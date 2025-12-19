from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.shared.exceptions import GitArenaException
from app.shared.middleware import exception_handler, generic_exception_handler
from app.modules.users.controller import router as users_router
from app.modules.users.auth_controller import router as auth_router
from app.modules.github.controller import router as github_router
from app.modules.analytics.controller import router as analytics_router
from app.modules.ai.controller import router as ai_router
from app.modules.spaces.controller import router as spaces_controller
from app.modules.gamification.controller import router as gamification_router
from app.modules.users.tasks_controller import router as tasks_router
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


app = FastAPI(
    title="GitArena API",
    description="GitArena - GitHub Analytics and AI Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
# Exception handlers
# app.add_exception_handler(GitArenaException, exception_handler)
# app.add_exception_handler(Exception, generic_exception_handler)

from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    error_msg = f"Global 500 Error: {str(exc)}"
    print(error_msg)
    # Write to file for backup debug access
    try:
        with open("debug_error.log", "a") as f:
            f.write(f"\n--- ERROR ---\n{error_msg}\n{traceback.format_exc()}\n")
    except:
        pass
        
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": error_msg, "trace": traceback.format_exc()}
    )

# Register routers
api_router = APIRouter(prefix="/api")
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(github_router)
api_router.include_router(analytics_router)
api_router.include_router(ai_router)
api_router.include_router(spaces_controller)
api_router.include_router(gamification_router)
api_router.include_router(tasks_router)


app.include_router(api_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "GitArena API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
