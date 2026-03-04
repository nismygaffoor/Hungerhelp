from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app) # Enable CORS for frontend communication

# Configure Upload Folder
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(os.path.join(UPLOAD_FOLDER, 'food_posts'), exist_ok=True)#Creates folders if they don’t exist

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

# from routes.delivery import delivery_bp
# from routes.request import request_bp
# from routes.feedback import feedback_bp

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(food_bp, url_prefix='/food')
app.register_blueprint(claims_bp, url_prefix='/claims')
app.register_blueprint(admin_bp, url_prefix='/admin')

# app.register_blueprint(delivery_bp, url_prefix='/delivery')
# app.register_blueprint(request_bp, url_prefix='/request')
# app.register_blueprint(feedback_bp, url_prefix='/feedback')

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
            "feedback": "/feedback (POST)"
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
