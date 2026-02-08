from flask import Blueprint, request, jsonify
import os
import uuid
from models.food_post import FoodPost
from middleware.auth_middleware import token_required
from datetime import datetime
from bson.objectid import ObjectId

food_bp = Blueprint('food', __name__)

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

    # Handle image uploads
    images = []
    if 'images' in request.files:
        files = request.files.getlist('images')
        for file in files:
            if file and file.filename:
                import uuid
                filename = f"{uuid.uuid4()}_{file.filename}"
                file_path = os.path.join('food_posts', filename)
                full_path = os.path.join('uploads', file_path)
                os.makedirs(os.path.dirname(full_path), exist_ok=True)
                file.save(full_path)
                images.append(file_path)

    # Add donor ID and images from the token/request
    data['donor_id'] = current_user['user_id']
    data['images'] = images
    
    # Handle boolean conversion for is_recurring
    if isinstance(data.get('is_recurring'), str):
        data['is_recurring'] = data['is_recurring'].lower() == 'true'
    
    if isinstance(data.get('is_urgent'), str):
        data['is_urgent'] = data['is_urgent'].lower() == 'true'
    
    post_id = FoodPost.create(data)
    return jsonify({"message": "Food post created", "post_id": post_id}), 201

@food_bp.route('/', methods=['GET'])
def get_posts():
    """
    Get all available food posts.
    Publicly accessible (or restrict to auth users if preferred).
    """
    posts = FoodPost.get_all_available()
    return jsonify(posts), 200

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
        
        # Check if user has permission to view (donor or admin)
        if current_user['role'] != 'Admin' and post.get('donor_id') != current_user['user_id']:
            # Allow public viewing for available posts
            if post.get('status') not in ['Available', 'Active']:
                return jsonify({"message": "Unauthorized"}), 403
        
        # Format the response
        post['_id'] = str(post['_id'])
        if hasattr(post.get('_id'), 'generation_time'):
            post['created_at'] = str(post['_id'].generation_time)
        
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
        
    success, message = FoodPost.update(post_id, current_user['user_id'], data)
    
    if success:
        return jsonify({"message": message}), 200
    return jsonify({"message": message}), 400

# Import DeliveryTask here to avoid circular dependencies if placed at top
from models.delivery import DeliveryTask
from models.food_post import FoodPost # Re-ensure import if needed

@food_bp.route('/<post_id>/claim', methods=['POST'])
@token_required
def claim_food(post_id):
    """
    Beneficiary claims a food post.
    Updates post status to 'Claimed' and creates a DeliveryTask.
    """
    current_user = request.user_data
    if current_user['role'] != 'Beneficiary':
        return jsonify({"error": "Only beneficiaries can claim food"}), 403

    # 1. Update Food Post Status
    query = {"_id": ObjectId(post_id), "status": "Available"}
    update = {
        "$set": {
            "status": "Claimed",
            "claimed_by": current_user['user_id'],
            "claimed_at": datetime.utcnow()
        }
    }
    
    # We need to fetch the post details first to get location for the delivery task
    post = FoodPost.collection.find_one(query)
    if not post:
        return jsonify({"error": "Food post not found or already claimed"}), 404

    # Execute update
    FoodPost.collection.update_one(query, update)

    # 2. Create Delivery Task
    # For now, we'll assume the beneficiary's address is the drop-off location
    # In a real app, we might ask for it in the request body
    dropoff_location = current_user.get('address', "Beneficiary Address")
    
    DeliveryTask.create_task(
        post_id=post_id,
        pickup_location=post['location'],
        dropoff_location=dropoff_location
    )

    return jsonify({"message": "Food claimed successfully. Delivery task created."}), 200
