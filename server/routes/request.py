from flask import Blueprint, request, jsonify
from models.request import FoodRequest
from middleware.auth_middleware import token_required

request_bp = Blueprint('request', __name__)

@request_bp.route('/', methods=['POST'])
@token_required
def create_request():
    """
    Beneficiary creates a food request.
    """
    current_user = request.user_data
    if current_user['role'] != 'Beneficiary':
        return jsonify({"error": "Only beneficiaries can make requests"}), 403

    data = request.json
    if not data or 'food_type' not in data:
        return jsonify({"error": "Missing required fields"}), 400

    data['beneficiary_id'] = current_user['user_id']
    
    req_id = FoodRequest.create(data)
    return jsonify({"message": "Request created", "request_id": req_id}), 201

@request_bp.route('/', methods=['GET'])
@token_required
def get_requests():
    """
    Get all active requests (Visible to Donors/Admins).
    """
    # specific permission check if needed, but maybe public for transparency?
    # Let's say Donors can see them to help.
    requests = FoodRequest.get_all_active()
    return jsonify(requests), 200

@request_bp.route('/my-requests', methods=['GET'])
@token_required
def get_my_requests():
    current_user = request.user_data
    requests = FoodRequest.get_by_beneficiary(current_user['user_id'])
    return jsonify(requests), 200
