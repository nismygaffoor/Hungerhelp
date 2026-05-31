from db import db
from datetime import datetime
from bson.objectid import ObjectId

class FoodRequest:
    collection = db.requests

    @staticmethod
    def create(data):
        """
        data: dict with beneficiary_id, items (list), urgency, location, description, destination_type
        """
        request_doc = {
            "beneficiary_id": ObjectId(data['beneficiary_id']) if isinstance(data['beneficiary_id'], str) else data['beneficiary_id'],
            "items": data.get('items', []),
            "food_type": data.get('food_type', ""), # Fallback/Legacy
            "quantity": data.get('quantity', ""), # Fallback/Legacy
            "urgency": data.get('urgency', 'Normal'), # High, Medium, Normal
            "location": data.get('location', ""),
            "district": data.get('district', ''),
            "home_address": data.get('home_address', data.get('home_no', '')),
            "city": data.get('city', data.get('road', '')),
            "description": data.get('description', ""),
            "status": "Active", # Active, Fulfilled, Deleted
            "created_at": datetime.utcnow()
        }
        result = FoodRequest.collection.insert_one(request_doc)
        return str(result.inserted_id)

    @staticmethod
    def get_all_active():
        from models.user import User
        cursor = FoodRequest.collection.find({"status": "Active"}).sort("created_at", -1)
        requests = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            doc['beneficiary_id'] = str(doc['beneficiary_id'])
            
            # Enrich with beneficiary info
            beneficiary = User.collection.find_one({"_id": ObjectId(doc['beneficiary_id'])})
            if beneficiary:
                doc['beneficiary_name'] = beneficiary.get('name', 'Beneficiary')
                doc['beneficiary_type'] = beneficiary.get('beneficiaryType', 'Individual')
            
            requests.append(doc)
        return requests

    @staticmethod
    def get_by_beneficiary(user_id):
        query = {
            "$or": [
                {"beneficiary_id": ObjectId(user_id)},
                {"beneficiary_id": user_id}
            ],
            "status": {"$ne": "Deleted"}
        }
        cursor = FoodRequest.collection.find(query).sort("created_at", -1)
        requests = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            doc['beneficiary_id'] = str(doc['beneficiary_id'])
            requests.append(doc)
        return requests

    @staticmethod
    def delete(request_id, user_id):
        try:
            oid = ObjectId(request_id)
        except Exception:
            return False, "invalid_id"

        req = FoodRequest.collection.find_one({"_id": oid})
        if not req:
            return False, "not_found"

        if str(req.get("beneficiary_id")) != str(user_id):
            return False, "unauthorized"

        if req.get("status") == "Deleted":
            return True, "already_deleted"

        if req.get("status") == "Fulfilled":
            return False, "fulfilled"

        FoodRequest.collection.update_one(
            {"_id": oid},
            {"$set": {"status": "Deleted"}}
        )
        return True, "success"

    @staticmethod
    def update(request_id, user_id, data):
        try:
            oid = ObjectId(request_id)
        except Exception:
            return False, "invalid_id"

        req = FoodRequest.collection.find_one({"_id": oid})
        if not req:
            return False, "not_found"

        if str(req.get("beneficiary_id")) != str(user_id):
            return False, "unauthorized"

        if req.get("status") == "Fulfilled":
            return False, "fulfilled"

        if req.get("status") == "Deleted":
            return False, "deleted"

        update_fields = {}
        allowed = [
            'items', 'food_type', 'quantity', 'urgency', 'location',
            'district', 'home_address', 'city', 'description',
        ]
        for field in allowed:
            if field in data:
                update_fields[field] = data[field]

        if not update_fields:
            return False, "no_fields"

        FoodRequest.collection.update_one({"_id": oid}, {"$set": update_fields})
        return True, "success"
