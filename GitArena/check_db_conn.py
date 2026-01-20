import psycopg2
import os
from dotenv import load_dotenv

# Try to load .env specifically
load_dotenv('.env', override=True)

def test_conn(host, user, password, db):
    print(f"Testing: host={host}, user={user}, pass={password[:3]}***, db={db}")
    try:
        conn = psycopg2.connect(
            host=host,
            user=user,
            password=password,
            database=db,
            connect_timeout=3
        )
        print("  [SUCCESS] Connection established!")
        conn.close()
        return True
    except Exception as e:
        print(f"  [FAILURE] {e}")
        return False

def main():
    print("=== DB CONNECTION DIAGNOSTIC ===")
    
    # Check Env Vars
    print(f"Environment POSTGRES_PASSWORD: {os.environ.get('POSTGRES_PASSWORD', 'NOT SET')}")
    print(f"Environment DATABASE_URL: {os.environ.get('DATABASE_URL', 'NOT SET')}")
    
    # Params from .env (hardcoded for this diagnostic)
    db_user = "postgres"
    db_pass = "newpassword123"
    db_name = "gitarena"
    
    print("\nAttempting common local variations:")
    test_conn("127.0.0.1", db_user, db_pass, db_name)
    test_conn("localhost", db_user, db_pass, db_name)
    
    # Try alternate password just in case (the default one)
    if db_pass != "postgres":
        print("\nAttempting with password 'postgres':")
        test_conn("127.0.0.1", db_user, "postgres", db_name)

if __name__ == "__main__":
    main()
