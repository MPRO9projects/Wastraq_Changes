# WASTRAQ Backend — Complete Debug & Fix Guide
## All bugs found, all fixes applied, step-by-step setup

---

## BUGS FIXED (Summary)

| # | File | Bug | Fix Applied |
|---|------|-----|-------------|
| 1 | `main.py` | `load_dotenv()` couldn't find `.env` if uvicorn was started from a different directory | Now resolves `.env` relative to `main.py`'s own directory |
| 2 | `main.py` | `allow_credentials=True` + `allow_origins=["*"]` is invalid CORS — browser rejects all responses | Auto-switches to no-credentials when using wildcard |
| 3 | `main.py` | No logging — errors vanished silently | Full `logging.basicConfig()` added, startup prints all config |
| 4 | `forms.py` | `BackgroundTasks` swallows all exceptions silently | Replaced with direct calls + independent try/except per operation |
| 5 | `forms.py` | `data.dict()` is deprecated in Pydantic v2 | Changed to `data.model_dump()` |
| 6 | `forms.py` | `PartnerRequest.formType = Literal["reseller","referrer","tech","partner"]` — frontend may send "Reseller" or "Tech Partner" which fails validation | Changed to `Optional[str]` with normalisation map |
| 7 | `sheets.py` | Service account file resolved from CWD, not `backend/` folder | Now tries 3 paths: absolute, relative to `sheets.py`, relative to CWD |
| 8 | `sheets.py` | `HttpError` caught but `FileNotFoundError`/`ValueError` not propagated properly | All exception types caught and re-raised with helpful messages |
| 9 | `sheets.py` | Sheet range used `{sheet_name}!A1` — fails if sheet name has spaces | Changed to `'{sheet_name}'!A1` with single quotes |
| 10 | `email.py` | Only `SMTPException` caught — `ConnectionRefusedError`, `OSError`, `socket.timeout` not caught | All connection errors now caught |
| 11 | `email.py` | No pre-flight check — silently returned if SMTP vars missing | Now raises `ValueError` with exact missing variable names |
| 12 | `email.py` | No SSL path for port 465 | Added `SMTP_SSL` for port 465, `STARTTLS` for 587 |
| 13 | `templates.py` | `data["key"]` caused `KeyError` if field missing | Changed all to `data.get("key", "")` |
| 14 | `templates.py` | `data.dict()` deprecated | Changed to `data.model_dump()` (in forms.py) |

---

## STEP 1 — Set Up Your `.env` File

Open `backend/.env` (or create it: `cp .env.example .env`).

Fill in **every value** below:

```env
# ── CORS ──────────────────────────────────────────────────────
ALLOWED_ORIGINS=*
# (In production change to: https://www.wastraq.io,https://wastraq.io)

# ── EMAIL ─────────────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-actual-gmail@gmail.com
SMTP_PASS=abcd efgh ijkl mnop        ← 16-char Gmail App Password
EMAIL_FROM_NAME=WASTRAQ
EMAIL_FROM=your-actual-gmail@gmail.com
ADMIN_EMAIL=admin@wastraq.io         ← where demo/partner emails go
CAREERS_EMAIL=careers@wastraq.io     ← where careers emails go

# ── GOOGLE SHEETS ─────────────────────────────────────────────
GOOGLE_SERVICE_ACCOUNT_FILE=service_account.json
SPREADSHEET_ID=1aBcDeFgHiJkLmNoPqRsTuVwXyZ   ← from your spreadsheet URL
```

---

## STEP 2 — Get Gmail App Password

1. Go to **https://myaccount.google.com**
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google" → click **2-Step Verification** → enable it
4. Search for **App Passwords** in the search bar at the top
5. Select app: **Mail** → device: **Other** → name it **WASTRAQ** → click **Generate**
6. Copy the **16-character password** (format: `xxxx xxxx xxxx xxxx`)
7. Paste it into `.env` as `SMTP_PASS=xxxx xxxx xxxx xxxx`

> ⚠️ Do NOT use your regular Google password. It will always fail with "Username and Password not accepted".

---

## STEP 3 — Set Up Google Sheets

### 3a — Create the Spreadsheet

