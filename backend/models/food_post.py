from db import db
from datetime import datetime
from bson.objectid import ObjectId

class FoodPost:
    collection = db.food_posts

    @staticmethod
    def create(data):
        """
        data: dict with donor_id, food_type, quantity, location, expiry_time, description, is_recurring, frequency, day
        """
        post_doc = {
            "donor_id": data['donor_id'],
            "food_type": data['food_type'],
            "quantity": data['quantity'],
            "location": data['location'],
            "expiry_time": data.get('expiry_time'),
            "description": data.get('description', ""),
            "images": data.get('images', []),
            "status": data.get('status', "Available"),
            "is_recurring": data.get('is_recurring', False),
            "is_urgent": data.get('is_urgent', False),
            "frequency": data.get('frequency', ""),
            "day": data.get('day', ""),
            "destination": data.get('destination', ""),
            "items": data.get('items', []),
            "destination": data.get('destination', ""),  # Legacy field for backward compatibility
            "destination_type": data.get('destination_type', ""),  # e.g., "Elder's Home", "Orphanage"
            "destination_name": data.get('destination_name', ""),  # Specific beneficiary name
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
        
        cursor = FoodPost.collection.find(query).sort("created_at", -1)
        posts = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            posts.append(doc)
        return posts

    @staticmethod
    def get_by_donor(donor_id, is_recurring=None):
        query = {"donor_id": donor_id}
        if is_recurring is not None:
            query["is_recurring"] = is_recurring
            
        cursor = FoodPost.collection.find(query).sort("created_at", -1)
        posts = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
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
        if role != 'Admin' and post['donor_id'] != user_id:
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
            'food_type', 'quantity', 'location', 'expiry_time', 
            'description', 'is_recurring', 'is_urgent', 
            'frequency', 'day', 'destination', 'status', 'items',
            'destination_type', 'destination_name'
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
