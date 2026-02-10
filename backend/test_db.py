from pymongo import MongoClient
import certifi
import traceback
import sys

uri = "mongodb+srv://nismygaffoor5_db_user:123123123@hungerhelp.f2ujrmh.mongodb.net/hungerhelp?retryWrites=true&w=majority"

print(f"Python version: {sys.version}")
print(f"Certifi path: {certifi.where()}")

print("\n--- Attempt 1: Standard with Certifi ---")
try:
    client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
    print("Server info:", client.server_info())
except Exception:
    traceback.print_exc()

print("\n--- Attempt 2: Without Certifi (System Store) ---")
try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    print("Server info:", client.server_info())
except Exception:
    traceback.print_exc()

print("\n--- Attempt 3: No TLS verification ---")
try:
    client = MongoClient(uri, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
    print("Server info:", client.server_info())
except Exception:
    traceback.print_exc()
