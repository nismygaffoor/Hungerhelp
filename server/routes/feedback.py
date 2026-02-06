from db import db
from datetime import datetime
from flask import Blueprint, request, jsonify
from middleware.auth_middleware import token_required

# Simple model logic inside route file for brevity as this is a small module
class Feedback:
    collection = db.feedback

    @staticmethod
    def create(data):
        doc = {
            "from_user_id": data['from_user_id'],
            "to_user_id": data.get('to_user_id'), # Optional, e.g., Beneficiary rating Volunteer
            "target_type": data.get('target_type'), # "Delivery", "FoodPost"
            "target_id": data.get('target_id'),
            "rating": data['rating'], # 1-5
            "comment": data.get('comment', ""),
            "created_at": datetime.utcnow()
        }
        result = Feedback.collection.insert_one(doc)
        return str(result.inserted_id)

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('/', methods=['POST'])
@token_required
def submit_feedback():
    current_user = request.user_data
    data = request.json
    
    if 'rating' not in data:
        return jsonify({"error": "Rating is required"}), 400

    data['from_user_id'] = current_user['user_id']
    
    feedback_id = Feedback.create(data)
    return jsonify({"message": "Feedback submitted", "id": feedback_id}), 201
