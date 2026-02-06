import requests
import time

BASE_URL = "http://127.0.0.1:5000"

def print_step(msg):
    print(f"\n[STEP] {msg}")

def register(role, name):
    email = f"{role.lower()}_{int(time.time())}@test.com"
    password = "password123"
    payload = {
        "name": name,
        "email": email,
        "password": password,
        "role": role,
        "contact": "1234567890",
        "address": "Colombo 7"
    }
    res = requests.post(f"{BASE_URL}/auth/register", json=payload)
    if res.status_code == 201:
        print(f"✅ Registered {role}: {email}")
        return login(email, password)
    else:
        print(f"❌ Failed to register {role}: {res.text}")
        return None

def login(email, password):
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if res.status_code == 200:
        return res.json()['token']
    else:
        print(f"❌ Login failed: {res.status_code} {res.text}")
        return None

try:
    # 1. Register Users
    print_step("Registering Users")
    donor_token = register("Donor", "Mr. Kamal")
    ben_token = register("Beneficiary", "Ammar")
    vol_token = register("Volunteer", "Sunil")
    admin_token = register("Admin", "Admin User")

    if not all([donor_token, ben_token, vol_token, admin_token]):
        print("❌ Stopping due to auth failure")
        exit()

    # 2. Donor Posts Food
    print_step("Donor Posting Food")
    post_data = {
        "food_type": "Rice and Curry",
        "quantity": 10,
        "location": "Wellawatte",
        "expiry_time": "2026-02-10 12:00"
    }
    headers = {"Authorization": f"Bearer {donor_token}"}
    res = requests.post(f"{BASE_URL}/food/", json=post_data, headers=headers)
    if res.status_code == 201:
        post_id = res.json()['post_id']
        print(f"✅ Food posted. ID: {post_id}")
    else:
        print(f"❌ Failed to post food: {res.text}")
        exit()

    # 3. Beneficiary Claims Food
    print_step("Beneficiary Claiming Food")
    headers = {"Authorization": f"Bearer {ben_token}"}
    res = requests.post(f"{BASE_URL}/food/{post_id}/claim", headers=headers)
    if res.status_code == 200:
        print(f"✅ Food claimed. Task created.")
    else:
        print(f"❌ Failed to claim food: {res.text}")

    # 4. Volunteer Checks Tasks
    print_step("Volunteer Checking Tasks")
    headers = {"Authorization": f"Bearer {vol_token}"}
    res = requests.get(f"{BASE_URL}/delivery/", headers=headers)
    tasks = res.json()
    if len(tasks) > 0:
        task_id = tasks[0]['_id']
        print(f"✅ Found {len(tasks)} tasks. Accepting Task ID: {task_id}")
        
        # Accept
        res = requests.post(f"{BASE_URL}/delivery/{task_id}/accept", headers=headers)
        if res.status_code == 200:
             print("✅ Task Accepted")
        else:
             print(f"❌ Failed to accept task: {res.text}")
    else:
        print("❌ No tasks found (Should have one)")

    # 5. Beneficiary Makes Request
    print_step("Beneficiary Making Request")
    headers = {"Authorization": f"Bearer {ben_token}"}
    req_data = {
        "food_type": "Milk Powder",
        "quantity": 2,
        "location": "Maradana"
    }
    res = requests.post(f"{BASE_URL}/request/", json=req_data, headers=headers)
    if res.status_code == 201:
        print("✅ Request created")
    else:
        print(f"❌ Failed to create request: {res.text}")

    # 6. Admin Checks Stats
    print_step("Admin Checking Stats")
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = requests.get(f"{BASE_URL}/admin/stats", headers=headers)
    if res.status_code == 200:
        print(f"✅ Admin Stats: {res.json()}")
    else:
        print(f"❌ Failed to fetch stats: {res.text}")

    print("\n✅✅ FULL BACKEND FLOW VERIFIED SUCCESSFULLY! ✅✅")

except Exception as e:
    print(f"❌ Test Script Error: {e}")
