from flask import Blueprint, request, jsonify
import os
import uuid
from models.food_post import FoodPost
from middleware.auth_middleware import token_required
from datetime import datetime
from bson.objectid import ObjectId

food_bp = Blueprint('food', __name__)
from models.claim import Claim

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

    if not data or 'food_type' not in data or 'location' not in data:
        return jsonify({"error": "Missing required fields (food_type, location)"}), 400

    # parse items if present (sent as JSON string from frontend)
    import json
    if 'items' in data and isinstance(data['items'], str):
        try:
            data['items'] = json.loads(data['items'])
        except:
            data['items'] = []

    # Handle per-item image uploads
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
        item['images'] = item_images

    # Add donor ID from the token
    data['donor_id'] = current_user['user_id']
    
    # Handle boolean conversion for is_recurring
    if isinstance(data.get('is_recurring'), str):
        data['is_recurring'] = data['is_recurring'].lower() == 'true'
    
    if isinstance(data.get('is_urgent'), str):
        data['is_urgent'] = data['is_urgent'].lower() == 'true'
        
    post_id = FoodPost.create(data)
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

    return jsonify(filtered_posts), 200

@food_bp.route('/my-posts', methods=['GET'])
@token_required
def get_my_posts():
    """
    Get all posts (recurring and non-recurring) created by the logged-in donor.
    """
    current_user = request.user_data
    posts = FoodPost.get_by_donor(current_user['user_id'])
    return jsonify(posts), 200

@food_bp.route('/my-recurring', methods=['GET'])
@token_required
def get_my_recurring():
    """
    Get recurring posts created by the logged-in donor.
    """
    current_user = request.user_data
    posts = FoodPost.get_by_donor(current_user['user_id'], is_recurring=True)
    return jsonify(posts), 200

@food_bp.route('/donor-stats', methods=['GET'])
@token_required
def get_donor_stats():
    """
    Get dashboard statistics for the logged-in donor.
    Returns: total posts, active posts, delivered count, and recent donations.
    """
    current_user = request.user_data
    donor_id = current_user['user_id']
    
    # Get all posts by this donor
    all_posts = list(FoodPost.collection.find({"donor_id": donor_id}))
    
    # Calculate statistics
    total_posts = len(all_posts)
    active_posts = len([p for p in all_posts if p.get('status') in ['Available', 'Active']])
    delivered_posts = len([p for p in all_posts if p.get('status') == 'Delivered'])
    
    # Get recent 5 donations sorted by creation date
    recent_donations = sorted(all_posts, key=lambda x: x.get('_id'), reverse=True)[:5]
    
    # Format recent donations for frontend
    formatted_recent = []
    for post in recent_donations:
        formatted_recent.append({
            '_id': str(post['_id']),
            'food_type': post.get('food_type', ''),
            'quantity': post.get('quantity', ''),
            'location': post.get('location', ''),
            'status': post.get('status', 'Available'),
            'images': post.get('images', []),
            'is_urgent': post.get('is_urgent', False),
            'is_recurring': post.get('is_recurring', False),
            'created_at': str(post.get('_id').generation_time) if hasattr(post.get('_id'), 'generation_time') else ''
        })
    
    # Get upcoming recurring donations (active recurring posts)
    recurring_posts = [p for p in all_posts if p.get('is_recurring') and p.get('status') in ['Available', 'Active']]
    upcoming_donations = []
    for post in recurring_posts[:3]:  # Limit to 3 upcoming
        food_name = post.get('food_type', 'Recurring Donation').split(' - ')[0]
        frequency = post.get('frequency', 'Weekly')
        day = post.get('day', 'Monday')
        upcoming_donations.append({
            'title': food_name,
            'time': f'{frequency} - {day}'
        })
    
    # Calculate monthly donation counts for the last 6 months
    from datetime import datetime, timedelta
    monthly_counts = [0] * 6
    current_date = datetime.now()
    
    for post in all_posts:
        if hasattr(post.get('_id'), 'generation_time'):
            post_date = post['_id'].generation_time
            months_ago = (current_date.year - post_date.year) * 12 + (current_date.month - post_date.month)
            if 0 <= months_ago < 6:
                monthly_counts[5 - months_ago] += 1
    
    return jsonify({
        'total_donations': total_posts,
        'active_donations': active_posts,
        'delivered_donations': delivered_posts,
        'recent_donations': formatted_recent,
        'upcoming_donations': upcoming_donations,
        'monthly_counts': monthly_counts
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
    data = request.json
    
    if not data:
        return jsonify({"message": "Missing update data"}), 400
        
    # Handle boolean conversion for is_recurring
    if isinstance(data.get('is_recurring'), str):
        data['is_recurring'] = data['is_recurring'].lower() == 'true'
    
    if isinstance(data.get('is_urgent'), str):
        data['is_urgent'] = data['is_urgent'].lower() == 'true'
    
    # Parse items if present (sent as JSON string from frontend)
    import json
    if 'items' in data and isinstance(data['items'], str):
        try:
            data['items'] = json.loads(data['items'])
        except:
            data['items'] = []
        
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

    try:
        # 1. Fetch Post Details and Update
        query = {"_id": ObjectId(post_id), "status": "Available"}
        post = FoodPost.collection.find_one(query)
        
        if not post:
            return jsonify({"error": "Food post not found or already claimed"}), 404

        # Execute status update on FoodPost
        FoodPost.collection.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": {
                "status": "Pending Pickup",
                "claimed_by": ObjectId(current_user['user_id']),
                "claimed_at": datetime.utcnow()
            }}
        )

        # 2. Create Claim Document
        from models.claim import Claim
        claim_id = Claim.collection.insert_one({
            "beneficiary_id": ObjectId(current_user['user_id']),
            "post_id": ObjectId(post_id),
            "donor_id": post['donor_id'],
            "status": "Pending Pickup",
            "claimed_at": datetime.utcnow()
        }).inserted_id

        # 3. Create Delivery Task
        from models.delivery import DeliveryTask
        dropoff_location = current_user.get('address', "Beneficiary Address")
        
        DeliveryTask.create_task(
            post_id=post_id,
            pickup_location=post['location'],
            dropoff_location=dropoff_location,
            claim_id=str(claim_id)
        )

        return jsonify({
            "message": "Food claimed successfully. Delivery task created.", 
            "claim_id": str(claim_id)
        }), 201

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to claim food: {str(e)}"}), 500
