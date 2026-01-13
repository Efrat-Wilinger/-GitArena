"""
Simple test to check if /users/me returns role
"""
import requests
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.shared.security import create_access_token

# Create a token for user ID 2
token = create_access_token({"sub": "2"})

# Call the API
response = requests.get(
    "http://localhost:8000/api/users/me",
    headers={"Authorization": f"Bearer {token}"}
)

print(f"Status Code: {response.status_code}")
print(f"Response JSON:")
print(response.json())

# Check if role is in response
data = response.json()
if 'role' in data:
    print(f"\n✅ Role found: {data['role']}")
else:
    print(f"\n❌ Role NOT found in response!")
    print(f"Keys in response: {list(data.keys())}")
