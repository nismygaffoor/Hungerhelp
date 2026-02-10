from datetime import datetime
from bson import ObjectId
from db import db

class Claim:
    collection = db['claims']

    @staticmethod
    def create(data):
        """Create a new food claim"""
        claim_doc = {
            "beneficiary_id": data['beneficiary_id'],
            "post_id": data['post_id'],
            "donor_id": data['donor_id'],
            "status": "Pending Pickup",  # Initial status
            "claimed_at": datetime.utcnow(),
            "pickup_time": data.get('pickup_time'),
            "notes": data.get('notes', '')
        }
        result = Claim.collection.insert_one(claim_doc)
        return str(result.inserted_id)

    @staticmethod
    def find_by_beneficiary(user_id):
        """Find all claims by a beneficiary (handles string or ObjectId)"""
        query = {
            "$or": [
                {"beneficiary_id": ObjectId(user_id)},
                {"beneficiary_id": user_id}
            ]
        }
        return list(Claim.collection.find(query).sort("claimed_at", -1))

    @staticmethod
    def find_by_donor(user_id):
        """Find all claims for a donor's posts (handles string or ObjectId)"""
        query = {
            "$or": [
                {"donor_id": ObjectId(user_id)},
                {"donor_id": user_id}
            ]
        }
        return list(Claim.collection.find(query).sort("claimed_at", -1))

    @staticmethod
    def get_stats(user_id):
        """Get claim statistics for beneficiary dashboard"""
        query = {
            "$or": [
                {"beneficiary_id": ObjectId(user_id)},
                {"beneficiary_id": user_id}
            ]
        }
        claims = list(Claim.collection.find(query))
        
        total_claimed = len(claims)
        pending = len([c for c in claims if str(c.get('status')).lower() in ['pending pickup', 'pending']])
        delivered = len([c for c in claims if str(c.get('status')).lower() in ['delivered', 'collected']])
        
        return {
            "total_claimed": total_claimed,
            "pending_pickups": pending,
            "delivered": delivered
        }
