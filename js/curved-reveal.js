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
