"""
WASTRAQ – utils/templates.py
Builds HTML email notifications for every form submission.
"""

from datetime import datetime
import html as _html_module


BRAND_GREEN = "#16a34a"
BRAND_DARK  = "#0a2016"
BRAND_LIGHT = "#f0fdf4"
FONT        = "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"


def _esc(value) -> str:
    if value is None or str(value).strip() == "":
        return "<em style='color:#aaa;'>&#8212;</em>"
    return _html_module.escape(str(value).strip())


def _ts() -> str:
    return datetime.utcnow().strftime("%d %b %Y, %H:%M UTC")


def _field(label: str, value) -> str:
    return (
        "<tr><td style='padding:8px 0;border-bottom:1px solid #f0fdf4;'>"
        "<span style='font-size:11px;font-weight:700;text-transform:uppercase;"
        "letter-spacing:.07em;color:#7c9177;'>{label}</span><br/>"
        "<span style='font-size:14px;color:#0d1f0b;font-weight:500;line-height:1.5;'>{value}</span>"
        "</td></tr>"
    ).format(label=_html_module.escape(label), value=_esc(value))


def _section(title: str) -> str:
    return (
        "<tr><td style='padding:16px 0 6px;'>"
        "<span style='font-size:15px;font-weight:800;color:{dark};letter-spacing:-.01em;'>{title}</span>"
        "</td></tr>"
    ).format(dark=BRAND_DARK, title=_html_module.escape(title))


def _shell(title: str, body: str) -> str:
    year = datetime.utcnow().year
    return (
        "<!DOCTYPE html><html lang='en'><head>"
        "<meta charset='UTF-8'/>"
        "<meta name='viewport' content='width=device-width,initial-scale=1'/>"
        "<title>{title}</title></head>"
        "<body style='margin:0;padding:0;background:#f4f7f4;font-family:{font};'>"
        "<table width='100%' cellpadding='0' cellspacing='0' role='presentation'>"
        "<tr><td align='center' style='padding:32px 16px;'>"
        "<table width='600' cellpadding='0' cellspacing='0' "
        "style='max-width:600px;width:100%;background:#fff;border-radius:16px;"
        "overflow:hidden;box-shadow:0 4px 24px rgba(10,32,22,.1);'>"
        "<tr><td style='background:{dark};padding:28px 36px;'>"
        "<span style='font-size:22px;font-weight:800;color:white;letter-spacing:-.02em;'>WASTRAQ</span>"
        "<span style='display:block;font-size:11px;color:rgba(255,255,255,.55);margin-top:4px;"
        "font-weight:500;letter-spacing:.08em;text-transform:uppercase;'>{title}</span>"
        "</td></tr>"
        "<tr><td style='padding:28px 36px;'>"
        "<table width='100%' cellpadding='0' cellspacing='0'>{body}</table>"
        "</td></tr>"
        "<tr><td style='background:{light};padding:18px 36px;border-top:1px solid #e2ead0;text-align:center;'>"
        "<p style='margin:0;font-size:12px;color:#7c9177;'>"
        "This notification was sent by the WASTRAQ website form system.<br/>"
        "&copy; {year} WASTRAQ &#8212; Developed by M Pro9 Pvt. Ltd."
        "</p></td></tr>"
        "</table></td></tr></table>"
        "</body></html>"
    ).format(
        title=_html_module.escape(title),
        font=FONT,
        dark=BRAND_DARK,
        light=BRAND_LIGHT,
        body=body,
        year=year,
    )


# ── DEMO REQUEST ──────────────────────────────────────────────

def build_demo_email(data: dict):
    fname = data.get("fname", "")
    lname = data.get("lname", "")
    org   = data.get("org", "")
    subject = "New Demo Request — {} {} ({})".format(fname, lname, org or "No org")
    body = (
        _section("Contact Details")
        + _field("Full Name",         "{} {}".format(fname, lname))
        + _field("Email Address",     data.get("email", ""))
        + _field("Phone Number",      data.get("phone", ""))
        + _field("Country",           data.get("country", ""))
        + _section("Organisation Details")
        + _field("Organisation",      org)
        + _field("Organisation Type", data.get("orgtype", ""))
        + _field("Website",           data.get("orgwebsite", ""))
        + _field("Fleet / Team Size", data.get("fleet", ""))
        + _section("Message")
        + _field("Message",           data.get("msg", ""))
        + "<tr><td style='padding-top:16px;'><span style='font-size:11px;color:#7c9177;'>Submitted: {}</span></td></tr>".format(_ts())
    )
    return subject, _shell("New Demo Request", body)


