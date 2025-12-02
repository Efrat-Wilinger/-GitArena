class GitArenaException(Exception):
    """Base exception for GitArena"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundException(GitArenaException):
    """Resource not found exception"""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)


class UnauthorizedException(GitArenaException):
    """Unauthorized access exception"""
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status_code=401)


class BadRequestException(GitArenaException):
    """Bad request exception"""
    def __init__(self, message: str = "Bad request"):
        super().__init__(message, status_code=400)


class GitHubAPIException(GitArenaException):
    """GitHub API error exception"""
    def __init__(self, message: str = "GitHub API error"):
        super().__init__(message, status_code=502)
