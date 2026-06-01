import re

from bson import ObjectId

from models.food_post import FoodPost
from models.user import User
from services.food_claim import claim_food_post, post_matches_beneficiary
from services.sms_service import build_sms_text, normalize_phone, send_sms
from utils.notifications import food_label


def find_beneficiary_by_phone(phone):
    normalized = normalize_phone(phone)
    if not normalized:
        return None

    for user in User.collection.find({"role": "Beneficiary"}):
        if normalize_phone(user.get("contact")) == normalized:
            return user
    return None


def get_available_posts_for_beneficiary(beneficiary):
    posts = FoodPost.get_all_available()
    return [post for post in posts if post_matches_beneficiary(post, beneficiary)]


def notify_beneficiaries_new_food(post_id):
    post = FoodPost.collection.find_one({"_id": ObjectId(post_id)})
    if not post or post.get("status") != "Available":
        return

    code = post.get("sms_claim_code")
    if not code:
        import secrets

        code = secrets.token_hex(3).upper()
        FoodPost.collection.update_one(
            {"_id": post["_id"]},
            {"$set": {"sms_claim_code": code}},
        )

    food = food_label(post.get("food_type"))
    city = (post.get("city") or post.get("district") or "your area").strip()
    body = build_sms_text(
        "new_food_available",
        {"food": food, "city": city, "code": code},
    )
    if not body:
        return

    for beneficiary in User.collection.find({"role": "Beneficiary"}, {"contact": 1}):
        if not post_matches_beneficiary(post, beneficiary):
            continue
        phone = normalize_phone(beneficiary.get("contact"))
        if phone:
            send_sms(phone, body)


def claim_food_by_sms_code(code, beneficiary_id):
    post = FoodPost.collection.find_one(
        {"sms_claim_code": code.upper(), "status": "Available"}
    )
    if not post:
        return False, "Invalid or expired claim code.", None

    return claim_food_post(str(post["_id"]), beneficiary_id)


def handle_inbound_sms(from_phone, body):
    text = (body or "").strip()
    upper = text.upper()

    if upper in ("HELP", "?"):
        return (
            "HungerHelp commands:\n"
            "LIST - show available food\n"
            "CLAIM XXXXXX - claim using code from alert"
        )

    if upper == "LIST":
        beneficiary = find_beneficiary_by_phone(from_phone)
        if not beneficiary:
            return "HungerHelp: Phone not registered. Add your number in your HungerHelp profile."
        posts = get_available_posts_for_beneficiary(beneficiary)[:5]
        if not posts:
            return "HungerHelp: No food available for you right now."
        lines = ["HungerHelp available food:"]
        for post in posts:
            code = post.get("sms_claim_code") or "------"
            food = food_label(post.get("food_type"))
            city = post.get("city") or post.get("district") or ""
            lines.append(f"{code} {food} ({city})")
        lines.append("Reply CLAIM XXXXXX to claim.")
        return "\n".join(lines)

    match = re.match(r"^CLAIM\s+([A-F0-9]{6})$", upper)
    if not match:
        return (
            "HungerHelp: Reply CLAIM XXXXXX using the code from the alert, "
            "or LIST to see available food."
        )

    beneficiary = find_beneficiary_by_phone(from_phone)
    if not beneficiary:
        return "HungerHelp: Phone not registered. Add your number in your HungerHelp profile."

    success, message, _ = claim_food_by_sms_code(
        match.group(1), str(beneficiary["_id"])
    )
    if success:
        return f"HungerHelp: {message}"
    return f"HungerHelp: {message}"
