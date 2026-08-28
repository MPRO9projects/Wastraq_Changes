injectNav('about');injectFooter();

/* Settle the one-time hero entrance, then apply a very subtle scroll-fade. */
(function initAboutHero() {
  var hero = document.querySelector('.about-hero');
  var inner = document.querySelector('.about-hero-inner');
  var description = document.querySelector('.about-hero-description');
  if (!hero || !inner) return;

  var settled = false;

  var settleHero = function () {
    settled = true;
    hero.classList.remove('about-hero--animating');
    hero.classList.add('about-hero--settled', 'about-hero-scrollfade');
  };

  if (description) description.addEventListener('animationend', function once() {
    settleHero();
    description.removeEventListener('animationend', once);
  }, { once: true });

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ticking = false;
  var onScroll = function () {
    if (!settled) settleHero();
    if (reduceMotion) return;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var progress = Math.min(window.scrollY / 200, 1);
      inner.style.transform = 'translate3d(0, ' + (progress * -20) + 'px, 0)';
      inner.style.opacity = 1 - progress * 0.08;
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  if (window.scrollY > 0) onScroll();
})();

/* Mission / Vision now use the shared .anim / .anim-left / .anim-right
   IntersectionObserver reveal (wastraq-shared.js) — no dedicated controller needed. */

/* ── Values — depth-stack card sequence (desktop only) ── */
(function initValuesStack() {
  var pin = document.querySelector('.wq-values-pin');
  var sticky = document.querySelector('.wq-values-sticky');
  var stack = document.querySelector('.wq-values-stack');
  var cards = stack ? Array.prototype.slice.call(stack.querySelectorAll('.wq-value-card')) : [];
  var dots = Array.prototype.slice.call(document.querySelectorAll('.wq-values-dot'));
  var prevBtn = document.querySelector('.wq-values-arrow--prev');
  var nextBtn = document.querySelector('.wq-values-arrow--next');
  if (!pin || !sticky || !stack || !cards.length) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isNarrow = window.matchMedia && window.matchMedia('(max-width: 700px)').matches;
  if (reduceMotion || isNarrow) return; /* CSS handles the plain vertical fallback */

  var n = cards.length;
  var ticking = false;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* FAR PREVIOUS (-2) → PREVIOUS (-1) → ACTIVE (0) → NEXT (+1) → FAR NEXT (+2); beyond ±3 is fully hidden. */
  var POINTS = [
    { o: -3, y: -300, scale: .85, opacity: 0   },
    { o: -2, y: -210, scale: .88, opacity: .45 },
    { o: -1, y: -115, scale: .93, opacity: .65 },
    { o: 0,  y: 0,    scale: 1,   opacity: 1   },
    { o: 1,  y: 120,  scale: .94, opacity: .70 },
    { o: 2,  y: 205,  scale: .90, opacity: .50 },
    { o: 3,  y: 300,  scale: .86, opacity: 0   }
  ];

  function styleForOffset(offset) {
    var o = clamp(offset, -3, 3);
    var lo = POINTS[0], hi = POINTS[POINTS.length - 1];
    for (var i = 0; i < POINTS.length - 1; i++) {
      if (o >= POINTS[i].o && o <= POINTS[i + 1].o) { lo = POINTS[i]; hi = POINTS[i + 1]; break; }
    }
    var t = (o - lo.o) / ((hi.o - lo.o) || 1);
    return {
      y: lerp(lo.y, hi.y, t),
      scale: lerp(lo.scale, hi.scale, t),
      opacity: lerp(lo.opacity, hi.opacity, t)
    };
  }

  function getTotal() {
    return pin.offsetHeight - sticky.offsetHeight;
  }

  function update() {
    ticking = false;
    var rect = pin.getBoundingClientRect();
    var total = getTotal();
    if (total <= 0) return;
    var scrolled = clamp(-rect.top, 0, total);
    var progress = scrolled / total;
    var virtualIndex = progress * (n - 1);
    var activeIndex = Math.round(virtualIndex);

    cards.forEach(function (card, i) {
      var offset = i - virtualIndex;
      var s = styleForOffset(offset);
      var isActive = Math.abs(offset) < 0.5;
      card.style.transform = 'translate3d(-50%, calc(-50% + ' + s.y + 'px), 0) scale(' + s.scale + ')';
      card.style.opacity = s.opacity;
      card.style.zIndex = Math.round((1 - Math.min(Math.abs(offset), 1)) * 9) + 1;
      card.style.pointerEvents = isActive ? 'auto' : 'none';
      card.classList.toggle('is-active', isActive);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === activeIndex);
    });
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  /* Prev/next arrows nudge the page scroll by exactly one card-step, so
     scroll position stays the single source of truth for card + dot state. */
  function goToStep(delta) {
    var total = getTotal();
    if (total <= 0) return;
    var step = total / (n - 1);
    window.scrollBy({ top: step * delta, left: 0, behavior: 'smooth' });
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { goToStep(-1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goToStep(1); });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
