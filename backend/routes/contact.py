import re
from flask import Blueprint, request, jsonify
from models.contact_message import ContactMessage
from middleware.auth_middleware import token_required, _extract_token
import jwt
import os

contact_bp = Blueprint('contact', __name__)
SECRET_KEY = os.getenv('SECRET_KEY', 'your_super_secret_key_here')
EMAIL_PATTERN = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


def _optional_user_id():
    token = _extract_token()
    if not token:
        return None
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return data.get('user_id')
    except Exception:
        return None


@contact_bp.route('/', methods=['POST'])
def submit_contact():
    """Public endpoint — store a contact form message."""
    data = request.json or {}

    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    subject = (data.get('subject') or '').strip()
    message = (data.get('message') or '').strip()

    if not name or not email or not message:
        return jsonify({'error': 'Name, email, and message are required'}), 400

    if not EMAIL_PATTERN.match(email):
        return jsonify({'error': 'Please enter a valid email address'}), 400

    message_id = ContactMessage.create({
        'name': name,
        'email': email,
        'subject': subject or 'General Inquiry',
        'message': message,
        'user_id': _optional_user_id(),
    })

    return jsonify({
        'message': 'Contact message submitted successfully',
        'contact_id': message_id,
    }), 201


@contact_bp.route('/', methods=['GET'])
@token_required
def list_contact_messages():
    current_user = request.user_data
    if current_user.get('role') != 'Admin':
        return jsonify({'error': 'Admin access required'}), 403

    status_filter = (request.args.get('status') or '').strip().lower() or None
    messages = ContactMessage.get_all(status_filter)
    stats = ContactMessage.get_stats()
    return jsonify({'messages': messages, 'stats': stats}), 200


@contact_bp.route('/<message_id>/status', methods=['PATCH'])
@token_required
def update_contact_status(message_id):
    current_user = request.user_data
    if current_user.get('role') != 'Admin':
        return jsonify({'error': 'Admin access required'}), 403

    data = request.json or {}
    status = (data.get('status') or '').strip().lower()
    if status not in ContactMessage.VALID_STATUSES:
        return jsonify({'error': 'Invalid status'}), 400

    if not ContactMessage.update_status(message_id, status):
        return jsonify({'error': 'Contact message not found'}), 404

    return jsonify({'message': 'Contact message status updated'}), 200
