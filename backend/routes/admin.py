from flask import Blueprint, request, jsonify
from models.user import User
from models.food_post import FoodPost
from models.delivery import DeliveryTask
from models.claim import Claim
from models.request import FoodRequest
from models.feedback import Feedback
from middleware.auth_middleware import token_required
from bson.objectid import ObjectId
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

def _json_safe(value):
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: _json_safe(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_json_safe(v) for v in value]
    return value

def _serialize_admin_user(user):
    """Format user document for admin API responses."""
    user['_id'] = str(user['_id'])
    created_at = user.get('created_at')
    if hasattr(created_at, 'isoformat'):
        user['created_at'] = created_at.isoformat()

    docs = user.get('verification_documents') or []
    serialized_docs = []
    for doc in docs:
        uploaded_at = doc.get('uploaded_at')
        if hasattr(uploaded_at, 'isoformat'):
            uploaded_at = uploaded_at.isoformat()
        serialized_docs.append({
            '_id': doc.get('_id', ''),
            'doc_type': doc.get('doc_type', 'Other'),
            'filename': doc.get('filename', ''),
            'original_name': doc.get('original_name', ''),
            'uploaded_at': uploaded_at or '',
        })
    user['verification_documents'] = serialized_docs
    user['rejection_reason'] = user.get('rejection_reason', '')
    return _json_safe(user)

def _get_admin_user_or_404(user_id):
    try:
        user = User.collection.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    except Exception:
        user = None
    if not user:
        return None
    return _serialize_admin_user(user)

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

def _record_date(record):
    created = record.get('created_at')
    if isinstance(created, datetime):
        return created.replace(tzinfo=None) if getattr(created, 'tzinfo', None) else created
    if isinstance(created, str):
        try:
            return datetime.fromisoformat(created.replace('Z', '+00:00').split('+')[0])
        except Exception:
            pass
    oid = record.get('_id')
    if hasattr(oid, 'generation_time'):
        gt = oid.generation_time
        return gt.replace(tzinfo=None) if getattr(gt, 'tzinfo', None) else gt
    return None

def _monthly_series(records, months=6):
    now = datetime.utcnow()
    labels = []
    counts = [0] * months
    for i in range(months - 1, -1, -1):
        month_date = now - timedelta(days=i * 30)
        labels.append(month_date.strftime('%b'))
    for record in records:
        record_date = _record_date(record)
        if not record_date:
            continue
        months_ago = (now.year - record_date.year) * 12 + (now.month - record_date.month)
        if 0 <= months_ago < months:
            counts[months - 1 - months_ago] += 1
    return labels, counts

