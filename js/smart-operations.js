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
