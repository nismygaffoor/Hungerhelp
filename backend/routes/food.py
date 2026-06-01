from flask import Blueprint, request, jsonify
import os
import uuid
from models.food_post import FoodPost
from middleware.auth_middleware import token_required
from datetime import datetime
from bson.objectid import ObjectId

food_bp = Blueprint('food', __name__)
from models.claim import Claim
from utils.location_helpers import normalize_location_data

# ... (removed redundant claim_post)

@food_bp.route('/', methods=['POST'])
@token_required
def create_post():
    """
    Create a new food post.
    Only Donors can create posts.
    """
    current_user = request.user_data
    if current_user['role'] != 'Donor':
        return jsonify({"error": "Only donors can post food"}), 403

    # Handle both JSON and Multipart data
    if request.is_json:
        data = request.json
    else:
        data = request.form.to_dict()

    if not data or 'food_type' not in data:
        return jsonify({"error": "Missing required fields (food_type)"}), 400

    data = normalize_location_data(data)
    if not data.get('district') or not data.get('city'):
        return jsonify({"error": "District and city are required"}), 400
    if not data.get('location'):
        return jsonify({"error": "Location is required"}), 400

    # parse items if present (sent as JSON string from frontend)
    import json
    if 'items' in data and isinstance(data['items'], str):
        try:
            data['items'] = json.loads(data['items'])
        except:
            data['items'] = []

    # Collect all item images into a top-level list for compatibility
    all_images = []
    import uuid
    for i, item in enumerate(data.get('items', [])):
        item_images = []
        file_key = f'item_images_{i}'
        if file_key in request.files:
            item_files = request.files.getlist(file_key)
            for file in item_files:
                if file and file.filename:
                    filename = f"{uuid.uuid4()}_{file.filename}"
                    file_path = os.path.join('food_posts', filename)
                    full_path = os.path.join('uploads', file_path)
                    os.makedirs(os.path.dirname(full_path), exist_ok=True)
                    file.save(full_path)
                    item_images.append(file_path)
                    all_images.append(file_path)
        item['images'] = item_images

    # Add donor ID from the token
    data['donor_id'] = current_user['user_id']
    data['images'] = all_images
    
    # Handle boolean conversion for is_recurring
    if isinstance(data.get('is_recurring'), str):
        data['is_recurring'] = data['is_recurring'].lower() == 'true'
    
    if isinstance(data.get('is_urgent'), str):
        data['is_urgent'] = data['is_urgent'].lower() == 'true'

    # Recurring posts should start as 'Active', not 'Available'
    if data.get('is_recurring'):
        data['status'] = 'Active'
        
    post_id = FoodPost.create(data)

    if not data.get("is_recurring") and data.get("status", "Available") == "Available":
        try:
            from services.sms_claim import notify_beneficiaries_new_food
            notify_beneficiaries_new_food(post_id)
        except Exception as exc:
            print(f"SMS food alert skipped: {exc}")

    return jsonify({"message": "Food post created", "post_id": post_id}), 201

