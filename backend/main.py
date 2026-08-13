"""
WASTRAQ Backend – main.py  (FIXED)
───────────────────────────────────
Fixes applied:
  1. load_dotenv() now uses the .env file NEXT TO main.py, regardless of
     which directory uvicorn is launched from.
  2. CORS: allow_credentials=True is incompatible with allow_origins=["*"].
     Fixed to use explicit origins OR wildcard without credentials.
  3. Proper logging setup so every error prints to the terminal.
  4. Startup event confirms environment variables are loaded correctly.
"""

import os
import sys
import logging
from pathlib import Path

# ── Load .env from the same folder as this file ──────────────────────────────
from dotenv import load_dotenv

_ENV_FILE = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_ENV_FILE, override=True)
# ── Environment Variables ────────────────────────────────────────────
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = os.getenv("SMTP_PORT")
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
CAREERS_EMAIL = os.getenv("CAREERS_EMAIL")

SPREADSHEET_ID = os.getenv("SPREADSHEET_ID")
GOOGLE_SERVICE_ACCOUNT_FILE = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE")
# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s – %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
log = logging.getLogger("wastraq")

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers import forms, chatbot

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="WASTRAQ API",
    description="Backend API for the WASTRAQ smart waste management platform.",
    version="1.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
_raw_origins = os.getenv("ALLOWED_ORIGINS", "").strip()

if _raw_origins and _raw_origins != "*":
    ALLOWED_ORIGINS    = [o.strip() for o in _raw_origins.split(",") if o.strip()]
    _allow_credentials = True
else:
    ALLOWED_ORIGINS    = ["*"]
    _allow_credentials = False

log.info("CORS origins: %s | credentials: %s", ALLOWED_ORIGINS, _allow_credentials)

app.add_middleware(
    CORSMiddleware,
    allow_origins     = ALLOWED_ORIGINS,
    allow_credentials = _allow_credentials,
    allow_methods     = ["GET", "POST", "OPTIONS"],
    allow_headers     = ["Content-Type", "Accept", "Authorization"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(forms.router,   prefix="/api/forms",   tags=["Forms"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])


@app.on_event("startup")
async def _startup():
    checks = {
        "SMTP_HOST":                   os.getenv("SMTP_HOST", ""),
        "SMTP_USER":                   os.getenv("SMTP_USER", ""),
        "SMTP_PASS":                   "SET" if os.getenv("SMTP_PASS") else "MISSING",
        "ADMIN_EMAIL":                 os.getenv("ADMIN_EMAIL", ""),
        "CAREERS_EMAIL":               os.getenv("CAREERS_EMAIL", ""),
        "SPREADSHEET_ID":              os.getenv("SPREADSHEET_ID", ""),
        "GOOGLE_SERVICE_ACCOUNT_FILE": os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", ""),
    }
    log.info("──────── WASTRAQ API starting ────────")
    for k, v in checks.items():
        log.info("  %-35s %s", k, v if v else "NOT SET ✗")

    sa_file = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "service_account.json")
    sa_path = Path(__file__).resolve().parent / sa_file
    if not sa_path.exists():
        log.warning("  service_account.json NOT FOUND at: %s", sa_path)
    else:
        log.info("  service_account.json FOUND ✓")
    log.info("──────────────────────────────────────")


@app.get("/api/health", tags=["Health"])
async def health():
    return {
        "status":             "ok",
        "service":            "WASTRAQ API",
        "smtp_configured":    bool(os.getenv("SMTP_USER") and os.getenv("SMTP_PASS")),
        "sheets_configured":  bool(os.getenv("SPREADSHEET_ID")),
    }


@app.exception_handler(Exception)
async def _global_handler(request: Request, exc: Exception):
    log.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "An internal server error occurred."},
    )


@app.get("/", include_in_schema=False)
async def root():
    return JSONResponse({"message": "WASTRAQ API is running. See /api/docs for documentation."})
