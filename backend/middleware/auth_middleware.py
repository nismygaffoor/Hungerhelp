from functools import wraps
from flask import request, jsonify
import jwt
import os
from models.user import User

SECRET_KEY = os.getenv("SECRET_KEY", "your_super_secret_key_here")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check if token is in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
            else:
                token = auth_header

        if not token:
            return jsonify({"error": "Token is missing"}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            # current_user = User.collection.find_one({"_id": object(data['user_id'])}) 
            # Skipped DB check for prototype speed, relying on signature.
            # For now, let's just pass the user data from token to be faster/simpler, 
            # or we can verify user exists.
            # Simplified for prototype:
            request.user_data = data # Attach user info to request
            
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        except Exception as e:
            return jsonify({"error": "Token invalid"}), 401

        return f(*args, **kwargs)

    return decorated
