import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

from app.shared.database import SessionLocal
from app.shared.models import Space, User, SpaceMember

def demote_user_for_testing(project_id=4):
    print(f"--- Demoting User in Project {project_id} (Transferring Ownership) ---")
    db = SessionLocal()
    try:
        # 1. Get the target project
        space = db.query(Space).filter(Space.id == project_id).first()
        if not space:
            print(f"Error: Project {project_id} not found.")
            return

        print(f"Target Project: {space.name} (ID: {space.id})")
        current_owner = db.query(User).filter(User.id == space.owner_id).first()
        print(f"Current Owner: {current_owner.username} (ID: {current_owner.id})")

        # 2. Get/Create Dummy Owner
        dummy_username = "test_owner_bot"
        dummy_owner = db.query(User).filter(User.username == dummy_username).first()
        if not dummy_owner:
            print(f"Creating dummy owner '{dummy_username}'...")
            dummy_owner = User(
                username=dummy_username,
                email="test_owner@gitarena.com",
                name="Test Owner Bot",
                role="manager",
                github_id="99999999" # Fake ID
            )
            db.add(dummy_owner)
            db.commit()
            db.refresh(dummy_owner)
        
        print(f"New Owner will be: {dummy_owner.username} (ID: {dummy_owner.id})")

        # 3. Transfer Ownership
        space.owner_id = dummy_owner.id
        db.commit()
        print(f"Ownership transferred to {dummy_owner.username}.")

        # 4. Ensure Efrat is a 'member'
        efrat_id = current_owner.id # Assuming current owner is Efrat
        
        member_record = db.query(SpaceMember).filter(
            SpaceMember.space_id == space.id, 
            SpaceMember.user_id == efrat_id
        ).first()

        if member_record:
            member_record.role = 'member'
            print("Existing member record updated to 'member'.")
        else:
            new_member = SpaceMember(
                space_id=space.id,
                user_id=efrat_id,
                role='member'
            )
            db.add(new_member)
            print("New member record created as 'member'.")
        
        db.commit()
        print("\nSUCCESS! You are now a regular MEMBER of this project.")
        print("Please refresh the page to see the Member View.")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    demote_user_for_testing()
