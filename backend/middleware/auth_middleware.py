from functools import wraps
from flask import request, jsonify
import jwt
import os
from bson import ObjectId
from models.user import User

SECRET_KEY = os.getenv("SECRET_KEY", "your_super_secret_key_here")

UNVERIFIED_ALLOWED_PREFIXES = (
    '/auth/',
    '/admin',
    '/users/verification-documents',
    '/users/profile-stats',
    '/notifications',
    '/sms/',
)

def _extract_token():
    if 'Authorization' not in request.headers:
        return None
    auth_header = request.headers['Authorization']
    if auth_header.startswith('Bearer '):
        return auth_header.split(' ')[1]
    return auth_header

def _is_access_locked(user):
    """Lock platform only after admin rejection (including re-submission pending review)."""
    if not user or user.get('is_verified'):
        return False
    if user.get('verification_status') == 'rejected':
        return True
    if user.get('rejection_reason'):
        return True
    return False

def check_platform_access():
    """
    First-time unverified users can use the full platform.
    Rejected users (even after re-uploading documents) are limited to profile/auth until re-approved.
    """
    if request.method == 'OPTIONS':
        return None

    path = request.path or ''
    if path == '/' or path.startswith('/uploads/') or path.startswith('/sms/'):
        return None

    for prefix in UNVERIFIED_ALLOWED_PREFIXES:
        if path.startswith(prefix):
            return None

    token = _extract_token()
    if not token:
        return None

    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except Exception:
        return None

    if data.get('role') == 'Admin':
        return None

    try:
        user = User.collection.find_one(
            {"_id": ObjectId(data['user_id'])},
            {"is_verified": 1, "verification_status": 1, "rejection_reason": 1}
        )
    except Exception:
        return None

    if not _is_access_locked(user):
        return None

    status = user.get('verification_status', 'rejected')
    if status == 'pending' and user.get('rejection_reason'):
        message = (
            'Your re-submitted documents are under review. Platform access stays locked '
            'until an admin re-approves your account.'
        )
    else:
        message = (
            'Your account was rejected. Please re-upload verification documents in your profile. '
            'Food and claim features stay locked until an admin re-approves you.'
        )

    return jsonify({
        'error': message,
        'code': 'verification_required',
        'verification_status': status,
        'rejection_reason': user.get('rejection_reason', ''),
    }), 403

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = _extract_token()

        if not token:
            return jsonify({"error": "Token is missing"}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user_data = data
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        except Exception:
            return jsonify({"error": "Token invalid"}), 401

        return f(*args, **kwargs)

    return decorated
