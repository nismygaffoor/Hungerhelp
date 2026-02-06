from db import db
from datetime import datetime
from bson.objectid import ObjectId

class FoodPost:
    collection = db.food_posts

    @staticmethod
    def create(data):
        """
        data: dict with donor_id, food_type, quantity, location, expiry_time, description
        """
        post_doc = {
            "donor_id": data['donor_id'],
            "food_type": data['food_type'],
            "quantity": data['quantity'],
            "location": data['location'],
            "expiry_time": data.get('expiry_time'), # String or datetime
            "description": data.get('description', ""),
            "status": "Available", # Available, Claimed, Delivered, Expired
            "created_at": datetime.utcnow()
        }
        result = FoodPost.collection.insert_one(post_doc)
        return str(result.inserted_id)

    @staticmethod
    def get_all_available():
        # Retrieve all posts where status is 'Available'
        # Sort by creation time descending (newest first)
        cursor = FoodPost.collection.find({"status": "Available"}).sort("created_at", -1)
        posts = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            posts.append(doc)
        return posts

    @staticmethod
    def get_by_donor(donor_id):
        cursor = FoodPost.collection.find({"donor_id": donor_id}).sort("created_at", -1)
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
