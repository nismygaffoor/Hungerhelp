from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)

ALLOWED_ORIGINS = {"http://localhost:5173", "http://127.0.0.1:5173"}


@app.after_request
def apply_cors_headers(response):
    origin = request.headers.get("Origin")
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    return response

# Configure Upload Folder
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(os.path.join(UPLOAD_FOLDER, 'food_posts'), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_FOLDER, 'verification_docs'), exist_ok=True)

from flask import send_from_directory
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Database Connection
from db import db

# Database Status Check
if db is not None:
    print("Database imported successfully")
else:
    print("Database connection failed")

from routes.auth import auth_bp
from routes.food import food_bp
from routes.claims import claims_bp
from routes.admin import admin_bp
from routes.users import users_bp
from routes.delivery import delivery_bp
from routes.requests import requests_bp
from routes.feedback import feedback_bp
from routes.notifications import notifications_bp
from routes.sms import sms_bp

@app.before_request
def handle_cors_preflight():
    if request.method == "OPTIONS":
        response = make_response("", 204)
        origin = request.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        return response

@app.before_request
def enforce_verified_platform_access():
    from middleware.auth_middleware import check_platform_access
    return check_platform_access()

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(food_bp, url_prefix='/food')
app.register_blueprint(claims_bp, url_prefix='/claims')
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(users_bp, url_prefix='/users')
app.register_blueprint(delivery_bp, url_prefix='/delivery')
app.register_blueprint(requests_bp, url_prefix='/requests')
app.register_blueprint(feedback_bp, url_prefix='/feedback')
app.register_blueprint(notifications_bp, url_prefix='/notifications')
app.register_blueprint(sms_bp, url_prefix='/sms')

@app.before_request
def run_scheduled_recurring_check():
    """Create today's recurring donation instances once per day when the API is used."""
    if request.method == 'OPTIONS':
        return None
    path = request.path or ''
    if not path.startswith('/food'):
        return None
    try:
        from services.recurring_processor import maybe_process_recurring
        maybe_process_recurring()
    except Exception as exc:
        print(f"Recurring check skipped: {exc}")
    return None

@app.route('/')
def home():
    return jsonify({
        "message": "Welcome to HungerHelp API",
        "status": "Running",
        "db_status": "Connected" if db is not None else "Disconnected",
        "endpoints": {
            "auth": "/auth/login, /auth/register",
            "food": "/food (GET, POST, DELETE, CLAIM)",
            "delivery": "/delivery (GET, ACCEPT, STATUS)",
            "request": "/request (GET, POST)",
            "admin": "/admin (STATS, VERIFY)",
            "feedback": "/feedback (POST)",
            "sms": "/sms/incoming (Twilio webhook)"
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000, use_reloader=False)