@food_bp.route('/', methods=['GET'])
@token_required
def get_posts():
    """
    Get all available food posts filtered by beneficiary targeting.
    Shows posts based on:
    1. No targeting (destination_type and destination_name empty) → Show to ALL
    2. Type targeting (destination_type set) → Show only to matching beneficiaryType
    3. Name targeting (destination_name set) → Show only to exact name match
    """
    current_user = request.user_data
    
    # Get all available posts
    all_posts = FoodPost.get_all_available()
    
    # If user is not a beneficiary, return all posts (for admin/donor viewing)
    if current_user['role'] != 'Beneficiary':
        return jsonify(all_posts), 200
    
    # Get beneficiary's profile info from database
    from models.user import User
    beneficiary = User.collection.find_one({"_id": ObjectId(current_user['user_id'])})
    
    if not beneficiary:
        return jsonify([]), 200
    
    beneficiary_type = beneficiary.get('beneficiaryType', '').strip()
    beneficiary_name = beneficiary.get('name', '').strip()
    
    # Filter posts based on targeting rules
    filtered_posts = []
    for post in all_posts:
        dest_type = post.get('destination_type', '').strip()
        dest_name = post.get('destination_name', '').strip()
        
        # Rule 1: No targeting (no type specified) → Show to everyone
        if not dest_type:
            filtered_posts.append(post)
            continue
        
        # Rule 2: Specific name targeting → Show ONLY if exact name match
        if dest_name:
            if dest_name.lower() == beneficiary_name.lower():
                filtered_posts.append(post)
            # If name is specified but doesn't match, don't show (even if type matches)
            continue
        
        # Rule 3: Type targeting only (no name) → Show if type matches
        if dest_type.lower() == beneficiary_type.lower():
            filtered_posts.append(post)
    
    # Enrich with donor names
    from models.user import User
    donor_cache = {}
    for post in filtered_posts:
        donor_id = post.get('donor_id')
        if donor_id not in donor_cache:
            donor = User.collection.find_one({"_id": ObjectId(donor_id)})
            if donor:
                donor_cache[donor_id] = donor.get('businessName') or donor.get('name') or "Unknown Donor"
            else:
                donor_cache[donor_id] = "Unknown Donor"
        post['donor_name'] = donor_cache[donor_id]

    district_filter = request.args.get('district', '').strip()
    if district_filter:
        def _matches_district(post):
            if post.get('district', '').strip() == district_filter:
                return True
            address = (post.get('location') or '').split(' | ')[0].strip()
            return address.startswith(f"{district_filter},") or address == district_filter

        filtered_posts = [post for post in filtered_posts if _matches_district(post)]

    return jsonify(filtered_posts), 200

@food_bp.route('/fulfill-request', methods=['POST'])
@token_required
def fulfill_request():
    """
    Donor fulfills a specific beneficiary request.
    Creates a food post already marked as 'Claimed',
    marks request as 'Fulfilled', and creates Claim + DeliveryTask.
    """
    current_user = request.user_data
    if current_user['role'] != 'Donor':
        return jsonify({"error": "Only donors can fulfill requests"}), 403

    try:
        # Use existing logic to get items and data
        data = request.form.to_dict()
        request_id = data.get('request_id')
        beneficiary_id = data.get('beneficiary_id') # Should be passed from frontend
        
        if not request_id or not beneficiary_id:
            return jsonify({"error": "Missing request_id or beneficiary_id"}), 400

        # 1. Handle Images
        all_images = []
        for key in request.files:
            if key.startswith('item_images_'):
                file = request.files[key]
                if file and file.filename:
                    filename = f"{uuid.uuid4()}_{file.filename}"
                    file_path = os.path.join('food_posts', filename)
                    full_path = os.path.join('uploads', file_path)
                    os.makedirs(os.path.dirname(full_path), exist_ok=True)
                    file.save(full_path)
                    all_images.append(file_path)

        # 2. Create Food Post (Status: Claimed)
        from models.food_post import FoodPost
        data['donor_id'] = current_user['user_id']
        data['images'] = all_images
        data['status'] = 'Claimed'
        data['claimed_by'] = ObjectId(beneficiary_id)
        data['claimed_at'] = datetime.utcnow()
        data['matched_request_id'] = request_id
        data['is_recurring'] = False

        if isinstance(data.get('is_recurring'), str):
            data['is_recurring'] = data['is_recurring'].lower() == 'true'
        if isinstance(data.get('is_urgent'), str):
            data['is_urgent'] = data['is_urgent'].lower() == 'true'
        
        # Convert items if present
        if 'items' in data:
            import json
            data['items'] = json.loads(data['items'])

        data = normalize_location_data(data)
        if not data.get('district') or not data.get('city'):
            return jsonify({"error": "District and city are required"}), 400

        post_id = FoodPost.create(data)

        # 3. Update Request Status
        from models.request import FoodRequest
        FoodRequest.collection.update_one(
            {"_id": ObjectId(request_id)},
            {"$set": {"status": "Fulfilled"}}
        )

        # 4. Create Claim Document
        from models.claim import Claim
        claim_id = Claim.collection.insert_one({
            "beneficiary_id": ObjectId(beneficiary_id),
            "post_id": ObjectId(post_id),
            "donor_id": ObjectId(current_user['user_id']),
            "status": "Claimed",
            "claimed_at": datetime.utcnow()
        }).inserted_id

        # 5. Create Delivery Task
        from models.delivery import DeliveryTask
        # We need the beneficiary's address for dropoff
        from models.user import User
        beneficiary = User.collection.find_one({"_id": ObjectId(beneficiary_id)})
        dropoff_location = beneficiary.get('address', "Beneficiary Address")

        DeliveryTask.create_task(
            post_id=post_id,
            pickup_location=data['location'],
            dropoff_location=dropoff_location,
            claim_id=str(claim_id)
        )

        from utils.notifications import notify_request_fulfilled, notify_new_delivery_task
        from models.user import User as UserModel
        donor = UserModel.collection.find_one(
            {"_id": ObjectId(current_user['user_id'])},
            {"name": 1},
        )
        notify_request_fulfilled(
            beneficiary_id,
            donor.get('name') if donor else 'A donor',
            data.get('food_type'),
        )
        notify_new_delivery_task(data.get('food_type'))

        return jsonify({
            "message": "Request fulfilled successfully. Delivery task created.",
            "post_id": post_id,
            "claim_id": str(claim_id)
        }), 201

    except Exception as e:
        return jsonify({"error": f"Failed to fulfill request: {str(e)}"}), 500

