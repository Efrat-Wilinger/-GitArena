from fastapi import FastAPI
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
app.add_exception_handler(GitArenaException, exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Register routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(github_router)
app.include_router(analytics_router)
app.include_router(ai_router)
app.include_router(spaces_controller)


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
