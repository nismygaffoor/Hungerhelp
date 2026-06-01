import os
import time
from datetime import datetime

from bson import ObjectId

from models.delivery import DeliveryTask
from models.food_post import FoodPost
from models.user import User
from utils.notifications import (
    notify_role,
    notify_user,
    food_label,
)

REMINDER_MINUTES = int(os.getenv("DELIVERY_REMINDER_MINUTES", "30"))
ESCALATION_MINUTES = int(os.getenv("DELIVERY_ESCALATION_MINUTES", "120"))

_last_escalation_check = 0


def maybe_process_escalations(throttle_seconds=60):
    """Run escalation checks at most once per throttle window."""
    global _last_escalation_check
    now = time.time()
    if now - _last_escalation_check < throttle_seconds:
        return {"skipped": True}
    _last_escalation_check = now
    return process_delivery_escalations()


def _task_age_minutes(task, now=None):
    created = task.get("created_at")
    if not created:
        return 0
    now = now or datetime.utcnow()
    if getattr(created, "tzinfo", None):
        created = created.replace(tzinfo=None)
    return (now - created).total_seconds() / 60


def _parties_for_task(task):
    post = FoodPost.collection.find_one({"_id": ObjectId(task["post_id"])}) if task.get("post_id") else None
    if not post:
        return None, None, None, None
    donor_id = str(post.get("donor_id", ""))
    beneficiary_id = str(post.get("claimed_by", "")) if post.get("claimed_by") else None
    food_type = post.get("food_type")
    post_id = str(post["_id"])
    return donor_id, beneficiary_id, food_type, post_id


def _remind_volunteers(task):
    _, _, food_type, _ = _parties_for_task(task)
    notify_role(
        "Volunteer",
        "delivery_reminder",
        {"food": food_label(food_type)},
        "/volunteer/tasks",
    )
    DeliveryTask.collection.update_one(
        {"_id": task["_id"]},
        {
            "$set": {
                "escalation_stage": "volunteer_reminded",
                "volunteer_reminder_at": datetime.utcnow(),
            }
        },
    )


def _escalate_task(task):
    donor_id, beneficiary_id, food_type, post_id = _parties_for_task(task)
    params = {"food": food_label(food_type)}

    if donor_id:
        notify_user(donor_id, "delivery_escalated_donor", params, f"/donor/donation/{post_id}")
    if beneficiary_id:
        notify_user(
            beneficiary_id,
            "delivery_escalated_beneficiary",
            params,
            f"/beneficiary/donation/{post_id}",
        )
    notify_role("Admin", "delivery_escalated_admin", params, "/admin/deliveries")

    DeliveryTask.collection.update_one(
        {"_id": task["_id"]},
        {
            "$set": {
                "escalation_stage": "escalated",
                "escalated_at": datetime.utcnow(),
            }
        },
    )
    FoodPost.collection.update_one(
        {"_id": ObjectId(task["post_id"])},
        {"$set": {"delivery_escalated": True}},
    )


def process_delivery_escalations():
    now = datetime.utcnow()
    processed = {"reminded": 0, "escalated": 0}

    cursor = DeliveryTask.collection.find(
        {
            "status": "Pending",
            "$or": [{"volunteer_id": None}, {"volunteer_id": {"$exists": False}}],
        }
    )

    for task in cursor:
        age = _task_age_minutes(task, now)
        stage = task.get("escalation_stage", "none")

        if age >= ESCALATION_MINUTES and stage != "escalated":
            _escalate_task(task)
            processed["escalated"] += 1
        elif age >= REMINDER_MINUTES and stage == "none":
            _remind_volunteers(task)
            processed["reminded"] += 1

    return processed