@food_bp.route('/my-posts', methods=['GET'])
@token_required
def get_my_posts():
    current_user = request.user_data
    
    # --- AUTOMATION: Process recurring donations for today ---
    try:
        today_day = datetime.now().strftime('%A')
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Find active templates for today
        templates = list(FoodPost.collection.find({
            "donor_id": current_user['user_id'],
            "is_recurring": True,
            "status": "Active",
            "day": today_day
        }))
        
        for template in templates:
            # Check if already created today
            if not FoodPost.collection.find_one({
                "parent_recurring_id": template['_id'],
                "created_at": {"$gte": today_start}
            }):
                # Create instance
                instance = {
                    "donor_id": template['donor_id'],
                    "food_type": template['food_type'],
                    "quantity": template['quantity'],
                    "location": template['location'],
                    "description": f"(Scheduled) {template.get('description', '')}",
                    "images": template.get('images', []),
                    "items": template.get('items', []),
                    "status": "Available",
                    "is_recurring": False,
                    "is_urgent": template.get('is_urgent', False),
                    "parent_recurring_id": template['_id'],
                    "destination_type": template.get('destination_type', ""),
                    "destination_name": template.get('destination_name', ""),
                    "expiry_time": (datetime.utcnow().replace(hour=23, minute=59)).isoformat(),
                    "created_at": datetime.utcnow()
                }
                FoodPost.collection.insert_one(instance)
    except Exception as e:
        print(f"Recurring Automation Error: {str(e)}")
    # --- END AUTOMATION ---

    posts = FoodPost.get_by_donor(current_user['user_id'], is_recurring=False)

    from models.user import User
    for post in posts:
        claimed_by = post.get('claimed_by')
        if claimed_by:
            try:
                beneficiary = User.collection.find_one({"_id": ObjectId(claimed_by)}, {"name": 1})
                if beneficiary:
                    post['beneficiary_name'] = beneficiary.get('name', 'Beneficiary')
            except Exception:
                pass
        if post.get('matched_request_id'):
            post['is_request_match'] = True

    return jsonify(posts), 200

@food_bp.route('/my-recurring', methods=['GET'])
@token_required
def get_my_recurring():
    """Get recurring posts created by the logged-in donor."""
    current_user = request.user_data
    posts = FoodPost.get_by_donor(current_user['user_id'], is_recurring=True)
    return jsonify(posts), 200

