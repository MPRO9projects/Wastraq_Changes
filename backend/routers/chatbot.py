"""
WASTRAQ – routers/chatbot.py
POST /api/chatbot/message

Rule-based chatbot engine with optional OpenAI GPT upgrade path.
Returns structured JSON responses the frontend widget renders.
"""

import os
import logging
import re
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

log = logging.getLogger(__name__)
router = APIRouter()


# ── Request / Response models ─────────────────────────────────────────────────

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply:    str
    type:     str = "text"       # text | buttons | link
    buttons:  list   = []
    link:     Optional[str] = None
    link_text:Optional[str] = None


# ══════════════════════════════════════════════════════════════
#  WASTRAQ KNOWLEDGE BASE
# ══════════════════════════════════════════════════════════════

KB = {
    # ── Products & platform ──────────────────────────────────
    "product|platform|feature|software|solution|what is wastraq|about wastraq": {
        "reply": (
            "WASTRAQ is an intelligent waste management SaaS platform used by municipal corporations, "
            "supervisors, and waste collection teams.\n\n"
            "Core modules include:\n"
            "• TraqCore™ — operations dashboard\n"
            "• RouteTraq™ — AI route optimisation\n"
            "• In-cab Driver App (iOS & Android)\n"
            "• Customer Self-Service Portal\n"
            "• Billing & Invoicing automation\n"
            "• Waste Insights & Analytics\n"
            "• IoT bin-sensor integration"
        ),
        "buttons": ["Schedule a Demo", "View Products", "Pricing Info"],
    },

    # ── Route optimisation ───────────────────────────────────
    "route|optimis|routetraq|fleet|gps|tracking": {
        "reply": (
            "RouteTraq™ is WASTRAQ's AI-powered route optimisation engine.\n\n"
            "It analyses your collection zones, vehicle capacity, road data, and IoT bin-fill levels "
            "to generate the most efficient routes.\n\n"
            "Most customers reduce fuel costs by 25–35% within the first month."
        ),
        "buttons": ["Book a Demo", "Learn More"],
    },

    # ── Pricing ──────────────────────────────────────────────
    "pric|cost|how much|plan|subscript|trial|free": {
        "reply": (
            "WASTRAQ pricing is tailored to your fleet size and operational needs — "
            "we don't believe in one-size-fits-all plans.\n\n"
            "To get an accurate quote, the best next step is a short discovery call with our team. "
            "We'll size a plan that fits your operation."
        ),
        "buttons": ["Request a Quote", "Schedule a Demo"],
        "link": "contact.html",
        "link_text": "Contact us",
    },

    # ── Demo ─────────────────────────────────────────────────
    "demo|book|schedule|meeting|call|consult": {
        "reply": (
            "A personalised WASTRAQ demo takes about 30 minutes and is completely free.\n\n"
            "During the demo we'll walk through the platform live, answer your specific questions, "
            "and size the right solution for your operation."
        ),
        "buttons": ["Book Demo Now"],
        "link": "contact.html",
        "link_text": "Fill out the demo request form →",
    },

    # ── Municipal / government ───────────────────────────────
    "municipal|council|government|city|urban|sanitation|public": {
        "reply": (
            "WASTRAQ is purpose-built for municipal corporations and local authorities.\n\n"
            "We support residential collection, commercial collection, compliance reporting, "
            "ward-level analytics, and full GDPR-compliant data exports."
        ),
        "buttons": ["Municipal Solutions", "Book a Demo"],
        "link": "solutions.html",
        "link_text": "View Municipal Solutions →",
    },

    # ── IoT / sensors ────────────────────────────────────────
    "iot|sensor|bin|smart bin|fill level|ultrasonic": {
        "reply": (
            "WASTRAQ integrates with all major IoT bin-level sensor providers.\n\n"
            "Fill-level data feeds directly into RouteTraq™ to trigger dynamic collection schedules — "
            "eliminating unnecessary trips to empty bins and preventing overflow incidents."
        ),
        "buttons": ["Learn More", "Book a Demo"],
    },

    # ── Partnership ──────────────────────────────────────────
    "partner|reseller|referr|tech partner|integrat|join": {
        "reply": (
            "The WASTRAQ Partner Network has three tiers:\n\n"
            "• Reseller — sell WASTRAQ directly, earn up to 30% recurring commission\n"
            "• Referral — refer leads, earn a flat referral fee per qualified introduction\n"
            "• Technology Partner — integrate your product with our open API\n\n"
            "Apply via our Partnership page."
        ),
        "buttons": ["Apply as Reseller", "Apply as Referrer", "Apply as Tech Partner"],
        "link": "partnership.html",
        "link_text": "View Partnership Options →",
    },

    # ── Careers ──────────────────────────────────────────────
    "career|job|hire|hiring|vacancy|work|team|join us|apply": {
        "reply": (
            "We're always looking for talented people to join the WASTRAQ team.\n\n"
            "Current open roles include Software Developer, Operations Manager, "
            "Field Supervisor, and more.\n\n"
            "Visit our Careers page to see all open positions and apply."
        ),
        "buttons": ["View Open Positions"],
        "link": "careers.html",
        "link_text": "Browse Careers →",
    },

    # ── Support / help ───────────────────────────────────────
    "support|help|issue|problem|trouble|bug|error|not work": {
        "reply": (
            "Our support team is here to help.\n\n"
            "• Help Center: browse 120+ articles and tutorials\n"
            "• Live Chat: Mon–Fri 8am–6pm GMT\n"
            "• Email: support@wastraq.io (response within 4 hours)\n\n"
            "What specific issue are you experiencing?"
        ),
        "buttons": ["Visit Help Center", "Contact Support"],
        "link": "help.html",
        "link_text": "Open Help Center →",
    },

    # ── API / Integration ────────────────────────────────────
    "api|integrat|erp|xero|quickbook|sap|webhook": {
        "reply": (
            "WASTRAQ offers a full REST API with OAuth 2.0 authentication.\n\n"
            "Native integrations include Xero, QuickBooks, SAP, and Oracle. "
            "For custom ERP connections, our open API handles all standard formats.\n\n"
            "Developer documentation is available at developer.wastraq.io"
        ),
        "buttons": ["API Documentation", "Contact Technical Team"],
    },

    # ── Security / data ──────────────────────────────────────
    "secur|gdpr|data|privacy|encrypt|complian": {
        "reply": (
            "WASTRAQ takes data security seriously.\n\n"
            "• AES-256 encryption at rest, TLS 1.3 in transit\n"
            "• SOC 2 Type II certified\n"
            "• ISO 27001 aligned\n"
            "• Full GDPR compliance\n"
            "• Annual third-party penetration testing"
        ),
        "buttons": ["View Privacy Policy", "View Data Privacy"],
        "link": "privacy-policy.html",
        "link_text": "Read Privacy Policy →",
    },

    # ── Onboarding / getting started ────────────────────────
    "onboard|start|setup|get start|how to begin|configur": {
        "reply": (
            "Getting started with WASTRAQ is fast.\n\n"
            "Most organisations are fully operational within 2–5 business days. "
            "Our onboarding team handles data migration, platform configuration, "
            "and hands-on training for your supervisors and drivers."
        ),
        "buttons": ["Book Onboarding Call", "Help Center"],
    },

    # ── Greetings ────────────────────────────────────────────
    "hello|hi |hey |morning|afternoon|good day|howdy": {
        "reply": (
            "Hello! 👋 I'm the WASTRAQ assistant.\n\n"
            "I can help you with information about our smart waste management platform, "
            "pricing, demos, partnerships, careers, and technical support.\n\n"
            "What can I help you with today?"
        ),
        "buttons": ["Products", "Book a Demo", "Pricing", "Support"],
    },

    # ── Thanks ───────────────────────────────────────────────
    "thank|thanks|great|perfect|awesome|helpful": {
        "reply": (
            "You're welcome! 😊 Is there anything else I can help you with?"
        ),
        "buttons": ["Book a Demo", "Visit Help Center", "Contact Team"],
    },

    # ── Default fallback ─────────────────────────────────────
    "__fallback__": {
        "reply": (
            "I'm not sure I have the right answer for that, but our team definitely does.\n\n"
            "Would you like to:\n"
            "• Book a 30-min demo call\n"
            "• Browse our Help Center\n"
            "• Contact our support team directly"
        ),
        "buttons": ["Book a Demo", "Help Center", "Contact Support"],
        "link": "contact.html",
        "link_text": "Get in touch →",
    },
}

