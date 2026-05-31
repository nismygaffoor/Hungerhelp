from db import db
from datetime import datetime
from bson.objectid import ObjectId

class FoodPost:
    collection = db.food_posts

    @staticmethod
    def _donor_id_filter(donor_id):
        try:
            oid = ObjectId(donor_id)
            return {"$or": [{"donor_id": oid}, {"donor_id": str(donor_id)}]}
        except Exception:
            return {"donor_id": donor_id}

    @staticmethod
    def _as_bool(value, default=False):
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.lower() == 'true'
        return default

    @staticmethod
    def create(data):
        """
        data: dict with donor_id, food_type, quantity, location, expiry_time, description, is_recurring, frequency, day
        """
        post_doc = {
            "donor_id": str(data['donor_id']),
            "food_type": data['food_type'],
            "quantity": data['quantity'],
            "location": data['location'],
            "district": data.get('district', ''),
            "home_address": data.get('home_address', data.get('home_no', '')),
            "city": data.get('city', data.get('road', '')),
            "expiry_time": data.get('expiry_time'),
            "description": data.get('description', ""),
            "images": data.get('images', []),
            "status": data.get('status', "Available"),
            "is_recurring": FoodPost._as_bool(data.get('is_recurring'), False),
            "is_urgent": FoodPost._as_bool(data.get('is_urgent'), False),
            "frequency": data.get('frequency', ""),
            "day": data.get('day', ""),
            "destination": data.get('destination', ""),
            "items": data.get('items', []),
            "destination_type": data.get('destination_type', ""),
            "destination_name": data.get('destination_name', ""),
            "claimed_by": data.get('claimed_by'),
            "claimed_at": data.get('claimed_at'),
            "matched_request_id": data.get('matched_request_id', ''),
            "created_at": datetime.utcnow()
        }
        result = FoodPost.collection.insert_one(post_doc)
        return str(result.inserted_id)

    @staticmethod
    def get_all_available():
        # Get current time as ISO string for lexicographical comparison
        now_iso = datetime.utcnow().isoformat()
        
        # Retrieve all non-recurring posts where status is 'Available'
        # Filter: Either no expiry time OR expiry time is in the future
        query = {
            "status": "Available",
            "is_recurring": False,
            "$or": [
                {"expiry_time": {"$gt": now_iso}},
                {"expiry_time": None},
                {"expiry_time": ""},
                {"expiry_time": {"$exists": False}}
            ]
        }
        
        cursor = FoodPost.collection.find(query).sort("_id", -1)
        posts = []
        for doc in cursor:
            # Convert all ObjectIds and datetime objects to strings for JSON serialization
            doc['_id'] = str(doc['_id'])
            for key, value in doc.items():
                if isinstance(value, ObjectId):
                    doc[key] = str(value)
                elif isinstance(value, datetime):
                    doc[key] = value.isoformat()
            posts.append(doc)
        return posts

    @staticmethod
    def get_by_donor(donor_id, is_recurring=None):
        query = FoodPost._donor_id_filter(donor_id)
        if is_recurring is not None:
            if is_recurring is False:
                recurring_filter = {"$or": [
                    {"is_recurring": False},
                    {"is_recurring": {"$exists": False}},
                    {"is_recurring": "false"},
                    {"is_recurring": None},
                ]}
            else:
                recurring_filter = {"is_recurring": True}
            query = {"$and": [query, recurring_filter]}
            
        cursor = FoodPost.collection.find(query).sort("_id", -1)
        posts = []
        for doc in cursor:
            # Convert all ObjectIds and datetime objects to strings for JSON serialization
            doc['_id'] = str(doc['_id'])
            for key, value in doc.items():
                if isinstance(value, ObjectId):
                    doc[key] = str(value)
                elif isinstance(value, datetime):
                    doc[key] = value.isoformat()
            posts.append(doc)
        return posts

    @staticmethod
    def delete(post_id, user_id, role):
        # Allow deletion if user is the owner OR is an Admin
        query = {"_id": ObjectId(post_id)}
        post = FoodPost.collection.find_one(query)
        
        if not post:
            return False, "Post not found"
        
        # Check permissions
        if role != 'Admin' and str(post.get('donor_id')) != str(user_id):
            return False, "Unauthorized"

        FoodPost.collection.delete_one(query)
        return True, "Deleted successfully"

    @staticmethod
    def update(post_id, user_id, data):
        """
        Update a food post. Verify ownership.
        """
        query = {"_id": ObjectId(post_id), "donor_id": user_id}
        
        # Build update document
        update_fields = {}
        allowed_fields = [
            'food_type', 'quantity', 'location', 'district', 'home_address', 'city', 'expiry_time', 
            'description', 'is_recurring', 'is_urgent', 
            'frequency', 'day', 'destination', 'status', 'items',
            'destination_type', 'destination_name', 'images'
        ]
        
        for field in allowed_fields:
            if field in data:
                update_fields[field] = data[field]
                
        if not update_fields:
            return False, "No valid fields to update"
            
        result = FoodPost.collection.update_one(query, {"$set": update_fields})
        
        if result.matched_count > 0:
            return True, "Updated successfully"
        return False, "Post not found or unauthorized"