@food_bp.route('/donor-stats', methods=['GET'])
@token_required
def get_donor_stats():
    """
    Get dashboard statistics for the logged-in donor.
    Returns donation counts, recent activity, in-progress items, and community requests.
    """
    from datetime import datetime, timedelta
    from models.request import FoodRequest
    from models.user import User

    current_user = request.user_data
    if current_user['role'] != 'Donor':
        return jsonify({"message": "Unauthorized"}), 403

    donor_id = current_user['user_id']
    IN_PROGRESS_STATUSES = ['Claimed', 'Pending Pickup', 'In Transit']
    ACTIVE_STATUSES = ['Available', 'Active']

    donation_posts = FoodPost.get_by_donor(donor_id, is_recurring=False)
    recurring_posts = FoodPost.get_by_donor(donor_id, is_recurring=True)

    total_donations = len(donation_posts)
    active_donations = len([p for p in donation_posts if p.get('status') in ACTIVE_STATUSES])
    in_progress = len([p for p in donation_posts if p.get('status') in IN_PROGRESS_STATUSES])
    delivered_donations = len([p for p in donation_posts if p.get('status') == 'Delivered'])
    request_matches = len([p for p in donation_posts if p.get('matched_request_id')])
    recurring_active = len([p for p in recurring_posts if p.get('status') in ACTIVE_STATUSES])

    claimed_ids = set()
    for post in donation_posts:
        claimed_by = post.get('claimed_by')
        if claimed_by:
            claimed_ids.add(claimed_by if isinstance(claimed_by, str) else str(claimed_by))

    beneficiary_names = {}
    if claimed_ids:
        oids = []
        for cid in claimed_ids:
            try:
                oids.append(ObjectId(cid))
            except Exception:
                pass
        if oids:
            beneficiary_names = {
                str(b['_id']): b.get('name', 'Beneficiary')
                for b in User.collection.find({"_id": {"$in": oids}}, {"name": 1})
            }

    def format_post(post):
        claimed_by = post.get('claimed_by')
        beneficiary_name = beneficiary_names.get(str(claimed_by), '') if claimed_by else ''
        created_at = post.get('created_at')
        if not created_at and hasattr(post.get('_id'), 'generation_time'):
            created_at = post['_id'].generation_time.isoformat()
        elif hasattr(created_at, 'isoformat'):
            created_at = created_at.isoformat()
        return {
            '_id': post['_id'],
            'food_type': post.get('food_type', ''),
            'quantity': post.get('quantity', ''),
            'location': post.get('location', ''),
            'status': post.get('status', 'Available'),
            'images': post.get('images', []),
            'items': post.get('items', []),
            'is_urgent': post.get('is_urgent', False),
            'is_recurring': FoodPost._as_bool(post.get('is_recurring'), False),
            'is_request_match': bool(post.get('matched_request_id')),
            'beneficiary_name': beneficiary_name,
            'expiry_time': post.get('expiry_time', ''),
            'created_at': str(created_at) if created_at else '',
        }

    recent_donations = [format_post(p) for p in donation_posts[:5]]
    in_progress_donations = [
        format_post(p) for p in donation_posts
        if p.get('status') in IN_PROGRESS_STATUSES
    ][:5]

    upcoming_donations = []
    for post in recurring_posts:
        if post.get('status') not in ACTIVE_STATUSES:
            continue
        food_name = post.get('food_type', 'Recurring Donation').split(' - ')[0]
        frequency = post.get('frequency', 'Weekly')
        day = post.get('day', 'Monday')
        upcoming_donations.append({
            'title': food_name,
            'time': f'{frequency} · {day}',
        })
        if len(upcoming_donations) >= 3:
            break

    open_requests_count = FoodRequest.collection.count_documents({"status": "Active"})
    recent_community_requests = []
    for req in FoodRequest.get_all_active()[:3]:
        items = req.get('items') or []
        recent_community_requests.append({
            'id': req['_id'],
            'title': items[0].get('category', req.get('food_type', 'Food Request')) if items else req.get('food_type', 'Food Request'),
            'beneficiary_name': req.get('beneficiary_name', 'Beneficiary'),
            'urgency': req.get('urgency', 'Normal'),
            'district': req.get('district', ''),
        })

    monthly_counts = [0] * 6
    month_labels = []
    current_date = datetime.utcnow()
    for i in range(5, -1, -1):
        month_date = current_date - timedelta(days=i * 30)
        month_labels.append(month_date.strftime('%b'))

    for post in donation_posts:
        created_at = post.get('created_at')
        if isinstance(created_at, str):
            try:
                post_date = datetime.fromisoformat(created_at.replace('Z', '+00:00').split('+')[0])
            except Exception:
                continue
        elif hasattr(created_at, 'year'):
            post_date = created_at
        elif hasattr(post.get('_id'), 'generation_time'):
            post_date = post['_id'].generation_time.replace(tzinfo=None)
        else:
            continue
        months_ago = (current_date.year - post_date.year) * 12 + (current_date.month - post_date.month)
        if 0 <= months_ago < 6:
            monthly_counts[5 - months_ago] += 1

    return jsonify({
        'total_donations': total_donations,
        'active_donations': active_donations,
        'in_progress': in_progress,
        'delivered_donations': delivered_donations,
        'request_matches': request_matches,
        'recurring_active': recurring_active,
        'open_requests_count': open_requests_count,
        'recent_donations': recent_donations,
        'in_progress_donations': in_progress_donations,
        'recent_community_requests': recent_community_requests,
        'upcoming_donations': upcoming_donations,
        'monthly_counts': monthly_counts,
        'month_labels': month_labels,
    }), 200

