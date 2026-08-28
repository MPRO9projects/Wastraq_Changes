import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from limiter import limiter
from utils.sheets import append_row
from utils.email  import send_email
from utils.templates import (
    build_demo_email,
    build_partner_email,
    build_careers_email,
    build_register_email,
    build_login_interest_email,
)

log = logging.getLogger(__name__)
router = APIRouter()

# ── Timestamp helper ──────────────────────────────────────────────────────────
def _ts() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


# ══════════════════════════════════════════════════════════════
#  PYDANTIC MODELS
# ══════════════════════════════════════════════════════════════

class DemoRequest(BaseModel):
    fname:      str            = Field(..., min_length=1)
    lname:      str            = Field(..., min_length=1)
    email:      EmailStr
    phone:      Optional[str]  = ""
    country:    Optional[str]  = ""
    org:        Optional[str]  = ""
    orgtype:    Optional[str]  = ""
    orgwebsite: Optional[str]  = ""
    fleet:      Optional[str]  = ""
    msg:        Optional[str]  = ""


class PartnerRequest(BaseModel):
    # BUG FIX: was Literal["reseller","referrer","tech","partner"]
    # Frontend may send "Reseller", "reseller", "Tech Partner" etc.
    # Changed to Optional[str] with normalisation below.
    formType:        Optional[str]  = "partner"
    name:            str            = Field(..., min_length=1)
    email:           EmailStr
    phone:           Optional[str]  = ""
    company:         Optional[str]  = ""
    city:            Optional[str]  = ""
    partnershipType: Optional[str]  = ""
    message:         Optional[str]  = ""


class CareersRequest(BaseModel):
    name:       str           = Field(..., min_length=1)
    email:      EmailStr
    phone:      Optional[str] = ""
    position:   str           = Field(..., min_length=1)
    linkedin:   Optional[str] = ""
    coverNote:  Optional[str] = ""


# register.html and login.html are "request access" lead-capture forms, not
# real account creation/authentication — there is no user database, no
# password hashing, and no session/token system anywhere in this backend.
# These models deliberately have NO password field: even though both forms
# collect a password client-side (for a minimum-length UX check only), it
# must never be transmitted to or accepted by this API. Any password field
# sent by a client is simply not part of these schemas, so FastAPI/Pydantic
# ignores it — it is never logged, stored in Sheets, or emailed.

class RegisterRequest(BaseModel):
    fname:    str           = Field(..., min_length=1, max_length=100)
    lname:    str           = Field(..., min_length=1, max_length=100)
    email:    EmailStr
    phone:    Optional[str] = Field("", max_length=40)
    location: Optional[str] = Field("", max_length=200)


class LoginInterestRequest(BaseModel):
    email: EmailStr


# ══════════════════════════════════════════════════════════════
#  DEMO REQUEST  –  POST /api/forms/demo
# ══════════════════════════════════════════════════════════════

@router.post("/demo")
@limiter.limit("5/minute")
async def submit_demo(request: Request, data: DemoRequest):
    """Demo request from contact.html — saves to 'Demo Requests' sheet and emails admin."""

    row = [
        data.fname, data.lname, data.email, data.phone,
        data.country, data.org, data.orgtype, data.orgwebsite,
        data.fleet, data.msg, _ts(),
    ]
    headers = [
        "First Name", "Last Name", "Email", "Phone",
        "Country", "Organisation", "Org Type", "Website",
        "Fleet Size", "Message", "Submitted At",
    ]

    sheets_ok = True
    email_ok  = True

    # ── Google Sheets ──────────────────────────────────────────
    try:
        append_row("Demo Requests", headers, row)
        log.info("Demo form saved to Sheets: %s %s <%s>", data.fname, data.lname, data.email)
    except Exception as exc:
        sheets_ok = False
        log.error("Demo → Sheets FAILED: %s", exc, exc_info=True)

    # ── Email notification ─────────────────────────────────────
    try:
        subject, html = build_demo_email(data.model_dump())
        send_email(subject, html, to="admin")
        log.info("Demo form email sent for: %s", data.email)
    except Exception as exc:
        email_ok = False
        log.error("Demo → Email FAILED: %s", exc, exc_info=True)

    # Always return success to frontend; log failures for ops team
    return {
        "success":   True,
        "message":   "Form submitted successfully.",
        "sheets_ok": sheets_ok,
        "email_ok":  email_ok,
    }


# ══════════════════════════════════════════════════════════════
#  PARTNER FORMS  –  POST /api/forms/partner
# ══════════════════════════════════════════════════════════════

