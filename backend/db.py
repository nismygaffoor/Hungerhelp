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

try:
    # Try connecting with standard settings
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client.hungerhelp
    # Quick check
    client.server_info()
    masked_uri = MONGO_URI.split('@')[-1] if '@' in MONGO_URI else MONGO_URI
    print(f"Successfully connected to MongoDB: ...@{masked_uri}")
except Exception as e:
    print(f"Standard connection failed: {e}")
    try:
        print("Attempting to connect with TLS verification disabled...")
        client = MongoClient(MONGO_URI, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
        db = client.hungerhelp
        client.server_info()
        print("Connected to MongoDB (TLS verification disabled)")
    except Exception as e2:
        print(f"Failed to connect to MongoDB even with TLS bypass: {e2}")
        db = None
