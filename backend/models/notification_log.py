from datetime import datetime

from db import db


class NotificationLog:
    collection = db.notification_logs

    @staticmethod
    def log(
        user_id,
        channel,
        ntype,
        destination,
        status,
        provider_id=None,
        error=None,
    ):
        NotificationLog.collection.insert_one(
            {
                "user_id": str(user_id),
                "channel": channel,
                "type": ntype,
                "destination": destination,
                "status": status,
                "provider_id": provider_id,
                "error": error,
                "created_at": datetime.utcnow(),
            }
        )
