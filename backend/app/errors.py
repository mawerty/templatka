"""Common HTTP errors for API routes.

Usage:
    from app.errors import NotFoundError, BadRequestError
    
    raise NotFoundError("User")  # -> 404: "User not found"
    raise BadRequestError("Invalid email format")  # -> 400
"""

from fastapi import HTTPException


class NotFoundError(HTTPException):
    """404 Not Found - resource doesn't exist."""

    def __init__(self, resource: str = "Resource"):
        super().__init__(status_code=404, detail=f"{resource} not found")


class BadRequestError(HTTPException):
    """400 Bad Request - invalid input."""

    def __init__(self, message: str = "Bad request"):
        super().__init__(status_code=400, detail=message)


class UnauthorizedError(HTTPException):
    """401 Unauthorized - authentication required."""

    def __init__(self, message: str = "Authentication required"):
        super().__init__(status_code=401, detail=message)


class ForbiddenError(HTTPException):
    """403 Forbidden - not allowed."""

    def __init__(self, message: str = "Not allowed"):
        super().__init__(status_code=403, detail=message)


class ConflictError(HTTPException):
    """409 Conflict - resource already exists."""

    def __init__(self, resource: str = "Resource"):
        super().__init__(status_code=409, detail=f"{resource} already exists")

