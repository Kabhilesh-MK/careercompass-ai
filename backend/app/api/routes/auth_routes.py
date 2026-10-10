"""Auth routes — register, login, logout, refresh, forgot/reset password, admin login."""

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.schemas.auth import (
    RegisterRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest,
    TokenResponse, RefreshRequest, MessageResponse,
)
from app.services import auth_service
from app.auth.dependencies import get_current_user, revoke_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: RegisterRequest):
    return await auth_service.register_user(data)


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    return await auth_service.login_user(data)


@router.post("/logout", response_model=MessageResponse)
async def logout(user: dict = Depends(get_current_user)):
    token = user.get("_token")
    if token:
        revoke_token(token)
    return {"message": "Logged out successfully"}


@router.post("/refresh", response_model=dict)
async def refresh(data: RefreshRequest):
    return auth_service.refresh_token(data.refresh_token)


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(data: ForgotPasswordRequest):
    await auth_service.forgot_password(data.email)
    return {"message": "If that email exists, a reset link has been sent."}


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(data: ResetPasswordRequest):
    await auth_service.reset_password(data.token, data.new_password)
    return {"message": "Password reset successfully."}


@router.post("/admin/login", response_model=TokenResponse)
async def admin_login(data: LoginRequest):
    return await auth_service.admin_login(data.email, data.password)
