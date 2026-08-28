/* =====================================================================
   WASTRAQ — Products Page (standalone build)
   product.js — merged, self-contained script for product.html.

   wastraq-shared.js was fully audited and is intentionally NOT included
   here: injectNav()/injectFooter()/toggleMobileNav() are unneeded (no
   navbar/footer on this standalone page), and initScrollAnimations()/
   animateCounters() target .anim/.wq-counter/.wq-stats — none of which
   appear anywhere in product.html. Every function this page actually
   needs lives in the four files merged below, in their original load
   order:
     1. js/products-hero.js              (hero entrance + orbit animation)
     2. js/products-hero-transition.js   (hero -> TraqCore curved reveal)
     3. js/product-section-transition.js (pinned section hand-offs,
        includes this task's bugfixes: the ps1Steps double-forEach and
        the undeclared `eased` in applyProgress6)
     4. js/product-showcase.js           (section IntersectionObserver +
        Integrations pulse/hover system)

   Each source file is wrapped in its own IIFE, exactly as in the
   original separate files, so they share no scope and behave
   identically to loading all four as separate <script> tags.
   ===================================================================== */

/* ===== Source: js/products-hero.js ===== */
(() => {
  const hero = document.querySelector('.wq-products-hero');
  if (!hero) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    hero.classList.add('wq-ph-in', 'wq-ph-settled');
    return;
  }

  let settleTimer = null;

  function enter() {
    hero.classList.add('wq-ph-in');
    // Longest entrance delay (pills/orbs) + its own duration, so the slow
    // ambient float only kicks in once everything has actually settled.
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => hero.classList.add('wq-ph-settled'), 2100);
  }

  function leave() {
    clearTimeout(settleTimer);
    hero.classList.remove('wq-ph-in', 'wq-ph-settled');
  }

  // The hero is the first thing on the page, so play the entrance almost
  // immediately on load rather than waiting on a scroll-triggered observer —
  // there's nothing above it to scroll down from. A short delay lets the
  // initial paint settle first so the reveal doesn't get eaten by layout.
  requestAnimationFrame(() => setTimeout(enter, 120));

  // Continuous Smooth Upright Orbit Animation around Truck
  function initHeroOrbitAnimation() {
    const container = hero.querySelector('.wq-hero-illustration');
    if (!container) return;
    const nodes = container.querySelectorAll('.wq-hero-node');
    if (!nodes.length) return;

    const numNodes = nodes.length;
    const angleStep = (2 * Math.PI) / numNodes;
    // Slow, continuous, premium orbit speed (~28s per full revolution)
    const orbitDuration = 28000;

    let startTime = null;
    let animId = null;

    function updatePositions(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Calculate current rotation angle (continuous loop 0 to 2*PI)
      const currentAngle = prefersReducedMotion
        ? -Math.PI / 2
        : ((elapsed % orbitDuration) / orbitDuration) * 2 * Math.PI - Math.PI / 2;

      // Illustration container bounds
      const rect = container.getBoundingClientRect();
      const width = rect.width || 490;
      const height = rect.height || 308;

      // Center of illustration
      const cx = width / 2;
      const cy = height / 2;

      // Elliptical radii matching the orbit SVG arc path (Rx ≈ 36.11%, Ry ≈ 38.23%)
      // Slightly tighter on small screens (<= 640px) to maintain clean margins
      const isMobile = window.innerWidth <= 640;
      const rx = width * (isMobile ? 0.33 : 0.3611);
      const ry = height * (isMobile ? 0.35 : 0.3823);

      nodes.forEach((node, index) => {
        const angle = currentAngle + (index * angleStep);
        // Parametric position along ellipse
        const x = cx + rx * Math.cos(angle);
        const y = cy + ry * Math.sin(angle);

        // translate3d keeps SVG icons 100% upright and readable at 60fps
        node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%)`;
      });

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(updatePositions);
      }
    }

    // Performance optimization: Pause when section is off screen
    const orbitObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !prefersReducedMotion) {
          if (!animId) {
            animId = requestAnimationFrame(updatePositions);
          }
        } else {
          if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
          }
        }
      });
    }, { threshold: 0.05 });

    orbitObserver.observe(container);

    // Initial render
    animId = requestAnimationFrame(updatePositions);

    window.addEventListener('resize', () => {
      if (!animId && !prefersReducedMotion) {
        animId = requestAnimationFrame(updatePositions);
      }
    }, { passive: true });
  }

  initHeroOrbitAnimation();

  // Still reversible: if the user scrolls down past the hero and back up,
  // replay the reveal instead of just snapping back to its settled state.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) enter();
      else leave();
    });
  }, { threshold: 0.2 });

  observer.observe(hero);
})();

/* ===== Source: js/products-hero-transition.js ===== */
(() => {
  const wrap = document.getElementById('wq-ph-wrap');
  if (!wrap) return;

  const content = wrap.querySelector('.wq-products-hero-inner');
  const orbits = wrap.querySelector('.wq-ph-orbits');
  const darkFill = wrap.querySelector('.wq-ph-dark-fill');
  const darkFillGlow = wrap.querySelector('.wq-ph-dark-fill-glow');
  if (!content || !darkFill) return;

  // The first module section's own sticky pin (see products-hero-transition
  // .css) — pulled up to overlap the hero's own rise so its real content
  // can reveal progressively while the field is still growing, instead of
  // only after the hero's pin has released.
  const ps1Wrap = document.getElementById('wq-ps1-wrap');
  const ps1Pin = ps1Wrap ? ps1Wrap.querySelector('.wq-ps1-pin') : null;
  const ps1Sec = ps1Pin ? ps1Pin.querySelector('.wq-ps-section') : null;
  const ps1Steps = ps1Sec ? [
    { els: [ps1Sec.querySelector('.wq-core-ecosystem-wrap, .wq-ps-visual-ecosystem')], start: 0.15, end: 0.45 },
    { els: [ps1Sec.querySelector('.wq-core-hub-group, .wq-ps-node-central')], start: 0.20, end: 0.50 },
    { els: Array.from(ps1Sec.querySelectorAll('.wq-core-net-line, .wq-ps-net-line')), start: 0.25, end: 0.55 },
    { els: Array.from(ps1Sec.querySelectorAll('.wq-core-node, .wq-ps-node:not(.wq-ps-node-central)')), start: 0.30, end: 0.60 },
    { els: [ps1Sec.querySelector('.wq-core-eyebrow, .wq-ps-eyebrow')], start: 0.25, end: 0.45 },
    { els: [ps1Sec.querySelector('.wq-core-heading, .wq-ps-heading-seo')], start: 0.30, end: 0.55 },
    { els: [ps1Sec.querySelector('.wq-core-p, .wq-ps-lead-p')], start: 0.40, end: 0.68 },
    { els: [ps1Sec.querySelector('.wq-core-capability-row, .wq-ps-clean-tags')], start: 0.50, end: 0.75 },
    { els: [ps1Sec.querySelector('.wq-core-cta, .wq-ps-cta')], start: 0.55, end: 0.80 },
    { els: [ps1Sec.querySelector('.wq-core-metrics-strip, .wq-ps-ops-panel')], start: 0.60, end: 0.90 },
  ] : [];

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return; // CSS falls back to a plain static layout

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function resetAll() {
    content.style.opacity = '';
    content.style.transform = '';
    if (orbits) { orbits.style.opacity = ''; orbits.style.transform = ''; }
    darkFill.style.clipPath = '';
    if (darkFillGlow) darkFillGlow.style.clipPath = '';
    if (ps1Pin) ps1Pin.style.clipPath = '';
    // ps1Steps is already a flat array of {els, start, end} step objects —
    // no extra nesting level to forEach over.
    ps1Steps.forEach(({ els }) => els.forEach((el) => {
      if (!el) return;
      el.style.opacity = '';
      el.style.transform = '';
      el.style.transition = '';
    }));
  }

  // Scroll-progress bands across the wrapper's own scrollable range — one
  // coordinated animation, not a sequence of separate steps:
  // 0–30%   the field rises from the lower edge of the screen and begins
  //         covering the hero — hero content fades, lifts and scales down
  //         in lockstep
  // 30–50%  the first module section's label + heading start appearing,
  //         clipped inside the still-rising field (already visible on
  //         screen the whole time via its own overlapping pin — see the
  //         .css — so there is no gap where the field is fully dark with
  //         nothing yet appearing inside it)
  // 45–70%  its description + CTA reveal
  // 55–90%  its visual/diagram reveals with a slightly larger upward bloom
  // 90–100% the field finishes covering the full viewport; content is
  //         already fully visible and settled by this point
  const HOLD_END = 0.0;
  const RISE_END = 0.9;

  function applyProgress(progress) {
    const riseT = clamp((progress - HOLD_END) / (RISE_END - HOLD_END), 0, 1);
    const easedRise = easeInOutCubic(riseT);

    // Hero's own content fades, lifts and scales down together as one
    // coordinated unit, in lockstep with the curved field rising beneath
    // it (same riseT) — never sliced, never duplicated, never left behind.
    content.style.opacity = String(1 - easedRise);
    content.style.transform = `translateY(${-easedRise * 40}px) scale(${1 - easedRise * 0.05})`;
    if (orbits) {
      orbits.style.opacity = String(1 - easedRise);
      orbits.style.transform = `translateY(${-easedRise * 24}px) scale(${1 - easedRise * 0.06})`;
    }

    // The curved field — a large semi-circle anchored at bottom-center,
    // rising and expanding upward. clip-path's percentage radius is
    // resolved from the box's own diagonal (sqrt(w²+h²)/√2), not from the
    // distance to the nearest/farthest corner from the anchor — so on a
    // tall, narrow (portrait/mobile) viewport, covering the top corners
    // from a bottom-center anchor can need well over 100%. 150%
    // comfortably covers any realistic aspect ratio.
    const radius = easedRise * 150;
    const clipPath = `circle(${radius}% at 50% 100%)`;
    darkFill.style.clipPath = clipPath;
    if (darkFillGlow) darkFillGlow.style.clipPath = `circle(${radius * 1.06}% at 50% 100%)`;

    // The first module section's own pin mirrors the exact same clip
    // shape — same formula, same progress — so the two stay pixel-
    // congruent and its content appears to be revealing *inside* the
    // hero's own rising field, one coordinated animation rather than a
    // hand-off.
    if (ps1Pin) {
      ps1Pin.style.clipPath = clipPath;
      // ps1Steps is already a flat array of {els, start, end} step objects —
      // no extra nesting level to forEach over (this was throwing every
      // frame, silently skipping all 10 steps' reveal treatment below).
      ps1Steps.forEach(({ els, start, end }) => {
        const localT = clamp((progress - start) / (end - start), 0, 1);
        const eased = easeInOutCubic(localT);
        els.forEach((el) => {
          if (!el) return;
          // .wq-ps-visual (and, generically, any element the showcase's
          // own IntersectionObserver reveal might later touch) carries its
          // own CSS transition — without disabling it here, our rapid
          // scroll-driven opacity/transform changes would get smoothed
          // over that transition's duration instead of applying instantly,
          // lagging behind the actual scroll position.
          el.style.transition = 'none';
          el.style.opacity = String(eased);
          el.style.transform = `translateY(${(1 - eased) * 40}px) scale(${0.97 + eased * 0.03})`;
        });
      });
    }
  }

  let ticking = false;

  function update() {
    ticking = false;

    if (window.innerWidth <= 900) {
      // Matches the module showcase's own mobile breakpoint — both fall
      // back to a plain stacked layout there (see the CSS), so skip
      // driving anything and make sure no inline overrides linger from a
      // resize down from desktop.
      resetAll();
      return;
    }

    const rect = wrap.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const scrollableDistance = rect.height - viewportHeight;

    // The first module section overlaps the hero's own rise (deliberate
    // negative margin, see .css) so it's already pinned underneath before
    // the hero's field finishes growing. Until it's genuinely stuck, it
    // would otherwise render at its normal, not-yet-stuck position and
    // bleed into view early — keep it hidden until that instant (same
    // pattern used for every other hero/section hand-off on this site).
    if (ps1Wrap && ps1Pin) {
      const ps1Rect = ps1Wrap.getBoundingClientRect();
      const isStuck = ps1Rect.top <= 0;
      const visibility = isStuck ? 'visible' : 'hidden';
      ps1Wrap.style.visibility = visibility;
      ps1Pin.style.visibility = visibility;
    }

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

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  update();
})();

/* ===== Source: js/product-section-transition.js ===== */
(() => {
  const wrap2 = document.getElementById('wq-ps2-wrap');
  if (!wrap2) return;

  const pin2 = wrap2.querySelector('.wq-ps2-pin');
  const sec2 = pin2 ? pin2.querySelector('#residential') : null;
  if (!pin2 || !sec2) return;

  // Section 2 (Residential Collection) Elements
  const sec2VisualCol = sec2.querySelector('.wq-ps-visual-col');
  const sec2ContentCol = sec2.querySelector('.wq-ps-content-col');
  const eyebrow = sec2.querySelector('.wq-res-eyebrow');
  const headingWords = Array.from(sec2.querySelectorAll('.wq-res-word'));
  const paragraph = sec2.querySelector('.wq-res-p');
  const subParagraph = sec2.querySelector('.wq-res-sub-p');
  const capability = sec2.querySelector('.wq-res-capability');
  const cta = sec2.querySelector('.wq-res-cta');
  
  const journeySteps = Array.from(sec2.querySelectorAll('.wq-journey-step'));
  const journeyLines = Array.from(sec2.querySelectorAll('.wq-journey-line'));
  const truckIcon = sec2.querySelector('.wq-journey-truck-icon');
  const homesStep = sec2.querySelector('.step-homes');
  const routeStep = sec2.querySelector('.step-route');

  // Section 1 Pin (TraqCore)
  const ps1Wrap = document.getElementById('wq-ps1-wrap');
  const ps1Pin = ps1Wrap ? ps1Wrap.querySelector('.wq-ps1-pin') : null;

  // Section 3 Pin (Commercial Collection)
  const ps3Wrap = document.getElementById('wq-ps3-wrap');
  const ps3Pin = ps3Wrap ? ps3Wrap.querySelector('.wq-ps3-pin') : null;
  const ps3Sec = ps3Pin ? ps3Pin.querySelector('#commercial') : null;
  
  const comEyebrow = ps3Sec ? ps3Sec.querySelector('.wq-com-eyebrow') : null;
  const comHeadingWords = ps3Sec ? Array.from(ps3Sec.querySelectorAll('.wq-com-word')) : [];
  const comParagraph = ps3Sec ? ps3Sec.querySelector('.wq-com-p') : null;
  const comSubParagraph = ps3Sec ? ps3Sec.querySelector('.wq-com-sub-p') : null;
  const comCapability = ps3Sec ? ps3Sec.querySelector('.wq-com-capability') : null;
  const comCta = ps3Sec ? ps3Sec.querySelector('.wq-com-cta') : null;
  
  const comCustomerStep = ps3Sec ? ps3Sec.querySelector('.step-customer') : null;
  const comMainLine = ps3Sec ? ps3Sec.querySelector('.line-main-down') : null;
  const comBranches = ps3Sec ? Array.from(ps3Sec.querySelectorAll('.wq-com-branch')) : [];
  const comFlowLine = ps3Sec ? ps3Sec.querySelector('.line-flow-down') : null;
  const comTruckIcon = ps3Sec ? ps3Sec.querySelector('.wq-com-truck-icon') : null;
  const comFlowRow = ps3Sec ? ps3Sec.querySelector('.wq-com-flow-row') : null;

  // Section 4 Pin (RouteTraq™)
  const ps4Wrap = document.getElementById('wq-ps4-wrap');
  const ps4Pin = ps4Wrap ? ps4Wrap.querySelector('.wq-ps4-pin') : null;
  const ps4Sec = ps4Pin ? ps4Pin.querySelector('#routeai') : null;

  const routeVisualCol = ps4Sec ? ps4Sec.querySelector('.wq-ps-visual-col') : null;
  const routeContentCol = ps4Sec ? ps4Sec.querySelector('.wq-ps-content-col') : null;
  const routeInputPills = ps4Sec ? Array.from(ps4Sec.querySelectorAll('.wq-route-input-pill')) : [];
  const routeFeederLines = ps4Sec ? Array.from(ps4Sec.querySelectorAll('.wq-feeder-line')) : [];
  const routeAiHub = ps4Sec ? ps4Sec.querySelector('.wq-route-ai-hub') : null;
  const routeActiveLine = ps4Sec ? ps4Sec.querySelector('.wq-route-active-line') : null;
  const routeVehicleMarker = ps4Sec ? ps4Sec.querySelector('.wq-route-vehicle-marker') : null;
  const routeStopNodes = ps4Sec ? Array.from(ps4Sec.querySelectorAll('.wq-route-stop-node')) : [];
  const routeMetrics = ps4Sec ? Array.from(ps4Sec.querySelectorAll('.wq-route-metric')) : [];
  const routeEyebrow = ps4Sec ? ps4Sec.querySelector('.wq-route-eyebrow') : null;
  const routeHeading = ps4Sec ? ps4Sec.querySelector('.wq-route-heading') : null;
  const routeP1 = ps4Sec ? ps4Sec.querySelector('.wq-route-p1') : null;
  const routeCapability = ps4Sec ? ps4Sec.querySelector('.wq-route-capability') : null;
  const routeCta = ps4Sec ? ps4Sec.querySelector('.wq-route-cta') : null;

  // Section 5 Pin (Waste Insights)
  const ps5Wrap = document.getElementById('wq-ps5-wrap');
  const ps5Pin = ps5Wrap ? ps5Wrap.querySelector('.wq-ps5-pin') : null;
  const ps5Sec = ps5Pin ? ps5Pin.querySelector('#insights') : null;

  const analyticsEyebrow = ps5Sec ? ps5Sec.querySelector('.wq-analytics-eyebrow') : null;
  const analyticsHeading = ps5Sec ? ps5Sec.querySelector('.wq-analytics-heading') : null;
  const analyticsP1 = ps5Sec ? ps5Sec.querySelector('.wq-analytics-p1') : null;
  const analyticsCapability = ps5Sec ? ps5Sec.querySelector('.wq-analytics-capability') : null;
  const analyticsCta = ps5Sec ? ps5Sec.querySelector('.wq-analytics-cta') : null;
  const analyticsDashboardWrap = ps5Sec ? ps5Sec.querySelector('.wq-analytics-dashboard-wrap') : null;
  const analyticsStatCards = ps5Sec ? Array.from(ps5Sec.querySelectorAll('.wq-analytics-stat-card')) : [];
  const analyticsChartPath = ps5Sec ? ps5Sec.querySelector('.wq-analytics-chart-path') : null;

  // Section 6 Pin (Integrations)
  const ps6Wrap = document.getElementById('wq-ps6-wrap');
  const ps6Pin = ps6Wrap ? ps6Wrap.querySelector('.wq-ps6-pin') : null;
  const ps6Sec = ps6Pin ? ps6Pin.querySelector('#integrations') : null;

  const integVisualWrap = ps6Sec ? ps6Sec.querySelector('.wq-integ-visual-wrap') : null;
  const integEyebrow = ps6Sec ? ps6Sec.querySelector('.wq-integ-eyebrow') : null;
  const integHeading = ps6Sec ? ps6Sec.querySelector('.wq-integ-heading') : null;
  const integP1 = ps6Sec ? ps6Sec.querySelector('.wq-integ-p1') : null;
  const integCapability = ps6Sec ? ps6Sec.querySelector('.wq-integ-capability') : null;
  const integCta = ps6Sec ? ps6Sec.querySelector('.wq-integ-cta') : null;
  const integCentralNode = ps6Sec ? ps6Sec.querySelector('.wq-integ-node-central') : null;
  const integLines = ps6Sec ? Array.from(ps6Sec.querySelectorAll('.wq-integ-line')) : [];
  const integNodes = ps6Sec ? {
    erp: ps6Sec.querySelector('.node-erp'),
    iot: ps6Sec.querySelector('.node-iot'),
    billing: ps6Sec.querySelector('.node-billing'),
    reporting: ps6Sec.querySelector('.node-reporting'),
    apis: ps6Sec.querySelector('.node-apis'),
    workflows: ps6Sec.querySelector('.node-workflows'),
  } : {};
  const integSupportingBanner = ps6Sec ? ps6Sec.querySelector('.wq-integ-supporting-banner') : null;
  const integAccentLine = ps6Sec ? ps6Sec.querySelector('.wq-integ-accent-line') : null;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function resetTransitionOnly() {
    if (ps1Pin) { ps1Pin.style.transform = ''; ps1Pin.style.opacity = '1'; }
    if (pin2) { pin2.style.transform = ''; pin2.style.opacity = '1'; }
    if (ps3Pin) { ps3Pin.style.transform = ''; ps3Pin.style.opacity = '1'; }
    if (ps4Pin) { ps4Pin.style.transform = ''; ps4Pin.style.opacity = '1'; }
    if (ps5Pin) { ps5Pin.style.transform = ''; ps5Pin.style.opacity = '1'; }
    if (ps6Pin) { ps6Pin.style.transform = ''; ps6Pin.style.opacity = '1'; }
  }

  // 1. TraqCore -> Residential
  function applyProgress(progress) {
    const slideProgress = clamp(progress / 0.70, 0, 1);
    const easedSlide = easeInOutCubic(slideProgress);

    if (ps1Pin) {
      ps1Pin.style.transition = 'none';
      ps1Pin.style.transform = `translateX(${-easedSlide * 100}%)`;
      ps1Pin.style.opacity = '1';
    }

    if (pin2) {
      pin2.style.transition = 'none';
      pin2.style.transform = `translateX(${(1 - easedSlide) * 100}%)`;
      pin2.style.opacity = '1';
    }

    // Immediate early reveal: content starts appearing at 0.35 opacity right as section enters
    const revealProgress = clamp(progress / 0.45, 0, 1);
    const easedReveal = easeInOutCubic(revealProgress);
    const baseOpacity = 0.35 + 0.65 * easedReveal;

    if (sec2VisualCol) {
      sec2VisualCol.style.transition = 'none';
      sec2VisualCol.style.opacity = String(baseOpacity);
      sec2VisualCol.style.transform = `translateX(${(1 - easedReveal) * -30}px)`;
    }

    if (sec2ContentCol) {
      sec2ContentCol.style.transition = 'none';
      sec2ContentCol.style.opacity = String(baseOpacity);
      sec2ContentCol.style.transform = `translateX(${(1 - easedReveal) * 30}px)`;
    }

    if (eyebrow) {
      eyebrow.style.transition = 'none';
      eyebrow.style.opacity = String(clamp(progress / 0.20, 0.4, 1));
    }

    headingWords.forEach((word, idx) => {
      const t = clamp((progress - (0.02 + idx * 0.03)) / 0.30, 0, 1);
      const eased = easeInOutCubic(t);
      word.style.transition = 'none';
      word.style.opacity = String(0.35 + 0.65 * eased);
      word.style.transform = `translateY(${(1 - eased) * 12}px)`;
    });

    if (paragraph) {
      const t = clamp((progress - 0.08) / 0.30, 0, 1);
      paragraph.style.transition = 'none';
      paragraph.style.opacity = String(0.35 + 0.65 * easeInOutCubic(t));
    }
    if (capability) {
      const t = clamp((progress - 0.14) / 0.30, 0, 1);
      capability.style.transition = 'none';
      capability.style.opacity = String(0.35 + 0.65 * easeInOutCubic(t));
    }
    if (cta) {
      const t = clamp((progress - 0.18) / 0.30, 0, 1);
      cta.style.transition = 'none';
      cta.style.opacity = String(0.35 + 0.65 * easeInOutCubic(t));
    }

    journeySteps.forEach((step, idx) => {
      const t = clamp((progress - (0.04 + idx * 0.04)) / 0.30, 0, 1);
      const eased = easeInOutCubic(t);
      step.style.transition = 'none';
      step.style.opacity = String(0.35 + 0.65 * eased);
      step.style.transform = `translateY(${(1 - eased) * 10}px)`;
    });

    journeyLines.forEach((line, idx) => {
      const t = clamp((progress - (0.08 + idx * 0.05)) / 0.25, 0, 1);
      line.style.transition = 'none';
      line.style.transform = `scaleY(${easeInOutCubic(t)})`;
    });

    if (truckIcon && homesStep && routeStep) {
      const travelDist = routeStep.offsetTop - homesStep.offsetTop;
      const truckT = clamp((progress - 0.08) / 0.60, 0, 1);
      const easedTruck = easeInOutCubic(truckT);
      const truckY = easedTruck * travelDist;
      truckIcon.style.transition = 'none';
      truckIcon.style.opacity = String(clamp(progress / 0.15, 0.4, 1));
      truckIcon.style.transform = `translate3d(0px, ${truckY}px, 0px)`;
      if (truckT >= 0.85) routeStep.classList.add('is-arrival-active');
      else routeStep.classList.remove('is-arrival-active');
    }
  }  // 2. Residential -> Commercial
  function applyProgress3(progress3) {
    const slideProgress = clamp(progress3, 0, 1);
    const easedSlide = easeInOutCubic(slideProgress);

    if (pin2) {
      pin2.style.transition = 'none';
      pin2.style.transform = `translateY(${-easedSlide * 100}%)`;
      pin2.style.opacity = '1';
    }

    if (ps3Pin) {
      ps3Pin.style.transition = 'none';
      ps3Pin.style.transform = `translateY(${(1 - easedSlide) * 100}%)`;
      ps3Pin.style.opacity = '1';
      ps3Pin.style.visibility = 'visible';
    }

    const revealProgress = clamp(progress3 / 0.40, 0, 1);
    const easedReveal = easeInOutCubic(revealProgress);
    const baseOpacity = 0.6 + 0.4 * easedReveal;

    if (comEyebrow) {
      comEyebrow.style.transition = 'none';
      comEyebrow.style.opacity = '1';
    }

    const comHeading = ps3Sec ? ps3Sec.querySelector('.wq-com-heading') : null;
    if (comHeading) {
      comHeading.style.transition = 'none';
      comHeading.style.opacity = '1';
      comHeading.style.transform = `translateY(${(1 - easedReveal) * 12}px)`;
    }

    if (comParagraph) {
      comParagraph.style.transition = 'none';
      comParagraph.style.opacity = '1';
    }
    if (comCapability) {
      comCapability.style.transition = 'none';
      comCapability.style.opacity = '1';
    }
    if (comCta) {
      comCta.style.transition = 'none';
      comCta.style.opacity = '1';
    }

    const comVisualCol = ps3Sec ? ps3Sec.querySelector('.wq-com-visual-col') : null;
    if (comVisualCol) {
      comVisualCol.style.transition = 'none';
      comVisualCol.style.opacity = '1';
      comVisualCol.style.transform = `translateY(${(1 - easedReveal) * 16}px)`;
    }

    if (comCustomerStep) {
      comCustomerStep.style.transition = 'none';
      comCustomerStep.style.opacity = String(baseOpacity);
    }
    if (comMainLine) {
      comMainLine.style.transition = 'none';
      comMainLine.style.transform = `scaleY(${easeInOutCubic(clamp((progress3 - 0.05) / 0.25, 0, 1))})`;
    }
    comBranches.forEach((branch, idx) => {
      const t = clamp((progress3 - (0.08 + idx * 0.05)) / 0.25, 0, 1);
      const eased = easeInOutCubic(t);
      branch.style.transition = 'none';
      branch.style.opacity = String(0.4 + 0.6 * eased);
      branch.style.transform = `translateY(${(1 - eased) * 10}px)`;
    });
    if (comFlowLine) {
      comFlowLine.style.transition = 'none';
      comFlowLine.style.transform = `scaleY(${easeInOutCubic(clamp((progress3 - 0.20) / 0.25, 0, 1))})`;
    }
    if (comFlowRow) {
      comFlowRow.style.transition = 'none';
      comFlowRow.style.opacity = String(clamp((progress3 - 0.25) / 0.25, 0.4, 1));
    }
  }

  // 3. Commercial -> RouteTraq
  function applyProgress4(progress4) {
    const slideProgress = clamp(progress4, 0, 1);
    const easedSlide = easeInOutCubic(slideProgress);

    if (ps3Pin) {
      ps3Pin.style.transition = 'none';
      ps3Pin.style.transform = `translateY(${-easedSlide * 100}%)`;
      ps3Pin.style.opacity = '1';
    }

    if (ps4Pin) {
      ps4Pin.style.transition = 'none';
      ps4Pin.style.transform = `translateY(${(1 - easedSlide) * 100}%)`;
      ps4Pin.style.opacity = '1';
      ps4Pin.style.visibility = 'visible';
    }

    const revealProgress = clamp(progress4 / 0.45, 0, 1);
    const easedReveal = easeInOutCubic(revealProgress);
    const baseOpacity = 0.35 + 0.65 * easedReveal;

    if (routeEyebrow) {
      routeEyebrow.style.transition = 'none';
      routeEyebrow.style.opacity = String(clamp(progress4 / 0.20, 0.4, 1));
    }
    if (routeHeading) {
      const t = clamp((progress4 - 0.04) / 0.30, 0, 1);
      const eased = easeInOutCubic(t);
      routeHeading.style.transition = 'none';
      routeHeading.style.opacity = String(0.35 + 0.65 * eased);
      routeHeading.style.transform = `translateY(${(1 - eased) * 16}px)`;
    }
    if (routeP1) {
      const t = clamp((progress4 - 0.10) / 0.30, 0, 1);
      routeP1.style.transition = 'none';
      routeP1.style.opacity = String(0.35 + 0.65 * easeInOutCubic(t));
    }
    if (routeCapability) {
      const t = clamp((progress4 - 0.16) / 0.30, 0, 1);
      routeCapability.style.transition = 'none';
      routeCapability.style.opacity = String(0.35 + 0.65 * easeInOutCubic(t));
    }
    if (routeCta) {
      const t = clamp((progress4 - 0.20) / 0.30, 0, 1);
      const eased = easeInOutCubic(t);
      routeCta.style.transition = 'none';
      routeCta.style.opacity = String(0.35 + 0.65 * eased);
      routeCta.style.transform = `translateY(${(1 - eased) * 10}px)`;
    }

    if (routeAiHub) {
      routeAiHub.style.transition = 'none';
      routeAiHub.style.opacity = String(baseOpacity);
      routeAiHub.style.transform = `scale(${0.9 + easedReveal * 0.1})`;
    }
    routeInputPills.forEach((pill, idx) => {
      const t = clamp((progress4 - (0.06 + idx * 0.04)) / 0.25, 0, 1);
      pill.style.transition = 'none';
      pill.style.opacity = String(0.35 + 0.65 * easeInOutCubic(t));
    });
    if (routeActiveLine) {
      const offset = (1 - easedReveal) * 400;
      routeActiveLine.style.strokeDashoffset = String(offset);
    }
    routeMetrics.forEach((metric, idx) => {
      const t = clamp((progress4 - (0.20 + idx * 0.05)) / 0.25, 0, 1);
      metric.style.transition = 'none';
      metric.style.opacity = String(0.35 + 0.65 * easeInOutCubic(t));
    });
  }

  // 4. RouteTraq -> Waste Insights
  function applyProgress5(progress5) {
    const slideProgress = clamp(progress5 / 0.75, 0, 1);
    const easedSlide = easeOutCubic(slideProgress);

    if (ps4Pin) {
      ps4Pin.style.transition = 'none';
      ps4Pin.style.transform = `translateY(${-easedSlide * 100}%)`;
      ps4Pin.style.opacity = '1';
    }

    if (ps5Pin) {
      ps5Pin.style.transition = 'none';
      ps5Pin.style.transform = `translateY(${(1 - easedSlide) * 100}%)`;
      ps5Pin.style.opacity = '1';
    }

    const revealProgress = clamp(progress5 / 0.45, 0, 1);
    const easedReveal = easeInOutCubic(revealProgress);
    const baseOpacity = 0.35 + 0.65 * easedReveal;

    if (analyticsEyebrow) {
      analyticsEyebrow.style.transition = 'none';
      analyticsEyebrow.style.opacity = String(clamp(progress5 / 0.20, 0.4, 1));
    }
    if (analyticsHeading) {
      const t = clamp((progress5 - 0.04) / 0.30, 0, 1);
      const eased = easeInOutCubic(t);
      analyticsHeading.style.transition = 'none';
      analyticsHeading.style.opacity = String(0.35 + 0.65 * eased);
      analyticsHeading.style.transform = `translateY(${(1 - eased) * 16}px)`;
    }
    if (analyticsP1) {
      const t = clamp((progress5 - 0.10) / 0.30, 0, 1);
      analyticsP1.style.transition = 'none';
      analyticsP1.style.opacity = String(0.35 + 0.65 * easeInOutCubic(t));
    }
    if (analyticsCapability) {
      const t = clamp((progress5 - 0.16) / 0.30, 0, 1);
      analyticsCapability.style.transition = 'none';
      analyticsCapability.style.opacity = String(0.35 + 0.65 * easeInOutCubic(t));
    }
    if (analyticsCta) {
      const t = clamp((progress5 - 0.20) / 0.30, 0, 1);
      analyticsCta.style.transition = 'none';
      analyticsCta.style.opacity = String(0.35 + 0.65 * easeInOutCubic(t));
    }

    if (analyticsDashboardWrap) {
      analyticsDashboardWrap.style.transition = 'none';
      analyticsDashboardWrap.style.opacity = String(baseOpacity);
    }
    analyticsStatCards.forEach((card, idx) => {
      const t = clamp((progress5 - (0.08 + idx * 0.05)) / 0.25, 0, 1);
      card.style.transition = 'none';
      card.style.opacity = String(0.35 + 0.65 * easeInOutCubic(t));
    });
    if (analyticsChartPath) {
      const offset = (1 - easedReveal) * 450;
      analyticsChartPath.style.strokeDashoffset = String(offset);
    }
  }

  // 5. Waste Insights -> Integrations
  function applyProgress6(progress6) {
    const slideProgress = clamp(progress6 / 0.60, 0, 1);
    const easedSlide = easeInOutCubic(slideProgress);

    if (ps5Pin) {
      ps5Pin.style.transition = 'none';
      ps5Pin.style.transform = `translateY(${-easedSlide * 100}%)`;
      ps5Pin.style.opacity = '1';
    }

    if (ps6Pin) {
      ps6Pin.style.transition = 'none';
      ps6Pin.style.transform = `translateY(${(1 - easedSlide) * 100}%)`;
      ps6Pin.style.opacity = '1';
    }

    const revealProgress = clamp(progress6 / 0.45, 0, 1);
    const easedReveal = easeInOutCubic(revealProgress);
    const baseOpacity = 0.35 + 0.65 * easedReveal;

    if (integVisualWrap) {
      integVisualWrap.style.transition = 'none';
      integVisualWrap.style.opacity = String(baseOpacity);
      integVisualWrap.style.transform = `translateY(${(1 - easedReveal) * 15}px)`;
    }

    if (integCentralNode) {
      const t = clamp(progress6 / 0.20, 0, 1);
      const eased = easeInOutCubic(t);
      integCentralNode.style.transition = 'none';
      integCentralNode.style.opacity = String(0.4 + 0.6 * eased);
      integCentralNode.style.transform = `translate(-50%, -50%) scale(${0.88 + eased * 0.12})`;
    }

    integLines.forEach((line) => {
      const t = clamp((progress6 - 0.08) / 0.25, 0, 1);
      const len = line.getAttribute('stroke-dasharray') || '160';
      const offset = (1 - easeInOutCubic(t)) * parseFloat(len);
      line.style.transition = 'none';
      line.style.strokeDashoffset = String(offset);
    });

    const nodeList = [
      integNodes.erp,
      integNodes.iot,
      integNodes.billing,
      integNodes.reporting,
      integNodes.apis,
      integNodes.workflows
    ];

    nodeList.forEach((node, idx) => {
      if (!node) return;
      const t = clamp((progress6 - (0.10 + idx * 0.04)) / 0.25, 0, 1);
      const eased = easeInOutCubic(t);
      node.style.transition = 'none';
      node.style.opacity = String(0.35 + 0.65 * eased);
      node.style.transform = `translate(-50%, -50%) scale(${0.88 + eased * 0.12})`;
    });

    if (integSupportingBanner) {
      const t = clamp((progress6 - 0.30) / 0.20, 0, 1);
      const eased = easeInOutCubic(t);
      integSupportingBanner.style.transition = 'none';
      integSupportingBanner.style.opacity = String(0.35 + 0.65 * eased);
      integSupportingBanner.style.transform = `translateY(${(1 - eased) * 10}px)`;
    }

    if (integEyebrow) {
      integEyebrow.style.transition = 'none';
      integEyebrow.style.opacity = String(clamp(progress6 / 0.20, 0.4, 1));
    }
    if (integHeading) {
      const t = clamp((progress6 - 0.04) / 0.30, 0, 1);
      const eased = easeInOutCubic(t);
      integHeading.style.transition = 'none';
      integHeading.style.opacity = String(0.35 + 0.65 * eased);
      integHeading.style.transform = `translateY(${(1 - eased) * 16}px)`;
    }
    if (integAccentLine) {
      const t = clamp((progress6 - 0.08) / 0.25, 0, 1);
      const eased = easeInOutCubic(t);
      integAccentLine.style.transition = 'none';
      integAccentLine.style.width = `${eased * 48}px`;
    }
    if (integP1) {
      const t = clamp((progress6 - 0.10) / 0.30, 0, 1);
      integP1.style.transition = 'none';
      integP1.style.opacity = String(0.35 + 0.65 * easeInOutCubic(t));
    }
    if (integCapability) {
      const t = clamp((progress6 - 0.16) / 0.30, 0, 1);
      integCapability.style.transition = 'none';
      integCapability.style.opacity = String(0.35 + 0.65 * easeInOutCubic(t));
    }
    if (integCta) {
      const t = clamp((progress6 - 0.20) / 0.30, 0, 1);
      const eased = easeInOutCubic(t);
      integCta.style.transition = 'none';
      integCta.style.opacity = String(0.35 + 0.65 * eased);
      integCta.style.transform = `translateY(${(1 - eased) * 10}px)`;
    }
  }

  let ticking = false;

  function update() {
    ticking = false;
    if (window.innerWidth <= 900) {
      resetAll();
      return;
    }

    function getProgress(wrapEl) {
      if (!wrapEl) return 0;
      const rect = wrapEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollableDistance = rect.height - viewportHeight;
      if (scrollableDistance <= 0) return rect.top <= 0 ? 1 : 0;
      return clamp(-rect.top / scrollableDistance, 0, 1);
    }

    const p2 = getProgress(wrap2);
    const p3 = getProgress(ps3Wrap);
    const p4 = getProgress(ps4Wrap);
    const p5 = getProgress(ps5Wrap);
    const p6 = getProgress(ps6Wrap);

    // Section Visibility Management: only the two wraps involved in the
    // CURRENTLY ACTIVE handoff may be visible. Because each wrap overlaps
    // the previous one by design (negative margin-top), sections several
    // steps ahead sit only ~20vh apart from each other in the document —
    // so a simple "is this wrap's box anywhere near the viewport" check
    // marked several *upcoming* sections visible at once. Since they're
    // sticky with no transform yet (their own transition hasn't started),
    // they render at their native in-flow position and the one with the
    // highest z-index (a later, not-yet-active section) painted over the
    // real active section — leaving the gaps between each fragment blank.
    // Restricting visibility to only the active pair keeps the viewport
    // fully covered by exactly the section(s) that should be on screen.
    const wraps = [
      { wrap: ps1Wrap, pin: ps1Pin },
      { wrap: wrap2, pin: pin2 },
      { wrap: ps3Wrap, pin: ps3Pin },
      { wrap: ps4Wrap, pin: ps4Pin },
      { wrap: ps5Wrap, pin: ps5Pin },
      { wrap: ps6Wrap, pin: ps6Pin },
    ];

    let activeWraps;
    if (p6 > 0) activeWraps = [ps5Wrap, ps6Wrap];
    else if (p5 > 0) activeWraps = [ps4Wrap, ps5Wrap];
    else if (p4 > 0) activeWraps = [ps3Wrap, ps4Wrap];
    else if (p3 > 0) activeWraps = [wrap2, ps3Wrap];
    else if (p2 > 0) activeWraps = [ps1Wrap, wrap2];
    else activeWraps = [ps1Wrap];

    wraps.forEach(({ wrap, pin }) => {
      if (wrap && pin) {
        const vis = activeWraps.indexOf(wrap) !== -1 ? 'visible' : 'hidden';
        wrap.style.visibility = vis;
        pin.style.visibility = vis;
      }
    });

    // Apply active transition step depending on scroll range
    if (p6 > 0) applyProgress6(p6);
    else if (p5 > 0) applyProgress5(p5);
    else if (p4 > 0) applyProgress4(p4);
    else if (p3 > 0) applyProgress3(p3);
    else if (p2 > 0) applyProgress(p2);
    else resetTransitionOnly();
  }

  function resetAll() {
    resetTransitionOnly();
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

/* ===== Source: js/product-showcase.js ===== */
(() => {
  const sections = Array.from(document.querySelectorAll('.wq-ps-section'));
  if (!sections.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    sections.forEach((section) => section.classList.add('is-in'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const sec = entry.target;
      if (entry.isIntersecting) {
        sec.classList.add('is-in');
        sec.classList.remove('is-above', 'is-below');
      } else {
        sec.classList.remove('is-in');
        if (entry.boundingClientRect.top < 0) {
          sec.classList.add('is-above');
          sec.classList.remove('is-below');
        } else {
          sec.classList.add('is-below');
          sec.classList.remove('is-above');
        }
      }
    });
  }, { threshold: 0.3 });

  sections.forEach((section) => {
    section.classList.add('is-below');
    observer.observe(section);
  });

  // ===== Section 6 Integration Architecture Data Pulses & Hover System =====
  document.addEventListener('DOMContentLoaded', () => {
    const sec6 = document.getElementById('integrations');
    if (!sec6) return;

    const pulseGroup = sec6.querySelector('.wq-integ-pulse-group');
    const centralNode = sec6.querySelector('.wq-integ-node-central');
    const lines = Array.from(sec6.querySelectorAll('.wq-integ-line'));
    const nodes = {
      erp: sec6.querySelector('.node-erp'),
      iot: sec6.querySelector('.node-iot'),
      billing: sec6.querySelector('.node-billing'),
      reporting: sec6.querySelector('.node-reporting'),
      apis: sec6.querySelector('.node-apis'),
      workflows: sec6.querySelector('.node-workflows')
    };

    const pathConfigs = [
      { id: 'path-erp', lineClass: 'line-erp', node: nodes.erp, type: 'inflow' },
      { id: 'path-iot', lineClass: 'line-iot', node: nodes.iot, type: 'inflow' },
      { id: 'path-billing', lineClass: 'line-billing', node: nodes.billing, type: 'inflow' },
      { id: 'path-reporting', lineClass: 'line-reporting', node: nodes.reporting, type: 'outflow' },
      { id: 'path-apis', lineClass: 'line-apis', node: nodes.apis, type: 'outflow' },
      { id: 'path-workflows', lineClass: 'line-workflows', node: nodes.workflows, type: 'outflow' }
    ];

    function spawnPulse(cfg) {
      if (!pulseGroup) return;
      const pathEl = sec6.querySelector('#' + cfg.id);
      if (!pathEl || typeof pathEl.getTotalLength !== 'function') return;

      const totalLen = pathEl.getTotalLength();
      if (!totalLen) return;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '3.5');
      circle.setAttribute('fill', cfg.type === 'inflow' ? '#37c85a' : '#0b5ed7');
      pulseGroup.appendChild(circle);

      const duration = 1400;
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentDist = progress * totalLen;
        const pt = pathEl.getPointAtLength(currentDist);

        circle.setAttribute('cx', pt.x);
        circle.setAttribute('cy', pt.y);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          pulseGroup.removeChild(circle);
          const destNode = cfg.type === 'outflow' ? cfg.node : centralNode;
          if (destNode) {
            destNode.classList.add('is-pulsed');
            setTimeout(() => destNode.classList.remove('is-pulsed'), 300);
          }
        }
      }
      requestAnimationFrame(step);
    }

    let pulseIndex = 0;
    setInterval(() => {
      if (prefersReducedMotion) return;
      const config = pathConfigs[pulseIndex % pathConfigs.length];
      spawnPulse(config);
      pulseIndex++;
    }, 3000);

    pathConfigs.forEach((item) => {
      if (!item.node) return;
      const targetLine = sec6.querySelector('#' + item.id);
      item.node.addEventListener('mouseenter', () => {
        lines.forEach((l) => {
          if (l === targetLine) {
            l.classList.add('is-active-line');
            l.classList.remove('is-dimmed-line');
          } else {
            l.classList.add('is-dimmed-line');
            l.classList.remove('is-active-line');
          }
        });
      });
      item.node.addEventListener('mouseleave', () => {
        lines.forEach((l) => {
          l.classList.remove('is-active-line', 'is-dimmed-line');
        });
      });
    });

    if (centralNode) {
      centralNode.addEventListener('mouseenter', () => {
        lines.forEach((l) => {
          l.classList.add('is-active-line');
          l.classList.remove('is-dimmed-line');
        });
        pathConfigs.forEach((cfg) => spawnPulse(cfg));
      });
      centralNode.addEventListener('mouseleave', () => {
        lines.forEach((l) => {
          l.classList.remove('is-active-line', 'is-dimmed-line');
        });
      });
    }
  });
})();
