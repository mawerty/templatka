from fastapi import HTTPException


class NotFoundError(HTTPException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(status_code=404, detail=f"{resource} not found")


class BadRequestError(HTTPException):
    def __init__(self, message: str = "Bad request"):
        super().__init__(status_code=400, detail=message)


class UnauthorizedError(HTTPException):
    def __init__(self, message: str = "Authentication required"):
        super().__init__(status_code=401, detail=message)


class ForbiddenError(HTTPException):
    def __init__(self, message: str = "Not allowed"):
        super().__init__(status_code=403, detail=message)


class ConflictError(HTTPException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(status_code=409, detail=f"{resource} already exists")
