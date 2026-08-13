# WASTRAQ Backend — Deployment Guide

This guide takes you from zero to a fully running production backend
in under 30 minutes on any Linux VPS (Ubuntu 22.04 recommended).

---

## Folder Structure

```
WASTRAQ/                        ← Your existing frontend files
  ├── index.html
  ├── contact.html
  ├── partnership.html
  ├── careers.html
  ├── wastraq-chatbot.js          ← NEW — chatbot widget (drop-in)
  └── ... (all other HTML pages)

backend/                        ← NEW — FastAPI backend
  ├── main.py
  ├── requirements.txt
  ├── .env.example                ← Copy to .env and fill in values
  ├── service_account.json        ← Google service account key (you provide)
  ├── routers/
  │   ├── forms.py                ← Form submission endpoints
  │   └── chatbot.py              ← Chatbot API endpoint
  └── utils/
      ├── sheets.py               ← Google Sheets integration
      ├── email.py                ← SMTP email sending
      └── templates.py            ← HTML email templates
```

---

## Step 1 — Set Up the Server

```bash
# Update server
sudo apt update && sudo apt upgrade -y

# Install Python 3.11+
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install Certbot for HTTPS
sudo apt install -y certbot python3-certbot-nginx
```

---

## Step 2 — Deploy the Backend

```bash
# Create app directory
sudo mkdir -p /var/www/wastraq-api
sudo chown $USER:$USER /var/www/wastraq-api

# Upload your backend/ folder contents to /var/www/wastraq-api/
# (use scp, rsync, or SFTP)

cd /var/www/wastraq-api

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from example
cp .env.example .env
nano .env                        # Fill in ALL values (see Step 3)
```

---

## Step 3 — Configure Environment Variables (.env)

Edit `/var/www/wastraq-api/.env` and fill in:

```env
# Your frontend domains (comma-separated, no spaces)
ALLOWED_ORIGINS=https://www.wastraq.io,https://wastraq.io

# SMTP — Gmail example
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@wastraq.io
SMTP_PASS=your-16-char-app-password   # Google App Password (not your login password)
EMAIL_FROM_NAME=WASTRAQ
EMAIL_FROM=noreply@wastraq.io
ADMIN_EMAIL=admin@wastraq.io
CAREERS_EMAIL=careers@wastraq.io

# Google Sheets
GOOGLE_SERVICE_ACCOUNT_FILE=service_account.json
SPREADSHEET_ID=1aBcDeFgHiJkLmNoPqRsTuVwXyZ   # From spreadsheet URL
```

### Gmail App Password Setup

1. Go to myaccount.google.com → Security → 2-Step Verification
2. Scroll to "App passwords"
3. Create password for "Mail" → "Other (custom)" → name it "WASTRAQ"
4. Copy the 16-character password into SMTP_PASS

---

## Step 4 — Google Sheets Setup

### 4a — Create Google Cloud Service Account

1. Go to console.cloud.google.com
2. Create a new project (e.g., "wastraq-backend")
3. Enable **Google Sheets API** (APIs & Services → Library)
4. Go to IAM & Admin → Service Accounts → Create Service Account
5. Name it "wastraq-backend", click Create
6. Skip optional fields, click Done
7. Click the service account → Keys → Add Key → JSON
8. Download the JSON file
9. Rename it `service_account.json`
10. Upload to `/var/www/wastraq-api/service_account.json`

### 4b — Create the Google Spreadsheet

1. Create a new Google Spreadsheet at sheets.google.com
2. Copy the spreadsheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/**THIS_IS_THE_ID**/edit`
3. Paste the ID into `.env` as `SPREADSHEET_ID`

### 4c — Share the Spreadsheet

1. Open the JSON key file — find the `client_email` field
2. Share your Google Spreadsheet with that email address (Editor role)

The backend will automatically create these tabs on first submission:

- **Demo Requests** — contact.html form submissions
- **Partnership** — partnership modal submissions
- **Careers** — careers.html applications

---

## Step 5 — Set Up systemd Service

Create `/etc/systemd/system/wastraq-api.service`:

```ini
[Unit]
Description=WASTRAQ FastAPI Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/wastraq-api
Environment="PATH=/var/www/wastraq-api/venv/bin"
ExecStart=/var/www/wastraq-api/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable wastraq-api
sudo systemctl start wastraq-api
sudo systemctl status wastraq-api    # Should show "active (running)"
```

---

## Step 6 — Nginx Reverse Proxy + HTTPS

Create `/etc/nginx/sites-available/wastraq-api`:

```nginx
server {
    listen 80;
    server_name api.wastraq.io;          # Use your actual API subdomain

    location / {
        proxy_pass         http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # CORS handled by FastAPI — do not set headers here
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/wastraq-api /etc/nginx/sites-enabled/
sudo nginx -t                          # Test config
sudo systemctl reload nginx

# Add HTTPS with Let's Encrypt (free SSL)
sudo certbot --nginx -d api.wastraq.io
```

---

## Step 7 — Update Frontend API URL

After deploying, update the API base URL in every HTML page.

**Find this line in every HTML file:**

```html
<script>
  window.WASTRAQ_API_BASE =
    "http://backend.wastraq.com"; /* change to production URL */
</script>
```

**Change to your production API URL:**

```html
<script>
  window.WASTRAQ_API_BASE = "https://api.wastraq.com";
</script>
```

**Also update the chatbot script tag:**

```html
<script
  data-api-base="https://api.wastraq.io"
  src="wastraq-chatbot.js"
></script>
```

---

## Step 8 — Verify Everything Works

```bash
# Test health endpoint
curl https://api.wastraq.io/api/health
# Expected: {"status":"ok","service":"WASTRAQ API"}

# Test demo form endpoint
curl -X POST https://api.wastraq.io/api/forms/demo \
  -H "Content-Type: application/json" \
  -d '{"fname":"Test","lname":"User","email":"test@example.com","fleet":"10-50"}'
# Expected: {"success":true,"message":"Form submitted successfully."}

# Test chatbot
curl -X POST https://api.wastraq.io/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"message":"What is WASTRAQ?"}'
# Expected: {"reply":"WASTRAQ is an intelligent...","buttons":[...],...}

# View API documentation
open https://api.wastraq.io/api/docs
```

---

## Optional — Enable OpenAI GPT Chatbot

For smarter AI-powered responses, add your OpenAI key to `.env`:

```env
OPENAI_API_KEY=sk-your-openai-api-key
```

Restart the service:

```bash
sudo systemctl restart wastraq-api
```

The chatbot automatically switches to GPT-3.5-turbo when the key is present.
If the OpenAI API fails, it falls back to the rule-based engine automatically.

---

## Monitoring & Logs

```bash
# View live logs
sudo journalctl -u wastraq-api -f

# View last 100 lines
sudo journalctl -u wastraq-api -n 100

# Check API status
sudo systemctl status wastraq-api
```

---

## Local Development

```bash
cd backend/
python3 -m venv venv
source venv/bin/activate         # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials

uvicorn main:app --reload --port 8000
# API runs at: http://backend.wastraq.com
# Docs at:     http://backend.wastraq.com/api/docs
```

---

## Support

Questions? Email: support@wastraq.io
