from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/hungerhelp")

try:
    client = MongoClient(MONGO_URI)
    db = client.hungerhelp
    # Quick check
    client.server_info()
    print(f"Connected to MongoDB at {MONGO_URI}")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    db = None
