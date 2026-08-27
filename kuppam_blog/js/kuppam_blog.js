

// WASTRAQ Shared Navigation & Footer

function injectNav(activePage = '') {
  const nav = `
  <nav class="wq-nav" id="wq-nav">
    <div class="wq-nav-inner">
      <a href="index.html" class="wq-logo" id="wq-nav-logo">
        <img src="assets/image/KB4 favicon.png" alt="WASTRAQ Logo" class="wq-nav-logo-icon" />
        <span class="logo-text">WASTRAQ</span><span class="tm">™</span>
      </a>
      <ul class="wq-nav-links">
        <li class="has-dropdown ${activePage==='products'?'active':''}">
          <a href="products.html">Products <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></a>
          <div class="wq-dropdown">
            <a href="products.html#core">TraqCore™ – The Core Platform</a>
            <a href="products.html#residential">Residential Collection</a>
            <a href="products.html#commercial">Commercial Collection</a>
            <a href="products.html#skip">Skip & Bulk Hire</a>
            <a href="products.html#routeai">RouteTraq™ | Smart Routing</a>
            <a href="products.html#incab">In-Cab Navigation</a>
            <a href="products.html#crm">Customer Relationship Management</a>
            <a href="products.html#portal">Customer Portal</a>
            <a href="products.html#insights">Waste Insights & Analytics</a>
            <a href="products.html#integrations">Integrations</a>
          </div>
        </li>
        <li class="has-dropdown ${activePage==='solutions'?'active':''}">
          <a href="solutions.html">Solutions <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></a>
          <div class="wq-dropdown">
            <a href="solutions.html#municipal">Municipal Utilities</a>
            <a href="solutions.html#collectors">Waste Collectors</a>
            <a href="enterprise.html">Enterprise</a>
          </div>
        </li>
        <li class="${activePage==='partnership'?'active':''}"><a href="partnership.html">Partnership</a></li>
        <li class="has-dropdown ${activePage==='about'||activePage==='blog'?'active':''}">
          <a href="about.html">About <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></a>
          <div class="wq-dropdown">
            <a href="about.html">About Us</a>
            <a href="blog.html">Blog</a>
            <a href="contact.html">Contact</a>
          </div>
        </li>
      </ul>
      <div class="wq-nav-actions">
        <a href="login.html" class="wq-btn-ghost">Login</a>
        <a href="contact.html" class="wq-btn-primary">Schedule Demo</a>
      </div>
      <button class="wq-hamburger" onclick="toggleMobileNav()" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="wq-mobile-menu" id="wq-mobile-menu">
      <a href="index.html">Home</a>
      <a href="products.html">Products</a>
      <a href="solutions.html">Solutions</a>
      <a href="partnership.html">Partnership</a>
      <a href="about.html">About Us</a>
      <a href="contact.html">Contact</a>
      <a href="login.html">Login</a>
      <a href="contact.html" class="wq-btn-primary" style="margin-top:12px;display:block;text-align:center">Schedule Demo</a>
    </div>
  </nav>`;
  const navPlaceholder = document.getElementById('nav-placeholder');
  if (navPlaceholder) {
    navPlaceholder.innerHTML = nav;
  }
  // Scroll behavior
  window.addEventListener('scroll', () => {
    const n = document.getElementById('wq-nav');
    if (n) {
      if (window.scrollY > 40) n.classList.add('scrolled');
      else n.classList.remove('scrolled');
    }
  });
}

function toggleMobileNav() {
  const menu = document.getElementById('wq-mobile-menu');
  if (menu) menu.classList.toggle('open');
}

function injectFooter() {
  const footer = `
  <footer class="wq-footer">
    <div class="wq-footer-top">
      <div class="wq-footer-brand">
        <a href="index.html" class="wq-logo wq-logo-light">
          <img src="assets/image/KB4 favicon.png" alt="WASTRAQ Logo" class="wq-nav-logo-icon" />
          <span class="logo-text">WASTRAQ</span><span class="tm">™</span>
        </a>
        <p>Intelligent waste management software for smart, sustainable, and profitable operations worldwide.</p>
        <div class="wq-social">
          <a href="https://www.linkedin.com/company/wastraq/" target="_blank" aria-label="LinkedIn"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg></a>
          <a href="https://www.facebook.com/share/1cgPJo54ic/" target="_blank" aria-label="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></a>
          <a href="https://youtube.com/@wastraq?si=Kzb9-58Q3Zh1gxQT" target="_blank" aria-label="YouTube"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg></a>
          <a href="https://www.instagram.com/wastraq?igsh=MXE1eGdzeGI0bDE5Nw==" target="_blank" aria-label="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm0 2h10c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3zm5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.5-2.5a1 1 0 100 2 1 1 0 000-2z"/></svg></a>
        </div>
      </div>
      <div class="wq-footer-cols">
        <div class="wq-footer-col">
          <h4>Products</h4>
          <a href="products.html#core">TraqCore™ Platform</a>
          <a href="products.html#commercial">Commercial Collection</a>
          <a href="products.html#residential">Residential Collection</a>
          <a href="products.html#skip">Skip & Bulk Hire</a>
          <a href="products.html#crm">CRM</a>
          <a href="products.html#incab">In-Cab Navigation</a>
          <a href="products.html#portal">Customer Portal</a>
          <a href="products.html#insights">Waste Insights</a>
          <a href="products.html#integrations">Integrations</a>
        </div>
        <div class="wq-footer-col">
          <h4>Solutions</h4>
          <a href="solutions.html#municipal">Municipal Utilities</a>
          <a href="solutions.html#collectors">Waste Collectors</a>
          <h4 style="margin-top:24px">Partnership</h4>
          <a href="partnership.html">Become a Partner</a>
        </div>
        <div class="wq-footer-col">
          <h4>Company</h4>
          <a href="about.html">About Us</a>
          <a href="blog.html">Blog</a>
          <a href="contact.html">Contact Us</a>
          <a href="careers.html">Careers</a>
          <a href="help.html">Help Centre</a>
          <a href="terms-and-conditions.html">Terms of Service</a>
          <a href="data-privacy.html">Data Privacy Policy</a>
          <a href="cookies.html">Read Cookie Policy</a>
          <a href="#">Security Policy</a>
        </div>
      </div>
    </div>
    <div class="wq-footer-bottom">
      <span>© 2026 WASTRAQ – All rights reserved</span>
      <span>Developed by <strong><a href="https://www.mpro9.in/" target="_blank" rel="noopener noreferrer">M Pro9 Pvt. Ltd.</a></strong></span>
    </div>
  </footer>`;
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = footer;
  }
}

// Animate on scroll
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('anim-in');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.anim').forEach(el => observer.observe(el));
}

// Counter animation
function animateCounters() {
  const counters = document.querySelectorAll('.wq-counter');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target);
    const suffix = counter.dataset.suffix || '';
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      counter.textContent = Math.floor(current) + suffix;
    }, 24);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  // Counter trigger
  const statSection = document.querySelector('.wq-stats');
  if (statSection) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { animateCounters(); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(statSection);
  }
});


