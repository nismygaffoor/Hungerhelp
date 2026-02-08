from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Get the directory of the current file
basedir = os.path.abspath(os.path.dirname(__file__))
env_path = os.path.join(basedir, '.env')

# Load .env file explicitly
load_dotenv(env_path)

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    print("WARNING: MONGO_URI not found in .env file! Falling back to localhost.")
    MONGO_URI = "mongodb://localhost:27017/hungerhelp"

import certifi

# ... existing code ...

try:
    # Use certifi for SSL CA bundle
    client = MongoClient(MONGO_URI, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
    db = client.hungerhelp
    # Quick check
    client.server_info()
    masked_uri = MONGO_URI.split('@')[-1] if '@' in MONGO_URI else MONGO_URI
    print(f"Successfully connected to MongoDB Atlas: ...@{masked_uri}")
except Exception as e:
    error_msg = str(e)
    print(f"Atlas connection failed: {error_msg}")
    
    if "TLSV1_ALERT_INTERNAL_ERROR" in error_msg:
        print("\n" + "!"*60)
        print("IMPORTANT: MongoDB Atlas is rejecting the connection with a TLS Alert.")
        print("This ALMOST ALWAYS means your current IP address is NOT whitelisted in Atlas.")
        print("Please log in to MongoDB Atlas and add '0.0.0.0/0' or your current IP to Network Access.")
        print("!"*60 + "\n")
    
    try:
        print("Final attempt: Connecting with TLS verification disabled...")
        client = MongoClient(MONGO_URI, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
        db = client.hungerhelp
        client.server_info()
        print("Connected to MongoDB Atlas (TLS verification disabled)")
    except Exception as e2:
        print(f"CRITICAL: Could not connect to Atlas. Error: {e2}")
        db = None
