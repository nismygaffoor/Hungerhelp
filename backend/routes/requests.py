from flask import Blueprint, request, jsonify
from models.request import FoodRequest
from middleware.auth_middleware import token_required
from bson.objectid import ObjectId
from utils.location_helpers import normalize_location_data

requests_bp = Blueprint('requests', __name__)

@requests_bp.route('/', methods=['POST'])
@token_required
def create_request():
    current_user = request.user_data
    if current_user['role'] != 'Beneficiary':
        return jsonify({"error": "Only beneficiaries can create food requests"}), 403
    
    data = request.json
    data['beneficiary_id'] = current_user['user_id']
    data = normalize_location_data(data)
    if not data.get('district') or not data.get('city'):
        return jsonify({"error": "District and city are required"}), 400
    
    try:
        request_id = FoodRequest.create(data)
        from utils.notifications import notify_new_food_request
        food_label = data.get('food_type') or 'Food request'
        if data.get('items') and isinstance(data['items'], list) and len(data['items']) > 0:
            first_item = data['items'][0]
            if isinstance(first_item, dict) and first_item.get('name'):
                food_label = first_item.get('name')
        notify_new_food_request(food_label, data.get('district'))
        return jsonify({"message": "Food request created successfully", "request_id": request_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@requests_bp.route('/', methods=['GET'])
@token_required
def get_all_active_requests():
    """Get food requests. Donors see active only; admins see all with summary."""
    current_user = request.user_data
    try:
        if current_user.get('role') == 'Admin':
            status_filter = request.args.get('status', 'All')
            requests_list = FoodRequest.get_all_for_admin(status_filter)
            summary = {
                "total": FoodRequest.collection.count_documents({"status": {"$ne": "Deleted"}}),
                "active": FoodRequest.collection.count_documents({"status": "Active"}),
                "fulfilled": FoodRequest.collection.count_documents({"status": "Fulfilled"}),
            }
            return jsonify({"requests": requests_list, "summary": summary}), 200

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
    if current_user['role'] != 'Beneficiary':
        return jsonify({"error": "Only beneficiaries can delete requests"}), 403

    try:
        success, reason = FoodRequest.delete(request_id, current_user['user_id'])
        if success:
            return jsonify({"message": "Request deleted successfully"}), 200
        if reason == "not_found" or reason == "invalid_id":
            return jsonify({"error": "Request not found"}), 404
        if reason == "unauthorized":
            return jsonify({"error": "You can only delete your own requests"}), 403
        if reason == "fulfilled":
            return jsonify({
                "error": "This request was already matched by a donor. Check My Claims for delivery progress."
            }), 400
        return jsonify({"error": "Failed to delete request"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@requests_bp.route('/<request_id>', methods=['PATCH'])
@token_required
def update_request(request_id):
    current_user = request.user_data
    if current_user['role'] != 'Beneficiary':
        return jsonify({"error": "Only beneficiaries can update requests"}), 403

    data = request.json or {}
    data = normalize_location_data(data)

    try:
        success, reason = FoodRequest.update(request_id, current_user['user_id'], data)
        if success:
            return jsonify({"message": "Request updated successfully"}), 200
        if reason == "not_found" or reason == "invalid_id":
            return jsonify({"error": "Request not found"}), 404
        if reason == "unauthorized":
            return jsonify({"error": "You can only edit your own requests"}), 403
        if reason == "fulfilled":
            return jsonify({"error": "Matched requests cannot be edited. Check My Claims for delivery progress."}), 400
        if reason == "deleted":
            return jsonify({"error": "This request was removed"}), 400
        return jsonify({"error": "Nothing to update"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
