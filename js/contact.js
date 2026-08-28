/* =====================================================================
   WASTRAQ — Contact Page (standalone bundle)
   All custom JS the Contact page needs: hero entrance settle, the demo
   request form submission, FAQ category filter + accordion, and the
   GSAP/ScrollTrigger entrance animations for the second section and FAQ.
   No navbar/footer injection, no shared.js — this page never renders
   a navbar or footer, and doesn't use any other shared.js helper (it
   doesn't use the .anim scroll-reveal or the .wq-counter animation that
   shared.js also provides — those aren't present on this page).
   ===================================================================== */

/* Settle the one-time hero entrance immediately if the visitor starts scrolling. */
(function initContactHero() {
  var hero = document.querySelector('.contact-hero');
  var description = document.querySelector('.contact-hero-description');
  if (!hero) return;

  var settleHero = function () {
    hero.classList.remove('contact-hero--animating');
    hero.classList.add('contact-hero--settled');
    window.removeEventListener('scroll', settleHero);
  };

  window.addEventListener('scroll', settleHero, { passive: true, once: true });
  if (description) description.addEventListener('animationend', settleHero, { once: true });
  if (window.scrollY > 0) settleHero();
})();

/* ── WASTRAQ FastAPI backend ──
   Public client-side endpoint only — no secrets. Override by setting
   window.WASTRAQ_API_BASE before this script runs, if ever needed. */
var WASTRAQ_API = (window.WASTRAQ_API_BASE || 'https://backend.wastraq.com');

function handleSubmit(e) {
  e.preventDefault();

  var btn = e.target.querySelector('button[type="submit"]');
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = 'Sending…';

  var data = {
    fname: document.getElementById('fname').value,
    lname: document.getElementById('lname').value,
    email: document.getElementById('email').value,
    phone: "'" + document.getElementById('phone').value,
    country: document.getElementById('country').value,
    org: document.getElementById('org').value,
    orgtype: document.getElementById('orgtype').value,
    orgwebsite: document.getElementById('orgwebsite').value,
    fleet: document.getElementById('fleet').value,
    msg: document.getElementById('msg').value
  };

  fetch(WASTRAQ_API + '/api/forms/demo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(function (res) {
      if (!res.ok) throw new Error('Server error ' + res.status);
      return res.json();
    })
    .then(function (json) {
      if (json.success) {
        var formState = document.getElementById('form-state');
        var successState = document.getElementById('success-state');
        if (formState) formState.style.display = 'none';
        if (successState) successState.style.display = 'block';
      } else {
        throw new Error(json.message || 'Submission failed');
      }
    })
    .catch(function (err) {
      btn.disabled = false;
      btn.textContent = 'Request My Personalised Demo →';
      alert('Something went wrong. Please try again or email us at info@wastraq.com');
      console.error('Demo form error:', err);
    });
}

/* ── FAQ accordion ─────────────────────────────────────── */
function toggleFaqAcc(btn) {
  var item = btn.closest('.faq-acc-item');
  var body = item.querySelector('.faq-acc-body');
  var inner = item.querySelector('.faq-acc-inner');
  var isOpen = item.classList.contains('faq-open');
  var allItems = document.querySelectorAll('.faq-acc-item');

  /* Close every open item except the one clicked */
  allItems.forEach(function (other) {
    if (other !== item && other.classList.contains('faq-open')) {
      _closeItem(other);
    }
  });

  /* Toggle the clicked item */
  if (isOpen) {
    _closeItem(item);
  } else {
    _openItem(item, body, inner, btn);
  }
}

/* ── Open an accordion item ─────────────────────────── */
function _openItem(item, body, inner, btn) {
  item.classList.add('faq-open');
  btn.setAttribute('aria-expanded', 'true');
  body.style.maxHeight = inner.scrollHeight + 'px';
}

/* ── Close an accordion item ────────────────────────── */
function _closeItem(item) {
  var body = item.querySelector('.faq-acc-body');
  var btn = item.querySelector('.faq-acc-btn');
  item.classList.remove('faq-open');
  btn.setAttribute('aria-expanded', 'false');
  body.style.maxHeight = '0';
}