@food_bp.route('/<post_id>', methods=['GET'])
@token_required
def get_post_detail(post_id):
    """
    Get details of a single food post by ID.
    """
    current_user = request.user_data
    
    try:
        post = FoodPost.collection.find_one({"_id": ObjectId(post_id)})
        
        if not post:
            return jsonify({"message": "Post not found"}), 404
        
        # Permission logic
        role = str(current_user.get('role', 'Unknown')).lower()
        user_id = str(current_user.get('user_id', ''))
        donor_id = str(post.get('donor_id', ''))
        status = str(post.get('status', 'Unknown')).lower()
        
        is_donor = (user_id == donor_id)
        is_admin = (role == 'admin')
        
        is_viewable = False
        if is_admin or is_donor:
            is_viewable = True
        elif status in ['available', 'active', 'pending pickup']:
            # Public/Pending posts are viewable by anyone (or specific logic below)
            is_viewable = True
        elif role == 'beneficiary':
            # Check if this beneficiary claimed the post
            is_viewable = (str(post.get('claimed_by')) == user_id)
            if not is_viewable:
                from models.claim import Claim
                claim = Claim.collection.find_one({
                    "$or": [
                        {"post_id": ObjectId(post_id)},
                        {"post_id": post_id}
                    ],
                    "$or": [
                        {"beneficiary_id": ObjectId(user_id)},
                        {"beneficiary_id": user_id}
                    ]
                })
                if claim:
                    is_viewable = True
        
        if not is_viewable:
            return jsonify({
                "message": "You do not have permission to view this donation",
                "debug": {
                    "role": role,
                    "status": status,
                    "is_donor": is_donor,
                    "user_id": user_id
                }
            }), 403
        
        # Enrich with donor name
        from models.user import User
        donor = User.collection.find_one({"_id": ObjectId(post.get('donor_id'))})
        if donor:
            post['donor_name'] = donor.get('businessName') or donor.get('name') or "Unknown Donor"
        else:
            post['donor_name'] = "Unknown Donor"

        # Format the response
        post['_id'] = str(post['_id'])
        post['donor_id'] = str(post['donor_id'])
        
        # Convert any other ObjectIds to strings for JSON serialization
        if 'parent_recurring_id' in post:
            post['parent_recurring_id'] = str(post['parent_recurring_id'])
        if 'claimed_by' in post:
            post['claimed_by'] = str(post['claimed_by'])

        from models.delivery import DeliveryTask as DeliveryTaskModel
        post['delivery'] = DeliveryTaskModel.serialize_for_post(post_id)
        post['fulfillment_mode'] = post.get('fulfillment_mode')
        post['delivery_escalated'] = bool(post.get('delivery_escalated'))
        
        return jsonify(post), 200
    except Exception as e:
        return jsonify({"message": "Invalid post ID"}), 400

