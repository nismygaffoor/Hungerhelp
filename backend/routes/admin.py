from flask import Blueprint, request, jsonify
from models.user import User
from models.food_post import FoodPost
from models.delivery import DeliveryTask
from middleware.auth_middleware import token_required
from bson.objectid import ObjectId

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/stats', methods=['GET'])
@token_required
def get_stats():
    current_user = request.user_data
    if current_user['role'] != 'Admin':
        return jsonify({"error": "Admin access required"}), 403

    stats = {
        "users": User.collection.count_documents({}),
        "food_posts": FoodPost.collection.count_documents({}),
        "deliveries": DeliveryTask.collection.count_documents({}),
        "pending_verifications": User.collection.count_documents({"is_verified": False})
    }
    return jsonify(stats), 200

@admin_bp.route('/users', methods=['GET'])
@token_required
def get_users():
    current_user = request.user_data
    if current_user['role'] != 'Admin':
        return jsonify({"error": "Admin access required"}), 403

    users = []
    for u in User.collection.find({}, {"password": 0}): # Exclude password
        u['_id'] = str(u['_id'])
        users.append(u)
    
    return jsonify(users), 200

@admin_bp.route('/users/<user_id>/verify', methods=['POST'])
@token_required
def verify_user(user_id):
    current_user = request.user_data
    if current_user['role'] != 'Admin':
        return jsonify({"error": "Admin access required"}), 403

    result = User.collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_verified": True}}
    )
    
    if result.modified_count > 0:
        return jsonify({"message": "User verified successfully"}), 200
    else:
        return jsonify({"error": "User not found or already verified"}), 400
