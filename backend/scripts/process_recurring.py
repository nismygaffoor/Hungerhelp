import os
import sys
from datetime import datetime
from bson.objectid import ObjectId

# Add the parent directory to sys.path to import models and db
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from db import db
from models.food_post import FoodPost

def process_recurring_donations():
    """
    Finds all active recurring donations scheduled for today and 
    creates a 'one-time' instance for them in the donation list.
    """
    print(f"[{datetime.now()}] Starting recurring donation processing...")
    
    # 1. Get today's day (e.g., 'Monday')
    today_day = datetime.now().strftime('%A')
    
    # 2. Find all active recurring donations for today
    query = {
        "is_recurring": True,
        "status": "Active",
        "day": today_day
    }
    
    recurring_templates = list(FoodPost.collection.find(query))
    print(f"Found {len(recurring_templates)} scheduled templates for {today_day}.")

    for template in recurring_templates:
        try:
            # Check if we already created an instance for this template today
            # (To avoid double-posting if the script runs twice)
            today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            existing_instance = FoodPost.collection.find_one({
                "parent_recurring_id": template['_id'],
                "created_at": {"$gte": today_start}
            })

            if existing_instance:
                print(f" - Instance already exists for template {template['_id']} today. Skipping.")
                continue

            # 3. Create the 'Instance'
            # We copy almost everything, but set is_recurring to False for the instance
            # and link it back to the parent.
            instance_data = {
                "donor_id": template['donor_id'],
                "food_type": template['food_type'],
                "quantity": template['quantity'],
                "location": template['location'],
                "description": f"(Scheduled) {template.get('description', '')}",
                "images": template.get('images', []),
                "items": template.get('items', []),
                "status": "Available",
                "is_recurring": False, # The instance itself is a one-time thing
                "is_urgent": template.get('is_urgent', False),
                "parent_recurring_id": template['_id'], # LINK TO MASTER
                "destination_type": template.get('destination_type', ""),
                "destination_name": template.get('destination_name', ""),
                "expiry_time": (datetime.utcnow().replace(hour=23, minute=59)).isoformat(), # Default expiry to end of day
                "created_at": datetime.utcnow()
            }

            FoodPost.collection.insert_one(instance_data)
            print(f" + Created daily instance for '{template['food_type']}' (ID: {template['_id']})")

        except Exception as e:
            print(f" ! Failed to process template {template['_id']}: {str(e)}")

    print(f"[{datetime.now()}] Recurring processing complete.")

if __name__ == "__main__":
    process_recurring_donations()