# ── PARTNER APPLICATION ───────────────────────────────────────

def build_partner_email(data: dict):
    form_type = (data.get("formType") or data.get("partnershipType") or "partner").lower().strip()
    name      = data.get("name", "")
    company   = data.get("company", "")
    type_labels = {
        "reseller": ("Reseller Partner Application",   "#16a34a"),
        "referrer": ("Referral Partner Application",   "#3b82f6"),
        "tech":     ("Technology Partner Application", "#8b5cf6"),
    }
    label, accent = type_labels.get(form_type, ("Partner Application", "#f59e0b"))
    subject = "New {} — {} ({})".format(label, name, company or "No company")
    badge = (
        "<span style='display:inline-block;margin-bottom:14px;padding:4px 12px;border-radius:100px;"
        "background:{a}22;border:1px solid {a}55;font-size:11px;font-weight:800;"
        "text-transform:uppercase;letter-spacing:.06em;color:{a};'>{l}</span>"
    ).format(a=accent, l=_html_module.escape(label))
    body = (
        "<tr><td style='padding-bottom:12px;'>" + badge + "</td></tr>"
        + _section("Applicant Details")
        + _field("Full Name",        name)
        + _field("Email",            data.get("email", ""))
        + _field("Phone",            data.get("phone", ""))
        + _field("Company",          company)
        + _field("City / Region",    data.get("city", ""))
        + _field("Partnership Type", form_type.capitalize())
        + _section("Message")
        + _field("Message",          data.get("message", ""))
        + "<tr><td style='padding-top:16px;'><span style='font-size:11px;color:#7c9177;'>Submitted: {}</span></td></tr>".format(_ts())
    )
    return subject, _shell(label, body)


# ── CAREERS APPLICATION ───────────────────────────────────────

def build_careers_email(data: dict):
    name     = data.get("name", "")
    position = data.get("position", "")
    subject  = "New Job Application — {} for {}".format(name, position)
    body = (
        _section("Applicant Details")
        + _field("Full Name",            name)
        + _field("Email",                data.get("email", ""))
        + _field("Phone",                data.get("phone", ""))
        + _field("Position Applied For", position)
        + _field("LinkedIn / Portfolio", data.get("linkedin", ""))
        + _section("Cover Note")
        + _field("Cover Note",           data.get("coverNote", ""))
        + "<tr><td style='padding-top:16px;'><span style='font-size:11px;color:#7c9177;'>Submitted: {}</span></td></tr>".format(_ts())
    )
    return subject, _shell("New Job Application", body)


# ── REGISTRATION ──────────────────────────────────────────────

def build_register_email(data: dict):
    fname   = data.get("fname", "")
    lname   = data.get("lname", "")
    subject = "New Registration — {} {}".format(fname, lname)
    body = (
        _section("New Account Registration")
        + _field("Full Name", "{} {}".format(fname, lname))
        + _field("Email",     data.get("email", ""))
        + _field("Phone",     data.get("phone", ""))
        + _field("Location",  data.get("location", ""))
        + "<tr><td style='padding-top:16px;'><span style='font-size:11px;color:#7c9177;'>Submitted: {}</span></td></tr>".format(_ts())
    )
    return subject, _shell("New Registration", body)


# ── LOGIN ACCESS REQUEST ──────────────────────────────────────

def build_login_interest_email(email: str):
    subject = "Login Access Request — {}".format(email)
    body = (
        _section("Login Access Request")
        + _field("Email Address", email)
        + "<tr><td style='padding-top:10px;'>"
        + "<p style='font-size:13px;color:#4b5e47;line-height:1.6;'>"
        + "A visitor attempted to sign in to the WASTRAQ platform. "
        + "Please follow up to set up their account access."
        + "</p></td></tr>"
        + "<tr><td style='padding-top:16px;'><span style='font-size:11px;color:#7c9177;'>Requested: {}</span></td></tr>".format(_ts())
    )
    return subject, _shell("Login Access Request", body)