@admin_bp.route('/analytics', methods=['GET'])
@token_required
def get_analytics():
    current_user = request.user_data
    if current_user['role'] != 'Admin':
        return jsonify({"error": "Admin access required"}), 403

    users = list(User.collection.find({}, {"password": 0}))
    posts = list(FoodPost.collection.find())
    donation_posts = [p for p in posts if not FoodPost._as_bool(p.get('is_recurring'), False)]
    deliveries = list(DeliveryTask.collection.find())
    claims = list(Claim.collection.find())
    requests_list = list(FoodRequest.collection.find({"status": {"$ne": "Deleted"}}))
    feedback_items = list(Feedback.collection.find())

    users_by_role = {}
    for u in users:
        role = u.get('role', 'Unknown')
        users_by_role[role] = users_by_role.get(role, 0) + 1

    posts_by_status = {}
    for p in donation_posts:
        status = p.get('status', 'Unknown')
        posts_by_status[status] = posts_by_status.get(status, 0) + 1

    deliveries_by_status = {}
    for d in deliveries:
        status = d.get('status', 'Unknown')
        deliveries_by_status[status] = deliveries_by_status.get(status, 0) + 1

    categories = {}
    for post in donation_posts:
        items = post.get('items') or []
        if items:
            for item in items:
                cat = item.get('category') or item.get('name') or 'Other'
                categories[cat] = categories.get(cat, 0) + 1
        else:
            cat = (post.get('food_type') or 'Other').split(' - ')[0]
            categories[cat] = categories.get(cat, 0) + 1

    food_categories = sorted(
        [{"name": k, "count": v} for k, v in categories.items()],
        key=lambda x: x['count'],
        reverse=True
    )[:8]

    delivered_count = posts_by_status.get('Delivered', 0)
    total_claims = len(claims)
    completed_deliveries = deliveries_by_status.get('Delivered', 0)
    delivery_rate = round((completed_deliveries / len(deliveries) * 100), 1) if deliveries else 0

    ratings = [f.get('rating') for f in feedback_items if f.get('rating')]
    avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 0

    donation_labels, donation_counts = _monthly_series(donation_posts)
    delivery_labels, delivery_counts = _monthly_series(deliveries)
    claim_labels, claim_counts = _monthly_series(claims)
    user_labels, user_counts = _monthly_series(users)

    return jsonify({
        "summary": {
            "total_users": len(users),
            "users_by_role": users_by_role,
            "total_posts": len(donation_posts),
            "posts_by_status": posts_by_status,
            "total_deliveries": len(deliveries),
            "deliveries_by_status": deliveries_by_status,
            "total_claims": total_claims,
            "delivered_posts": delivered_count,
            "total_requests": len(requests_list),
            "active_requests": len([r for r in requests_list if r.get('status') == 'Active']),
            "fulfilled_requests": len([r for r in requests_list if r.get('status') == 'Fulfilled']),
            "verified_users": len([u for u in users if u.get('is_verified')]),
            "pending_verifications": len([u for u in users if not u.get('is_verified') and u.get('verification_status') != 'rejected' and u.get('role') != 'Admin']),
            "rejected_users": len([u for u in users if u.get('verification_status') == 'rejected']),
            "total_feedback": len(feedback_items),
            "avg_feedback_rating": avg_rating,
            "delivery_completion_rate": delivery_rate,
        },
        "monthly_donations": {"labels": donation_labels, "counts": donation_counts},
        "monthly_deliveries": {"labels": delivery_labels, "counts": delivery_counts},
        "monthly_claims": {"labels": claim_labels, "counts": claim_counts},
        "monthly_registrations": {"labels": user_labels, "counts": user_counts},
        "food_categories": food_categories,
        "impact": {
            "meals_delivered": delivered_count,
            "claims_made": total_claims,
            "deliveries_completed": completed_deliveries,
            "requests_fulfilled": len([r for r in requests_list if r.get('status') == 'Fulfilled']),
        },
    }), 200

@admin_bp.route('/users', methods=['GET'])
@token_required
def get_users():
    current_user = request.user_data
    if current_user['role'] != 'Admin':
        return jsonify({"error": "Admin access required"}), 403

    users = []
    for u in User.collection.find({}, {"password": 0}):
        users.append(_serialize_admin_user(u))
    
    return jsonify(users), 200

@admin_bp.route('/users/<user_id>', methods=['GET'])
@token_required
def get_user(user_id):
    current_user = request.user_data
    if current_user['role'] != 'Admin':
        return jsonify({"error": "Admin access required"}), 403

    user = _get_admin_user_or_404(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user), 200

@admin_bp.route('/users/<user_id>/verify', methods=['POST'])
@token_required
def verify_user(user_id):
    current_user = request.user_data
    if current_user['role'] != 'Admin':
        return jsonify({"error": "Admin access required"}), 403

    user = User.collection.find_one({"_id": ObjectId(user_id)}, {"role": 1, "verification_documents": 1})
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user.get('role') == 'Admin':
        return jsonify({"error": "Cannot modify admin accounts"}), 400

    docs = user.get('verification_documents') or []
    if not docs:
        return jsonify({"error": "User has not uploaded verification documents"}), 400

    User.collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {"is_verified": True, "verification_status": "verified"},
            "$unset": {"rejection_reason": ""},
        }
    )
    from utils.notifications import notify_account_verified
    notify_account_verified(user_id, user.get('role'))
    return jsonify({"message": "User verified successfully"}), 200

