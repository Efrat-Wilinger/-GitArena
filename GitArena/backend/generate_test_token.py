import sys
import os
from datetime import timedelta

# Add backend directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.shared.security import create_access_token
from app.config.settings import settings

def generate_token():
    # User ID 1 is typically the first user/manager
    user_id = 1
    
    access_token = create_access_token(
        data={"sub": str(user_id)},
        expires_delta=timedelta(minutes=60*24) # 24 hours
    )
    
    print(access_token)
    return access_token

if __name__ == "__main__":
    generate_token()
