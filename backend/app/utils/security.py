"""Security utilities — input sanitization, rate limiting, header hardening."""

from __future__ import annotations

import hashlib
import re
import time
from collections import defaultdict
from typing import Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


# ---------------------------------------------------------------------------
# Input sanitisation
# ---------------------------------------------------------------------------

_HTML_ESCAPE = str.maketrans({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#x27;", "/": "&#x2F;",
})


def sanitize(value: str, max_length: int = 2048) -> str:
    """Strip leading/trailing whitespace, truncate, and HTML-escape a string."""
    return str(value).strip()[:max_length].translate(_HTML_ESCAPE)


def strip_html(value: str) -> str:
    """Remove HTML tags from a string."""
    return re.sub(r"<[^>]+>", "", str(value))


# ---------------------------------------------------------------------------
# In-memory rate limiter  (sliding window, resets per process restart)
# ---------------------------------------------------------------------------

_RATE_STORE: dict[str, list[float]] = defaultdict(list)

RATE_LIMIT_RULES: dict[str, tuple[int, int]] = {
    # path prefix → (max_requests, window_seconds)
    "/api/auth/login":           (60,  60),
    "/api/auth/register":        (30,  60),
    "/api/auth/forgot-password": (10,  300),
    "/api/ml/predict":           (60,  60),
    "/api/resume":               (30,  60),
    "/api/report":               (30,  60),
}


def _get_client_key(request: Request) -> str:
    """Return a stable key for the requesting client (IP + path prefix)."""
    ip = request.client.host if request.client else "unknown"
    # Use first 3 segments of path as bucket key
    path = "/".join(request.url.path.split("/")[:4])
    return f"{ip}:{path}"


def check_rate_limit(request: Request) -> tuple[bool, int]:
    """
    Returns (allowed: bool, retry_after_seconds: int).
    Checks the most specific matching rule.
    """
    path = request.url.path
    rule = next(
        ((limit, window) for prefix, (limit, window) in RATE_LIMIT_RULES.items()
         if path.startswith(prefix)),
        None,
    )
    if rule is None:
        return True, 0  # no rule → allow

    limit, window = rule
    now = time.time()
    key = _get_client_key(request)
    timestamps = _RATE_STORE[key]

    # Remove expired timestamps
    _RATE_STORE[key] = [t for t in timestamps if now - t < window]
    timestamps = _RATE_STORE[key]

    if len(timestamps) >= limit:
        oldest = timestamps[0]
        retry_after = int(window - (now - oldest)) + 1
        return False, retry_after

    _RATE_STORE[key].append(now)
    return True, 0


# ---------------------------------------------------------------------------
# Security headers middleware
# ---------------------------------------------------------------------------

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to every response."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Rate limit check
        allowed, retry_after = check_rate_limit(request)
        if not allowed:
            return JSONResponse(
                status_code=429,
                content={"success": False, "code": "rate_limit", "message": "Too many requests. Please slow down."},
                headers={"Retry-After": str(retry_after)},
            )

        response: Response = await call_next(request)

        # Security headers
        response.headers["X-Content-Type-Options"]    = "nosniff"
        response.headers["X-Frame-Options"]            = "DENY"
        response.headers["X-XSS-Protection"]           = "1; mode=block"
        response.headers["Referrer-Policy"]            = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"]         = "camera=(), microphone=(), geolocation=()"
        # Only add HSTS in production (prevents issues on http localhost)
        # response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        if "server" in response.headers:
            del response.headers["server"]

        return response