@admin_bp.route('/users/<user_id>/reject', methods=['POST'])
@token_required
def reject_user(user_id):
    current_user = request.user_data
    if current_user['role'] != 'Admin':
        return jsonify({"error": "Admin access required"}), 403

    user = User.collection.find_one({"_id": ObjectId(user_id)}, {"role": 1})
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user.get('role') == 'Admin':
        return jsonify({"error": "Cannot reject admin accounts"}), 400

    data = request.json or {}
    reason = (data.get('reason') or '').strip()

    User.collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "is_verified": False,
                "verification_status": "rejected",
                "rejection_reason": reason or "Account rejected by administrator.",
            }
        }
    )
    from utils.notifications import notify_account_rejected
    notify_account_rejected(
        user_id,
        reason or "Account rejected by administrator.",
        user.get('role'),
    )
    return jsonify({"message": "User rejected successfully"}), 200

def _serialize_admin_post(post):
    post['_id'] = str(post['_id'])
    created_at = post.get('created_at')
    if hasattr(created_at, 'isoformat'):
        post['created_at'] = created_at.isoformat()
    donor_id = post.get('donor_id')
    donor_name = 'Unknown Donor'
    if donor_id:
        try:
            donor = User.collection.find_one(
                {"_id": ObjectId(donor_id) if not isinstance(donor_id, ObjectId) else donor_id},
                {"name": 1, "businessName": 1}
            )
            if not donor:
                donor = User.collection.find_one({"_id": str(donor_id)}, {"name": 1, "businessName": 1})
            if donor:
                donor_name = donor.get('businessName') or donor.get('name') or donor_name
        except Exception:
            pass
    post['donor_name'] = donor_name
    if donor_id:
        post['donor_id'] = str(donor_id)
    return _json_safe(post)

@admin_bp.route('/posts', methods=['GET'])
@token_required
def get_all_posts():
    current_user = request.user_data
    if current_user['role'] != 'Admin':
        return jsonify({"error": "Admin access required"}), 403

    posts = []
    for post in FoodPost.collection.find().sort("_id", -1):
        posts.append(_serialize_admin_post(post))
    return jsonify(posts), 200

@admin_bp.route('/posts/<post_id>/reject', methods=['POST'])
@token_required
def reject_post(post_id):
    current_user = request.user_data
    if current_user['role'] != 'Admin':
        return jsonify({"error": "Admin access required"}), 403

    result = FoodPost.collection.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": {"status": "Rejected"}}
    )
    if result.matched_count == 0:
        return jsonify({"error": "Post not found"}), 404
    post = FoodPost.collection.find_one({"_id": ObjectId(post_id)}, {"donor_id": 1, "food_type": 1})
    if post and post.get('donor_id'):
        from utils.notifications import notify_post_rejected
        notify_post_rejected(str(post['donor_id']), post.get('food_type'))
    return jsonify({"message": "Food post rejected and hidden from the platform"}), 200

@admin_bp.route('/posts/<post_id>/approve', methods=['POST'])
@token_required
def approve_post(post_id):
    current_user = request.user_data
    if current_user['role'] != 'Admin':
        return jsonify({"error": "Admin access required"}), 403

    post = FoodPost.collection.find_one({"_id": ObjectId(post_id)})
    if not post:
        return jsonify({"error": "Post not found"}), 404

    new_status = "Available" if post.get('status') == "Rejected" else post.get('status', 'Available')
    FoodPost.collection.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": {"status": new_status}}
    )
    if post.get('donor_id'):
        from utils.notifications import notify_post_approved
        notify_post_approved(str(post['donor_id']), post.get('food_type'))
    if new_status == "Available" and not post.get("is_recurring"):
        try:
            from services.sms_claim import notify_beneficiaries_new_food
            notify_beneficiaries_new_food(post_id)
        except Exception as exc:
            print(f"SMS food alert skipped: {exc}")
    return jsonify({"message": "Food post approved and published"}), 200

@admin_bp.route('/requests', methods=['GET'])
@token_required
def get_all_requests():
    current_user = request.user_data
    if current_user['role'] != 'Admin':
        return jsonify({"error": "Admin access required"}), 403

    status_filter = request.args.get('status', 'All')
    requests = FoodRequest.get_all_for_admin(status_filter)
    summary = {
        "total": len(requests) if status_filter == "All" else FoodRequest.collection.count_documents({"status": {"$ne": "Deleted"}}),
        "active": FoodRequest.collection.count_documents({"status": "Active"}),
        "fulfilled": FoodRequest.collection.count_documents({"status": "Fulfilled"}),
    }
    return jsonify({"requests": requests, "summary": summary}), 200

