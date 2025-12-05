"""Auth feature - JWT-based authentication.

Enable in config.py:
    enable_auth: bool = True

Provides:
    - POST /api/auth/register - Create new user
    - POST /api/auth/login - Get JWT token
    - GET /api/auth/me - Get current user
    - POST /api/auth/logout - Invalidate token (client-side)

Usage in routes:
    from app.features.auth.deps import get_current_user, get_optional_user

    @router.get("/protected")
    def protected_route(user: AuthUser = Depends(get_current_user)):
        return {"message": f"Hello {user.name}"}
"""

from app.features.auth.router import router as auth_router

__all__ = ["auth_router"]