@food_bp.route('/<post_id>', methods=['DELETE'])
@token_required
def delete_post(post_id):
    """
    Delete a post.
    """
    current_user = request.user_data
    success, message = FoodPost.delete(post_id, current_user['user_id'], current_user['role'])
    
    status_code = 200 if success else 403 if message == "Unauthorized" else 404
    return jsonify({"message": message}), status_code

@food_bp.route('/<post_id>/status', methods=['PATCH'])
@token_required
def update_post_status(post_id):
    """Update status (e.g., Active/Paused for recurring)."""
    current_user = request.user_data
    data = request.json
    
    if not data or 'status' not in data:
        return jsonify({"message": "Missing status"}), 400
        
    query = {"_id": ObjectId(post_id), "donor_id": current_user['user_id']}
    result = FoodPost.collection.update_one(query, {"$set": {"status": data['status']}})
    
    if result.modified_count > 0:
        return jsonify({"message": "Status updated"}), 200
    return jsonify({"message": "Failed to update"}), 400

@food_bp.route('/<post_id>', methods=['PUT'])
@token_required
def update_post(post_id):
    """Update post details (verification inside FoodPost.update)."""
    current_user = request.user_data
    
    # Handle both JSON and Multipart data
    if request.is_json:
        data = request.json
    else:
        data = request.form.to_dict()
    
    if not data:
        return jsonify({"message": "Missing update data"}), 400
        
    # Handle boolean conversion
    if isinstance(data.get('is_recurring'), str):
        data['is_recurring'] = data['is_recurring'].lower() == 'true'
    
    if isinstance(data.get('is_urgent'), str):
        data['is_urgent'] = data['is_urgent'].lower() == 'true'

    # Status logic
    if data.get('is_recurring') is True and 'status' not in data:
        data['status'] = 'Active'
    elif data.get('is_recurring') is False and 'status' not in data:
        data['status'] = 'Available'
    
    # Parse items if present
    import json
    if 'items' in data and isinstance(data['items'], str):
        try:
            data['items'] = json.loads(data['items'])
        except:
            data['items'] = []
    
    # Handle New Image Uploads
    new_images = []
    import uuid
    
    # Check for general images
    if 'images' in request.files:
        files = request.files.getlist('images')
        for file in files:
            if file and file.filename:
                filename = f"{uuid.uuid4()}_{file.filename}"
                file_path = os.path.join('food_posts', filename)
                full_path = os.path.join('uploads', file_path)
                os.makedirs(os.path.dirname(full_path), exist_ok=True)
                file.save(full_path)
                new_images.append(file_path)

    # Check for item-specific images
    items = data.get('items', [])
    for i, item in enumerate(items):
        file_key = f'item_images_{i}'
        if file_key in request.files:
            item_files = request.files.getlist(file_key)
            item_images = item.get('images', [])
            for file in item_files:
                if file and file.filename:
                    filename = f"{uuid.uuid4()}_{file.filename}"
                    file_path = os.path.join('food_posts', filename)
                    full_path = os.path.join('uploads', file_path)
                    os.makedirs(os.path.dirname(full_path), exist_ok=True)
                    file.save(full_path)
                    item_images.append(file_path)
                    new_images.append(file_path)
            item['images'] = item_images

    # Rebuild top-level images array from all items to handle deletions/additions correctly
    all_current_images = []
    for item in items:
        if 'images' in item:
            all_current_images.extend(item['images'])
    
    # Also include any general images uploaded (if any)
    if new_images:
        # Avoid duplicates if they were already added to items
        for img in new_images:
            if img not in all_current_images:
                all_current_images.append(img)
                
    data['images'] = all_current_images

    data = normalize_location_data(data)

    success, message = FoodPost.update(post_id, current_user['user_id'], data)
    
    if success:
        return jsonify({"message": message}), 200
    return jsonify({"message": message}), 400

