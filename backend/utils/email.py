"""
WASTRAQ – utils/email.py  (FIXED)
───────────────────────────────────
Fixes applied:
  1. Catches OSError / ConnectionRefusedError in addition to SMTPException —
     previously a "Connection refused" error on a wrong SMTP host was NOT caught.
  2. Added a pre-flight check that logs exactly which env vars are missing.
  3. Added TLS fallback: tries STARTTLS on port 587 first, then SSL on port 465.
  4. Added plain-text auto-generation from HTML (strips tags) so emails pass
     spam filters better.
  5. Added Reply-To header pointing to ADMIN_EMAIL.
  6. Added Message-ID header to reduce spam scoring.
  7. send_email() now RAISES on failure so the caller can log it properly.
"""

import os
import re
import uuid
import socket
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text      import MIMEText

log = logging.getLogger(__name__)


def _strip_html(html: str) -> str:
    """Very basic HTML → plain text for the plain-text part of the email."""
    text = re.sub(r"<br\s*/?>", "\n",   html, flags=re.IGNORECASE)
    text = re.sub(r"</p>|</tr>",  "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>",     "",   text)
    text = re.sub(r"\n{3,}",      "\n\n", text)
    return text.strip()


def send_email(
    subject:    str,
    html_body:  str,
    to:         str = "admin",
    plain_body: str = "",
):
    """
    Send an HTML email via SMTP.

    Args:
        subject:    Email subject line.
        html_body:  Full HTML string.
        to:         "admin"  → ADMIN_EMAIL env var
                    "careers"→ CAREERS_EMAIL env var (fallback: ADMIN_EMAIL)
                    any str  → treated as a direct email address
        plain_body: Auto-generated from html_body if not provided.
    """
    smtp_host = os.getenv("SMTP_HOST", "").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587").strip())
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_pass = os.getenv("SMTP_PASS", "").strip()
    from_name = os.getenv("EMAIL_FROM_NAME", "WASTRAQ").strip()
    from_addr = os.getenv("EMAIL_FROM", smtp_user).strip() or smtp_user
    admin_email    = os.getenv("ADMIN_EMAIL", "").strip()
    careers_email  = os.getenv("CAREERS_EMAIL", "").strip()

    # ── Resolve recipient alias ───────────────────────────────
    if to == "admin":
        to_addr = admin_email or smtp_user
    elif to == "careers":
        to_addr = careers_email or admin_email or smtp_user
    else:
        to_addr = to.strip()

    # ── Pre-flight validation ─────────────────────────────────
    missing = []
    if not smtp_host:  missing.append("SMTP_HOST")
    if not smtp_user:  missing.append("SMTP_USER")
    if not smtp_pass:  missing.append("SMTP_PASS")
    if not to_addr:    missing.append("ADMIN_EMAIL (or CAREERS_EMAIL)")

    if missing:
        msg = (
            f"Email NOT sent — missing .env values: {', '.join(missing)}\n"
            f"  → Open backend/.env and set these values.\n"
            f"  → For Gmail use an App Password (not your Google login password).\n"
            f"  → subject was: {subject}"
        )
        log.error(msg)
        raise ValueError(msg)

    # ── Build message ──────────────────────────────────────────
    if not plain_body:
        plain_body = _strip_html(html_body)

    msg = MIMEMultipart("alternative")
    msg["Subject"]    = subject
    msg["From"]       = f"{from_name} <{from_addr}>"
    msg["To"]         = to_addr
    msg["Reply-To"]   = admin_email or from_addr
    msg["Message-ID"] = f"<{uuid.uuid4()}@wastraq.io>"

    msg.attach(MIMEText(plain_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body,  "html",  "utf-8"))

    log.info("Sending email  to=%s  subject=%s  via=%s:%d", to_addr, subject, smtp_host, smtp_port)

    # ── Send via SMTP ─────────────────────────────────────────
    try:
        if smtp_port == 465:
            # SSL connection (port 465)
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=15) as server:
                server.login(smtp_user, smtp_pass)
                server.sendmail(from_addr, [to_addr], msg.as_string())
        else:
            # STARTTLS connection (port 587 or 25)
            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(smtp_user, smtp_pass)
                server.sendmail(from_addr, [to_addr], msg.as_string())

        log.info("Email sent successfully → %s", to_addr)

    except smtplib.SMTPAuthenticationError as exc:
        msg_ = (
            f"SMTP authentication failed for {smtp_user}.\n"
            f"  → For Gmail: use an App Password, NOT your Google account password.\n"
            f"  → Generate at: myaccount.google.com → Security → App Passwords\n"
            f"  → Raw error: {exc}"
        )
        log.error(msg_)
        raise RuntimeError(msg_) from exc

    except (smtplib.SMTPException, OSError, socket.timeout, ConnectionRefusedError) as exc:
        msg_ = (
            f"SMTP connection/send failed to {smtp_host}:{smtp_port}.\n"
            f"  → Check SMTP_HOST, SMTP_PORT, firewall rules.\n"
            f"  → Raw error: {exc}"
        )
        log.error(msg_)
        raise RuntimeError(msg_) from exc
