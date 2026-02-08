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
    Get posts created by the logged-in donor.
    """
    current_user = request.user_data
    posts = FoodPost.get_by_donor(current_user['user_id'])
    return jsonify(posts), 200

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
