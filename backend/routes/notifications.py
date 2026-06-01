from flask import Blueprint, request, jsonify
from middleware.auth_middleware import token_required
from models.notification import Notification

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.route("/", methods=["GET"])
@token_required
def list_notifications():
    user_id = request.user_data["user_id"]
    limit = min(int(request.args.get("limit", 30)), 50)
    notifications = Notification.get_for_user(user_id, limit=limit)
    unread = Notification.unread_count(user_id)
    return jsonify({"notifications": notifications, "unread_count": unread}), 200


@notifications_bp.route("/unread-count", methods=["GET"])
@token_required
def unread_count():
    user_id = request.user_data["user_id"]
    return jsonify({"unread_count": Notification.unread_count(user_id)}), 200


@notifications_bp.route("/<notification_id>/read", methods=["PATCH"])
@token_required
def mark_read(notification_id):
    user_id = request.user_data["user_id"]
    success = Notification.mark_read(notification_id, user_id)
    if not success:
        return jsonify({"error": "Notification not found"}), 404
    return jsonify({"message": "Notification marked as read"}), 200


@notifications_bp.route("/read-all", methods=["PATCH"])
@token_required
def mark_all_read():
    user_id = request.user_data["user_id"]
    count = Notification.mark_all_read(user_id)
    return jsonify({"message": "All notifications marked as read", "updated": count}), 200
