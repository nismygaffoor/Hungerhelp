from datetime import datetime

from bson import ObjectId

from models.claim import Claim
from models.delivery import DeliveryTask
from models.food_post import FoodPost
from models.user import User
from utils.location_helpers import get_user_delivery_address
from utils.notifications import food_label, notify_food_claimed, notify_new_delivery_task


def post_matches_beneficiary(post, beneficiary):
    dest_type = (post.get("destination_type") or "").strip()
    dest_name = (post.get("destination_name") or "").strip()
    beneficiary_type = (beneficiary.get("beneficiaryType") or "").strip()
    beneficiary_name = (beneficiary.get("name") or "").strip()

    if dest_name:
        if dest_name.lower() != beneficiary_name.lower():
            return False
    elif dest_type and dest_type.lower() != beneficiary_type.lower():
        return False

    post_district = (post.get("district") or "").strip()
    beneficiary_district = (beneficiary.get("district") or "").strip()
    if post_district and beneficiary_district:
        if post_district.lower() != beneficiary_district.lower():
            return False

    return True


def claim_food_post(post_id, beneficiary_id):
    """
    Claim an available food post for a beneficiary.
    Returns (success: bool, message: str, claim_id: str|None)
    """
    try:
        post = FoodPost.collection.find_one(
            {"_id": ObjectId(post_id), "status": "Available"}
        )
        if not post:
            return False, "Food post not found or already claimed.", None

        beneficiary = User.collection.find_one(
            {"_id": ObjectId(beneficiary_id)},
            {
                "name": 1,
                "role": 1,
                "is_verified": 1,
                "beneficiaryType": 1,
                "district": 1,
                "address": 1,
                "city": 1,
                "home_address": 1,
                "home_no": 1,
                "road": 1,
            },
        )
        if not beneficiary or beneficiary.get("role") != "Beneficiary":
            return False, "Only beneficiaries can claim food.", None

        if not beneficiary.get("is_verified"):
            return False, "Your account must be verified before claiming.", None

        if not post_matches_beneficiary(post, beneficiary):
            return False, "This donation is not available for your profile.", None

        FoodPost.collection.update_one(
            {"_id": ObjectId(post_id)},
            {
                "$set": {
                    "status": "Claimed",
                    "claimed_by": ObjectId(beneficiary_id),
                    "claimed_at": datetime.utcnow(),
                }
            },
        )

        claim_id = Claim.collection.insert_one(
            {
                "beneficiary_id": ObjectId(beneficiary_id),
                "post_id": ObjectId(post_id),
                "donor_id": post["donor_id"],
                "status": "Claimed",
                "claimed_at": datetime.utcnow(),
            }
        ).inserted_id

        dropoff_location = get_user_delivery_address(
            beneficiary, "Beneficiary Address"
        )
        DeliveryTask.create_task(
            post_id=post_id,
            pickup_location=post["location"],
            dropoff_location=dropoff_location,
            claim_id=str(claim_id),
        )

        notify_food_claimed(
            str(post.get("donor_id", "")),
            beneficiary.get("name") or "Someone",
            post.get("food_type"),
        )
        notify_new_delivery_task(post.get("food_type"))

        return True, "Food claimed successfully. A volunteer will be notified.", str(
            claim_id
        )
    except Exception as exc:
        return False, f"Failed to claim food: {exc}", None
