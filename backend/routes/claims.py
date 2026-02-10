from flask import Blueprint, request, jsonify
from models.claim import Claim
from models.food_post import FoodPost
from middleware.auth_middleware import token_required
from bson import ObjectId

claims_bp = Blueprint('claims', __name__)

@claims_bp.route('/my-claims', methods=['GET'])
@token_required
def get_my_claims():
    """Get all claims for the logged-in beneficiary"""
    current_user = request.user_data
    if current_user['role'] != 'Beneficiary':
        return jsonify({"message": "Unauthorized"}), 403

    claims = Claim.find_by_beneficiary(current_user['user_id'])
    
    # Enrich with food post details
    enriched_claims = []
    # Enrich with donor names
    from models.user import User
    donor_cache = {}
    for claim in claims:
        post = FoodPost.collection.find_one({"_id": ObjectId(claim['post_id'])})
        if post:
            donor_id = post.get('donor_id')
            if donor_id not in donor_cache:
                donor = User.collection.find_one({"_id": ObjectId(donor_id)})
                if donor:
                    donor_cache[donor_id] = donor.get('businessName') or donor.get('name') or "Unknown Donor"
                else:
                    donor_cache[donor_id] = "Unknown Donor"
            
            # Aggregate images from items if global images is empty
            post_items = post.get('items', [])
            all_item_images = []
            for item in post_items:
                if 'images' in item:
                    all_item_images.extend(item['images'])
            
            display_images = post.get('images', [])
            if not display_images:
                display_images = all_item_images

            claim_data = {
                "id": str(claim['_id']),
                "post_id": str(claim['post_id']),
                "food_type": post.get('food_type', 'Unknown Food'),
                "quantity": post.get('quantity', 'N/A'),
                "donor_id": donor_id,
                "donor_name": donor_cache[donor_id],
                "status": claim['status'],
                "claimed_at": claim['claimed_at'],
                "images": display_images,
                "location": post.get('location', '')
            }
            enriched_claims.append(claim_data)
            
    return jsonify(enriched_claims), 200

@claims_bp.route('/stats', methods=['GET'])
@token_required
def get_dashboard_stats():
    """Get beneficiary dashboard stats"""
    current_user = request.user_data
    if current_user['role'] != 'Beneficiary':
        return jsonify({"message": "Unauthorized"}), 403
        
    stats = Claim.get_stats(current_user['user_id'])
    
    # Get recent claims
    claims = Claim.find_by_beneficiary(current_user['user_id'])[:5]
    recent_activity = []
    for claim in claims:
        post = FoodPost.collection.find_one({"_id": ObjectId(claim['post_id'])})
        if post:
            recent_activity.append({
                "title": post.get('food_type', 'Food Claim').split(' - ')[0],
                "time": str(claim['claimed_at']),
                "status": claim['status']
            })
            
    return jsonify({
        "stats": stats,
        "recent_activity": recent_activity
    }), 200