1. Go to **https://sheets.google.com**
2. Create a new spreadsheet
3. Name it: **WASTRAQ Form Submissions**
4. Copy the ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/  1aBcDeFgHiJkLmNoPqRsTuVwXyZ  /edit
                                              ↑ This is your SPREADSHEET_ID ↑
   ```
5. Paste into `.env` as `SPREADSHEET_ID=1aBcDeFgHiJkLmNoPqRsTuVwXyZ`

### 3b — Create Service Account (Google Cloud)

1. Go to **https://console.cloud.google.com**
2. Click the project dropdown (top left) → **New Project**
3. Name: `wastraq-backend` → **Create**
4. In the search bar at top → search **Google Sheets API** → click it → **Enable**
5. Left menu: **IAM & Admin** → **Service Accounts** → **+ Create Service Account**
6. Name: `wastraq-sheets` → **Create and Continue** → **Done**
7. Click on the service account → **Keys** tab → **Add Key** → **Create new key** → **JSON**
8. A `.json` file downloads automatically
9. **Rename it** to `service_account.json`
10. **Move it** to your `backend/` folder (same folder as `main.py`)

### 3c — Share the Spreadsheet with the Service Account

1. Open `service_account.json` in a text editor
2. Find the `"client_email"` field — it looks like:
   `wastraq-sheets@wastraq-backend.iam.gserviceaccount.com`
3. Open your Google Spreadsheet
4. Click **Share** (top right)
5. Paste the `client_email` address into the "Add people" box
6. Set role to **Editor**
7. Click **Share** — **uncheck "Notify people"**

---

## STEP 4 — Install Dependencies

```bash
cd backend/
pip install -r requirements.txt
```

If you get errors, install individually:
```bash
pip install fastapi uvicorn python-dotenv
pip install pydantic[email]
pip install google-auth google-api-python-client google-auth-httplib2
```

---

## STEP 5 — Start the Backend

```bash
cd backend/
uvicorn main:app --reload --port 8000
```

On startup you should see something like:
```
INFO  wastraq – SMTP_HOST                           smtp.gmail.com
INFO  wastraq – SMTP_USER                           your@gmail.com
INFO  wastraq – SMTP_PASS                           SET
INFO  wastraq – ADMIN_EMAIL                         admin@wastraq.io
INFO  wastraq – SPREADSHEET_ID                      1aBcDeFg...
INFO  wastraq – service_account.json FOUND ✓
```

If you see `NOT SET` for any value → your `.env` is not being read correctly.

---

## STEP 6 — Test Everything

### Test 1 — API Health Check
Open in browser: **http://localhost:8000/api/health**

Expected response:
```json
{
  "status": "ok",
  "smtp_configured": true,
  "sheets_configured": true
}
```

If `smtp_configured` is `false` → SMTP_USER or SMTP_PASS is missing.
If `sheets_configured` is `false` → SPREADSHEET_ID is missing.

---

### Test 2 — Test Email
Open: **http://localhost:8000/api/forms/test-email**

Expected:
```json
{"success": true, "message": "Test email sent. Check your inbox."}
```

If error: read the `"error"` field — it tells you exactly what's wrong.

Common errors:
- `"SMTP_PASS not configured"` → fill in SMTP_PASS in .env
- `"Username and Password not accepted"` → you're using your Google login password, not an App Password
- `"Connection refused"` → wrong SMTP_HOST or firewall blocking port 587

---

### Test 3 — Test Google Sheets
Open: **http://localhost:8000/api/forms/test-sheets**

Expected:
```json
{"success": true, "message": "Test row written to 'Test' sheet."}
```

Then open your Google Spreadsheet — you should see a new tab called **Test** with a row in it.

Common errors:
- `"service_account.json not found"` → check the file is in `backend/` folder
- `"The caller does not have permission"` → you haven't shared the spreadsheet with the service account email
- `"SPREADSHEET_ID not configured"` → fill in SPREADSHEET_ID in .env

---

### Test 4 — Test Demo Form via curl

```bash
curl -X POST http://localhost:8000/api/forms/demo \
  -H "Content-Type: application/json" \
  -d '{
    "fname": "Test",
    "lname": "User",
    "email": "test@example.com",
    "phone": "07700000000",
    "org": "Test Corp",
    "fleet": "10-50"
  }'
```

Expected:
```json
{
  "success": true,
  "message": "Form submitted successfully.",
  "sheets_ok": true,
  "email_ok": true
}
```

If `sheets_ok` is `false` or `email_ok` is `false` → check the terminal for the error message.

---

### Test 5 — Test Partner Form

```bash
curl -X POST http://localhost:8000/api/forms/partner \
  -H "Content-Type: application/json" \
  -d '{
    "formType": "reseller",
    "name": "Jane Smith",
    "email": "jane@testco.com",
    "phone": "07700000001",
    "company": "Test Co Ltd",
    "city": "London",
    "partnershipType": "reseller",
    "message": "Interested in reseller partnership."
  }'
```

---

### Test 6 — Test Careers Form

```bash
curl -X POST http://localhost:8000/api/forms/careers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "07700000002",
    "position": "Senior Software Developer",
    "linkedin": "https://linkedin.com/in/johndoe",
    "coverNote": "I am very interested in this role."
  }'
```

---

## STEP 7 — Update Frontend API URL

After your backend is running (locally or on a server), update the API URL in your HTML files.

**Find this line in EVERY HTML page:**
```html
<script>window.WASTRAQ_API_BASE = "http://localhost:8000"; /* change to production URL */</script>
```

**For local development:** leave as `http://localhost:8000`

**For production server** (e.g., your domain is `api.wastraq.io`):
```html
<script>window.WASTRAQ_API_BASE = "https://api.wastraq.io";</script>
```

---

## Troubleshooting Quick Reference

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Form submits but no email received | Wrong SMTP credentials | Use Gmail App Password not login password |
| "Username and Password not accepted" | Using Google login password | Generate App Password at myaccount.google.com |
| "Connection refused" | Wrong SMTP_HOST or port blocked | Check SMTP_HOST=smtp.gmail.com, SMTP_PORT=587 |
| No data in Google Sheets | SPREADSHEET_ID wrong or file not shared | Copy ID from URL, share with service account email |
| "service_account.json not found" | File in wrong folder | Place in `backend/` folder, same level as `main.py` |
| "The caller does not have permission" | Spreadsheet not shared | Share spreadsheet with client_email from JSON file |
| `sheets_ok: false` in response | Any Sheets error | Read terminal log — exact error is printed there |
| `email_ok: false` in response | Any SMTP error | Read terminal log — exact error is printed there |
| CORS error in browser | Frontend domain not in ALLOWED_ORIGINS | Add your domain to ALLOWED_ORIGINS in .env |
| 422 Unprocessable Entity | Wrong field names in form JSON | Check field names match the Pydantic model |
