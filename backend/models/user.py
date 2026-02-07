from db import db
import bcrypt
from datetime import datetime

class User:
    collection = db.users

    @staticmethod
    def create_user(data):
        """
        Creates a new user.
        data: dict containing name, email, password, role, contact, address
        """
        # Validate required fields
        required_fields = ['name', 'email', 'password', 'role']
        for field in required_fields:
            if field not in data:
                return {"error": f"{field} is required"}, 400

        # Check if email already exists
        if User.collection.find_one({"email": data['email']}):
            return {"error": "Email already exists"}, 400

        # Hash password
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

        user_doc = {
            "name": data['name'],
            "email": data['email'],
            "password": hashed_password,  # Store binary hash
            "role": data['role'],         # Donor, Beneficiary, Volunteer, Admin
            "contact": data.get('contact', ""),
            "address": data.get('address', ""),
            "is_verified": False if data['role'] != 'Admin' else True, # Admins auto-verified for now (or manual)
            "created_at": datetime.utcnow()
        }

        result = User.collection.insert_one(user_doc)
        return {"message": "User created successfully", "user_id": str(result.inserted_id)}, 201

    @staticmethod
    def find_by_email(email):
        return User.collection.find_one({"email": email})

    @staticmethod
    def verify_password(stored_password, provided_password):
        return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password)
