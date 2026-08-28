"""
WASTRAQ – limiter.py
─────────────────────
Shared slowapi Limiter instance. Kept in its own module (rather than
defined in main.py) so routers can import it without a circular import
between main.py <-> routers/*.py.

Applied to every public form endpoint in routers/forms.py to protect
against spam/abuse — these are unauthenticated, public POST endpoints
that write to Google Sheets and send email, so without a limit a bot
could flood the spreadsheet and mail quota in seconds.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
