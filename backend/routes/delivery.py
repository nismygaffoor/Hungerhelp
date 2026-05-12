from flask import Blueprint, request, jsonify
from models.delivery import DeliveryTask
from models.food_post import FoodPost
from middleware.auth_middleware import token_required
from bson import ObjectId
from datetime import datetime

delivery_bp = Blueprint('delivery', __name__)

@delivery_bp.route('/available', methods=['GET'])
@token_required
def get_available_tasks():
    """Get all delivery tasks that are Pending (no volunteer)"""
    current_user = request.user_data
    if str(current_user['role']).lower() != 'volunteer':
        return jsonify({"message": "Only volunteers can see delivery tasks"}), 403

    tasks = DeliveryTask.get_available_tasks()
    
    # Enrich with food post details
    enriched_tasks = []
    for task in tasks:
        post = FoodPost.collection.find_one({"_id": ObjectId(task['post_id'])})
        if post:
            task['food_type'] = post.get('food_type', 'Food Donation')
            task['quantity'] = post.get('quantity', '')
            task['donor_id'] = str(post.get('donor_id'))
            task['is_urgent'] = post.get('is_urgent', False)
            enriched_tasks.append(task)
            
    return jsonify(enriched_tasks), 200

@delivery_bp.route('/<task_id>/accept', methods=['POST'])
@token_required
def accept_task(task_id):
    """Volunteer accepts a delivery task"""
    current_user = request.user_data
    if str(current_user['role']).lower() != 'volunteer':
        return jsonify({"message": "Only volunteers can accept tasks"}), 403

    success = DeliveryTask.assign_volunteer(task_id, current_user['user_id'])
    if success:
        # Update the original FoodPost status to 'Pending Pickup'
        task = DeliveryTask.collection.find_one({"_id": ObjectId(task_id)})
        if task:
            FoodPost.collection.update_one(
                {"_id": ObjectId(task['post_id'])},
                {"$set": {"status": "Pending Pickup"}}
            )
        return jsonify({"message": "Task accepted successfully"}), 200
    return jsonify({"message": "Failed to accept task or task already taken"}), 400

@delivery_bp.route('/my-tasks', methods=['GET'])
@token_required
def get_my_tasks():
    """Get tasks assigned to the logged-in volunteer"""
    current_user = request.user_data
    cursor = DeliveryTask.collection.find({"volunteer_id": current_user['user_id']}).sort("created_at", -1)
    tasks = []
    for doc in cursor:
        doc['_id'] = str(doc['_id'])
        # Enrich with post details
        post = FoodPost.collection.find_one({"_id": ObjectId(doc['post_id'])})
        if post:
            doc['food_type'] = post.get('food_type', 'Food Donation')
            doc['location'] = post.get('location', '')
        tasks.append(doc)
    return jsonify(tasks), 200

@delivery_bp.route('/<task_id>/status', methods=['PATCH'])
@token_required
def update_task_status(task_id):
    """Update delivery status (PickedUp, Delivered)"""
    current_user = request.user_data
    data = request.json
    new_status = data.get('status')
    
    if new_status not in ['PickedUp', 'Delivered']:
        return jsonify({"message": "Invalid status"}), 400

    # Verify task ownership
    task = DeliveryTask.collection.find_one({"_id": ObjectId(task_id)})
    if not task or task.get('volunteer_id') != current_user['user_id']:
        return jsonify({"message": "Unauthorized or task not found"}), 403

    success = DeliveryTask.update_status(task_id, new_status)
    if success:
        # Update FoodPost status to match
        mapped_status = "In Transit" if new_status == "PickedUp" else "Delivered"
        FoodPost.collection.update_one(
            {"_id": ObjectId(task['post_id'])},
            {"$set": {"status": mapped_status}}
        )
        return jsonify({"message": f"Status updated to {new_status}"}), 200
    return jsonify({"message": "Failed to update status"}), 400