# Import DeliveryTask here to avoid circular dependencies if placed at top
from models.delivery import DeliveryTask
from models.food_post import FoodPost # Re-ensure import if needed

@food_bp.route('/<post_id>/claim', methods=['POST'])
@token_required
def claim_food_consolidated(post_id):
    """
    Beneficiary claims a food post.
    Updates post status to 'Claimed' and creates a DeliveryTask.
    """
    current_user = request.user_data
    if str(current_user['role']).lower() != 'beneficiary':
        return jsonify({"error": "Only beneficiaries can claim food"}), 403

    from services.food_claim import claim_food_post

    success, message, claim_id = claim_food_post(post_id, current_user['user_id'])
    if not success:
        status = 404 if "not found" in message.lower() or "already claimed" in message.lower() else 400
        return jsonify({"error": message}), status

    return jsonify({
        "message": message,
        "claim_id": claim_id,
    }), 201


@food_bp.route('/<post_id>/self-pickup', methods=['POST'])
@token_required
def beneficiary_self_pickup_route(post_id):
    current_user = request.user_data
    if current_user['role'] != 'Beneficiary':
        return jsonify({"error": "Only beneficiaries can choose self pickup"}), 403

    task = DeliveryTask.get_by_post_id(post_id)
    if not task or task.get("escalation_stage") != "escalated" or task.get("status") != "Pending":
        return jsonify({"error": "Self pickup is available only after delivery is escalated with no volunteer"}), 400

    from services.fulfillment import beneficiary_self_pickup
    success, message = beneficiary_self_pickup(post_id, current_user['user_id'])
    if success:
        return jsonify({"message": message}), 200
    return jsonify({"error": message}), 400


@food_bp.route('/<post_id>/cancel-claim', methods=['POST'])
@token_required
def beneficiary_cancel_claim_route(post_id):
    current_user = request.user_data
    if current_user['role'] != 'Beneficiary':
        return jsonify({"error": "Only beneficiaries can cancel claims"}), 403

    task = DeliveryTask.get_by_post_id(post_id)
    if not task or task.get("escalation_stage") != "escalated":
        return jsonify({"error": "Cancel is available only after delivery is escalated with no volunteer"}), 400
    if task.get("status") not in ("Pending", "Assigned"):
        return jsonify({"error": "Delivery already in progress"}), 400

    from services.fulfillment import beneficiary_cancel_claim
    success, message = beneficiary_cancel_claim(post_id, current_user['user_id'])
    if success:
        return jsonify({"message": message}), 200
    return jsonify({"error": message}), 400


@food_bp.route('/<post_id>/donor-delivery', methods=['POST'])
@token_required
def donor_self_delivery_route(post_id):
    current_user = request.user_data
    if current_user['role'] != 'Donor':
        return jsonify({"error": "Only donors can offer to deliver"}), 403

    task = DeliveryTask.get_by_post_id(post_id)
    if not task or task.get("escalation_stage") != "escalated" or task.get("status") != "Pending":
        return jsonify({"error": "Self delivery is available only after delivery is escalated with no volunteer"}), 400

    from services.fulfillment import donor_self_delivery
    success, message = donor_self_delivery(post_id, current_user['user_id'])
    if success:
        return jsonify({"message": message}), 200
    return jsonify({"error": message}), 400
