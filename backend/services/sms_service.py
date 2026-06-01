import os
import re

from bson import ObjectId

from models.notification_log import NotificationLog
from models.user import User

SMS_ENABLED = os.getenv("SMS_ENABLED", "false").lower() in ("1", "true", "yes")

SMS_TEMPLATES = {
    "food_claimed": "HungerHelp: {name} claimed your {food} donation.",
    "delivery_available": "HungerHelp: New delivery task — {food}. Open Volunteer Tasks to accept.",
    "volunteer_assigned": "HungerHelp: {volunteer} will deliver {food}.",
    "food_picked_up": "HungerHelp: {volunteer} picked up {food} and is on the way.",
    "food_delivered": "HungerHelp: {food} was delivered successfully.",
    "request_fulfilled": "HungerHelp: {donor} fulfilled your request for {food}.",
    "new_food_request": "HungerHelp: New request for {food} in {district}.",
    "account_verified": "HungerHelp: Your account is verified. You can use the platform now.",
    "account_rejected": "HungerHelp: Account verification rejected. {reason}",
    "post_approved": "HungerHelp: Your {food} donation post was approved.",
    "post_rejected": "HungerHelp: Your {food} donation post was rejected.",
    "verification_submitted": "HungerHelp: {name} ({role}) submitted verification documents.",
    "task_released": "HungerHelp: Volunteer released the delivery for {food}. Awaiting a new volunteer.",
    "delivery_reminder": "HungerHelp: Delivery still unassigned — {food}. Volunteers, please check Tasks.",
    "delivery_escalated_donor": "HungerHelp: No volunteer for {food}. Open your donation to choose self-pickup or deliver yourself.",
    "delivery_escalated_beneficiary": "HungerHelp: No volunteer for {food}. Open your claim to choose self-pickup or wait.",
    "delivery_escalated_admin": "HungerHelp: Delivery escalated — no volunteer for {food}. Admin action needed.",
    "self_pickup_selected": "HungerHelp: Beneficiary chose self pickup for {food}.",
    "claim_cancelled": "HungerHelp: Claim cancelled for {food}. It is available again.",
    "donor_will_deliver": "HungerHelp: Donor will deliver {food} to you.",
    "admin_assigned_task": "HungerHelp: Admin assigned you a delivery task — {food}.",
    "new_food_available": "HungerHelp: {food} in {city}. Reply CLAIM {code} to claim.",
}


def normalize_phone(contact, default_country_code="94"):
    """Convert local Sri Lankan numbers to E.164 (+94...)."""
    if not contact:
        return None

    raw = str(contact).strip()
    digits = re.sub(r"\D", "", raw)
    if not digits:
        return None

    if raw.startswith("+"):
        return "+" + digits

    if digits.startswith("0"):
        digits = default_country_code + digits[1:]
    elif not digits.startswith(default_country_code):
        digits = default_country_code + digits

    return "+" + digits


def build_sms_text(ntype, params=None):
    template = SMS_TEMPLATES.get(ntype)
    if not template:
        return None

    safe = {k: str(v) for k, v in (params or {}).items() if v is not None}
    try:
        return template.format_map(_SafeFormatDict(safe))
    except Exception:
        return template


class _SafeFormatDict(dict):
    def __missing__(self, key):
        return "{" + key + "}"


def send_sms(to_number, body):
    if not SMS_ENABLED:
        return {"ok": False, "skipped": True, "reason": "SMS disabled"}

    if not to_number or not body:
        return {"ok": False, "reason": "missing recipient or message body"}

    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_FROM_NUMBER")

    if not all([account_sid, auth_token, from_number]):
        return {"ok": False, "reason": "Twilio credentials not configured"}

    try:
        from twilio.rest import Client

        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=body[:1600],
            from_=from_number,
            to=to_number,
        )
        return {"ok": True, "sid": message.sid, "status": message.status}
    except Exception as exc:
        return {"ok": False, "error": str(exc)}


def send_notification_sms(user_id, ntype, params=None):
    try:
        oid = ObjectId(user_id)
    except Exception:
        oid = user_id

    user = User.collection.find_one({"_id": oid}, {"contact": 1})
    if not user:
        NotificationLog.log(
            user_id, "sms", ntype, None, "skipped", error="user not found"
        )
        return

    phone = normalize_phone(user.get("contact"))
    if not phone:
        NotificationLog.log(
            user_id, "sms", ntype, None, "skipped", error="no valid phone number"
        )
        return

    body = build_sms_text(ntype, params)
    if not body:
        NotificationLog.log(
            user_id, "sms", ntype, phone, "skipped", error="no SMS template"
        )
        return

    result = send_sms(phone, body)
    if result.get("ok"):
        NotificationLog.log(
            user_id,
            "sms",
            ntype,
            phone,
            "sent",
            provider_id=result.get("sid"),
        )
    elif result.get("skipped"):
        NotificationLog.log(
            user_id,
            "sms",
            ntype,
            phone,
            "skipped",
            error=result.get("reason"),
        )
    else:
        NotificationLog.log(
            user_id,
            "sms",
            ntype,
            phone,
            "failed",
            error=result.get("error") or result.get("reason"),
        )
