"""Auth-related request/response schemas."""

from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


PASSWORD_REGEX = r"^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$"


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    phone: Optional[str] = Field(default=None, max_length=20)
    degree: Optional[str] = None
    department: Optional[str] = None
    college: Optional[str] = None
    year: Optional[int] = Field(default=None, ge=1980, le=2030)
    cgpa: Optional[float] = Field(default=None, ge=0, le=10)
    interests: list[str] = Field(default_factory=list)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        import re
        if not re.match(PASSWORD_REGEX, v):
            raise ValueError(
                "Password must be at least 8 chars with one uppercase, one digit, and one special character."
            )
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        import re
        if not re.match(PASSWORD_REGEX, v):
            raise ValueError(
                "Password must be at least 8 chars with one uppercase, one digit, and one special character."
            )
        return v


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    full_name: str
    profile_completed: bool = False


class RefreshRequest(BaseModel):
    refresh_token: str


class MessageResponse(BaseModel):
    message: str
