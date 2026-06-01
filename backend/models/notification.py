from datetime import datetime
from bson import ObjectId
from db import db


class Notification:
    collection = db.notifications

    @staticmethod
    def create(user_id, ntype, params=None, link=None):
        doc = {
            "user_id": str(user_id),
            "type": ntype,
            "params": params or {},
            "link": link or "",
            "read": False,
            "created_at": datetime.utcnow(),
        }
        result = Notification.collection.insert_one(doc)
        return str(result.inserted_id)

    @staticmethod
    def _serialize(doc):
        created_at = doc.get("created_at")
        return {
            "_id": str(doc["_id"]),
            "type": doc.get("type", ""),
            "params": doc.get("params") or {},
            "link": doc.get("link", ""),
            "read": bool(doc.get("read")),
            "created_at": created_at.isoformat() if hasattr(created_at, "isoformat") else created_at,
        }

    @staticmethod
    def get_for_user(user_id, limit=30):
        cursor = (
            Notification.collection.find({"user_id": str(user_id)})
            .sort("created_at", -1)
            .limit(limit)
        )
        return [Notification._serialize(doc) for doc in cursor]

    @staticmethod
    def unread_count(user_id):
        return Notification.collection.count_documents(
            {"user_id": str(user_id), "read": False}
        )

    @staticmethod
    def mark_read(notification_id, user_id):
        result = Notification.collection.update_one(
            {"_id": ObjectId(notification_id), "user_id": str(user_id)},
            {"$set": {"read": True}},
        )
        return result.modified_count > 0

    @staticmethod
    def mark_all_read(user_id):
        result = Notification.collection.update_many(
            {"user_id": str(user_id), "read": False},
            {"$set": {"read": True}},
        )
        return result.modified_count
