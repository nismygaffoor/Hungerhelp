import sys
import os

# Add the backend directory to sys.path to import models and db
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models.user import User
from db import db

def seed_admin():
    print("Checking for existing admin user...")
    admin_email = "admin@hungerhelp.com"
    existing_admin = User.find_by_email(admin_email)
    
    if existing_admin:
        print(f"Admin user with email {admin_email} already exists.")
        return

    print("Seeding admin user...")
    admin_data = {
        "name": "System Admin",
        "email": admin_email,
        "password": "admin-secure-password-2026", # Recommended to change after first login
        "role": "Admin",
        "contact": "0000000000",
        "address": "System",
        "is_verified": True
    }
    
    response, status = User.create_user(admin_data)
    
    if status == 201:
        print(f"Successfully seeded admin user: {admin_email}")
        print(f"Temporary Password: {admin_data['password']}")
    else:
        print(f"Failed to seed admin user: {response.get('error', 'Unknown error')}")

if __name__ == "__main__":
    if db is None:
        print("Error: Could not connect to database. Please check your .env file and network access.")
    else:
        seed_admin()
