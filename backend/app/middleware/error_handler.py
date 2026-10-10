"""Global error-handling middleware.

Catches AppException (custom), Pydantic validation errors, and any
unexpected exceptions, returning a consistent JSON error envelope.
"""

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from loguru import logger

from app.utils.exceptions import AppException


def register_error_handlers(app: FastAPI) -> None:

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        logger.warning(f"AppException {exc.status_code}: {exc.message} [{request.url.path}]")
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "code": exc.code, "message": exc.message, "detail": exc.message},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_handler(request: Request, exc: RequestValidationError):
        raw_errors = exc.errors()
        logger.warning(f"Validation error [{request.url.path}]: {raw_errors}")
        
        # Extract the first human-readable validation error for user display
        first_msg = "Input validation failed."
        if raw_errors:
            err_msg = raw_errors[0].get("msg", "")
            if err_msg.startswith("Value error, "):
                err_msg = err_msg[len("Value error, "):]
            if err_msg:
                first_msg = err_msg

        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "code": "validation_error",
                "message": first_msg,
                "detail": first_msg,
                "errors": jsonable_encoder(raw_errors),
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        detail_msg = str(exc.detail) if exc.detail else "HTTP error"
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "code": "http_error", "message": detail_msg, "detail": detail_msg},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception(f"Unhandled error [{request.url.path}]: {exc}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "code": "server_error", "message": "An unexpected error occurred.", "detail": "An unexpected error occurred."},
        )