@admin_bp.route('/deliveries', methods=['GET'])
@token_required
def get_all_deliveries():
    current_user = request.user_data
    if current_user['role'] != 'Admin':
        return jsonify({"error": "Admin access required"}), 403

    from services.delivery_escalation import maybe_process_escalations
    maybe_process_escalations()

    deliveries = []
    for task in DeliveryTask.collection.find().sort("created_at", -1):
        task['_id'] = str(task['_id'])
        task['post_id'] = str(task.get('post_id', ''))
        created_at = task.get('created_at')
        if hasattr(created_at, 'isoformat'):
            task['created_at'] = created_at.isoformat()
        escalated_at = task.get('escalated_at')
        if hasattr(escalated_at, 'isoformat'):
            task['escalated_at'] = escalated_at.isoformat()
        task['escalation_stage'] = task.get('escalation_stage', 'none')
        post = FoodPost.collection.find_one({"_id": ObjectId(task['post_id'])}) if task.get('post_id') else None
        if post:
            task['food_type'] = post.get('food_type', 'Food Donation')
        volunteer_id = task.get('volunteer_id')
        if volunteer_id:
            try:
                vol = User.collection.find_one(
                    {"$or": [{"_id": ObjectId(volunteer_id)}, {"_id": volunteer_id}]},
                    {"name": 1}
                )
                task['volunteer_name'] = vol.get('name', 'Volunteer') if vol else 'Volunteer'
            except Exception:
                task['volunteer_name'] = 'Volunteer'
        else:
            task['volunteer_name'] = None
        deliveries.append(_json_safe(task))
    return jsonify(deliveries), 200

@admin_bp.route('/deliveries/<task_id>/status', methods=['PATCH'])
@token_required
def update_delivery_status(task_id):
    current_user = request.user_data
    if current_user['role'] != 'Admin':
        return jsonify({"error": "Admin access required"}), 403

    data = request.json or {}
    new_status = data.get('status')
    allowed = ['Assigned', 'PickedUp', 'Delivered', 'Cancelled']
    if new_status not in allowed:
        return jsonify({"error": f"Status must be one of: {', '.join(allowed)}"}), 400

    task = DeliveryTask.collection.find_one({"_id": ObjectId(task_id)})
    if not task:
        return jsonify({"error": "Delivery task not found"}), 404

    DeliveryTask.collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"status": new_status}}
    )

    post_id = task.get('post_id')
    if post_id:
        if new_status == 'PickedUp':
            FoodPost.collection.update_one({"_id": ObjectId(post_id)}, {"$set": {"status": "In Transit"}})
        elif new_status == 'Delivered':
            FoodPost.collection.update_one({"_id": ObjectId(post_id)}, {"$set": {"status": "Delivered"}})
        elif new_status == 'Cancelled':
            FoodPost.collection.update_one({"_id": ObjectId(post_id)}, {"$set": {"status": "Available"}})

    return jsonify({"message": f"Delivery updated to {new_status}"}), 200

@admin_bp.route('/deliveries/process-escalations', methods=['POST'])
@token_required
def run_delivery_escalations():
    current_user = request.user_data
    if current_user['role'] != 'Admin':
        return jsonify({"error": "Admin access required"}), 403

    from services.delivery_escalation import process_delivery_escalations
    result = process_delivery_escalations()
    return jsonify({"message": "Escalation check completed", "result": result}), 200

@admin_bp.route('/deliveries/<task_id>/assign', methods=['POST'])
@token_required
def admin_assign_delivery(task_id):
    current_user = request.user_data
    if current_user['role'] != 'Admin':
        return jsonify({"error": "Admin access required"}), 403

    data = request.json or {}
    volunteer_id = data.get('volunteer_id')
    if not volunteer_id:
        return jsonify({"error": "volunteer_id is required"}), 400

    from services.fulfillment import admin_assign_volunteer
    success, message = admin_assign_volunteer(task_id, volunteer_id)
    if success:
        return jsonify({"message": message}), 200
    return jsonify({"error": message}), 400