@router.post("/partner")
@limiter.limit("5/minute")
async def submit_partner(request: Request, data: PartnerRequest):
    """Reseller / Referrer / Tech-Partner modal — saves to 'Partnership' sheet."""

    # Normalise formType to lowercase
    form_type = (data.formType or data.partnershipType or "partner").strip().lower()
    # Map common variations
    form_type_map = {
        "tech partner": "tech",
        "technology partner": "tech",
        "techpartner": "tech",
        "tech-partner": "tech",
        "referral": "referrer",
        "referral partner": "referrer",
    }
    form_type = form_type_map.get(form_type, form_type)

    row = [
        data.name, data.email, data.phone, data.company,
        data.city, form_type, data.message, _ts(),
    ]
    headers = [
        "Full Name", "Email", "Phone", "Company",
        "City", "Partnership Type", "Message", "Submitted At",
    ]

    sheets_ok = True
    email_ok  = True

    try:
        append_row("Partnership", headers, row)
        log.info("Partner form saved to Sheets: %s <%s> type=%s", data.name, data.email, form_type)
    except Exception as exc:
        sheets_ok = False
        log.error("Partner → Sheets FAILED: %s", exc, exc_info=True)

    try:
        # Pass normalised type back so email template can use it
        payload = data.model_dump()
        payload["formType"] = form_type
        subject, html = build_partner_email(payload)
        send_email(subject, html, to="admin")
        log.info("Partner form email sent for: %s", data.email)
    except Exception as exc:
        email_ok = False
        log.error("Partner → Email FAILED: %s", exc, exc_info=True)

    return {
        "success":   True,
        "message":   "Form submitted successfully.",
        "sheets_ok": sheets_ok,
        "email_ok":  email_ok,
    }


# ══════════════════════════════════════════════════════════════
#  CAREERS FORM  –  POST /api/forms/careers
# ══════════════════════════════════════════════════════════════

@router.post("/careers")
@limiter.limit("5/minute")
async def submit_careers(request: Request, data: CareersRequest):
    """Careers application — saves to 'Careers' sheet and emails careers team."""

    row = [
        data.name, data.email, data.phone,
        data.position, data.linkedin, data.coverNote, _ts(),
    ]
    headers = [
        "Full Name", "Email", "Phone",
        "Position Applied", "LinkedIn / Portfolio", "Cover Note", "Submitted At",
    ]

    sheets_ok = True
    email_ok  = True

    try:
        append_row("Careers", headers, row)
        log.info("Careers form saved to Sheets: %s <%s> pos=%s", data.name, data.email, data.position)
    except Exception as exc:
        sheets_ok = False
        log.error("Careers → Sheets FAILED: %s", exc, exc_info=True)

    try:
        subject, html = build_careers_email(data.model_dump())
        send_email(subject, html, to="careers")
        log.info("Careers form email sent for: %s", data.email)
    except Exception as exc:
        email_ok = False
        log.error("Careers → Email FAILED: %s", exc, exc_info=True)

    return {
        "success":   True,
        "message":   "Form submitted successfully.",
        "sheets_ok": sheets_ok,
        "email_ok":  email_ok,
    }


# ══════════════════════════════════════════════════════════════
#  REGISTER "REQUEST ACCESS"  –  POST /api/forms/register
# ══════════════════════════════════════════════════════════════

@router.post("/register")
@limiter.limit("5/minute")
async def submit_register(request: Request, data: RegisterRequest):
    """
    register.html — this is a lead-capture 'request access' form, not real
    account creation. No password is accepted by RegisterRequest, so none
    is ever stored in Sheets or included in the notification email.
    """
    row = [
        data.fname, data.lname, data.email, data.phone, data.location, _ts(),
    ]
    headers = [
        "First Name", "Last Name", "Email", "Phone", "Location", "Submitted At",
    ]

    sheets_ok = True
    email_ok  = True

    try:
        append_row("Registrations", headers, row)
        log.info("Register request saved to Sheets: %s %s <%s>", data.fname, data.lname, data.email)
    except Exception as exc:
        sheets_ok = False
        log.error("Register → Sheets FAILED: %s", exc, exc_info=True)

    try:
        subject, html = build_register_email(data.model_dump())
        send_email(subject, html, to="admin")
        log.info("Register request email sent for: %s", data.email)
    except Exception as exc:
        email_ok = False
        log.error("Register → Email FAILED: %s", exc, exc_info=True)

    return {
        "success":   True,
        "message":   "Registration request received. Our team will be in touch shortly.",
        "sheets_ok": sheets_ok,
        "email_ok":  email_ok,
    }


# ══════════════════════════════════════════════════════════════
#  LOGIN "REQUEST ACCESS"  –  POST /api/forms/login
# ══════════════════════════════════════════════════════════════

@router.post("/login")
@limiter.limit("8/minute")
async def submit_login_interest(request: Request, data: LoginInterestRequest):
    """
    login.html — there is no real authentication here. This records the
    email as an access request for manual follow-up. No password is
    accepted by LoginInterestRequest, so none is ever stored or emailed.
    """
    row = [data.email, _ts()]
    headers = ["Email", "Requested At"]

    sheets_ok = True
    email_ok  = True

    try:
        append_row("Login Requests", headers, row)
        log.info("Login access request saved to Sheets: %s", data.email)
    except Exception as exc:
        sheets_ok = False
        log.error("Login request → Sheets FAILED: %s", exc, exc_info=True)

    try:
        subject, html = build_login_interest_email(str(data.email))
        send_email(subject, html, to="admin")
        log.info("Login access request email sent for: %s", data.email)
    except Exception as exc:
        email_ok = False
        log.error("Login request → Email FAILED: %s", exc, exc_info=True)

    return {
        "success":   True,
        "message":   "Request received. Our team will be in touch shortly.",
        "sheets_ok": sheets_ok,
        "email_ok":  email_ok,
    }


