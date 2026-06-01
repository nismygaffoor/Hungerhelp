from db import db
from datetime import datetime
from bson.objectid import ObjectId

class DeliveryTask:
    collection = db.deliveries

    @staticmethod
    def create_task(post_id, pickup_location, dropoff_location, claim_id=None):
        """
        Creates a new delivery task when food is claimed.
        """
        task_doc = {
            "post_id": post_id,
            "claim_id": claim_id,
            "volunteer_id": None, # Initially unassigned
            "pickup_location": pickup_location,
            "dropoff_location": dropoff_location,
            "status": "Pending", # Pending, Assigned, PickedUp, Delivered
            "escalation_stage": "none",
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

    @staticmethod
    def _post_id_query(post_id):
        try:
            oid = ObjectId(post_id)
            return {"$or": [{"post_id": post_id}, {"post_id": oid}, {"post_id": str(oid)}]}
        except Exception:
            return {"post_id": post_id}

    @staticmethod
    def get_by_post_id(post_id):
        return DeliveryTask.collection.find_one(DeliveryTask._post_id_query(post_id))

    @staticmethod
    def release_volunteer(task_id, volunteer_id):
        """Return task to the open pool if still at Assigned (not picked up yet)."""
        try:
            vid = volunteer_id
            oid = ObjectId(volunteer_id)
            volunteer_filter = {"$or": [{"volunteer_id": vid}, {"volunteer_id": oid}, {"volunteer_id": str(oid)}]}
        except Exception:
            volunteer_filter = {"volunteer_id": volunteer_id}

        query = {
            "_id": ObjectId(task_id),
            "status": "Assigned",
        }
        query.update(volunteer_filter)

        result = DeliveryTask.collection.update_one(
            query,
            {"$set": {"volunteer_id": None, "status": "Pending"}},
        )
        return result.modified_count > 0

    @staticmethod
    def serialize_for_post(post_id):
        """Build delivery summary for food post detail responses."""
        from models.user import User

        task = DeliveryTask.get_by_post_id(post_id)
        if not task:
            return None

        info = {
            "delivery_task_id": str(task["_id"]),
            "delivery_status": task.get("status"),
            "dropoff_location": task.get("dropoff_location", ""),
            "pickup_location": task.get("pickup_location", ""),
            "volunteer_id": None,
            "volunteer_name": None,
            "volunteer_contact": None,
            "escalation_stage": task.get("escalation_stage", "none"),
            "escalated_at": task.get("escalated_at").isoformat() if hasattr(task.get("escalated_at"), "isoformat") else task.get("escalated_at"),
            "awaiting_volunteer": task.get("status") == "Pending" and not task.get("volunteer_id"),
            "escalated": task.get("escalation_stage") == "escalated",
        }

        vid = task.get("volunteer_id")
        if not vid:
            return info

        info["volunteer_id"] = str(vid)
        try:
            vol_query = {"$or": [{"_id": ObjectId(vid)}, {"_id": vid}]}
        except Exception:
            vol_query = {"_id": vid}
        volunteer = User.collection.find_one(vol_query, {"name": 1, "contact": 1})
        if volunteer:
            info["volunteer_name"] = volunteer.get("name")
            info["volunteer_contact"] = volunteer.get("contact", "")

        return info