# Button → URL mapping
BUTTON_LINKS = {
    "Schedule a Demo":        "contact.html",
    "Book Demo Now":          "contact.html",
    "Book a Demo":            "contact.html",
    "Book Onboarding Call":   "contact.html",
    "Request a Quote":        "contact.html",
    "Contact Support":        "contact.html",
    "Contact Technical Team": "contact.html",
    "Contact Team":           "contact.html",
    "View Products":          "products.html",
    "Learn More":             "products.html",
    "Municipal Solutions":    "solutions.html",
    "Apply as Reseller":      "partnership.html",
    "Apply as Referrer":      "partnership.html",
    "Apply as Tech Partner":  "partnership.html",
    "View Open Positions":    "careers.html",
    "Visit Help Center":      "help.html",
    "Help Center":            "help.html",
    "API Documentation":      "help-topic.html?topic=platform-setup#api-auth",
    "View Privacy Policy":    "privacy-policy.html",
    "View Data Privacy":      "data-privacy.html",
    "Pricing Info":           "contact.html",
}


def _match(message: str) -> dict:
    """Return the best matching KB entry for the user message."""
    msg = message.lower().strip()
    for pattern, response in KB.items():
        if pattern == "__fallback__":
            continue
        if any(re.search(k, msg) for k in pattern.split("|")):
            return response
    return KB["__fallback__"]


