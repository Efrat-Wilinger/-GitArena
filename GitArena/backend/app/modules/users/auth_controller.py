from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.shared.database import get_db
from app.modules.users.service import UserService
from app.modules.users.dto import TokenResponse
from app.shared.security import create_access_token
from app.config.settings import settings
import httpx
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/github/login", response_model=TokenResponse)
async def github_login(code: str, db: Session = Depends(get_db)):
    """
    GitHub OAuth login endpoint
    Exchange authorization code for access token and create/update user
    """
    # Exchange code for access token
    print(f"DEBUG: Starting GitHub login with code: {code[:5]}...")
    print(f"DEBUG: Client ID: {settings.GITHUB_CLIENT_ID}")
    
    async with httpx.AsyncClient() as client:
        try:
            token_response = await client.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": settings.GITHUB_REDIRECT_URI
                }
            )
            print(f"DEBUG: GitHub Token Response Status: {token_response.status_code}")
            print(f"DEBUG: GitHub Token Response Body: {token_response.text}")
            
            if token_response.status_code != 200:
                raise HTTPException(status_code=400, detail=f"Failed to exchange code for token: {token_response.text}")
            
            token_data = token_response.json()
            if "error" in token_data:
                 raise HTTPException(status_code=400, detail=f"GitHub Error: {token_data.get('error_description')}")
                 
            access_token = token_data.get("access_token")
            
            if not access_token:
                raise HTTPException(status_code=400, detail="No access token received from GitHub")
                
        except Exception as e:
            print(f"DEBUG: Exception during token exchange: {str(e)}")
            raise e
    
    # Get user info from GitHub
    service = UserService(db)
    github_user = await service.get_github_user_info(access_token)
    
    # Create or update user
    user = service.create_or_update_user(github_user, access_token)
    
    # Generate JWT token
    jwt_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return TokenResponse(
        access_token=jwt_token,
        token_type="bearer",
        user=user
    )


@router.get("/github/callback")
async def github_callback(code: str):
    """
    GitHub OAuth callback endpoint
    This is a placeholder - in production, frontend handles the callback
    """
    return {"code": code, "message": "Use this code with POST /auth/github/login"}
