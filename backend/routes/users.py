from flask import Blueprint, request, jsonify
from models.user import User
from middleware.auth_middleware import token_required

users_bp = Blueprint('users', __name__)

@users_bp.route('/search-beneficiaries', methods=['GET'])
@token_required
def search_beneficiaries():
    query = request.args.get('q', '')
    beneficiaries = User.search_beneficiaries(query)
    return jsonify(beneficiaries), 200

@users_bp.route('/verify-beneficiary', methods=['GET'])
@token_required
def verify_beneficiary():
    name = request.args.get('name', '')
    beneficiary = User.find_beneficiary_by_name(name)
    if beneficiary:
        beneficiary['_id'] = str(beneficiary['_id'])
        return jsonify({"valid": True, "beneficiary": beneficiary}), 200
    return jsonify({"valid": False}), 200