/* ── Category filter ────────────────────────────────── */
function filterFaq(clickedBtn, category) {
  /* Update pill active state */
  var allPills = document.querySelectorAll('.faq-filter-btn');
  allPills.forEach(function (p) {
    p.classList.remove('faq-filter-active');
    p.setAttribute('aria-selected', 'false');
  });
  clickedBtn.classList.add('faq-filter-active');
  clickedBtn.setAttribute('aria-selected', 'true');

  /* Close all open items before filtering */
  document.querySelectorAll('.faq-acc-item.faq-open').forEach(function (item) {
    _closeItem(item);
  });

  /* Show / hide items by category */
  var allItems = document.querySelectorAll('.faq-acc-item');
  var visible = 0;

  allItems.forEach(function (item) {
    var cat = item.getAttribute('data-category');
    var show = (category === 'all' || cat === category);
    item.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  /* Toggle the no-results message */
  var noResults = document.getElementById('faq-no-results');
  if (noResults) {
    noResults.style.display = visible === 0 ? 'block' : 'none';
  }
}

/* ── Re-calculate max-height on window resize ────────── */
/* (handles the case where answer text reflows on resize) */
window.addEventListener('resize', function () {
  document.querySelectorAll('.faq-acc-item.faq-open').forEach(function (item) {
    var body = item.querySelector('.faq-acc-body');
    var inner = item.querySelector('.faq-acc-inner');
    if (body && inner) {
      body.style.maxHeight = inner.scrollHeight + 'px';
    }
  });
}, { passive: true });

/* ── GSAP & ScrollTrigger Animations for Second Section & FAQ ── */
(function () {
  if (typeof gsap === 'undefined') return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('.contact-sec-label, .contact-sec-title, .contact-sec-sub, .contact-form-card, .contact-info-card, .map-wrapper').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* Matches the .contact-grid single-column breakpoint (max-width:900px) —
     that's the point the sidebar cards stack full-width below the form, so
     it's also the point their entrance motion needs to switch away from
     sideways travel. */
  var isMobile = window.innerWidth <= 900;
  var labelOffset = isMobile ? 35 : 60;

  var secondSection = document.getElementById('contact-second-section');
  if (secondSection) {
    // ── SECOND SECTION ENTRANCE ANIMATION ────────
    var secTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#contact-second-section',
        start: 'top 80%'
      },
      defaults: { ease: 'power3.out' }
    });

    // STEP 1: Small label appears
    secTl.from('.contact-sec-label', { duration: 0.4, opacity: 0, y: -10 })

      // STEP 2: Headline enters from slight left/up (x: -60px, y: 15px, 0.6s-0.8s, power3.out)
      .from('.contact-sec-title', {
        duration: 0.75,
        opacity: 0,
        x: -labelOffset,
        y: 15
      }, '-=0.15')

      // STEP 3: Supporting paragraph fades upward
      .from('.contact-sec-sub', { duration: 0.55, opacity: 0, y: 20 }, '-=0.35')

      // STEP 4: Main form container enters (opacity: 0->1, y: 35px, scale: 0.985->1)
      .from('.contact-form-card', {
        duration: 0.65,
        opacity: 0,
        y: 35,
        scale: 0.985
      }, '-=0.25')

      // STEP 5: Right-side supporting cards enter with small stagger.
      // Desktop: side-to-side (x: 35px -> 45px -> 55px), matching the
      // approved entrance. Mobile: swapped for a small upward fade (y)
      // only — the sidebar stacks full-width below the form there, so any
      // sideways travel is more likely to touch the viewport edge, and per
      // the mobile motion guidance this should be opacity + y, not a
      // side-to-side move.
      .from('.contact-sidebar .contact-info-card, .contact-sidebar .map-wrapper', isMobile ? {
        duration: 0.5,
        opacity: 0,
        y: 20,
        stagger: 0.08
      } : {
        duration: 0.55,
        opacity: 0,
        x: function (index) { return 35 + (index * 10); },
        stagger: 0.09
      }, '-=0.45');
  }

  // FORM FIELD REVEAL (Logical groups inside form reveal with subtle stagger 0.04s-0.07s)
  if (document.querySelector('.contact-form-card')) {
    gsap.from('.wq-form .wq-form-row, .wq-form .wq-field, .wq-form button[type="submit"]', {
      scrollTrigger: {
        trigger: '.contact-form-card',
        start: 'top 75%'
      },
      duration: 0.4,
      opacity: 0,
      y: 15,
      stagger: 0.05,
      ease: 'power2.out'
    });
  }

  // ── FAQ SECTION REVEAL ─────────────────────────
  if (document.querySelector('.faq-upgraded-wrap')) {
    gsap.from('.faq-upgraded-wrap', {
      scrollTrigger: {
        trigger: '.faq-upgraded-wrap',
        start: 'top 82%'
      },
      duration: 0.6,
      opacity: 0,
      y: 30,
      ease: 'power2.out'
    });
  }
})();
