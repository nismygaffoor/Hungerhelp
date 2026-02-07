from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# Connect to MongoDB
client = MongoClient(os.getenv("MONGO_URI"))
db = client.get_database()
users_collection = db.users

print("\n--- Registered Users in Database ---")
users = list(users_collection.find())

if not users:
    print("No users found yet.")
else:
    for user in users:
        print(f"Name: {user.get('name')}")
        print(f"Role: {user.get('role')}")
        print(f"Email: {user.get('email')}")
        print(f"Verified: {user.get('is_verified')}")
        print("-" * 30)

print(f"\nTotal Users: {len(users)}")
print("Database Location:", os.getenv("MONGO_URI"))
