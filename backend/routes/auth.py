from flask import Blueprint, request, jsonify
from models.user import User
import jwt
import datetime
import os

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
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.find_by_email(data['email'])
    
    if user and User.verify_password(user['password'], data['password']):
        # Generate JWT Token
        token = jwt.encode({
            'user_id': str(user['_id']),
            'role': user['role'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "name": user['name'],
                "role": user['role'],
                "email": user['email']
            }
        }), 200
    
    return jsonify({"error": "Invalid email or password"}), 401
