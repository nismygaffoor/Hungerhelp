from db import db
from datetime import datetime
from bson.objectid import ObjectId

class FoodRequest:
    collection = db.requests

    @staticmethod
    def create(data):
        """
        data: dict with beneficiary_id, food_type, quantity, urgency, location
        """
        request_doc = {
            "beneficiary_id": data['beneficiary_id'],
            "food_type": data['food_type'],
            "quantity": data['quantity'],
            "urgency": data.get('urgency', 'Normal'), # High, Medium, Normal
            "location": data['location'],
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
            requests.append(doc)
        return requests

    @staticmethod
    def get_by_beneficiary(user_id):
        cursor = FoodRequest.collection.find({"beneficiary_id": user_id}).sort("created_at", -1)
        requests = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            requests.append(doc)
        return requests
