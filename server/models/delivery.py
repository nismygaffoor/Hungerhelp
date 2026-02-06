from db import db
from datetime import datetime
from bson.objectid import ObjectId

class DeliveryTask:
    collection = db.deliveries

    @staticmethod
    def create_task(post_id, pickup_location, dropoff_location):
        """
        Creates a new delivery task when food is claimed.
        """
        task_doc = {
            "post_id": post_id,
            "volunteer_id": None, # Initially unassigned
            "pickup_location": pickup_location,
            "dropoff_location": dropoff_location,
            "status": "Pending", # Pending, Assigned, PickedUp, Delivered
            "created_at": datetime.utcnow()
        }
        result = DeliveryTask.collection.insert_one(task_doc)
        return str(result.inserted_id)

    @staticmethod
    def get_available_tasks():
        # Get tasks that are Pending (no volunteer yet)
        cursor = DeliveryTask.collection.find({"status": "Pending"}).sort("created_at", -1)
        tasks = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            tasks.append(doc)
        return tasks

    @staticmethod
    def assign_volunteer(task_id, volunteer_id):
        result = DeliveryTask.collection.update_one(
            {"_id": ObjectId(task_id), "status": "Pending"},
            {"$set": {"volunteer_id": volunteer_id, "status": "Assigned"}}
        )
        return result.modified_count > 0

    @staticmethod
    def update_status(task_id, new_status):
        result = DeliveryTask.collection.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": {"status": new_status}}
        )
        return result.modified_count > 0