# ══════════════════════════════════════════════════════════════
#  DEBUG ENDPOINTS (remove in production if desired)
# ══════════════════════════════════════════════════════════════

@router.get("/test-email")
async def test_email():
    """Send a test email to ADMIN_EMAIL to verify SMTP is working."""
    try:
        send_email(
            subject   = "WASTRAQ – SMTP Test Email",
            html_body = "<h2>SMTP is working correctly!</h2><p>This is a test from your WASTRAQ backend.</p>",
            to        = "admin",
        )
        return {"success": True, "message": "Test email sent. Check your inbox."}
    except Exception as exc:
        log.error("test-email failed: %s", exc, exc_info=True)
        return {"success": False, "error": str(exc)}


@router.get("/test-sheets")
async def test_sheets():
    """Write a test row to Google Sheets 'Test' tab to verify Sheets API is working."""
    try:
        append_row(
            "Test",
            ["Test Column", "Timestamp"],
            ["WASTRAQ backend test", _ts()],
        )
        return {"success": True, "message": "Test row written to 'Test' sheet. Check your spreadsheet."}
    except Exception as exc:
        log.error("test-sheets failed: %s", exc, exc_info=True)
        return {"success": False, "error": str(exc)}


# ══════════════════════════════════════════════════════════════
#  EMAIL SUBSCRIPTION  –  POST /api/forms/subscribe
# ══════════════════════════════════════════════════════════════

class SubscriptionRequest(BaseModel):
    email: EmailStr
    type:  Optional[str] = "subscription"    # always "subscription" from frontend


@router.post("/subscribe")
@limiter.limit("5/minute")
async def submit_subscription(request: Request, data: SubscriptionRequest):
    """
    Receives email subscription from any page.
    Saves to 'Subscriptions' sheet and emails admin.
    """
    row = [
        "Subscription",           # Type column
        str(data.email),          # Email
        _ts(),                    # Timestamp
    ]
    headers = ["Type", "Email", "Subscribed At"]

    sheets_ok = True
    email_ok  = True

    # ── Google Sheets ──────────────────────────────────────────
    try:
        append_row("Subscriptions", headers, row)
        log.info("Subscription saved to Sheets: %s", data.email)
    except Exception as exc:
        sheets_ok = False
        log.error("Subscription → Sheets FAILED: %s", exc, exc_info=True)

    # ── Email notification ─────────────────────────────────────
    try:
        subject = "New Subscription — {}".format(data.email)
        html_body = """<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f7f4;font-family:Plus Jakarta Sans,Helvetica Neue,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="560" cellpadding="0" cellspacing="0"
      style="max-width:560px;width:100%;background:#fff;border-radius:16px;
             overflow:hidden;box-shadow:0 4px 24px rgba(10,32,22,.1);">
      <tr><td style="background:#0a2016;padding:26px 32px;">
        <span style="font-size:21px;font-weight:800;color:white;letter-spacing:-.02em;">WASTRAQ</span>
        <span style="display:block;font-size:11px;color:rgba(255,255,255,.5);margin-top:4px;
                     font-weight:600;letter-spacing:.08em;text-transform:uppercase;">New Subscription</span>
      </td></tr>
      <tr><td style="padding:28px 32px;">
        <p style="margin:0 0 16px;font-size:15px;color:#4b5e47;line-height:1.6;">
          A new user has subscribed for WASTRAQ release updates.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f0fdf4;">
              <span style="font-size:11px;font-weight:700;text-transform:uppercase;
                           letter-spacing:.07em;color:#7c9177;">Email Address</span><br/>
              <span style="font-size:15px;color:#0d1f0b;font-weight:600;">{email}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;">
              <span style="font-size:11px;font-weight:700;text-transform:uppercase;
                           letter-spacing:.07em;color:#7c9177;">Subscribed At</span><br/>
              <span style="font-size:14px;color:#0d1f0b;font-weight:500;">{ts}</span>
            </td>
          </tr>
        </table>
      </td></tr>
      <tr><td style="background:#f0fdf4;padding:16px 32px;border-top:1px solid #e2ead0;text-align:center;">
        <p style="margin:0;font-size:12px;color:#7c9177;">
          New subscription request received: {email}<br/>
          &copy; {year} WASTRAQ — M Pro9 Pvt. Ltd.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>""".format(
            email=str(data.email),
            ts=_ts(),
            year=datetime.now(timezone.utc).year,
        )
        send_email(subject, html_body, to="admin")
        log.info("Subscription email sent for: %s", data.email)
    except Exception as exc:
        email_ok = False
        log.error("Subscription → Email FAILED: %s", exc, exc_info=True)

    return {
        "success":   True,
        "message":   "Thank you! We will notify you soon.",
        "sheets_ok": sheets_ok,
        "email_ok":  email_ok,
    }
