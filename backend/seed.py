import os
import bcrypt
from datetime import datetime, timedelta
from db import db
from models.user import User
from models.food_post import FoodPost

def seed():
    print("Starting database seeding...")

    # 1. Create a sample donor if none exists
    donor_email = "donor@example.com"
    existing_donor = db.users.find_one({"email": donor_email})
    
    if not existing_donor:
        print("Creating sample donor...")
        hashed_pw = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt())
        donor_data = {
            "name": "John Donor",
            "email": donor_email,
            "password": hashed_pw,
            "role": "Donor",
            "location": "Colombo, Sri Lanka",
            "phone": "+94 77 123 4567",
            "created_at": datetime.utcnow()
        }
        res = db.users.insert_one(donor_data)
        donor_id = str(res.inserted_id)
    else:
        print("Sample donor already exists.")
        donor_id = str(existing_donor['_id'])

    # 2. Seed Food Posts (One-time and Recurring)
    print("Seeding food posts...")
    # Clear existing posts for this donor
    db.food_posts.delete_many({"donor_id": donor_id})
    
    posts = [
        # One-time donations
        {
            "donor_id": donor_id,
            "food_type": "Vegetables - Fresh Harvest",
            "quantity": "15kg",
            "location": "Colombo 07 | Main Distribution Center",
            "expiry_time": (datetime.utcnow() + timedelta(days=2)).isoformat(),
            "description": "Organic carrots and leeks from my farm.",
            "images": [],
            "status": "Available",
            "is_recurring": False
        },
        {
            "donor_id": donor_id,
            "food_type": "Baked Goods - Evening Snacks",
            "quantity": "50 Packs",
            "location": "Kandy | Community Hall",
            "expiry_time": (datetime.utcnow() + timedelta(hours=5)).isoformat(),
            "description": "Freshly baked buns and pastries from our bakery.",
            "images": [],
            "status": "Available",
            "is_recurring": False,
            "is_urgent": True
        },
        # Recurring donations
        {
            "donor_id": donor_id,
            "food_type": "Hot Meals - Lunch Pack",
            "quantity": "25 Packs",
            "location": "Colombo | Central Kitchen",
            "frequency": "Daily",
            "day": "Everyday",
            "destination": "Local Orphanage",
            "images": [],
            "status": "Active",
            "is_recurring": True,
            "description": "Freshly prepared lunch packs for daily distribution."
        },
        {
            "donor_id": donor_id,
            "food_type": "Fresh Fruit Batch",
            "quantity": "10kg",
            "location": "Galle | Fruit Market",
            "frequency": "Weekly",
            "day": "Wednesday",
            "destination": "Elders Home",
            "images": [],
            "status": "Active",
            "is_recurring": True,
            "description": "Seasonal fruits batch for the weekly support program."
        }
    ]
    
    for p in posts:
        FoodPost.create(p)

    print("\n" + "="*40)
    print("SEEDING COMPLETE!")
    print(f"Donor Email: {donor_email}")
    print("Password: password123")
    print("="*40)

if __name__ == "__main__":
    seed()
