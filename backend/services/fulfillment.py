from datetime import datetime

from bson import ObjectId

from models.delivery import DeliveryTask
from models.food_post import FoodPost
from models.claim import Claim
from models.user import User
from utils.notifications import notify_user, food_label


def _sync_claim(post_id, status):
    Claim.collection.update_one(
        {"post_id": ObjectId(post_id)},
        {"$set": {"status": status}},
    )


def _get_open_task(post_id):
    return DeliveryTask.get_by_post_id(post_id)


def _cancel_volunteer_task(task):
    if not task:
        return
    DeliveryTask.collection.update_one(
        {"_id": task["_id"]},
        {"$set": {"status": "Cancelled", "volunteer_id": None}},
    )


def _food_name(post):
    return food_label(post.get("food_type") if post else None)


def beneficiary_self_pickup(post_id, beneficiary_id):
    post = FoodPost.collection.find_one({"_id": ObjectId(post_id)})
    if not post:
        return False, "Post not found"
    if str(post.get("claimed_by", "")) != str(beneficiary_id):
        return False, "You can only update your own claims"
    if post.get("status") not in ("Claimed", "Pending Pickup"):
        return False, "This claim can no longer be switched to self pickup"

    task = _get_open_task(post_id)
    if task and task.get("status") not in ("Pending", "Assigned"):
        return False, "Delivery is already in progress"

    _cancel_volunteer_task(task)
    FoodPost.collection.update_one(
        {"_id": ObjectId(post_id)},
        {
            "$set": {
                "status": "Pending Pickup",
                "fulfillment_mode": "self_pickup",
                "delivery_escalated": False,
            }
        },
    )
    _sync_claim(post_id, "Pending Pickup")

    donor_id = str(post.get("donor_id", ""))
    if donor_id:
        notify_user(
            donor_id,
            "self_pickup_selected",
            {"food": _food_name(post)},
            f"/donor/donation/{post_id}",
        )

    return True, "Self pickup confirmed. Go to the donor pickup location."


def beneficiary_cancel_claim(post_id, beneficiary_id):
    post = FoodPost.collection.find_one({"_id": ObjectId(post_id)})
    if not post:
        return False, "Post not found"
    if str(post.get("claimed_by", "")) != str(beneficiary_id):
        return False, "You can only cancel your own claims"
    if post.get("status") in ("In Transit", "Delivered"):
        return False, "Delivery already started — cannot cancel"

    task = _get_open_task(post_id)
    _cancel_volunteer_task(task)

    FoodPost.collection.update_one(
        {"_id": ObjectId(post_id)},
        {
            "$set": {"status": "Available", "fulfillment_mode": None, "delivery_escalated": False},
            "$unset": {"claimed_by": "", "claimed_at": ""},
        },
    )
    _sync_claim(post_id, "Cancelled")

    donor_id = str(post.get("donor_id", ""))
    if donor_id:
        notify_user(
            donor_id,
            "claim_cancelled",
            {"food": _food_name(post)},
            f"/donor/donation/{post_id}",
        )

    return True, "Claim cancelled. Food is available for others again."


def donor_self_delivery(post_id, donor_id):
    post = FoodPost.collection.find_one({"_id": ObjectId(post_id)})
    if not post:
        return False, "Post not found"
    if str(post.get("donor_id", "")) != str(donor_id):
        return False, "Only the donor can offer to deliver"
    if post.get("status") not in ("Claimed", "Pending Pickup"):
        return False, "This donation is not waiting for delivery help"

    task = _get_open_task(post_id)
    if task and task.get("status") not in ("Pending", "Assigned"):
        return False, "A volunteer delivery is already in progress"

    _cancel_volunteer_task(task)
    FoodPost.collection.update_one(
        {"_id": ObjectId(post_id)},
        {
            "$set": {
                "status": "Pending Pickup",
                "fulfillment_mode": "donor_delivery",
                "delivery_escalated": False,
            }
        },
    )
    _sync_claim(post_id, "Pending Pickup")

    beneficiary_id = str(post.get("claimed_by", ""))
    if beneficiary_id:
        notify_user(
            beneficiary_id,
            "donor_will_deliver",
            {"food": _food_name(post)},
            f"/beneficiary/donation/{post_id}",
        )

    return True, "You will deliver this food to the beneficiary."


def admin_assign_volunteer(task_id, volunteer_id):
    volunteer = User.collection.find_one(
        {"$or": [{"_id": ObjectId(volunteer_id)}, {"_id": volunteer_id}]},
        {"name": 1, "role": 1},
    ) if volunteer_id else None

    if not volunteer or volunteer.get("role") != "Volunteer":
        return False, "Invalid volunteer"

    success = DeliveryTask.assign_volunteer(task_id, str(volunteer["_id"]))
    if not success:
        return False, "Task is no longer available for assignment"

    task = DeliveryTask.collection.find_one({"_id": ObjectId(task_id)})
    if task and task.get("post_id"):
        FoodPost.collection.update_one(
            {"_id": ObjectId(task["post_id"])},
            {
                "$set": {
                    "status": "Pending Pickup",
                    "fulfillment_mode": "volunteer",
                    "delivery_escalated": False,
                }
            },
        )
        _sync_claim(task["post_id"], "Pending Pickup")

        from utils.notifications import notify_volunteer_assigned

        post = FoodPost.collection.find_one({"_id": ObjectId(task["post_id"])})
        donor_id = str(post.get("donor_id", "")) if post else ""
        beneficiary_id = str(post.get("claimed_by", "")) if post and post.get("claimed_by") else ""
        notify_volunteer_assigned(
            donor_id,
            beneficiary_id,
            volunteer.get("name"),
            post.get("food_type") if post else None,
        )
        notify_user(
            str(volunteer["_id"]),
            "admin_assigned_task",
            {"food": _food_name(post)},
            "/volunteer/history",
        )

    return True, f"Assigned to {volunteer.get('name', 'volunteer')}"
