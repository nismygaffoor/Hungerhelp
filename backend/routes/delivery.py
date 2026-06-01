from flask import Blueprint, request, jsonify
from models.delivery import DeliveryTask
from models.food_post import FoodPost
from models.claim import Claim
from models.user import User
from middleware.auth_middleware import token_required
from bson import ObjectId
from datetime import datetime, timedelta
from utils.notifications import (
    notify_volunteer_assigned,
    notify_food_picked_up,
    notify_food_delivered,
    notify_task_released,
    notify_new_delivery_task,
)

delivery_bp = Blueprint('delivery', __name__)

def _volunteer_query(volunteer_id):
    try:
        oid = ObjectId(volunteer_id)
        return {"$or": [{"volunteer_id": volunteer_id}, {"volunteer_id": oid}]}
    except Exception:
        return {"volunteer_id": volunteer_id}

def _enrich_task(task):
    post = FoodPost.collection.find_one({"_id": ObjectId(task['post_id'])})
    if post:
        task['food_type'] = post.get('food_type', 'Food Donation')
        task['quantity'] = post.get('quantity', '')
        task['location'] = post.get('location', '')
        task['is_urgent'] = post.get('is_urgent', False)
    created_at = task.get('created_at')
    if hasattr(created_at, 'isoformat'):
        task['created_at'] = created_at.isoformat()
    task['_id'] = str(task['_id'])
    task['post_id'] = str(task.get('post_id', ''))
    return task

def _format_task_summary(task):
    enriched = _enrich_task(dict(task))
    food_name = enriched.get('food_type', 'Food Donation').split(' - ')[0]
    status = enriched.get('status', 'Pending')
    display_status = 'In Transit' if status == 'PickedUp' else status
    return {
        'id': enriched['_id'],
        'title': food_name,
        'status': display_status,
        'pickup_location': enriched.get('pickup_location', ''),
        'dropoff_location': enriched.get('dropoff_location', ''),
        'is_urgent': enriched.get('is_urgent', False),
        'created_at': enriched.get('created_at', ''),
    }

def _sync_claim_status(post_id, status):
    Claim.collection.update_one(
        {"post_id": ObjectId(post_id)},
        {"$set": {"status": status}}
    )

def _parties_for_task(task):
    post = FoodPost.collection.find_one({"_id": ObjectId(task['post_id'])}) if task.get('post_id') else None
    if not post:
        return None, None, None
    donor_id = str(post.get('donor_id', ''))
    beneficiary_id = str(post.get('claimed_by', '')) if post.get('claimed_by') else None
    food_type = post.get('food_type')
    return donor_id, beneficiary_id, food_type

@delivery_bp.route('/available', methods=['GET'])
@token_required
def get_available_tasks():
    """Get all delivery tasks that are Pending (no volunteer)"""
    from services.delivery_escalation import maybe_process_escalations
    maybe_process_escalations()

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

