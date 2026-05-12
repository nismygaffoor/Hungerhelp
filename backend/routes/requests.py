from flask import Blueprint, request, jsonify
from models.request import FoodRequest
from middleware.auth_middleware import token_required
from bson.objectid import ObjectId

requests_bp = Blueprint('requests', __name__)

@requests_bp.route('/', methods=['POST'])
@token_required
def create_request():
    current_user = request.user_data
    if current_user['role'] != 'Beneficiary':
        return jsonify({"error": "Only beneficiaries can create food requests"}), 403
    
    data = request.json
    data['beneficiary_id'] = current_user['user_id']
    
    try:
        request_id = FoodRequest.create(data)
        return jsonify({"message": "Food request created successfully", "request_id": request_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@requests_bp.route('/', methods=['GET'])
@token_required
def get_all_active_requests():
    """Get all active food requests (for donors/admin to see)"""
    try:
        requests = FoodRequest.get_all_active()
        return jsonify(requests), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@requests_bp.route('/my-requests', methods=['GET'])
@token_required
def get_my_requests():
    """Get requests created by the logged-in beneficiary"""
    current_user = request.user_data
    try:
        requests = FoodRequest.get_by_beneficiary(current_user['user_id'])
        return jsonify(requests), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@requests_bp.route('/<request_id>', methods=['DELETE'])
@token_required
def delete_request(request_id):
    current_user = request.user_data
    try:
        success = FoodRequest.delete(request_id, current_user['user_id'])
        if success:
            return jsonify({"message": "Request deleted successfully"}), 200
        return jsonify({"error": "Request not found or unauthorized"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
