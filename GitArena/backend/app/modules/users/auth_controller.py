from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.shared.database import get_db
from app.modules.users.service import UserService
from app.modules.users.dto import TokenResponse
from app.shared.security import create_access_token
from app.config.settings import settings
import httpx
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/github/login", response_model=TokenResponse)
async def github_login(code: str, db: Session = Depends(get_db)):
    """
    GitHub OAuth login endpoint
    Exchange authorization code for access token and create/update user
    """
    # Exchange code for access token
    try:
        logger.info(f"GITHUB_LOGIN_START: code={code[:5]}...")
        logger.info(f"GITHUB_CONFIG: client_id={settings.GITHUB_CLIENT_ID[:5]}... redirect_uri={settings.GITHUB_REDIRECT_URI}")
        
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
                logger.info(f"GITHUB_TOKEN_STATUS: {token_response.status_code}")
                
                if token_response.status_code != 200:
                    logger.error(f"GITHUB_TOKEN_ERROR: {token_response.text}")
                    raise HTTPException(status_code=400, detail=f"Failed to exchange code for token: {token_response.text}")
                
                token_data = token_response.json()
                logger.info(f"GITHUB_TOKEN_DATA_KEYS: {list(token_data.keys())}")
                if "error" in token_data:
                     logger.error(f"GITHUB_OAUTH_ERROR: {token_data.get('error')} - {token_data.get('error_description')}")
                     raise HTTPException(status_code=400, detail=f"GitHub Error: {token_data.get('error_description')}")
                     
                access_token = token_data.get("access_token")
                
                if not access_token:
                    logger.error("GITHUB_NO_TOKEN: No access token in response")
                    raise HTTPException(status_code=400, detail=f"No access token received. Response: {token_data}")

                    
            except Exception as e:
                print(f"DEBUG: Exception during token exchange: {str(e)}")
                raise HTTPException(status_code=400, detail=f"Token Exchange Error: {str(e)}")
        
        # Get user info from GitHub
        service = UserService(db)
        try:
            logger.info("FETCHING_GITHUB_USER_INFO...")
            github_user = await service.get_github_user_info(access_token)
            logger.info(f"GITHUB_USER_FETCHED: login={github_user.get('login')}")
            
            # Create or update user
            logger.info("CREATE_OR_UPDATE_USER_DB...")
            user = service.create_or_update_user(github_user, access_token)
            logger.info(f"USER_DB_SUCCESS: id={user.id}")

            
            # Generate JWT token
            jwt_token = create_access_token(
                data={"sub": str(user.id)},
                expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            )
            logger.info("JWT_CREATED_SUCCESSFULLY")

            
            return TokenResponse(
                access_token=jwt_token,
                token_type="bearer",
                user=user
            )
        except Exception as db_err:
            print(f"DEBUG: DB/Service Error: {str(db_err)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=400, detail=f"Database/User Error: {str(db_err)}")
            
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"DEBUG: Unhandled Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


@router.get("/github/callback")
async def github_callback(code: str):
    """
    GitHub OAuth callback endpoint
    This is a placeholder - in production, frontend handles the callback
    """
    return {"code": code, "message": "Use this code with POST /auth/github/login"}