@delivery_bp.route('/stats', methods=['GET'])
@token_required
def get_volunteer_stats():
    """Dashboard statistics for the logged-in volunteer."""
    current_user = request.user_data
    if str(current_user['role']).lower() != 'volunteer':
        return jsonify({"message": "Unauthorized"}), 403

    volunteer_id = current_user['user_id']
    all_tasks = list(
        DeliveryTask.collection.find(_volunteer_query(volunteer_id)).sort("created_at", -1)
    )

    total_deliveries = len(all_tasks)
    completed = len([t for t in all_tasks if t.get('status') == 'Delivered'])
    active = len([t for t in all_tasks if t.get('status') in ['Assigned', 'PickedUp']])
    assigned = len([t for t in all_tasks if t.get('status') == 'Assigned'])
    in_transit = len([t for t in all_tasks if t.get('status') == 'PickedUp'])
    available_tasks_count = DeliveryTask.collection.count_documents({"status": "Pending"})

    recent_deliveries = [_format_task_summary(t) for t in all_tasks[:5]]
    active_deliveries = [
        _format_task_summary(t) for t in all_tasks
        if t.get('status') in ['Assigned', 'PickedUp']
    ][:5]

    available_preview = []
    for task in DeliveryTask.get_available_tasks()[:3]:
        enriched = _enrich_task(dict(task))
        food_name = enriched.get('food_type', 'Food Donation').split(' - ')[0]
        available_preview.append({
            'id': enriched['_id'],
            'title': food_name,
            'pickup_location': enriched.get('pickup_location', ''),
            'dropoff_location': enriched.get('dropoff_location', ''),
            'is_urgent': enriched.get('is_urgent', False),
        })

    weekly_counts = [0] * 7
    day_labels = []
    now = datetime.utcnow()
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_labels.append(day.strftime('%a'))
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        for task in all_tasks:
            if task.get('status') != 'Delivered':
                continue
            created = task.get('created_at')
            if not created:
                continue
            if hasattr(created, 'replace'):
                created_naive = created.replace(tzinfo=None) if getattr(created, 'tzinfo', None) else created
            else:
                continue
            if day_start <= created_naive < day_end:
                weekly_counts[6 - i] += 1

    return jsonify({
        'stats': {
            'total_deliveries': total_deliveries,
            'completed': completed,
            'active': active,
            'assigned': assigned,
            'in_transit': in_transit,
            'available_tasks': available_tasks_count,
        },
        'recent_deliveries': recent_deliveries,
        'active_deliveries': active_deliveries,
        'available_preview': available_preview,
        'weekly_counts': weekly_counts,
        'day_labels': day_labels,
    }), 200

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
            _sync_claim_status(task['post_id'], "Pending Pickup")
            donor_id, beneficiary_id, food_type = _parties_for_task(task)
            volunteer = User.collection.find_one(
                {"_id": ObjectId(current_user['user_id'])},
                {"name": 1},
            ) if current_user.get('user_id') else None
            notify_volunteer_assigned(
                donor_id,
                beneficiary_id,
                volunteer.get('name') if volunteer else current_user.get('name'),
                food_type,
            )
        return jsonify({"message": "Task accepted successfully"}), 200
    return jsonify({"message": "Failed to accept task or task already taken"}), 400

@delivery_bp.route('/<task_id>/release', methods=['POST'])
@token_required
def release_task(task_id):
    """Volunteer releases an assigned task back to the open pool."""
    current_user = request.user_data
    if str(current_user['role']).lower() != 'volunteer':
        return jsonify({"message": "Only volunteers can release tasks"}), 403

    task = DeliveryTask.collection.find_one({"_id": ObjectId(task_id)})
    if not task:
        return jsonify({"message": "Task not found"}), 404

    success = DeliveryTask.release_volunteer(task_id, current_user['user_id'])
    if not success:
        return jsonify({
            "message": "Cannot release this task. It may already be picked up or not assigned to you."
        }), 400

    if task.get('post_id'):
        FoodPost.collection.update_one(
            {"_id": ObjectId(task['post_id'])},
            {"$set": {"status": "Claimed"}},
        )
        _sync_claim_status(task['post_id'], "Claimed")

    donor_id, beneficiary_id, food_type = _parties_for_task(task)
    notify_task_released(donor_id, beneficiary_id, food_type)
    notify_new_delivery_task(food_type)

    return jsonify({"message": "Task released. It is available for other volunteers."}), 200

@delivery_bp.route('/my-tasks', methods=['GET'])
@token_required
def get_my_tasks():
    """Get tasks assigned to the logged-in volunteer"""
    current_user = request.user_data
    cursor = DeliveryTask.collection.find(_volunteer_query(current_user['user_id'])).sort("created_at", -1)
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
        _sync_claim_status(task['post_id'], mapped_status)
        donor_id, beneficiary_id, food_type = _parties_for_task(task)
        volunteer = User.collection.find_one(
            {"_id": ObjectId(current_user['user_id'])},
            {"name": 1},
        )
        volunteer_name = volunteer.get('name') if volunteer else 'Volunteer'
        if new_status == 'PickedUp':
            notify_food_picked_up(donor_id, beneficiary_id, volunteer_name, food_type)
        elif new_status == 'Delivered':
            notify_food_delivered(donor_id, beneficiary_id, food_type)
        return jsonify({"message": f"Status updated to {new_status}"}), 200
    return jsonify({"message": "Failed to update status"}), 400
