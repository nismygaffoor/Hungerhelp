import os
from flask import Blueprint, request, jsonify
from models.user import User
from models.claim import Claim
from models.food_post import FoodPost
from models.delivery import DeliveryTask
from models.request import FoodRequest
from middleware.auth_middleware import token_required
from bson.objectid import ObjectId

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

@users_bp.route('/profile-stats', methods=['GET'])
@token_required
def profile_stats():
    current_user = request.user_data
    user_id = current_user['user_id']
    role = current_user['role']

    if role == 'Beneficiary':
        claim_stats = Claim.get_stats(user_id)
        beneficiary_query = {
            "$or": [
                {"beneficiary_id": ObjectId(user_id)},
                {"beneficiary_id": user_id},
            ]
        }
        active_requests = FoodRequest.collection.count_documents({**beneficiary_query, "status": "Active"})
        fulfilled_requests = FoodRequest.collection.count_documents({**beneficiary_query, "status": "Fulfilled"})
        return jsonify({
            "total_claims": claim_stats['total_claimed'],
            "pending_pickups": claim_stats['pending_pickups'],
            "delivered": claim_stats['delivered'],
            "active_requests": active_requests,
            "fulfilled_requests": fulfilled_requests,
        }), 200

    if role == 'Donor':
        all_posts = list(FoodPost.collection.find(FoodPost._donor_id_filter(user_id)))
        donation_posts = [p for p in all_posts if not FoodPost._as_bool(p.get('is_recurring'), False)]
        return jsonify({
            "total_donations": len(donation_posts),
            "active_donations": len([p for p in donation_posts if p.get('status') in ['Available', 'Active']]),
            "delivered": len([p for p in donation_posts if p.get('status') == 'Delivered']),
            "fulfilled_requests": len([p for p in donation_posts if p.get('matched_request_id')]),
        }), 200

    if role == 'Volunteer':
        volunteer_query = {
            "$or": [
                {"volunteer_id": user_id},
                {"volunteer_id": ObjectId(user_id)},
            ]
        }
        all_tasks = list(DeliveryTask.collection.find(volunteer_query))
        return jsonify({
            "total_deliveries": len(all_tasks),
            "completed": len([t for t in all_tasks if t.get('status') == 'Delivered']),
            "active": len([t for t in all_tasks if t.get('status') in ['Assigned', 'PickedUp']]),
            "pending_accepted": len([t for t in all_tasks if t.get('status') == 'Assigned']),
        }), 200

    if role == 'Admin':
        return jsonify({
            "total_users": User.collection.count_documents({}),
            "food_posts": FoodPost.collection.count_documents({}),
            "deliveries": DeliveryTask.collection.count_documents({}),
            "pending_verifications": User.collection.count_documents({"is_verified": False}),
        }), 200

    return jsonify({"error": "Unsupported role"}), 400

ALLOWED_DOC_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png'}
DOC_TYPES = ['National ID', 'Proof of Address', 'Organization Letter', 'Other']

@users_bp.route('/verification-documents', methods=['POST'])
@token_required
def upload_verification_document():
    current_user = request.user_data
    if current_user['role'] == 'Admin':
        return jsonify({"error": "Admins cannot upload verification documents"}), 403

    if 'document' not in request.files:
        return jsonify({"error": "No document file provided"}), 400

    file = request.files['document']
    if not file or not file.filename:
        return jsonify({"error": "Invalid file"}), 400

    doc_type = request.form.get('doc_type', 'Other')
    if doc_type not in DOC_TYPES:
        doc_type = 'Other'

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_DOC_EXTENSIONS:
        return jsonify({"error": "Allowed formats: PDF, JPG, JPEG, PNG"}), 400

    import uuid as uuid_lib
    saved_name = f"{uuid_lib.uuid4()}{ext}"
    file_path = os.path.join('verification_docs', saved_name)
    full_path = os.path.join('uploads', file_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    file.save(full_path)

    doc = User.add_verification_document(
        current_user['user_id'],
        doc_type,
        file_path,
        file.filename
    )
    return jsonify({"message": "Document uploaded successfully", "document": doc}), 201

@users_bp.route('/verification-documents/<doc_id>', methods=['DELETE'])
@token_required
def delete_verification_document(doc_id):
    current_user = request.user_data
    success = User.remove_verification_document(current_user['user_id'], doc_id)
    if success:
        return jsonify({"message": "Document removed successfully"}), 200
    return jsonify({"error": "Document not found"}), 404
