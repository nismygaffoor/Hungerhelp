from flask import Blueprint, request, jsonify
from models.feedback import Feedback
from models.user import User
from middleware.auth_middleware import token_required
from bson import ObjectId

feedback_bp = Blueprint('feedback', __name__)

VALID_CATEGORIES = {
    'Donor': ['Platform Experience', 'Donation Process', 'Beneficiary Interaction', 'Other'],
    'Beneficiary': ['Platform Experience', 'Food Quality', 'Delivery Experience', 'Other'],
    'Volunteer': ['Platform Experience', 'Delivery Process', 'Pickup Coordination', 'Other'],
    'Admin': ['Platform Experience', 'Other'],
}


@feedback_bp.route('/', methods=['POST'])
@token_required
def submit_feedback():
    current_user = request.user_data
    data = request.json or {}

    rating = data.get('rating')
    message = (data.get('message') or '').strip()
    category = (data.get('category') or 'Other').strip()

    if not rating or not message:
        return jsonify({'error': 'Rating and message are required'}), 400

    try:
        rating = int(rating)
    except (TypeError, ValueError):
        return jsonify({'error': 'Rating must be a number between 1 and 5'}), 400

    if rating < 1 or rating > 5:
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400

    role = current_user.get('role', '')
    allowed = VALID_CATEGORIES.get(role, ['Other'])
    if category not in allowed:
        category = 'Other'

    user = User.collection.find_one({'_id': ObjectId(current_user['user_id'])}, {'name': 1})
    user_name = user.get('name', 'User') if user else 'User'

    feedback_id = Feedback.create({
        'user_id': current_user['user_id'],
        'user_name': user_name,
        'user_role': role,
        'category': category,
        'rating': rating,
        'message': message,
    })

    return jsonify({'message': 'Feedback submitted successfully', 'feedback_id': feedback_id}), 201


@feedback_bp.route('/my', methods=['GET'])
@token_required
def get_my_feedback():
    current_user = request.user_data
    items = Feedback.get_by_user(current_user['user_id'])
    return jsonify(items), 200


@feedback_bp.route('/', methods=['GET'])
@token_required
def get_all_feedback():
    current_user = request.user_data
    if current_user.get('role') != 'Admin':
        return jsonify({'error': 'Admin access required'}), 403

    role_filter = request.args.get('role', '').strip() or None
    items = Feedback.get_all(role_filter)
    stats = Feedback.get_stats()
    return jsonify({'feedback': items, 'stats': stats}), 200