# ══════════════════════════════════════════════════════════════
#  ENDPOINT
# ══════════════════════════════════════════════════════════════

@router.post("/message", response_model=ChatResponse)
async def chat(body: ChatMessage):
    """
    Receives a user message, matches it to the knowledge base,
    and returns a structured reply with optional CTA buttons.

    Future upgrade: swap _match() for an OpenAI call when
    OPENAI_API_KEY is set in .env.
    """
    openai_key = os.getenv("OPENAI_API_KEY", "")

    if openai_key:
        # ── GPT upgrade path ────────────────────────────────
        try:
            import httpx
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {openai_key}"},
                    json={
                        "model": "gpt-3.5-turbo",
                        "messages": [
                            {
                                "role": "system",
                                "content": (
                                    "You are the WASTRAQ assistant — a helpful, professional chatbot "
                                    "for WASTRAQ, an intelligent waste management SaaS platform. "
                                    "Keep replies concise (max 120 words), clear, and focused on "
                                    "WASTRAQ products, services, pricing, onboarding, partnerships, "
                                    "and support. If asked about something outside WASTRAQ, "
                                    "politely redirect the user to contact the team."
                                ),
                            },
                            {"role": "user", "content": body.message},
                        ],
                        "max_tokens": 200,
                        "temperature": 0.4,
                    },
                )
                resp.raise_for_status()
                reply_text = resp.json()["choices"][0]["message"]["content"].strip()
                return ChatResponse(reply=reply_text, buttons=["Book a Demo", "Help Center"])
        except Exception as exc:
            log.warning("OpenAI call failed, falling back to rule engine: %s", exc)

    # ── Rule-based engine ───────────────────────────────────
    match = _match(body.message)
    return ChatResponse(
        reply     = match["reply"],
        buttons   = match.get("buttons", []),
        link      = match.get("link"),
        link_text = match.get("link_text"),
    )


@router.get("/buttons")
async def button_links():
    """Returns the button → URL mapping so the frontend can navigate correctly."""
    return BUTTON_LINKS
