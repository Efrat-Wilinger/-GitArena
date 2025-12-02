from fastapi import Request, status
from fastapi.responses import JSONResponse
from app.shared.exceptions import GitArenaException
import logging

logger = logging.getLogger(__name__)


async def exception_handler(request: Request, exc: GitArenaException):
    """Global exception handler for custom exceptions"""
    logger.error(f"GitArenaException: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"}
    )
