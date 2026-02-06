from flask import Blueprint, request, jsonify
from models.delivery import DeliveryTask
from middleware.auth_middleware import token_required

delivery_bp = Blueprint('delivery', __name__)

@delivery_bp.route('/', methods=['GET'])
@token_required
def get_available_tasks():
    """
    Get all pending delivery tasks.
    """
    current_user = request.user_data
    if current_user['role'] not in ['Volunteer', 'Admin']:
         return jsonify({"error": "Unauthorized"}), 403
    
    tasks = DeliveryTask.get_available_tasks()
    return jsonify(tasks), 200

@delivery_bp.route('/<task_id>/accept', methods=['POST'])
@token_required
def accept_task(task_id):
    """
    Volunteer accepts a task.
    """
    current_user = request.user_data
    if current_user['role'] != 'Volunteer':
        return jsonify({"error": "Only volunteers can accept tasks"}), 403

    success = DeliveryTask.assign_volunteer(task_id, current_user['user_id'])
    
    if success:
        return jsonify({"message": "Task accepted successfully"}), 200
    else:
        return jsonify({"error": "Task not found or already assigned"}), 400

@delivery_bp.route('/<task_id>/status', methods=['PUT'])
@token_required
def update_status(task_id):
    """
    Update delivery status (PickedUp, Delivered).
    """
    current_user = request.user_data
    if current_user['role'] not in ['Volunteer', 'Admin']:
        return jsonify({"error": "Unauthorized"}), 403

    new_status = request.json.get('status')
    if new_status not in ['PickedUp', 'Delivered']:
        return jsonify({"error": "Invalid status"}), 400

    success = DeliveryTask.update_status(task_id, new_status)
    if success:
        return jsonify({"message": "Status updated"}), 200
    else:
        return jsonify({"error": "Task update failed"}), 400
