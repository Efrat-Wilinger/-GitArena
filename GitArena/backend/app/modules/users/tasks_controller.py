import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.shared.database import get_db
from app.modules.users.controller import get_current_user
from app.modules.users.dto import UserResponse
from typing import List, Dict, Any

router = APIRouter(prefix="/users", tags=["users"])

GITHUB_API_URL = "https://api.github.com"

@router.get("/{user_id}/tasks")
async def get_user_tasks(
    user_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get all tasks assigned to a user from GitHub (PRs and Issues)"""
    
    if not current_user.access_token:
        raise HTTPException(status_code=401, detail="GitHub token not found")


    tasks = []
    
    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"token {current_user.access_token}",
            "Accept": "application/vnd.github.v3+json"
        }

        
        # 1. Fetch Issues assigned to user
        # 2. Fetch Pull Requests assigned to user
        # 3. Fetch Pull Requests requiring review (review-requested)
        
        # For simplicity, we search for issues/PRs involving the user
        search_query = f"assignee:{current_user.username} state:open"
        try:
            response = await client.get(
                f"{GITHUB_API_URL}/search/issues",
                headers=headers,
                params={"q": search_query}
            )
            
            if response.status_code == 200:
                data = response.json()
                for item in data.get("items", []):
                    item_type = "pr" if "pull_request" in item else "issue"
                    tasks.append({
                        "id": str(item["id"]),
                        "type": item_type,
                        "title": item["title"],
                        "repo": item["repository_url"].split("/")[-1],
                        "status": "pending",
                        "priority": "medium", # GitHub doesn't have a standard priority field
                        "dueDate": None,
                        "url": item["html_url"],
                        "number": item["number"]
                    })
                    
            # Also fetch PRs where review is requested
            review_query = f"review-requested:{current_user.username} state:open"
            review_response = await client.get(
                f"{GITHUB_API_URL}/search/issues",
                headers=headers,
                params={"q": review_query}
            )
            
            if review_response.status_code == 200:
                data = review_response.json()
                for item in data.get("items", []):
                    tasks.append({
                        "id": str(item["id"]),
                        "type": "review",
                        "title": item["title"],
                        "repo": item["repository_url"].split("/")[-1],
                        "status": "pending",
                        "priority": "high",
                        "dueDate": None,
                        "url": item["html_url"],
                        "number": item["number"]
                    })
                    
        except Exception as e:
            print(f"Error fetching tasks: {e}")
            # Fallback to empty if GitHub is down
            pass

    return tasks

