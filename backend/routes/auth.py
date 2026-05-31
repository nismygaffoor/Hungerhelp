from flask import Blueprint, request, jsonify
from models.user import User
import jwt
import datetime
import os
from bson import ObjectId
from middleware.auth_middleware import token_required

auth_bp = Blueprint('auth', __name__)

SECRET_KEY = os.getenv("SECRET_KEY", "your_super_secret_key_here")

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    response, status = User.create_user(data)
    return jsonify(response), status

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or 'email' not in data or 'password' not in data or 'role' not in data:
        return jsonify({"error": "Email, password, and role are required"}), 400

    user = User.find_by_email(data['email'])
    
    if user and User.verify_password(user['password'], data['password']):
        # Verify role match (case-insensitive)
        if str(data['role']).lower() != str(user['role']).lower():
            return jsonify({"error": f"This account is registered as a {user['role']}, not a {data['role']}"}), 401

        token = jwt.encode({
            'user_id': str(user['_id']),
            'role': user['role'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": User.serialize_profile(user)
        }), 200
    
    return jsonify({"error": "Invalid email or password"}), 401

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me():
    current_user = request.user_data
    user = User.collection.find_one(
        {"_id": ObjectId(current_user['user_id'])},
        {"password": 0}
    )
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(User.serialize_profile(user)), 200

@auth_bp.route('/profile', methods=['PATCH'])
@token_required
def update_profile():
    current_user = request.user_data
    data = request.json or {}

    success = User.update_profile(current_user['user_id'], data)
    if not success:
        return jsonify({"error": "No valid fields to update"}), 400

    user = User.collection.find_one(
        {"_id": ObjectId(current_user['user_id'])},
        {"password": 0}
    )
    return jsonify({
        "message": "Profile updated successfully",
        "user": User.serialize_profile(user)
    }), 200
                                 