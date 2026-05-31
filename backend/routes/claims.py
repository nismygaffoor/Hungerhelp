from flask import Blueprint, request, jsonify
from models.claim import Claim
from models.food_post import FoodPost
from middleware.auth_middleware import token_required
from bson import ObjectId

claims_bp = Blueprint('claims', __name__)

ACTIVE_STATUSES = ['Claimed', 'Pending Pickup', 'In Transit']

def _status_from_post(post, claim):
    """Use food post status as source of truth for delivery progress."""
    if post and post.get('status'):
        return post.get('status')
    return claim.get('status', 'Unknown')

def _get_claim_status(claim, post=None):
    if post is not None:
        return _status_from_post(post, claim)
    post = FoodPost.collection.find_one({"_id": ObjectId(claim['post_id'])})
    return _status_from_post(post, claim)

def _collect_post_images(post):
    display_images = post.get('images', [])
    if display_images:
        return display_images
    all_item_images = []
    for item in post.get('items', []):
        if 'images' in item:
            all_item_images.extend(item['images'])
    return all_item_images

def _fetch_posts_by_claims(claims):
    if not claims:
        return {}
    post_ids = []
    for claim in claims:
        pid = claim.get('post_id')
        if pid:
            post_ids.append(pid if isinstance(pid, ObjectId) else ObjectId(pid))
    if not post_ids:
        return {}
    return {
        str(post['_id']): post
        for post in FoodPost.collection.find({"_id": {"$in": post_ids}})
    }

def _fetch_donor_names(posts):
    from models.user import User
    donor_ids = set()
    for post in posts.values():
        donor_id = post.get('donor_id')
        if donor_id:
            donor_ids.add(donor_id if isinstance(donor_id, ObjectId) else ObjectId(donor_id))
    if not donor_ids:
        return {}
    return {
        str(donor['_id']): donor.get('businessName') or donor.get('name') or "Unknown Donor"
        for donor in User.collection.find(
            {"_id": {"$in": list(donor_ids)}},
            {"name": 1, "businessName": 1}
        )
    }

@claims_bp.route('/my-claims', methods=['GET'])
@token_required
def get_my_claims():
    """Get all claims for the logged-in beneficiary"""
    current_user = request.user_data
    if current_user['role'] != 'Beneficiary':
        return jsonify({"message": "Unauthorized"}), 403

    claims = Claim.find_by_beneficiary(current_user['user_id'])
    posts = _fetch_posts_by_claims(claims)
    donor_names = _fetch_donor_names(posts)

    enriched_claims = []
    for claim in claims:
        post = posts.get(str(claim['post_id']))
        if not post:
            continue

        donor_id = str(post.get('donor_id', ''))
        enriched_claims.append({
            "id": str(claim['_id']),
            "post_id": str(claim['post_id']),
            "food_type": post.get('food_type', 'Unknown Food'),
            "quantity": post.get('quantity', 'N/A'),
            "donor_id": donor_id,
            "donor_name": donor_names.get(donor_id, "Unknown Donor"),
            "status": _status_from_post(post, claim),
            "claimed_at": claim['claimed_at'],
            "images": _collect_post_images(post),
            "location": post.get('location', '')
        })
            
    return jsonify(enriched_claims), 200

@claims_bp.route('/stats', methods=['GET'])
@token_required
def get_dashboard_stats():
    """Get beneficiary dashboard stats"""
    current_user = request.user_data
    if current_user['role'] != 'Beneficiary':
        return jsonify({"message": "Unauthorized"}), 403
        
    stats = Claim.get_stats(current_user['user_id'])
    all_claims = Claim.find_by_beneficiary(current_user['user_id'])
    posts = _fetch_posts_by_claims(all_claims)

    total_claimed = len(all_claims)
    pending_pickups = sum(
        1 for c in all_claims
        if _status_from_post(posts.get(str(c['post_id'])), c) in ACTIVE_STATUSES
    )
    delivered = sum(
        1 for c in all_claims
        if _status_from_post(posts.get(str(c['post_id'])), c) == 'Delivered'
    )

    stats = {
        "total_claimed": total_claimed,
        "pending_pickups": pending_pickups,
        "delivered": delivered,
    }

    beneficiary_query = {
        "$or": [
            {"beneficiary_id": ObjectId(current_user['user_id'])},
            {"beneficiary_id": current_user['user_id']},
        ]
    }
    from models.request import FoodRequest
    active_requests = FoodRequest.collection.count_documents({**beneficiary_query, "status": "Active"})
    fulfilled_requests = FoodRequest.collection.count_documents({**beneficiary_query, "status": "Fulfilled"})
    donor_names = _fetch_donor_names(posts)

    recent_activity = []
    for claim in all_claims[:5]:
        post = posts.get(str(claim['post_id']))
        if post:
            donor_id = str(post.get('donor_id', ''))
            claimed_at = claim.get('claimed_at')
            recent_activity.append({
                "title": post.get('food_type', 'Food Claim').split(' - ')[0],
                "time": claimed_at.isoformat() if hasattr(claimed_at, 'isoformat') else str(claimed_at),
                "status": _status_from_post(post, claim),
                "post_id": str(claim['post_id']),
                "donor_name": donor_names.get(donor_id, 'Community Donor'),
            })

    recent_requests = []
    for req in FoodRequest.get_by_beneficiary(current_user['user_id'])[:3]:
        items = req.get('items') or []
        recent_requests.append({
            "id": req['_id'],
            "title": items[0].get('category', req.get('food_type', 'Food Request')) if items else req.get('food_type', 'Food Request'),
            "status": req.get('status', 'Active'),
            "urgency": req.get('urgency', 'Normal'),
            "created_at": req.get('created_at').isoformat() if hasattr(req.get('created_at'), 'isoformat') else str(req.get('created_at', '')),
        })
            
    return jsonify({
        "stats": {
            **stats,
            "active_requests": active_requests,
            "fulfilled_requests": fulfilled_requests,
        },
        "recent_activity": recent_activity,
        "recent_requests": recent_requests,
    }), 200