// === cookie-consent.js ===
(function () {
  const CONSENT_KEY = "wastraq_cookie_consent";
  const REJECT_TIME_KEY = "wastraq_cookie_rejected_at";
  const REJECT_DURATION = 24 * 60 * 60 * 1000; // 1 day

  function getConsent() {
    return localStorage.getItem(CONSENT_KEY);
  }

  function saveConsent(value) {
    localStorage.setItem(CONSENT_KEY, value);
  }

  function createCookieBanner() {

    const consent = getConsent();

    if (consent === "accepted") {
        return;
    }

    if (consent === "rejected") {

        const rejectedAt = localStorage.getItem(REJECT_TIME_KEY);

        if (
            rejectedAt &&
            (Date.now() - Number(rejectedAt)) < REJECT_DURATION
        ) {
            return;
        }

        // More than 1 day has passed
        localStorage.removeItem(CONSENT_KEY);
        localStorage.removeItem(REJECT_TIME_KEY);
    }

    const banner = document.createElement("div");
    banner.id = "wastraq-cookie-banner";

    banner.innerHTML = `
      <div class="wastraq-cookie-box">
        <div>
          <h3>We use cookies</h3>
          <p>
            WASTRAQ uses cookies to improve your browsing experience,
            remember your preferences, analyze website performance, and support
            better platform functionality.
            <a href="cookies.html">Read Cookie Policy</a>
          </p>
        </div>

        <div class="wastraq-cookie-actions">
          <button id="wastraq-reject-cookies" type="button">Reject</button>
          <button id="wastraq-accept-cookies" type="button">Accept</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);
    banner.style.display = "block";

    document
      .getElementById("wastraq-accept-cookies")
      .addEventListener("click", function () {
        saveConsent("accepted");
        banner.remove();
        loadTrackingScripts();

        /*
          Later, if you add Google Analytics, Meta Pixel,
          LinkedIn Pixel, etc., load them here only after accept.
        */
      });

    document
  .getElementById("wastraq-reject-cookies")
  .addEventListener("click", function () {

      saveConsent("rejected");

      localStorage.setItem(
          REJECT_TIME_KEY,
          Date.now()
      );

      banner.remove();

  });
  }

  document.addEventListener("DOMContentLoaded", createCookieBanner);
})();

// === curved-reveal.js ===
(() => {
  const section = document.querySelector('.wq-curved-reveal');
  if (!section) return;

  const card = section.querySelector('.wq-reveal-card');
  const mask = section.querySelector('#wq-curved-mask');
  const content = section.querySelector('.wq-reveal-content');
  if (!card || !mask) return;

  // Ordered curve keyframes the mask morphs through as the section scrolls.
  const keyframes = [
    `M 0 0 L 1000 0 L 1000 570 C 760 525 250 525 0 570 Z`, // start (fully open)
    `M 0 0 L 1000 0 L 1000 460 C 760 405 250 405 0 460 Z`,
    `M 0 0 L 1000 0 L 1000 335 C 760 275 250 275 0 335 Z`,
    `M 0 0 L 1000 0 L 1000 210 C 760 150 250 150 0 210 Z`,
    `M 0 0 L 1000 0 L 1000 75 C 760 20 250 20 0 75 Z`,
    `M 0 -100 L 1000 -100 L 1000 -60 C 760 -110 250 -110 0 -60 Z`, // final (fully covered)
  ];

  const keyframeNumbers = keyframes.map((path) => path.match(/-?[\d.]+/g).map(Number));
  const lastKeyframe = keyframes[keyframes.length - 1];

  function buildPath(template, numbers) {
    let index = 0;
    return template.replace(/-?[\d.]+/g, () => numbers[index++]);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  const clamp01 = (value) => Math.min(Math.max(value, 0), 1);

  // Maps local animation progress (0..1) across the keyframe chain to a path string.
  function pathForProgress(t) {
    const clamped = clamp01(t);
    const segmentCount = keyframeNumbers.length - 1;
    const scaled = clamped * segmentCount;
    let segmentIndex = Math.floor(scaled);
    if (segmentIndex >= segmentCount) segmentIndex = segmentCount - 1;
    const localT = easeInOutCubic(scaled - segmentIndex);

    const from = keyframeNumbers[segmentIndex];
    const to = keyframeNumbers[segmentIndex + 1];
    const current = from.map((value, i) => value + (to[i] - value) * localT);

    return buildPath(keyframes[segmentIndex], current);
  }

  // Scroll progress bands (tune boundaries as needed):
  // 0.00–0.68  curve animation plays immediately (forward on scroll down,
  //            reverse on scroll up) — the dark/green reveal starts the
  //            instant this scene is entered, no blank held-white settle
  //            beforehand, so the handoff from Smart Operations reads as one
  //            continuous motion instead of two separate blank stretches.
  // 0.00–0.18  heading fades/slides in concurrently with the curve animation
  //            (finishes well before the curve itself settles)
  // 0.68–0.85  completed state holds
  // 0.85–1.00  content eases out just before the next section takes over
  const HEADING_FADE_END = 0.18;
  const ANIM_END = 0.68;
  const HOLD_END = 0.85;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function applyFrame(progress) {
    let contentOpacity;
    let contentY;
    let maskPath;

    if (progress <= ANIM_END) {
      const maskT = progress / ANIM_END;
      maskPath = pathForProgress(maskT);
    } else {
      maskPath = lastKeyframe;
    }

    if (progress <= HEADING_FADE_END) {
      const t = HEADING_FADE_END === 0 ? 1 : progress / HEADING_FADE_END;
      contentOpacity = t;
      contentY = (1 - t) * 24;
    } else if (progress <= HOLD_END) {
      contentOpacity = 1;
      contentY = 0;
    } else {
      const t = (progress - HOLD_END) / (1 - HOLD_END);
      contentOpacity = 1 - t * 0.6;
      contentY = -t * 20;
    }

    mask.setAttribute('d', maskPath);
    if (content) {
      content.style.opacity = String(contentOpacity);
      content.style.transform = `translate(-50%, calc(-50% + ${contentY}px))`;
    }
  }

  if (prefersReducedMotion) {
    section.style.visibility = 'visible';
    card.style.visibility = 'visible';
    applyFrame(1);
    return;
  }

  let ticking = false;

  function update() {
    ticking = false;

    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const scrollableDistance = rect.height - viewportHeight;

    // This section's wrapper is pulled up with a negative margin (see
    // curved-reveal.css) so its pin engages the instant Smart Operations
    // releases, with no plain-scroll gap between them. But until the sticky
    // card actually engages (rect.top <= 0), it still renders at its normal
    // in-flow position — meaning as its wrapper approaches the viewport from
    // below, the card (a full 100dvh tall) gradually bleeds up over the previous
    // section's still-active content, well before the intended handoff point.
    // Keep it hidden until it's genuinely stuck, so Smart Operations' own
    // handoff curtain is what the user sees rising, not this card peeking in
    // early. Instant, not transitioned: at this exact moment the two already
    // look near-identical (Smart Operations' curtain vs. this card's initial
    // mostly-light mask), so there's nothing to visibly pop.
    const isStuck = rect.top <= 0;
    const visibility = isStuck ? 'visible' : 'hidden';
    section.style.visibility = visibility;
    card.style.visibility = visibility;

    // Skip work while the section is nowhere near the viewport.
    if (rect.bottom < -viewportHeight || rect.top > viewportHeight * 2) return;

    let progress;
    if (scrollableDistance <= 0) {
      progress = rect.top <= 0 ? 1 : 0;
    } else {
      // rect.top goes from +viewportHeight (section not yet reached) down to
      // -scrollableDistance (section fully scrolled through & about to unpin).
      progress = clamp01(-rect.top / scrollableDistance);
    }

    applyFrame(progress);
  }

  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });

  update();
})();


// === smart-operations.js ===
(() => {
  const section = document.getElementById('wq-smart-operations');
  if (!section) return;

  const modules = [
    { title: 'Workforce Management', short: 'Workforce Management', icon: 'fa-users', bullets: ['Staff records and role-based access for your whole team', 'Biometric attendance — no manual sign-in sheets', 'Simple shift and duty scheduling', 'Real-time visibility into staff activity'] },
    { title: 'Field Operations', short: 'Field Operations', icon: 'fa-route', bullets: ['Daily collection and route tracking', 'Field issue reporting and resolution', 'Task and work assignment management', 'Live status updates across every team'] },
    { title: 'Fleet Tracking', short: 'Fleet Tracking', icon: 'fa-truck-fast', bullets: ['Live GPS tracking for every vehicle', 'Real-time route and location visibility', 'Driver trip and task management', 'Distance and trip history at a glance'] },
    { title: 'Vendor Management', short: 'Vendor Management', icon: 'fa-handshake', bullets: ['One centralized vendor directory', 'Quick onboarding for new suppliers', 'Track vendor performance and history', 'Manage vendor documents in one place'] },
    { title: 'Weighbridge', short: 'Weighbridge', icon: 'fa-scale-balanced', bullets: ['Accurate gross and tare weight capture', 'Automatic weighment record creation', 'Vehicle entry and exit tracking', 'Fully digital records — no paperwork'] },
    { title: 'Material Recovery', short: 'Material Recovery', icon: 'fa-recycle', bullets: ['Waste segregation and classification', 'Track materials from collection to processing', 'Bailing and dispatch record-keeping', 'Full material traceability, end to end'] },
    { title: 'Inventory Control', short: 'Inventory Control', icon: 'fa-boxes-stacked', bullets: ['Real-time stock level visibility', 'Track every stock movement', 'Easy stock clearance and reconciliation', 'Never run short or overstock again'] },
    { title: 'Finance & Expenses', short: 'Finance & Expenses', icon: 'fa-coins', bullets: ['Simple expense tracking', 'Clear profit & loss visibility', 'Cost breakdown by site, vehicle, or operation', 'No more manual spreadsheets'] },
    { title: 'Compliance & Audit', short: 'Compliance & Audit', icon: 'fa-clipboard-check', bullets: ['Complete audit trail for every action', 'Ready-to-export compliance reports', 'Activity logs for full accountability', 'Always inspection-ready'] },
    { title: 'Analytics & Insights', short: 'Analytics & Insights', icon: 'fa-chart-line', bullets: ['Real-time dashboards across every module', 'Visual reports for faster decisions', 'Track performance across teams and sites', 'Data you can actually act on'] }
  ];

  const page = section.querySelector('.wq-smartops-page');
  const masterCircle = section.querySelector('.wq-smartops-circle');
  const iconCycle = section.querySelector('.wq-smartops-cycle');
  const arcLayer = section.querySelector('.wq-smartops-arc');
  const rightPanel = section.querySelector('.wq-smartops-right');
  const rightTitle = section.querySelector('.wq-smartops-right-title');
  const featureList = section.querySelector('.wq-smartops-feature-list');
  const rightInner = section.querySelector('.wq-smartops-right-inner');
  const header = section.querySelector('.wq-smartops-header');

  if (!page || !masterCircle || !iconCycle || !arcLayer || !rightPanel || !rightTitle || !featureList || !rightInner) return;

  // Handoff curtain — a sliver of the next section's dark/green background
  // that rises from the bottom during this section's own final stretch of
  // scroll, so Better Decisions is visibly already arriving before Smart
  // Operations finishes exiting (see applyProgress() below).
  const handoff = document.createElement('div');
  handoff.className = 'wq-smartops-handoff';
  handoff.setAttribute('aria-hidden', 'true');
  page.appendChild(handoff);

  const arcItems = [];
  const cycleIcons = [];
  let currentPosition = 0;
  let currentIndex = 0;

  modules.forEach((module) => {
    const item = document.createElement('div');
    item.className = 'wq-smartops-arc-item';

    const label = document.createElement('div');
    label.className = 'wq-smartops-arc-label';
    label.textContent = module.short;

    const dot = document.createElement('div');
    dot.className = 'wq-smartops-arc-dot';

    item.appendChild(label);
    item.appendChild(dot);
    arcLayer.appendChild(item);
    arcItems.push(item);
  });

  modules.forEach((module) => {
    const icon = document.createElement('div');
    icon.className = 'wq-smartops-cycle-icon';
    icon.innerHTML = `<i class="fa-solid ${module.icon}"></i>`;
    iconCycle.appendChild(icon);
    cycleIcons.push(icon);
  });

  // Bullet <li> elements are created once and reused across feature changes —
  // updating textContent in place avoids rebuilding the list (and the
  // flash/flicker that comes with it) every time the active module changes.
  const bulletCount = Math.max(...modules.map((module) => module.bullets.length));
  for (let i = 0; i < bulletCount; i++) {
    featureList.appendChild(document.createElement('li'));
  }
  const bulletEls = Array.from(featureList.children);

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getGeometry() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width <= 760) {
      return { radius: 390, centerX: -35, centerY: 290 };
    }

    const radius = Math.max(height * 0.76, width * 0.395);
    const rightEdge = width * 0.565; // nudged right for a better-balanced composition

    return { radius, centerX: rightEdge - radius, centerY: height * 0.5 };
  }

  function positionCircle() {
    const geo = getGeometry();
    const diameter = geo.radius * 2;

    masterCircle.style.width = `${diameter}px`;
    masterCircle.style.height = `${diameter}px`;
    masterCircle.style.left = `${geo.centerX - geo.radius}px`;
    masterCircle.style.top = `${geo.centerY - geo.radius}px`;
  }

  function drawArc() {
    const geo = getGeometry();
    const step = window.innerWidth <= 760 ? 10.5 : 8.7;

    arcItems.forEach((item, index) => {
      let offset = index - currentPosition;
      const half = modules.length / 2;

      while (offset > half) offset -= modules.length;
      while (offset < -half) offset += modules.length;

      const angle = offset * step;
      const radians = (angle * Math.PI) / 180;
      const x = geo.centerX + Math.cos(radians) * geo.radius;
      const y = geo.centerY + Math.sin(radians) * geo.radius;

      item.style.left = `${x}px`;
      item.style.top = `${y}px`;

      const distance = Math.abs(offset);
      let opacity = 1;
      if (distance > 4.8) opacity = 0;
      else if (distance > 4) opacity = 0.14;
      else if (distance > 3) opacity = 0.29;
      else if (distance > 2) opacity = 0.47;
      else if (distance > 1) opacity = 0.7;
      item.style.opacity = opacity;

      const scale = 1 - Math.min(distance * 0.014, 0.055);
      item.style.transform = `translate(-100%, -50%) scale(${scale})`;
    });
  }

  function drawIconCycle() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    let centerX;
    let centerY;
    let radius;

    if (width <= 760) {
      centerX = width * 0.34;
      centerY = 290;
      radius = 108;
    } else {
      centerX = width * 0.225; // nudged right alongside the arc
      radius = Math.min(width * 0.12, height * 0.19);
      // Keep the ring vertically centered, but never let it climb high enough
      // to collide with the heading/description above it.
      centerY = Math.max(height * 0.5, headerClearanceY + radius);
    }

    cycleIcons.forEach((icon, index) => {
      let offset = index - currentPosition;
      const half = modules.length / 2;

      while (offset > half) offset -= modules.length;
      while (offset < -half) offset += modules.length;

      const angle = -90 + offset * (360 / modules.length);
      const radians = (angle * Math.PI) / 180;
      const x = centerX + Math.cos(radians) * radius;
      const y = centerY + Math.sin(radians) * radius;

      icon.style.left = `${x}px`;
      icon.style.top = `${y}px`;

      const distance = Math.abs(offset);
      const scale = 1 - Math.min(distance * 0.036, 0.15);
      icon.style.transform = `translate(-50%, -50%) scale(${scale})`;
      // Higher floor than before — inactive icons stay clearly recognizable
      // instead of fading into the background.
      icon.style.opacity = Math.max(0.68, 1 - distance * 0.065);
    });
  }

  function setActive() {
    arcItems.forEach((item, index) => item.classList.toggle('active', index === currentIndex));
    cycleIcons.forEach((icon, index) => icon.classList.toggle('active', index === currentIndex));
  }

  function setContent(index) {
    const module = modules[index];
    rightTitle.textContent = module.title;
    bulletEls.forEach((li, i) => {
      const bullet = module.bullets[i];
      li.textContent = bullet || '';
      li.style.display = bullet ? '' : 'none';
    });
  }

  // Feature changes bloom in: hide (translateY down + scale down + fade),
  // swap the now-invisible text, then let the CSS transition settle it back
  // up into place — "bloom from below → fade in → move up → settle".
  const CONTENT_SWITCH_MS = 260;
  let lastContentIndex = -1;
  let contentSwitchTimer = null;

  function updateContentForIndex(index) {
    if (index === lastContentIndex) return;
    lastContentIndex = index;

    rightInner.classList.add('switching');
    if (contentSwitchTimer) clearTimeout(contentSwitchTimer);
    contentSwitchTimer = setTimeout(() => {
      setContent(index);
      rightInner.classList.remove('switching');
    }, CONTENT_SWITCH_MS);
  }

  let headerClearanceY = 0;

  function updateHeaderClearance() {
    if (!header) {
      headerClearanceY = 0;
      return;
    }
    const rect = header.getBoundingClientRect();
    headerClearanceY = rect.bottom + 32;
  }

  function layout() {
    updateHeaderClearance();
    positionCircle();
  }

  // --- Continuous scroll-driven progress --------------------------------
  // The whole experience (entry, all 10 features, exit) is one continuous
  // function of scroll position — no discrete per-feature scroll steps, no
  // wheel interception. This is what compresses ~10 stops down to roughly
  // 3 natural scroll gestures: the section is short enough that a normal
  // scroll session glides straight through it, exactly like the curved-reveal
  // section right after it.
  const ARC_IN_END = 0.05; // circle + arc fade/settle in
  const CONTENT_IN_END = 0.1; // icons + right panel fade in
  const EXIT_START = 0.95; // composition fades out as the handoff to the next section begins
  const HANDOFF_START = 0.8; // the next section's dark curtain starts rising well before that fade
  // Roughly matches the curved-reveal section's own initial curve reveal
  // (~7-10% of viewport height), so the curtain's top state and the real
  // section's starting mask line up without a visible jump at the handoff.
  const HANDOFF_MAX_RATIO = 0.09;

  function applyProgress(progress) {
    // Header height/position only affects layout while the scene is actually
    // pinned in the viewport — measuring it once at page load (when the
    // section is still far off-screen) gives a bogus value that never
    // recovers, so refresh it every frame here instead of only on resize.
    updateHeaderClearance();

    let structuralOpacity;
    let contentOpacity;

    if (progress <= ARC_IN_END) {
      structuralOpacity = ARC_IN_END === 0 ? 1 : progress / ARC_IN_END;
      contentOpacity = 0;
    } else if (progress <= CONTENT_IN_END) {
      structuralOpacity = 1;
      contentOpacity = (progress - ARC_IN_END) / (CONTENT_IN_END - ARC_IN_END);
    } else if (progress <= EXIT_START) {
      structuralOpacity = 1;
      contentOpacity = 1;
    } else {
      const t = (progress - EXIT_START) / (1 - EXIT_START);
      structuralOpacity = 1 - t;
      contentOpacity = 1 - t;
    }

    masterCircle.style.opacity = String(structuralOpacity);
    masterCircle.style.transform = `translateY(${(1 - structuralOpacity) * -48}px) scale(${0.94 + structuralOpacity * 0.06})`;
    arcLayer.style.opacity = String(structuralOpacity);
    iconCycle.style.opacity = String(contentOpacity);
    rightPanel.style.opacity = String(contentOpacity);

    const handoffT = clamp((progress - HANDOFF_START) / (1 - HANDOFF_START), 0, 1);
    handoff.style.height = `${handoffT * window.innerHeight * HANDOFF_MAX_RATIO}px`;

    const scrubT = clamp((progress - CONTENT_IN_END) / (EXIT_START - CONTENT_IN_END), 0, 1);
    currentPosition = scrubT * (modules.length - 1);
    currentIndex = clamp(Math.round(currentPosition), 0, modules.length - 1);

    drawArc();
    drawIconCycle();
    setActive();
    updateContentForIndex(currentIndex);
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    layout();
    masterCircle.style.opacity = '1';
    masterCircle.style.transform = 'translateY(0) scale(1)';
    arcLayer.style.opacity = '1';
    iconCycle.style.opacity = '1';
    rightPanel.style.opacity = '1';
    handoff.style.height = '0px';
    drawArc();
    drawIconCycle();
    setActive();
    setContent(0);
    lastContentIndex = 0;
    return;
  }

  let ticking = false;

  function update() {
    ticking = false;

    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const scrollableDistance = rect.height - viewportHeight;

    // Skip work while the section is nowhere near the viewport.
    if (rect.bottom < -viewportHeight || rect.top > viewportHeight * 2) return;

    let progress;
    if (scrollableDistance <= 0) {
      progress = rect.top <= 0 ? 1 : 0;
    } else {
      progress = clamp(-rect.top / scrollableDistance, 0, 1);
    }

    applyProgress(progress);
  }

  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function onResize() {
    layout();
    onScrollOrResize();
  }

  // Keyboard accessibility: nudge one feature-step at a time via native
  // smooth scrolling rather than intercepting/animating manually.
  function featureStepPx() {
    const total = Math.max(section.offsetHeight - window.innerHeight, 1);
    const scrubRange = total * (EXIT_START - CONTENT_IN_END);
    return scrubRange / Math.max(modules.length - 1, 1);
  }

  section.addEventListener('keydown', (event) => {
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      window.scrollBy({ top: featureStepPx(), behavior: 'smooth' });
    }
    if (['ArrowLeft', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      window.scrollBy({ top: -featureStepPx(), behavior: 'smooth' });
    }
  });

  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScrollOrResize, { passive: true });

  layout();
  update();
})();


// === smart-story.js ===
(() => {
  const section = document.getElementById('wq-smart-story');
  if (!section) return;

  const revealEls = section.querySelectorAll('.wq-story-reveal');
  const storyBlocks = section.querySelectorAll('.wq-story-block');
  const storyLineFill = section.querySelector('#wq-story-line-fill');
  const story = section.querySelector('.wq-smart-story-track');

  if (!story || !storyLineFill) return;

  revealEls.forEach((element) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.disconnect();
        }
      });
    }, { threshold: 0.14 });

    observer.observe(element);
  });

  let lastScrollY = window.scrollY;
  let scrollDirection = 'down';

  function updateDirection() {
    const currentY = window.scrollY;
    scrollDirection = currentY > lastScrollY ? 'down' : 'up';
    lastScrollY = currentY;
  }

  function updateStoryLine() {
    const rect = story.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const start = viewportHeight * 0.72;
    const end = -rect.height + viewportHeight * 0.32;
    let progress = (start - rect.top) / (start - end);
    progress = Math.max(0, Math.min(1, progress));
    storyLineFill.style.height = `${progress * 100}%`;
  }

  const storyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const block = entry.target;

      if (entry.isIntersecting) {
        block.classList.remove('scroll-down', 'scroll-up');
        block.classList.add('active');
      } else {
        block.classList.remove('active');
        if (scrollDirection === 'down') {
          block.classList.remove('scroll-up');
          block.classList.add('scroll-down');
        } else {
          block.classList.remove('scroll-down');
          block.classList.add('scroll-up');
        }
      }
    });
  }, { rootMargin: '-16% 0px -16% 0px', threshold: 0.18 });

  storyBlocks.forEach((block) => storyObserver.observe(block));

  window.addEventListener('scroll', () => {
    updateDirection();
    updateStoryLine();
  }, { passive: true });

  updateStoryLine();

  const workflowCards = section.querySelectorAll('.wq-workflow-card');
  let workflowIndex = 0;

  function highlightWorkflow() {
    workflowCards.forEach((card) => card.classList.remove('active-step'));
    if (workflowCards[workflowIndex]) {
      workflowCards[workflowIndex].classList.add('active-step');
      workflowIndex = (workflowIndex + 1) % workflowCards.length;
    }
  }

  const workflowTimer = setInterval(highlightWorkflow, 1250);

  if (workflowTimer) {
    section.addEventListener('mouseleave', () => highlightWorkflow());
  }
})();


// === wastraq-chatbot.js ===
/**
 * WASTRAQ Smart Chatbot Widget
 * ─────────────────────────────
 * Drop-in floating chat assistant. Zero dependencies.
 * Integrates with FastAPI backend at /api/chatbot/message.
 *
 * Usage: add  <script src="wastraq-chatbot.js"></script>  before </body>
 * or call  initWastraqChat({ apiBase: '...' })  manually.
 */

(function (global) {
  'use strict';

  /* ── Configuration defaults ─────────────────────────────── */
  var DEFAULT_CONFIG = {
    apiBase:       'https://backend.wastraq.com',   
    position:      'bottom-right',
    accentColor:   '#16a34a',
    darkColor:     '#0a2016',
    lightBg:       '#f0fdf4',
    borderColor:   '#e2ead0',
    fontFamily:    "'Plus Jakarta Sans', Helvetica Neue, Arial, sans-serif",
    greeting:      "Hello! 👋 I'm the WASTRAQ assistant. How can I help you today?",
    placeholder:   "Ask about products, pricing, demos…",
    botName:       'WASTRAQ Assistant',
    openDelay:     0,          // ms before auto-open (0 = don't auto-open)
  };

  /* ── Internal state ─────────────────────────────────────── */
  var cfg        = {};
  var isOpen     = false;
  var isTyping   = false;
  var buttonLinks = {};
  var initialized = false;

  /* ══════════════════════════════════════════════════════════
     STYLES (injected once into <head>)
  ══════════════════════════════════════════════════════════ */
  function injectStyles() {
    if (document.getElementById('wq-chat-styles')) return;
    var style = document.createElement('style');
    style.id  = 'wq-chat-styles';
    style.textContent = [
      /* ── Launcher button ── */
      '.wq-chat-launcher{',
        'position:fixed;bottom:24px;right:24px;z-index:9998;',
        'width:56px;height:56px;border-radius:50%;',
        'background:linear-gradient(90deg, #6FBB59 0%, #159D91 45%, #0750AD 100%) !important;',
        'border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;',
        'box-shadow:0 4px 20px rgba(21,157,145,.4);',
        'transition:transform .2s,box-shadow .2s;',
        'outline:none;',
      '}',
      '.wq-chat-launcher:hover{transform:scale(1.06);box-shadow:0 6px 28px rgba(7,80,173,.5);}',
      '.wq-chat-launcher:focus-visible{outline:3px solid #22c55e;outline-offset:3px;}',
      '.wq-chat-launcher svg{transition:transform .3s;}',
      '.wq-chat-launcher.open svg.icon-chat{display:none}',
      '.wq-chat-launcher.open svg.icon-close{display:block!important}',
      '.wq-chat-launcher svg.icon-close{display:none}',

      /* Notification dot */
      '.wq-chat-dot{',
        'position:absolute;top:3px;right:3px;width:11px;height:11px;',
        'border-radius:50%;background:#f59e0b;',
        'border:2px solid #fff;',
        'animation:wqPulse 2s ease infinite;',
      '}',
      '@keyframes wqPulse{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.4)}50%{box-shadow:0 0 0 5px rgba(245,158,11,0)}}',

      /* ── Widget window ── */
      '.wq-chat-window{',
        'position:fixed;bottom:90px;right:24px;z-index:9999;',
        'width:360px;max-width:calc(100vw - 32px);',
        'height:520px;max-height:calc(100vh - 120px);',
        'background:#fff;border-radius:18px;',
        'box-shadow:0 16px 56px rgba(10,32,22,.18),0 2px 8px rgba(10,32,22,.1);',
        'display:flex;flex-direction:column;overflow:hidden;',
        'transform:translateY(16px) scale(.96);opacity:0;pointer-events:none;',
        'transition:transform .3s cubic-bezier(.22,.68,0,1.2),opacity .25s ease;',
      '}',
      '.wq-chat-window.visible{transform:translateY(0) scale(1);opacity:1;pointer-events:all;}',

      /* ── Header ── */
      '.wq-chat-header{',
        'background:linear-gradient(135deg,#0a2016,#14502e);',
        'padding:16px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0;',
      '}',
      '.wq-chat-header-avatar{',
        'width:38px;height:38px;border-radius:50%;',
        'background:rgba(34,197,94,.18);border:2px solid rgba(34,197,94,.35);',
        'display:flex;align-items:center;justify-content:center;flex-shrink:0;',
      '}',
      '.wq-chat-header-info{flex:1;min-width:0;}',
      '.wq-chat-header-name{font-size:.9rem;font-weight:800;color:#fff;line-height:1.2;}',
      '.wq-chat-header-status{font-size:.72rem;color:rgba(255,255,255,.6);display:flex;align-items:center;gap:5px;margin-top:2px;}',
      '.wq-chat-status-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;flex-shrink:0;}',
      '.wq-chat-close-btn{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.6);padding:4px;border-radius:6px;display:flex;align-items:center;transition:color .15s;}',
      '.wq-chat-close-btn:hover{color:#fff;}',

      /* ── Messages ── */
      '.wq-chat-messages{',
        'flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;',
        'scroll-behavior:smooth;',
      '}',
      '.wq-chat-messages::-webkit-scrollbar{width:4px;}',
      '.wq-chat-messages::-webkit-scrollbar-track{background:transparent;}',
      '.wq-chat-messages::-webkit-scrollbar-thumb{background:#e2ead0;border-radius:4px;}',

      /* Bubble rows */
      '.wq-msg{display:flex;gap:8px;align-items:flex-end;max-width:88%;}',
      '.wq-msg.bot{align-self:flex-start;}',
      '.wq-msg.user{align-self:flex-end;flex-direction:row-reverse;}',

      /* Bubble */
      '.wq-bubble{',
        'padding:10px 13px;border-radius:14px;font-size:.875rem;line-height:1.6;word-break:break-word;white-space:pre-wrap;',
      '}',
      '.wq-msg.bot .wq-bubble{background:#f0fdf4;color:#0d1f0b;border-bottom-left-radius:4px;}',
      '.wq-msg.user .wq-bubble{background:#16a34a;color:#fff;border-bottom-right-radius:4px;}',

      /* Bot avatar in message */
      '.wq-msg-avatar{',
        '<img src="assets/image/KB13 wastraq_logo.png" alt="WASTRAQ" height="40" width="80" style="display:block;">',
      '}',

      /* Typing indicator */
      '.wq-typing{display:flex;align-items:center;gap:4px;padding:10px 13px;background:#f0fdf4;border-radius:14px;border-bottom-left-radius:4px;}',
      '.wq-typing span{width:7px;height:7px;border-radius:50%;background:#7c9177;animation:wqDot 1.2s ease infinite;}',
      '.wq-typing span:nth-child(2){animation-delay:.2s;}',
      '.wq-typing span:nth-child(3){animation-delay:.4s;}',
      '@keyframes wqDot{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}',

      /* ── Buttons strip ── */
      '.wq-chat-buttons{',
        'padding:4px 16px 10px;display:flex;flex-wrap:wrap;gap:6px;',
      '}',
      '.wq-chat-btn{',
        'display:inline-flex;align-items:center;gap:5px;',
        'padding:6px 12px;border-radius:100px;border:1.5px solid #e2ead0;',
        'background:#fff;color:#14502e;font-size:.77rem;font-weight:700;',
        'cursor:pointer;transition:all .15s;font-family:inherit;white-space:nowrap;',
      '}',
      '.wq-chat-btn:hover{background:#f0fdf4;border-color:#22c55e;color:#14502e;}',

      /* ── Link chip ── */
      '.wq-chat-link-chip{',
        'margin:4px 16px 8px;padding:8px 12px;',
        'background:#f0fdf4;border:1px solid #dcfce7;border-radius:8px;',
        'display:flex;align-items:center;gap:7px;text-decoration:none;',
        'font-size:.78rem;font-weight:700;color:#14502e;',
        'transition:background .18s;',
      '}',
      '.wq-chat-link-chip:hover{background:#dcfce7;}',

      /* ── Input bar ── */
      '.wq-chat-input-bar{',
        'padding:10px 12px;border-top:1px solid #e2ead0;display:flex;gap:8px;align-items:flex-end;flex-shrink:0;',
      '}',
      '.wq-chat-input{',
        'flex:1;resize:none;border:1.5px solid #e2ead0;border-radius:10px;',
        'padding:9px 12px;font-family:inherit;font-size:.88rem;color:#0d1f0b;',
        'background:#f8faf7;outline:none;line-height:1.5;max-height:100px;',
        'transition:border-color .18s,box-shadow .18s;',
      '}',
      '.wq-chat-input:focus{border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,.12);background:#fff;}',
      '.wq-chat-send{',
        'width:38px;height:38px;border-radius:10px;background:linear-gradient(90deg, #6FBB59 0%, #159D91 45%, #0750AD 100%) !important;',
        'border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;',
        'flex-shrink:0;transition:transform .12s,filter .18s;',
      '}',
      '.wq-chat-send:hover{filter:brightness(1.1);transform:scale(1.04);}',
      '.wq-chat-send:disabled{opacity:.5;cursor:not-allowed;transform:none;}',

      /* ── Powered-by strip ── */
      '.wq-chat-powered{',
        'padding:6px 12px;text-align:center;font-size:.68rem;color:#7c9177;border-top:1px solid #f0fdf4;flex-shrink:0;',
      '}',

      /* ── Mobile overrides ── */
      '@media(max-width:480px){',
        '.wq-chat-window{right:12px;bottom:80px;width:calc(100vw - 24px);height:calc(100vh - 100px);}',
        '.wq-chat-launcher{bottom:16px;right:16px;}',
      '}',
    ].join('');
    document.head.appendChild(style);
  }

  /* ══════════════════════════════════════════════════════════
     DOM BUILDER
  ══════════════════════════════════════════════════════════ */
  function buildWidget() {
    /* ── Launcher button ── */
    var launcher = document.createElement('button');
    launcher.className  = 'wq-chat-launcher';
    launcher.id         = 'wq-chat-launcher';
    launcher.setAttribute('aria-label', 'Open WASTRAQ chat assistant');
    launcher.setAttribute('aria-haspopup', 'dialog');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.innerHTML  = [
      '<svg class="icon-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
        '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
      '</svg>',
      '<svg class="icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
        '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
      '</svg>',
      '<span class="wq-chat-dot" id="wq-chat-dot" aria-hidden="true"></span>',
    ].join('');
    launcher.addEventListener('click', toggleChat);

    /* ── Widget window ── */
    var win = document.createElement('div');
    win.className = 'wq-chat-window';
    win.id        = 'wq-chat-window';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', 'WASTRAQ chat assistant');
    win.setAttribute('aria-modal', 'false');

    /* Header */
    var header = document.createElement('div');
    header.className = 'wq-chat-header';
    header.innerHTML = [
      '<div class="wq-chat-header-avatar" aria-hidden="true">',
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
          '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
        '</svg>',
      '</div>',
      '<div class="wq-chat-header-info">',
        '<div class="wq-chat-header-name">', cfg.botName, '</div>',
        '<div class="wq-chat-header-status">',
          '<span class="wq-chat-status-dot" aria-hidden="true"></span>',
          'Online — usually replies instantly',
        '</div>',
      '</div>',
      '<button class="wq-chat-close-btn" id="wq-chat-close-btn" aria-label="Close chat" onclick="document.getElementById(\'wq-chat-launcher\').click()">',
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
          '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
        '</svg>',
      '</button>',
    ].join('');

    /* Messages area */
    var msgs = document.createElement('div');
    msgs.className  = 'wq-chat-messages';
    msgs.id         = 'wq-chat-messages';
    msgs.setAttribute('role', 'log');
    msgs.setAttribute('aria-live', 'polite');
    msgs.setAttribute('aria-label', 'Chat messages');

    /* Input bar */
    var inputBar = document.createElement('div');
    inputBar.className = 'wq-chat-input-bar';
    inputBar.innerHTML = [
      '<textarea class="wq-chat-input" id="wq-chat-input"',
        ' placeholder="', cfg.placeholder, '"',
        ' rows="1"',
        ' aria-label="Type your message"',
        ' aria-multiline="true"',
      '></textarea>',
      '<button class="wq-chat-send" id="wq-chat-send" aria-label="Send message">',
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
          '<line x1="22" y1="2" x2="11" y2="13"/>',
          '<polygon points="22 2 15 22 11 13 2 9 22 2"/>',
        '</svg>',
      '</button>',
    ].join('');

    /* Powered-by */
    var powered = document.createElement('div');
    powered.className   = 'wq-chat-powered';
    powered.textContent = 'Powered by WASTRAQ';

    win.appendChild(header);
    win.appendChild(msgs);
    win.appendChild(powered);
    win.appendChild(inputBar);

    document.body.appendChild(launcher);
    document.body.appendChild(win);

    /* Wire up input events */
    var input    = document.getElementById('wq-chat-input');
    var sendBtn  = document.getElementById('wq-chat-send');

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage();
      }
    });
    input.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
    sendBtn.addEventListener('click', sendUserMessage);

    /* Show greeting after short delay */
    setTimeout(function () {
      appendBotMessage(cfg.greeting, ['Products', 'Book a Demo', 'Pricing', 'Support']);
      /* Remove notification dot once opened */
    }, 600);
  }

  /* ══════════════════════════════════════════════════════════
     CHAT LOGIC
  ══════════════════════════════════════════════════════════ */

  function toggleChat() {
    isOpen = !isOpen;
    var win      = document.getElementById('wq-chat-window');
    var launcher = document.getElementById('wq-chat-launcher');
    var dot      = document.getElementById('wq-chat-dot');
    if (isOpen) {
      win.classList.add('visible');
      launcher.classList.add('open');
      launcher.setAttribute('aria-expanded', 'true');
      if (dot) dot.style.display = 'none';
      var input = document.getElementById('wq-chat-input');
      if (input) setTimeout(function () { input.focus(); }, 300);
    } else {
      win.classList.remove('visible');
      launcher.classList.remove('open');
      launcher.setAttribute('aria-expanded', 'false');
    }
  }

  function appendBotMessage(text, buttons, link, linkText) {
    var msgs = document.getElementById('wq-chat-messages');
    if (!msgs) return;

    var row = document.createElement('div');
    row.className = 'wq-msg bot';
    row.innerHTML = [
      '<div class="wq-msg-avatar" aria-hidden="true">',
        '<img src="assets/image/KB13 wastraq_logo.png" alt="WASTRAQ" height="40" width="80" style="display:block;">',
      '</div>',
      '<div class="wq-bubble">', escHtml(text), '</div>',
    ].join('');
    msgs.appendChild(row);

    /* Buttons */
    if (buttons && buttons.length) {
      var btnRow = document.createElement('div');
      btnRow.className = 'wq-chat-buttons';
      buttons.forEach(function (label) {
        var btn = document.createElement('button');
        btn.className   = 'wq-chat-btn';
        btn.textContent = label;
        btn.addEventListener('click', function () {
          var url = buttonLinks[label];
          if (url) {
            window.location.href = url;
          } else {
            sendAsUser(label);
          }
        });
        btnRow.appendChild(btn);
      });
      msgs.appendChild(btnRow);
    }

    /* Link chip */
    if (link && linkText) {
      var chip = document.createElement('a');
      chip.className   = 'wq-chat-link-chip';
      chip.href        = link;
      chip.innerHTML   = [
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
          '<path d="M5 12h14M12 5l7 7-7 7"/>',
        '</svg>',
        escHtml(linkText),
      ].join('');
      msgs.appendChild(chip);
    }

    scrollBottom(msgs);
  }

  function appendUserMessage(text) {
    var msgs = document.getElementById('wq-chat-messages');
    if (!msgs) return;
    var row = document.createElement('div');
    row.className = 'wq-msg user';
    row.innerHTML = '<div class="wq-bubble">' + escHtml(text) + '</div>';
    msgs.appendChild(row);
    scrollBottom(msgs);
  }

  function showTyping() {
    var msgs = document.getElementById('wq-chat-messages');
    if (!msgs) return;
    var el = document.createElement('div');
    el.className = 'wq-msg bot';
    el.id        = 'wq-typing-indicator';
    el.innerHTML = [
      '<div class="wq-msg-avatar" aria-hidden="true">',
        '<img src="assets/image/KB13 wastraq_logo.png" alt="WASTRAQ" height="40" width="80" style="display:block;">',
      '</div>',
      '<div class="wq-typing" aria-label="WASTRAQ is typing" role="status">',
        '<span></span><span></span><span></span>',
      '</div>',
    ].join('');
    msgs.appendChild(el);
    scrollBottom(msgs);
  }

  function hideTyping() {
    var el = document.getElementById('wq-typing-indicator');
    if (el) el.remove();
  }

  function sendAsUser(text) {
    appendUserMessage(text);
    callAPI(text);
  }

  function sendUserMessage() {
    if (isTyping) return;
    var input = document.getElementById('wq-chat-input');
    var text  = (input.value || '').trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    sendAsUser(text);
  }

  function callAPI(message) {
    isTyping = true;
    var sendBtn = document.getElementById('wq-chat-send');
    if (sendBtn) sendBtn.disabled = true;
    showTyping();

    fetch(cfg.apiBase + '/api/chatbot/message', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message: message }),
    })
      .then(function (r) {
        if (!r.ok) throw new Error('API ' + r.status);
        return r.json();
      })
      .then(function (data) {
        hideTyping();
        isTyping = false;
        if (sendBtn) sendBtn.disabled = false;
        appendBotMessage(
          data.reply || 'Something went wrong. Please try again.',
          data.buttons || [],
          data.link,
          data.link_text
        );
      })
      .catch(function () {
        hideTyping();
        isTyping = false;
        if (sendBtn) sendBtn.disabled = false;
        appendBotMessage(
          "I'm having trouble connecting right now. Please try refreshing or contact us directly at support@wastraq.com",
          ['Contact Support', 'Help Center']
        );
      });
  }

  /* ══════════════════════════════════════════════════════════
     HELPERS
  ══════════════════════════════════════════════════════════ */

  function scrollBottom(el) {
    setTimeout(function () { el.scrollTop = el.scrollHeight; }, 50);
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>');
  }

  function fetchButtonLinks() {
    fetch(cfg.apiBase + '/api/chatbot/buttons')
      .then(function (r) { return r.json(); })
      .then(function (data) { buttonLinks = data; })
      .catch(function () { /* use empty mapping */ });
  }

  /* ══════════════════════════════════════════════════════════
     PUBLIC INIT
  ══════════════════════════════════════════════════════════ */

  function initWastraqChat(options) {
    if (initialized) return;
    initialized = true;

    cfg = Object.assign({}, DEFAULT_CONFIG, options || {});

    // Read from global WASTRAQ_CHAT_CONFIG if set in page
    if (global.WASTRAQ_CHAT_CONFIG) {
      cfg = Object.assign(cfg, global.WASTRAQ_CHAT_CONFIG);
    }

    injectStyles();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        buildWidget();
        fetchButtonLinks();
      });
    } else {
      buildWidget();
      fetchButtonLinks();
    }

    if (cfg.openDelay > 0) {
      setTimeout(function () {
        if (!isOpen) toggleChat();
      }, cfg.openDelay);
    }
  }

  /* Auto-init using script tag data attributes */
  (function autoInit() {
    var script = document.currentScript ||
      (function () {
        var scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
      })();
    var apiBase = (script && script.getAttribute('data-api-base')) || DEFAULT_CONFIG.apiBase;
    initWastraqChat({ apiBase: apiBase });
  })();

  /* Expose for manual init */
  global.initWastraqChat = initWastraqChat;

})(window);




// === Inline Script #2 ===
(function () {
      /* 1. SCROLL PROGRESS BAR */
      var bar = document.getElementById('kp-scroll-progress');
      function updateBar() {
        if (!bar) return;
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = h > 0 ? Math.min(window.scrollY / h * 100, 100) + '%' : '0%';
      }
      window.addEventListener('scroll', updateBar, { passive: true });
      updateBar();

      /* 2. GENERIC REVEAL (IntersectionObserver) */
      var revealEls = document.querySelectorAll('.kp-reveal');
      if (revealEls.length && 'IntersectionObserver' in window) {
        var revealIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add('visible');
            } else {
              e.target.classList.remove('visible');
            }
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(function (el) { revealIO.observe(el); });
      } else {
        revealEls.forEach(function (el) { el.classList.add('visible'); });
      }

      /* 3. COUNTER ANIMATION */
      function animateCounter(el) {
        if (el.dataset.animating === 'true') return;
        el.dataset.animating = 'true';
        var rawTarget = el.dataset.target;
        if (!rawTarget) return;
        var target = parseInt(rawTarget, 10);
        var suffix = el.dataset.suffix || '';
        var duration = 1400;
        var start = null;
        function step(ts) {
          if (el.dataset.animating !== 'true') return; // Cancelled by scrolling away
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = Math.round(eased * target);
          el.textContent = (current >= 1000 ? current.toLocaleString() : current) + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else {
            el.classList.add('popped');
            setTimeout(function () { el.classList.remove('popped'); }, 500);
            el.dataset.animating = 'false';
          }
        }
        requestAnimationFrame(step);
      }

      var counterEls = document.querySelectorAll('.wq-stat-num[data-target]');
      if (counterEls.length && 'IntersectionObserver' in window) {
        var counterIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              animateCounter(e.target);
            } else {
              e.target.dataset.animating = 'false';
              e.target.textContent = '0' + (e.target.dataset.suffix || '');
              e.target.classList.remove('popped');
            }
          });
        }, { threshold: 0.5 });
        counterEls.forEach(function (el) { counterIO.observe(el); });
      }

      /* 4. TIMELINE SVG PATH DRAWING ANIMATION */
      (function () {
        var tlContainer = document.querySelector('.timeline-container');
        var tlPath = document.getElementById('kp-timeline-path');
        var tlTraveler = document.getElementById('kp-tl-traveler');
        var tlNodes = document.querySelectorAll('.kp-tl-node');
        var tlTexts = document.querySelectorAll('.tl-label-block[data-tl-text-idx]');
        if (!tlContainer || !tlPath) return;

        // Node positions along the path as fractions (0–1) of total length
        var nodeFractions = [0.20, 0.45, 0.64, 0.87];

        var animStarted = false;
        var pathLen = 0;

        function initPath() {
          // Must be called after layout is painted so getTotalLength() works
          pathLen = tlPath.getTotalLength() || 1200;
          tlPath.style.strokeDasharray = pathLen;
          tlPath.style.strokeDashoffset = pathLen;
          if (tlTraveler) {
            tlTraveler.style.opacity = '1';
            tlTraveler.setAttribute('cx', -50);
            tlTraveler.setAttribute('cy', 140);
          }
          tlNodes.forEach(function (n) { n.classList.remove('tl-node-visible'); });
          tlTexts.forEach(function (t) { t.classList.remove('tl-text-visible'); });
        }

        // Initialize immediately so elements start hidden
        requestAnimationFrame(function () { initPath(); });

        function startAnimation() {
          if (animStarted) return;
          animStarted = true;
          if (pathLen === 0) pathLen = tlPath.getTotalLength() || 1200;

          var duration = 2200; // ms for the full path draw
          var startTime = null;
          var nodeTriggered = [false, false, false, false];

          function easeInOut(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          }

          function frame(ts) {
            if (!startTime) startTime = ts;
            var elapsed = ts - startTime;
            var rawProgress = Math.min(elapsed / duration, 1);
            var progress = easeInOut(rawProgress);

            // Draw the path
            tlPath.style.strokeDashoffset = pathLen * (1 - progress);

            // Move the traveler dot along the path
            if (tlTraveler && pathLen > 0) {
              var pt = tlPath.getPointAtLength(progress * pathLen);
              tlTraveler.setAttribute('cx', pt.x);
              tlTraveler.setAttribute('cy', pt.y);
            }

            // Reveal nodes as path passes them
            nodeFractions.forEach(function (fraction, idx) {
              if (!nodeTriggered[idx] && progress >= fraction) {
                nodeTriggered[idx] = true;
                if (tlNodes[idx]) tlNodes[idx].classList.add('tl-node-visible');
                if (tlTexts[idx]) {
                  setTimeout(function () {
                    tlTexts[idx].classList.add('tl-text-visible');
                  }, 100);
                }
              }
            });

            if (rawProgress < 1) {
              requestAnimationFrame(frame);
            } else {
              // Hide traveler when done
              if (tlTraveler) {
                tlTraveler.style.opacity = '0';
                tlTraveler.style.transition = 'opacity 0.4s ease';
              }
            }
          }

          requestAnimationFrame(frame);
        }

        function resetAnimation() {
          animStarted = false;
          initPath();
        }

        if ('IntersectionObserver' in window) {
          var tlIO = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
              // Small delay to ensure the SVG is fully rendered and pathLen is correct
              setTimeout(startAnimation, 100);
            } else {
              resetAnimation();
            }
          }, { threshold: 0, rootMargin: '0px 0px -80px 0px' });
          tlIO.observe(tlContainer);
        } else {
          startAnimation();
        }
      })();

      /* 5. TIMELINE CHECKMARKS STAGGER */
      var checks = document.querySelectorAll('.timeline-check');
      if (checks.length && 'IntersectionObserver' in window) {
        var checkIO = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) {
            checks.forEach(function (c, i) {
              c.dataset.tid = setTimeout(function () { c.classList.add('visible'); }, i * 80);
            });
          } else {
            checks.forEach(function (c) {
              clearTimeout(c.dataset.tid);
              c.classList.remove('visible');
            });
          }
        }, { threshold: 0.2 });
        checkIO.observe(checks[0]);
      }

      /* 6. PHOTO CARDS STAGGER */
      var photoCards = document.querySelectorAll('.photo-card');
      if (photoCards.length && 'IntersectionObserver' in window) {
        var photoIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              var idx = Array.prototype.indexOf.call(photoCards, e.target);
              e.target.dataset.tid = setTimeout(function () { e.target.classList.add('visible'); }, (idx % 3) * 120);
            } else {
              clearTimeout(e.target.dataset.tid);
              e.target.classList.remove('visible');
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
        photoCards.forEach(function (c) { photoIO.observe(c); });
      }

      /* 7. DIFF ROWS SCROLL SCANNER */
      var diffRows = document.querySelectorAll('.diff-row');
      if (diffRows.length && 'IntersectionObserver' in window) {
        var diffIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add('kp-hit');
            } else {
              e.target.classList.remove('kp-hit');
            }
          });
        }, { threshold: 0.5, rootMargin: '0px 0px -80px 0px' });
        diffRows.forEach(function (r) { diffIO.observe(r); });
      }

      /* 8. STAT ITEMS REVEAL */
      var statItems = document.querySelectorAll('.wq-stat-item');
      if (statItems.length && 'IntersectionObserver' in window) {
        var statIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.style.opacity = '1';
              e.target.style.transform = 'translateY(0)';
            } else {
              e.target.style.opacity = '0';
              e.target.style.transform = 'translateY(24px)';
            }
          });
        }, { threshold: 0.2 });
        statItems.forEach(function (el, i) {
          el.style.opacity = '0';
          el.style.transform = 'translateY(24px)';
          el.style.transition = 'opacity 0.6s ' + (i * 0.1) + 's ease, transform 0.6s ' + (i * 0.1) + 's cubic-bezier(0.22,1,0.36,1)';
          statIO.observe(el);
        });
      }

      /* 9. SUCCESS QUOTE SLIDE-IN */
      var sq = document.querySelector('.success-quote');
      if (sq && 'IntersectionObserver' in window) {
        sq.style.opacity = '0';
        sq.style.transform = 'translateX(-20px)';
        sq.style.transition = 'opacity 0.7s 0.2s ease, transform 0.7s 0.2s cubic-bezier(0.22,1,0.36,1)';
        var sqIO = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) {
            sq.style.opacity = '1';
            sq.style.transform = 'translateX(0)';
          } else {
            sq.style.opacity = '0';
            sq.style.transform = 'translateX(-20px)';
          }
        }, { threshold: 0.4 });
        sqIO.observe(sq);
      }

      /* 10. BOTTOM CTA TEXT REVEAL */
      var ctaEls = document.querySelectorAll('.bottom-cta h2, .bottom-cta p, .bottom-cta .wq-hero-actions, .bottom-logos');
      ctaEls.forEach(function (el, i) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.7s ' + (i * 0.15) + 's ease, transform 0.7s ' + (i * 0.15) + 's ease';
      });
      if (ctaEls.length && 'IntersectionObserver' in window) {
        var ctaIO = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) {
            ctaEls.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
          } else {
            ctaEls.forEach(function (el) { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; });
          }
        }, { threshold: 0.2 });
        ctaIO.observe(ctaEls[0]);
      }

      /* 11. ACCORDION AUTOSCROLL */
      var accordionCards = document.querySelectorAll('.wq-cards-grid .wq-card');
      if (accordionCards.length > 0) {
        var activeIdx = 0;
        accordionCards[activeIdx].classList.add('autoscroll-active');
        setInterval(function () {
          accordionCards[activeIdx].classList.remove('autoscroll-active');
          activeIdx = (activeIdx + 1) % accordionCards.length;
          accordionCards[activeIdx].classList.add('autoscroll-active');
        }, 2000);
      }

    })();


// Auto-inject navigation and footer on page load
function autoInjectNavFooter() {
  if (typeof injectNav === 'function') injectNav('blog');
  if (typeof injectFooter === 'function') injectFooter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInjectNavFooter);
} else {
  autoInjectNavFooter();
}
