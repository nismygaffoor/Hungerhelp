from models.notification import Notification
from models.user import User


PROFILE_LINKS = {
    "Donor": "/donor/profile",
    "Beneficiary": "/beneficiary/profile",
    "Volunteer": "/volunteer/profile",
}

DASHBOARD_LINKS = {
    "Donor": "/donor/dashboard",
    "Beneficiary": "/beneficiary/dashboard",
    "Volunteer": "/volunteer/dashboard",
}


def notify_user(user_id, ntype, params=None, link=None):
    if not user_id:
        return None
    user_id = str(user_id)
    notification_id = Notification.create(user_id, ntype, params, link)
    _dispatch_sms(user_id, ntype, params)
    return notification_id


def _dispatch_sms(user_id, ntype, params):
    try:
        from services.sms_service import send_notification_sms

        send_notification_sms(user_id, ntype, params)
    except Exception:
        pass


def notify_users(user_ids, ntype, params=None, link=None):
    for user_id in user_ids:
        notify_user(user_id, ntype, params, link)


def notify_role(role, ntype, params=None, link=None):
    import re
    pattern = re.compile(f"^{re.escape(role)}$", re.IGNORECASE)
    for user in User.collection.find({}, {"_id": 1, "role": 1}):
        if pattern.match(user.get("role") or ""):
            notify_user(str(user["_id"]), ntype, params, link)


def food_label(value, fallback="Food donation"):
    if not value:
        return fallback
    return str(value).split(" - ")[0].strip() or fallback


def notify_food_claimed(donor_id, beneficiary_name, food_type):
    notify_user(
        str(donor_id) if donor_id else None,
        "food_claimed",
        {"name": beneficiary_name or "Someone", "food": food_label(food_type)},
        "/donor/history",
    )


def notify_beneficiaries_new_food_available(post_id):
    """In-app (+ SMS via notify_user) alert for eligible beneficiaries when food is posted."""
    from bson import ObjectId
    from models.food_post import FoodPost
    from services.food_claim import post_matches_beneficiary

    try:
        post = FoodPost.collection.find_one({"_id": ObjectId(post_id)})
    except Exception:
        return
    if not post or post.get("status") != "Available":
        return

    food = food_label(post.get("food_type"))
    city = (post.get("city") or post.get("district") or "your area").strip()
    donor_name = "A donor"
    donor_id = post.get("donor_id")
    if donor_id:
        try:
            oid = ObjectId(str(donor_id))
        except Exception:
            oid = donor_id
        donor = User.collection.find_one(
            {"_id": oid},
            {"name": 1, "businessName": 1},
        )
        if donor:
            donor_name = donor.get("businessName") or donor.get("name") or donor_name

    for beneficiary in User.collection.find({"role": {"$regex": "^Beneficiary$", "$options": "i"}}):
        if not post_matches_beneficiary(post, beneficiary):
            continue
        notify_user(
            str(beneficiary["_id"]),
            "new_food_available",
            {
                "food": food,
                "city": city,
                "donor": donor_name,
                "code": post.get("sms_claim_code") or "",
            },
            "/beneficiary/claim",
        )


def notify_new_delivery_task(food_type):
    notify_role(
        "Volunteer",
        "delivery_available",
        {"food": food_label(food_type)},
        "/volunteer/tasks",
    )


def notify_volunteer_assigned(donor_id, beneficiary_id, volunteer_name, food_type):
    params = {
        "volunteer": volunteer_name or "A volunteer",
        "food": food_label(food_type),
    }
    if donor_id:
        notify_user(donor_id, "volunteer_assigned", params, "/donor/history")
    if beneficiary_id:
        notify_user(beneficiary_id, "volunteer_assigned", params, "/beneficiary/history")


def notify_food_picked_up(donor_id, beneficiary_id, volunteer_name, food_type):
    params = {
        "volunteer": volunteer_name or "Volunteer",
        "food": food_label(food_type),
    }
    if donor_id:
        notify_user(donor_id, "food_picked_up", params, "/donor/history")
    if beneficiary_id:
        notify_user(beneficiary_id, "food_picked_up", params, "/beneficiary/history")


def notify_food_delivered(donor_id, beneficiary_id, food_type):
    params = {"food": food_label(food_type)}
    if donor_id:
        notify_user(donor_id, "food_delivered", params, "/donor/history")
    if beneficiary_id:
        notify_user(beneficiary_id, "food_delivered", params, "/beneficiary/history")


def notify_request_fulfilled(beneficiary_id, donor_name, food_type):
    notify_user(
        beneficiary_id,
        "request_fulfilled",
        {"donor": donor_name or "A donor", "food": food_label(food_type)},
        "/beneficiary/my-requests",
    )


def notify_new_food_request(food_type, district):
    notify_role(
        "Donor",
        "new_food_request",
        {"food": food_label(food_type), "district": district or "your area"},
        "/donor/requestedfood",
    )


def notify_account_verified(user_id, role):
    notify_user(
        user_id,
        "account_verified",
        {},
        DASHBOARD_LINKS.get(role, "/dashboard"),
    )


def notify_account_rejected(user_id, reason, role):
    notify_user(
        user_id,
        "account_rejected",
        {"reason": reason or "Please contact support."},
        PROFILE_LINKS.get(role, "/dashboard"),
    )


def notify_post_approved(donor_id, food_type):
    notify_user(
        donor_id,
        "post_approved",
        {"food": food_label(food_type)},
        "/donor/history",
    )


def notify_post_rejected(donor_id, food_type):
    notify_user(
        donor_id,
        "post_rejected",
        {"food": food_label(food_type)},
        "/donor/history",
    )


def notify_verification_submitted(user_name, user_role):
    notify_role(
        "Admin",
        "verification_submitted",
        {"name": user_name or "User", "role": user_role or "User"},
        "/admin/users",
    )


def notify_task_released(donor_id, beneficiary_id, food_type):
    params = {"food": food_label(food_type)}
    if donor_id:
        notify_user(donor_id, "task_released", params, "/donor/history")
    if beneficiary_id:
        notify_user(beneficiary_id, "task_released", params, "/beneficiary/history")
