from db import db
import bcrypt
import uuid
from datetime import datetime
from bson import ObjectId
from utils.location_helpers import normalize_user_address

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

        data = normalize_user_address(data)

        user_doc = {
            "name": data['name'],
            "email": data['email'],
            "password": hashed_password,  # Store binary hash
            "role": data['role'],         # Donor, Beneficiary, Volunteer, Admin
            "contact": data.get('contact', ""),
            "address": data.get('address', ""),
            "district": data.get('district', ''),
            "home_address": data.get('home_address', data.get('home_no', '')),
            "city": data.get('city', data.get('road', '')),
            "businessName": data.get('businessName', ""),  # Donor-specific
            "beneficiaryType": data.get('beneficiaryType', ""),  # Beneficiary-specific
            "language": data.get('language', ""),  # Beneficiary-specific
            "experience": data.get('experience', ""),  # Volunteer-specific
            "is_verified": False if data['role'] != 'Admin' else True,
            "verification_documents": [],
            "verification_status": "verified" if data['role'] == 'Admin' else "not_submitted",
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

    @staticmethod
    def search_beneficiaries(query):
        """Search for users with role 'Beneficiary' by name (partial match)."""
        if not query:
            return []
        
        # Case-insensitive partial match
        cursor = User.collection.find({
            "role": "Beneficiary",
            "name": {"$regex": query, "$options": "i"}
        }, {"password": 0}).limit(10)
        
        users = []
        for u in cursor:
            u['_id'] = str(u['_id'])
            users.append(u)
        return users

    @staticmethod
    def find_beneficiary_by_name(name):
        """Find a beneficiary by exact name."""
        return User.collection.find_one({
            "role": "Beneficiary",
            "name": name
        }, {"password": 0})

    @staticmethod
    def update_profile(user_id, data):
        allowed_fields = ['name', 'contact', 'address', 'district', 'home_address', 'city', 'language', 'businessName', 'beneficiaryType', 'experience']
        updates = {k: data[k] for k in allowed_fields if k in data}
        if not updates:
            return False
        updates = normalize_user_address(updates)
        from bson import ObjectId
        result = User.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": updates}
        )
        return result.matched_count > 0

    @staticmethod
    def serialize_profile(user):
        created_at = user.get('created_at')
        return {
            "user_id": str(user['_id']),
            "name": user.get('name', ''),
            "email": user.get('email', ''),
            "role": user.get('role', ''),
            "contact": user.get('contact', ''),
            "address": user.get('address', ''),
            "district": user.get('district', ''),
            "home_address": user.get('home_address', user.get('home_no', '')),
            "city": user.get('city', user.get('road', '')),
            "language": user.get('language', 'English'),
            "businessName": user.get('businessName', ''),
            "beneficiaryType": user.get('beneficiaryType', ''),
            "experience": user.get('experience', ''),
            "is_verified": user.get('is_verified', False),
            "verification_status": user.get('verification_status', 'not_submitted'),
            "verification_documents": user.get('verification_documents', []),
            "rejection_reason": user.get('rejection_reason', ''),
            "created_at": created_at.isoformat() if created_at else None,
        }

    @staticmethod
    def add_verification_document(user_id, doc_type, file_path, original_name):
        doc = {
            "_id": str(uuid.uuid4()),
            "doc_type": doc_type,
            "filename": file_path,
            "original_name": original_name,
            "uploaded_at": datetime.utcnow().isoformat(),
        }
        User.collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$push": {"verification_documents": doc},
                "$set": {
                    "verification_status": "pending",
                    "is_verified": False,
                },
            }
        )
        return doc

    @staticmethod
    def remove_verification_document(user_id, doc_id):
        result = User.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$pull": {"verification_documents": {"_id": doc_id}}}
        )
        if result.modified_count == 0:
            return False

        user = User.collection.find_one(
            {"_id": ObjectId(user_id)},
            {"verification_documents": 1, "is_verified": 1, "verification_status": 1, "rejection_reason": 1}
        )
        if user and not user.get('is_verified'):
            if user.get('verification_documents'):
                User.collection.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$set": {"verification_status": "pending", "is_verified": False}}
                )
            elif user.get('rejection_reason') or user.get('verification_status') == 'rejected':
                User.collection.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$set": {"verification_status": "rejected", "is_verified": False}}
                )
            else:
                User.collection.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$set": {"verification_status": "not_submitted", "is_verified": False}}
                )
        return True
