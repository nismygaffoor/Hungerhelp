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
            "description": data.get('description', ""),
            "status": "Active", # Active, Fulfilled, Deleted
            "created_at": datetime.utcnow()
        }
        result = FoodRequest.collection.insert_one(request_doc)
        return str(result.inserted_id)

    @staticmethod
    def get_all_active():
        cursor = FoodRequest.collection.find({"status": "Active"}).sort("created_at", -1)
        requests = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            doc['beneficiary_id'] = str(doc['beneficiary_id'])
            requests.append(doc)
        return requests

    @staticmethod
    def get_by_beneficiary(user_id):
        query = {"beneficiary_id": ObjectId(user_id)}
        cursor = FoodRequest.collection.find(query).sort("created_at", -1)
        requests = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            doc['beneficiary_id'] = str(doc['beneficiary_id'])
            requests.append(doc)
        return requests

    @staticmethod
    def delete(request_id, user_id):
        result = FoodRequest.collection.update_one(
            {"_id": ObjectId(request_id), "beneficiary_id": ObjectId(user_id)},
            {"$set": {"status": "Deleted"}}
        )
        return result.modified_count > 0
