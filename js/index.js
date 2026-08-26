// index.js — index.html's own page behavior:
// intro animation, smart-operations carousel, curved-reveal transition,
// smart-story section, and page-specific behavior (platform tabs, KPI
// counters, FAQ accordion). Not part of the shared nav/footer.

// ---- 2. Intro animation controller — was index-intro.js ----
/**
 * WASTRAQ Bidirectional Synchronized Animation Controller
 * 
 * Stage 1 (Landfill Intro):
 * - Typewriter text: "IS WASTE BECOMING A PROBLEM?" types automatically on enter/return.
 * - "WE HAVE A SOLUTION" taskbar sits at bottom with original styling, smoothness, and scroll transition.
 * - Text is NEVER deleted/reversed when scrolling up within this section.
 * - On scroll/click: Smoothly executes the forward transition.
 * - When returning from the main site to this section, typewriter restarts automatically from the beginning.
 * 
 * Stage 2 (Logo & Navbar Motion):
 * - Logo spins 360° once in center.
 * - Logo glides smoothly to top-left navbar position.
 * - Navbar expands horizontally from behind the settled logo.
 * - Hero headline types out in center.
 */

(function () {
  'use strict';

  const LANDFILL_TEXT = "IS WASTE BECOMING A PROBLEM?";
  const HERO_TEXT = "Smarter Waste. Cleaner Cities. Zero Guesswork.";
  const TYPEWRITER_SPEED = 48;

  let landfillCharIndex = 0;
  let landfillAutoTimer = null;
  let taskbarRevealTimer = null;
  let isIntroDismissed = false;
  let isTransitioning = false;
  let isHeroTyped = false;
  let typewriterTimeout = null;

  document.addEventListener('DOMContentLoaded', () => {
    // Robust multi-method reload detection
    let isReload = false;
    try {
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries && navEntries.length > 0) {
        isReload = navEntries[0].type === 'reload';
      } else if (window.performance && window.performance.navigation) {
        isReload = window.performance.navigation.type === 1; // TYPE_RELOAD
      }
    } catch (err) {
      isReload = false;
    }

    const isExplicitReload = window.location.search.includes('reload=true');
    const currentPageState = sessionStorage.getItem('wq_page_state');
    const isIntroHash = window.location.hash === '#intro' || window.location.search.includes('intro=true');

    if (isExplicitReload) {
      history.replaceState(null, document.title, window.location.pathname);
    }

    if (isReload) {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);

      if (currentPageState === 'landfill' && !isExplicitReload) {
        // If the user was viewing the Landfill page, reload stays on Landfill
        document.body.classList.add('intro-active');
        document.body.classList.add('hero-pending');
        initLandfillTypewriter();
      } else {
        // If on Smarter Waste or any other page, reload opens Smarter Waste homepage
        setHomepageActiveDirectly();
      }
    } else {
      // Normal visit
      if (currentPageState === 'homepage' && !isIntroHash) {
        setHomepageActiveDirectly();
      } else {
        // Default initial landing: show Landfill intro
        sessionStorage.setItem('wq_has_visited', 'true');
        sessionStorage.setItem('wq_page_state', 'landfill');
        document.body.classList.add('intro-active');
        document.body.classList.add('hero-pending');
        initLandfillTypewriter();
      }
    }
    initIntroInteractions();
  });

  // Set the homepage active directly (default state when navigating to homepage / logo click / reload on homepage)
  function setHomepageActiveDirectly() {
    sessionStorage.setItem('wq_page_state', 'homepage');
    if (landfillAutoTimer) {
      clearInterval(landfillAutoTimer);
      landfillAutoTimer = null;
    }
    if (taskbarRevealTimer) {
      clearTimeout(taskbarRevealTimer);
      taskbarRevealTimer = null;
    }
    const introExperience = document.getElementById('wastraq-intro-experience');
    if (introExperience) {
      introExperience.classList.add('intro-dismissed');
    }
    const flyingLogo = document.getElementById('wq-intro-flying-logo-wrap');
    if (flyingLogo) {
      flyingLogo.style.display = 'none';
      flyingLogo.style.opacity = '0';
      flyingLogo.style.visibility = 'hidden';
      flyingLogo.classList.remove('animating-center', 'flying-to-nav', 'circuit-active', 'text-faded-out', 'rotating-360', 'rotating-reverse');
    }
    document.body.classList.remove('intro-active', 'hero-pending', 'nav-retracting');
    document.body.classList.add('navbar-settled', 'hero-revealed');
    isIntroDismissed = true;
    isTransitioning = false;
    startHeroTypewriter();
  }

  // 1. LANDFILL INTRO AUTO-TYPEWRITER
  function initLandfillTypewriter() {
    const typewriterElement = document.getElementById('wq-typewriter-text');
    const taskbarAnchor = document.getElementById('wq-taskbar-trigger');
    if (!typewriterElement) return;

    // Reset state, clear text & hide taskbar
    landfillCharIndex = 0;
    typewriterElement.textContent = '';
    if (taskbarAnchor) {
      taskbarAnchor.classList.remove('visible');
    }

    if (landfillAutoTimer) {
      clearInterval(landfillAutoTimer);
      landfillAutoTimer = null;
    }
    if (taskbarRevealTimer) {
      clearTimeout(taskbarRevealTimer);
      taskbarRevealTimer = null;
    }

    // Automatically type from the beginning
    setTimeout(() => {
      landfillAutoTimer = setInterval(() => {
        if (landfillCharIndex < LANDFILL_TEXT.length) {
          landfillCharIndex++;
          typewriterElement.textContent = LANDFILL_TEXT.substring(0, landfillCharIndex);
        } else {
          clearInterval(landfillAutoTimer);
          landfillAutoTimer = null;

          // Typewriter finishes → 2-second pause → "WE HAVE A SOLUTION" appears automatically
          taskbarRevealTimer = setTimeout(() => {
            const anchor = document.getElementById('wq-taskbar-trigger');
            if (anchor && !isIntroDismissed) {
              anchor.classList.add('visible');
            }
          }, 2000);
        }
      }, TYPEWRITER_SPEED);
    }, 200);
  }

  // 2. HERO HEADLINE TYPEWRITER (Runs only after navbar fully settles)
  function startHeroTypewriter() {
    const heroTextElement = document.getElementById('wq-hero-typewriter-text');
    const heroCursorElement = document.getElementById('wq-hero-typewriter-cursor');
    const heroSubtitle = document.getElementById('wq-hero-subtitle');
    const heroActions = document.querySelector('.wq-hero-actions');
    const heroPills = document.querySelector('.wq-hero-pills');

    if (!heroTextElement) return;

    if (isHeroTyped) {
      heroTextElement.innerHTML = `Smarter Waste.<br/><span class="green-accent">Cleaner Cities.</span><br/>Zero Guesswork.`;
      if (heroSubtitle) heroSubtitle.classList.add('visible');
      if (heroActions) heroActions.classList.add('visible');
      if (heroPills) heroPills.classList.add('visible');
      return;
    }

    let charIndex = 0;
    heroTextElement.textContent = '';
    if (heroCursorElement) heroCursorElement.style.display = 'inline-block';

    function typeHeroChar() {
      if (charIndex < HERO_TEXT.length) {
        const raw = HERO_TEXT.substring(0, charIndex + 1);

        let formatted = raw;
        if (formatted.includes("Smarter Waste. ")) {
          formatted = formatted.replace("Smarter Waste. ", "Smarter Waste.<br/>");
        }
        if (formatted.includes("Cleaner Cities. ")) {
          formatted = formatted.replace("Cleaner Cities. ", '<span class="green-accent">Cleaner Cities.</span><br/>');
        } else if (formatted.includes("Cleaner Cities.")) {
          formatted = formatted.replace("Cleaner Cities.", '<span class="green-accent">Cleaner Cities.</span>');
        }

        heroTextElement.innerHTML = formatted;
        charIndex++;
        typewriterTimeout = setTimeout(typeHeroChar, TYPEWRITER_SPEED);
      } else {
        isHeroTyped = true;
        if (heroCursorElement) {
          heroCursorElement.style.display = 'none';
        }
        // Step 1: Reveal description text smoothly below the heading
        setTimeout(() => {
          if (heroSubtitle) heroSubtitle.classList.add('visible');
        }, 180);
        // Step 2: Reveal "Schedule a Free Demo" and "Explore Platform" buttons underneath
        setTimeout(() => {
          if (heroActions) heroActions.classList.add('visible');
          if (heroPills) heroPills.classList.add('visible');
        }, 620);
      }
    }

    typeHeroChar();
  }

  // Called when the user scrolls before the hero headline finishes typing.
  function completeHeroTypingInstantly() {
    if (isHeroTyped) return;

    if (typewriterTimeout) {
      clearTimeout(typewriterTimeout);
      typewriterTimeout = null;
    }

    const heroTextElement = document.getElementById('wq-hero-typewriter-text');
    const heroCursorElement = document.getElementById('wq-hero-typewriter-cursor');
    const heroSubtitle = document.getElementById('wq-hero-subtitle');
    const heroActions = document.querySelector('.wq-hero-actions');
    const heroPills = document.querySelector('.wq-hero-pills');

    isHeroTyped = true;

    if (heroTextElement) {
      heroTextElement.innerHTML = `Smarter Waste.<br/><span class="green-accent">Cleaner Cities.</span><br/>Zero Guesswork.`;
    }
    if (heroCursorElement) heroCursorElement.style.display = 'none';

    if (heroSubtitle) heroSubtitle.classList.add('visible');
    if (heroActions) heroActions.classList.add('visible');
    if (heroPills) heroPills.classList.add('visible');
  }

  // 3. MAIN BIDIRECTIONAL CONTROLLER
  function initIntroInteractions() {
    const introExperience = document.getElementById('wastraq-intro-experience');
    const flyingLogo = document.getElementById('wq-intro-flying-logo-wrap');
    const heroSubtitle = document.getElementById('wq-hero-subtitle');
    const heroActions = document.querySelector('.wq-hero-actions');
    const heroPills = document.querySelector('.wq-hero-pills');

    if (!introExperience) return;

    // ── FORWARD ANIMATION SEQUENCE ──
    function executeForwardTransition() {
      if (isIntroDismissed || isTransitioning) return;
      isTransitioning = true;

      // Stop auto typing or pending taskbar reveal if still running
      if (landfillAutoTimer) {
        clearInterval(landfillAutoTimer);
        landfillAutoTimer = null;
      }
      if (taskbarRevealTimer) {
        clearTimeout(taskbarRevealTimer);
        taskbarRevealTimer = null;
      }

      // Step 1: Logo + WASTRAQ appear together in the center, landfill dismisses
      introExperience.classList.add('intro-dismissed');
      document.body.classList.remove('intro-active', 'navbar-settled', 'nav-retracting');
      document.body.classList.add('hero-pending');

      if (flyingLogo) {
        flyingLogo.style.display = 'block';
        flyingLogo.style.opacity = '1';
        flyingLogo.style.visibility = 'visible';
        flyingLogo.classList.remove('flying-to-nav', 'text-faded-out', 'rotating-360', 'rotating-reverse');
        flyingLogo.classList.add('animating-center');

        // Trigger 360° spin in center + circuit glow
        setTimeout(() => {
          flyingLogo.classList.add('rotating-360', 'circuit-active');
        }, 80);
      }

      // Step 2: 360° spin completes in center (1350ms) -> text & circuits smoothly fade
      setTimeout(() => {
        if (flyingLogo) {
          flyingLogo.classList.add('text-faded-out');
          flyingLogo.classList.remove('circuit-active');
        }
      }, 1350);

      // Step 3: Spin fully finished -> Smoothly glide logo to top-left navbar position (1450ms)
      setTimeout(() => {
        if (flyingLogo) {
          flyingLogo.classList.remove('animating-center');
          flyingLogo.classList.add('flying-to-nav');
        }
      }, 1450);

      // Step 4: Logo settles in navbar position (2180ms) -> Navbar expands from behind it
      setTimeout(() => {
        document.body.classList.remove('hero-pending');
        document.body.classList.add('navbar-settled');
        if (flyingLogo) {
          flyingLogo.style.display = 'none';
          flyingLogo.style.opacity = '0';
          flyingLogo.style.visibility = 'hidden';
        }
      }, 2180);

      // Step 5: Navbar expansion complete -> reveal hero content & start typewriter (2950ms)
      setTimeout(() => {
        sessionStorage.setItem('wq_page_state', 'homepage');
        document.body.classList.add('hero-revealed');
        startHeroTypewriter();
        isIntroDismissed = true;
        isTransitioning = false;
      }, 2950);
    }

    // ── REVERSE ANIMATION SEQUENCE ──
    function executeReverseTransition() {
      if (!isIntroDismissed || isTransitioning) return;
      isTransitioning = true;

      if (typewriterTimeout) {
        clearTimeout(typewriterTimeout);
      }

      // Reverse Step 1: Hero content fades out (0ms)
      document.body.classList.remove('hero-revealed');
      if (heroSubtitle) heroSubtitle.classList.remove('visible');
      if (heroActions) heroActions.classList.remove('visible');
      if (heroPills) heroPills.classList.remove('visible');
      isHeroTyped = false;

      // Reverse Step 2: Navbar retracts back into logo position (0ms)
      document.body.classList.add('nav-retracting');
      document.body.classList.remove('navbar-settled');

      // Flying logo takes over at top-left navbar position
      if (flyingLogo) {
        flyingLogo.style.display = 'block';
        flyingLogo.style.opacity = '1';
        flyingLogo.style.visibility = 'visible';

        flyingLogo.classList.remove('animating-center', 'circuit-active', 'rotating-360', 'rotating-reverse');
        flyingLogo.classList.add('flying-to-nav', 'text-faded-out');
      }

      // Reverse Step 3: Logo smoothly glides from top-left back to center (600ms)
      setTimeout(() => {
        document.body.classList.remove('nav-retracting');
        document.body.classList.add('hero-pending');

        if (flyingLogo) {
          flyingLogo.classList.remove('flying-to-nav');
          flyingLogo.classList.add('animating-center');
        }
      }, 600);

      // Reverse Step 4: Logo reaches center -> WASTRAQ text fades in, circuits draw, and logo spins in reverse (1350ms)
      setTimeout(() => {
        if (flyingLogo) {
          flyingLogo.classList.remove('text-faded-out');
          flyingLogo.classList.add('circuit-active');
          flyingLogo.classList.add('rotating-reverse');
        }
      }, 1350);

      // Reverse Step 5: Spin completes in center -> circuits fade out (2650ms)
      setTimeout(() => {
        if (flyingLogo) {
          flyingLogo.classList.remove('circuit-active');
        }
      }, 2650);

      // Reverse Step 6: Flying logo smoothly fades out before landfill page slides down (2950ms)
      setTimeout(() => {
        if (flyingLogo) {
          flyingLogo.style.opacity = '0';
          flyingLogo.style.visibility = 'hidden';
        }
        introExperience.classList.remove('intro-dismissed');
      }, 2950);

      // Reverse Step 7: Clean state reset & restart landfill typewriter (3650ms)
      setTimeout(() => {
        sessionStorage.setItem('wq_page_state', 'landfill');
        document.body.classList.add('intro-active');
        document.body.classList.remove('hero-pending', 'navbar-settled', 'nav-retracting');
        if (flyingLogo) {
          flyingLogo.style.display = 'none';
          flyingLogo.style.opacity = '0';
          flyingLogo.style.visibility = 'hidden';
          flyingLogo.classList.remove('animating-center', 'circuit-active', 'text-faded-out', 'rotating-360', 'rotating-reverse');
        }
        isIntroDismissed = false;
        isTransitioning = false;

        initLandfillTypewriter();
      }, 3650);
    }

    // Click trigger on Taskbar & hints
    const taskbarElements = document.querySelectorAll('#wq-taskbar-trigger, .wq-white-taskbar, .wq-taskbar-text, .wq-scroll-hint');
    taskbarElements.forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        executeForwardTransition();
      });
    });

    // Wheel Scroll detection
    let wheelThrottle = false;
    window.addEventListener('wheel', (e) => {
      if (isTransitioning) return;

      if (!isIntroDismissed) {
        if (e.deltaY > 6) {
          if (wheelThrottle) return;
          wheelThrottle = true;
          setTimeout(() => { wheelThrottle = false; }, 80);
          executeForwardTransition();
        }
      } else {
        if (e.deltaY > 0 && !isHeroTyped) {
          completeHeroTypingInstantly();
        }
        // Smarter Waste page is the upper scroll boundary: upward scroll remains stable on this page
      }
    }, { passive: true });

    // Touch support for Mobile Swipes
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isTransitioning) return;
      const touchEndY = e.touches[0].clientY;
      const diffY = touchStartY - touchEndY;

      if (!isIntroDismissed) {
        if (diffY > 16) {
          executeForwardTransition();
          touchStartY = touchEndY;
        }
      } else {
        if (diffY > 0 && !isHeroTyped) {
          completeHeroTypingInstantly();
        }
        // Smarter Waste page is the upper scroll boundary: upward swipe remains stable on this page
      }
    }, { passive: true });

    // Handle clicks on WASTRAQ logo, text, and home navigation
    document.addEventListener('click', (e) => {
      const logoLink = e.target.closest('#wq-nav-logo, a[href="index.html"], a[href="./index.html"], a[href="/"]');
      if (logoLink) {
        // If already on the homepage / index.html
        const isCurrentPageHome = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname === '';
        if (isCurrentPageHome) {
          e.preventDefault();
          if (window.location.hash) {
            history.replaceState(null, document.title, window.location.pathname + window.location.search.replace(/[?&]intro=true/g, ''));
          }
          setHomepageActiveDirectly();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });
  }

})();

// ---- 3. Smart Operations carousel — was js/smart-operations.js ----
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
      const radius = width * 1.5;
      // Position bottom of shallow curve at ~29-30% of viewport height
      const curveBottom = Math.max(height * 0.29, 195);
      const centerY = curveBottom - radius;
      return { radius, centerX: width * 0.5, centerY, iconCenterY: curveBottom - 34 };
    }

    const radius = Math.max(height * 0.76, width * 0.395);
    const rightEdge = width * 0.565; // nudged right for a better-balanced composition

    return { radius, centerX: rightEdge - radius, centerY: height * 0.5, iconCenterY: height * 0.5 };
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
    if (window.innerWidth <= 760) return; // Arc is hidden on mobile

    const geo = getGeometry();
    const step = 8.7;

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
      const isPast = index < currentIndex;
      const isActive = index === currentIndex;
      const isUpcoming = index > currentIndex;

      let opacity = 1;
      if (isActive) {
        opacity = 1;
      } else if (isUpcoming) {
        // Upcoming items are light/faded
        opacity = Math.max(0.28, 0.65 - (index - currentIndex) * 0.18);
      } else if (isPast) {
        // Past items smoothly fade upward
        opacity = Math.max(0, 0.4 - (currentIndex - index) * 0.18);
      }

      if (distance > 4.5) opacity = 0;
      item.style.opacity = String(opacity);

      const scale = isActive ? 1 : 1 - Math.min(distance * 0.014, 0.055);
      item.style.transform = `translate(-100%, -50%) scale(${scale})`;
    });
  }

  function drawIconCycle() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width <= 760) {
      const geo = getGeometry();
      cycleIcons.forEach((icon, index) => {
        if (index === currentIndex) {
          icon.style.left = `${geo.centerX}px`;
          icon.style.top = `${geo.iconCenterY}px`;
          icon.style.transform = 'translate(-50%, -50%) scale(1)';
          icon.style.opacity = '1';
        } else {
          icon.style.opacity = '0';
        }
      });
      return;
    }

    let centerX = width * 0.225;
    let radius = Math.min(width * 0.12, height * 0.19);
    let centerY = Math.max(height * 0.5, headerClearanceY + radius);

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
      icon.style.opacity = index === currentIndex ? '1' : Math.max(0.55, 1 - distance * 0.1);
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

  // Smooth upward fade for content transition
  const CONTENT_SWITCH_MS = 220;
  let lastContentIndex = -1;
  let maxCompletedIndex = 0;
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

  // --- Continuous scroll-driven progress with single appearance guarantee ---
  const ARC_IN_END = 0.05;
  const CONTENT_IN_END = 0.1;
  const EXIT_START = 0.95;
  const HANDOFF_START = 0.8;
  const HANDOFF_MAX_RATIO = 0.09;

  function applyProgress(progress) {
    updateHeaderClearance();

    const isMobile = window.innerWidth <= 760;

    // Keep content and structure 100% visible throughout scroll on both desktop and mobile
    // The next sticky reveal section seamlessly covers this section without any blank gap
    let structuralOpacity = 1;
    let contentOpacity = 1;

    if (progress < CONTENT_IN_END && window.innerWidth > 760) {
      contentOpacity = Math.max(0.7, progress / CONTENT_IN_END);
    }

    masterCircle.style.opacity = '1';
    masterCircle.style.transform = isMobile 
      ? 'translateY(0) scale(1)' 
      : 'translateY(0) scale(1)';
    arcLayer.style.opacity = '1';
    iconCycle.style.opacity = String(contentOpacity);
    rightPanel.style.opacity = String(contentOpacity);

    const handoffT = clamp((progress - HANDOFF_START) / (1 - HANDOFF_START), 0, 1);
    handoff.style.height = `${handoffT * window.innerHeight * HANDOFF_MAX_RATIO}px`;

    const scrubT = clamp((progress - CONTENT_IN_END) / (EXIT_START - CONTENT_IN_END), 0, 1);
    const targetPos = scrubT * (modules.length - 1);
    
    // Ensure smooth monotonic progression (each module appears once in sequence)
    currentPosition = targetPos;
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

  // Viewport IntersectionObserver to trigger smooth page-up scroll animation
  const container = section.querySelector('.wq-smartops-container');
  if (container && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          container.classList.add('is-revealed');
        } else {
          // Allow animation to replay when scrolling away and returning
          container.classList.remove('is-revealed');
        }
      });
    }, {
      threshold: 0.25 // Trigger when 20-30% of the section is visible
    });

    revealObserver.observe(section);
  } else if (container) {
    container.classList.add('is-revealed');
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScrollOrResize, { passive: true });

  layout();
  update();
})();

// ---- 4. Curved reveal transition — was js/curved-reveal.js ----
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

// ---- 5. Smart Story section — was js/smart-story.js ----
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

// ---- 6. Page-specific behavior (platform tabs, KPI counters, FAQ accordion) — was js/index-page.js ----
// index.html — page-specific behavior (extracted from inline <script> blocks)

injectNav('home');
injectFooter();

// Scroll animation for Trusted By section
(function() {
  const trustedSection = document.querySelector('.wq-trusted');
  if (trustedSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          trustedSection.classList.add('is-visible');
        } else {
          trustedSection.classList.remove('is-visible');
        }
      });
    }, { threshold: 0.25 });
    observer.observe(trustedSection);
  }
})();

// Scroll-driven pinned card sequence (Reference Video Behavior)
const panels = document.querySelectorAll('.wq-tab-panel');
const tabs = document.querySelectorAll('.wq-tab');
let activeTabIndex = 0;

let tabTransitionTimeout = null;

function switchTab(nextIndex, direction = null) {
  if (nextIndex < 0) nextIndex = 0;
  if (nextIndex >= panels.length) nextIndex = panels.length - 1;
  if (nextIndex === activeTabIndex && panels[activeTabIndex].classList.contains('active')) return;

  const prevIndex = activeTabIndex;
  activeTabIndex = nextIndex;

  const isForward = direction !== null ? direction === 'down' : nextIndex > prevIndex;

  // Highlight active heading (dark/bold) while others remain light/gray
  tabs.forEach((tab, index) => {
    tab.classList.toggle('active', index === nextIndex);
  });

  // On Desktop, ensure panels are children of #tab-visuals
  if (window.innerWidth > 992) {
    const visualContainer = document.getElementById('tab-visuals');
    if (visualContainer) {
      panels.forEach(p => {
        if (p.parentNode !== visualContainer) {
          visualContainer.appendChild(p);
        }
      });
    }
  }

  // Smooth scroll-driven card transition: previous cards stay permanently stationary underneath, next card slides from OFF-SCREEN RIGHT to LEFT over it
  panels.forEach((panel, index) => {
    if (index === nextIndex) {
      panel.classList.remove('exit-forward', 'exit-backward', 'covered');
      // Set starting position to off-screen right
      panel.classList.add('enter-from-right');
      void panel.offsetWidth; // Force reflow to guarantee CSS transition starts from translateX(100%)
      panel.classList.remove('enter-from-right');
      panel.classList.add('active');
    } else if (index < nextIndex) {
      // All previous cards stay stationary underneath, fully covered by incoming card
      panel.classList.remove('active', 'enter-from-right');
      panel.classList.add('covered');
    } else {
      // Future cards stay off-screen on the right
      panel.classList.remove('active', 'enter-from-right', 'covered', 'exit-forward', 'exit-backward');
    }
  });

  // Clear any pending animation triggers
  if (tabTransitionTimeout) {
    clearTimeout(tabTransitionTimeout);
  }

  // Pre-reset the target card's numbers to 0 immediately so no premature values show during transit
  resetCardMetrics(nextIndex);

  // Trigger KPI number counters after the incoming card completes its entrance over the previous card (850ms + 100ms delay)
  tabTransitionTimeout = setTimeout(() => {
    triggerCardMetrics(nextIndex);
  }, 950);
}

function resetCardMetrics(index) {
  if (index === 0) {
    const remEl = document.getElementById('driver-metric-rem');
    const schedEl = document.getElementById('driver-metric-sched');
    const finishEl = document.getElementById('driver-metric-finish');
    if (remEl) remEl.textContent = '0';
    if (schedEl) schedEl.textContent = '0%';
    if (finishEl) finishEl.textContent = '0:00';
  } else if (index === 1) {
    const satEl = document.getElementById('crm-metric-sat');
    const respEl = document.getElementById('crm-metric-resp');
    const resEl = document.getElementById('crm-metric-res');
    if (satEl) satEl.textContent = '0%';
    if (respEl) respEl.textContent = '0s';
    if (resEl) resEl.textContent = '0%';
  } else if (index === 2) {
    const accEl = document.getElementById('route-metric-acc');
    const shiftEl = document.getElementById('route-metric-shift');
    const speedEl = document.getElementById('route-metric-speed');
    if (accEl) accEl.textContent = '0%';
    if (shiftEl) shiftEl.textContent = '0m';
    if (speedEl) speedEl.textContent = '0×';
  } else if (index === 3) {
    const callsEl = document.getElementById('portal-metric-calls');
    const payEl = document.getElementById('portal-metric-pay');
    const ratingEl = document.getElementById('portal-metric-rating');
    if (callsEl) callsEl.textContent = '0%';
    if (payEl) payEl.textContent = '0%';
    if (ratingEl) ratingEl.textContent = '0★';
  } else if (index === 4) {
    const genEl = document.getElementById('waste-pct-gen');
    const recEl = document.getElementById('waste-pct-rec');
    const orgEl = document.getElementById('waste-pct-org');
    if (genEl) genEl.textContent = '0%';
    if (recEl) recEl.textContent = '0%';
    if (orgEl) orgEl.textContent = '0%';
  }
}

function triggerCardMetrics(index) {
  if (index === 0) {
    animateDriverMetrics();
  } else if (index === 1) {
    animateCrmMetrics();
  } else if (index === 2) {
    animateRouteMetrics();
  } else if (index === 3) {
    animatePortalMetrics();
  } else if (index === 4) {
    animateWasteBars();
  }
}

let driverCountAnimId = null;

function animateDriverMetrics() {
  const remEl = document.getElementById('driver-metric-rem');
  const schedEl = document.getElementById('driver-metric-sched');
  const finishEl = document.getElementById('driver-metric-finish');
  if (!remEl || !schedEl || !finishEl) return;

  if (driverCountAnimId) cancelAnimationFrame(driverCountAnimId);

  const duration = 1500; // Exact 1.5 seconds duration
  const startTime = performance.now();

  function updateDriver(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Smooth ease-out cubic deceleration
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    // Collections Remaining: 0 -> 1, 2, 3 ... 18
    const remVal = Math.round(easeProgress * 18);
    remEl.textContent = remVal;

    // On Schedule: 0% -> 1%, 2%, 3% ... 94% (% suffix kept visible)
    const schedVal = Math.round(easeProgress * 94);
    schedEl.textContent = schedVal + '%';

    // Est. Finish: 0:00 -> 14:30 (0 minutes -> 870 minutes formatted as MM:SS / HH:MM)
    const totalMinutes = Math.round(easeProgress * 870);
    const hrs = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const mins = String(totalMinutes % 60).padStart(2, '0');
    finishEl.textContent = `${hrs}:${mins}`;

    if (progress < 1) {
      driverCountAnimId = requestAnimationFrame(updateDriver);
    } else {
      remEl.textContent = '18';
      schedEl.textContent = '94%';
      finishEl.textContent = '14:30';
      driverCountAnimId = null;
    }
  }

  // Start all three counters at 0 simultaneously
  remEl.textContent = '0';
  schedEl.textContent = '0%';
  finishEl.textContent = '0:00';

  driverCountAnimId = requestAnimationFrame(updateDriver);
}

function animatePortalMetrics() {
  const callsEl = document.getElementById('portal-metric-calls');
  const payEl = document.getElementById('portal-metric-pay');
  const ratingEl = document.getElementById('portal-metric-rating');
  if (!callsEl || !payEl || !ratingEl) return;

  const duration = 1400; // 1.4s ease-out duration
  const startTime = performance.now();

  function updatePortal(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Smooth cubic ease-out curve
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    // Inbound Calls: 0% -> -65% (minus sign & % suffix kept visible)
    const callsVal = Math.round(easeProgress * 65);
    callsEl.textContent = callsVal === 0 ? '0%' : '−' + callsVal + '%';

    // Digital Pay Rate: 0% -> 94% (% suffix kept visible)
    const payVal = Math.round(easeProgress * 94);
    payEl.textContent = payVal + '%';

    // App Rating: 0 -> 4.9★ (★ symbol kept visible)
    const ratingVal = (easeProgress * 4.9).toFixed(1);
    ratingEl.textContent = ratingVal + '★';

    if (progress < 1) {
      requestAnimationFrame(updatePortal);
    } else {
      callsEl.textContent = '−65%';
      payEl.textContent = '94%';
      ratingEl.textContent = '4.9★';
    }
  }

  // Reset to 0 first, then smoothly animate count
  callsEl.textContent = '0%';
  payEl.textContent = '0%';
  ratingEl.textContent = '0★';

  requestAnimationFrame(updatePortal);
}

function animateRouteMetrics() {
  const accEl = document.getElementById('route-metric-acc');
  const shiftEl = document.getElementById('route-metric-shift');
  const speedEl = document.getElementById('route-metric-speed');
  if (!accEl || !shiftEl || !speedEl) return;

  const duration = 1400; // 1.4s ease-out duration
  const startTime = performance.now();

  function updateRoute(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Smooth cubic ease-out curve
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    // Route Accuracy: 0% -> 99.1%
    const accVal = (easeProgress * 99.1).toFixed(1);
    accEl.textContent = accVal + '%';

    // Per Shift Saved: 0m -> -38m (minus sign kept visible)
    const shiftVal = Math.round(easeProgress * 38);
    shiftEl.textContent = shiftVal === 0 ? '0m' : '−' + shiftVal + 'm';

    // Dispatch Speed: 0x -> 4.2x (multiplier suffix kept visible)
    const speedVal = (easeProgress * 4.2).toFixed(1);
    speedEl.textContent = speedVal + '×';

    if (progress < 1) {
      requestAnimationFrame(updateRoute);
    } else {
      accEl.textContent = '99.1%';
      shiftEl.textContent = '−38m';
      speedEl.textContent = '4.2×';
    }
  }

  // Reset to 0 first, then smoothly animate count
  accEl.textContent = '0%';
  shiftEl.textContent = '0m';
  speedEl.textContent = '0×';

  requestAnimationFrame(updateRoute);
}

function animateCrmMetrics() {
  const satEl = document.getElementById('crm-metric-sat');
  const respEl = document.getElementById('crm-metric-resp');
  const resEl = document.getElementById('crm-metric-res');
  if (!satEl || !respEl || !resEl) return;

  const duration = 1400; // 1.4s ease-out duration
  const startTime = performance.now();

  function updateCrm(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Smooth cubic ease-out curve
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    // Satisfaction: 0% -> 98.4%
    const satVal = (easeProgress * 98.4).toFixed(1);
    satEl.textContent = satVal + '%';

    // Avg Response: 0s -> 12s
    const respVal = Math.round(easeProgress * 12);
    respEl.textContent = respVal + 's';

    // Resolution Rate: 0% -> 100%
    const resVal = Math.round(easeProgress * 100);
    resEl.textContent = resVal + '%';

    if (progress < 1) {
      requestAnimationFrame(updateCrm);
    } else {
      satEl.textContent = '98.4%';
      respEl.textContent = '12s';
      resEl.textContent = '100%';
    }
  }

  // Reset to 0 first, then smoothly animate count
  satEl.textContent = '0%';
  respEl.textContent = '0s';
  resEl.textContent = '0%';

  requestAnimationFrame(updateCrm);
}

function animateWasteBars() {
  const genEl = document.getElementById('waste-pct-gen');
  const recEl = document.getElementById('waste-pct-rec');
  const orgEl = document.getElementById('waste-pct-org');
  if (!genEl || !recEl || !orgEl) return;

  const duration = 1400; // 1.4 seconds
  const startTime = performance.now();

  function updateNumbers(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Smooth ease-out cubic curve
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    genEl.textContent = Math.round(easeProgress * 62) + '%';
    recEl.textContent = Math.round(easeProgress * 24) + '%';
    orgEl.textContent = Math.round(easeProgress * 10) + '%';

    if (progress < 1) {
      requestAnimationFrame(updateNumbers);
    } else {
      genEl.textContent = '62%';
      recEl.textContent = '24%';
      orgEl.textContent = '10%';
    }
  }

  // Reset to 0% first, then animate
  genEl.textContent = '0%';
  recEl.textContent = '0%';
  orgEl.textContent = '0%';

  requestAnimationFrame(updateNumbers);
}

// Manual tab click support: Clicking an option activates the card with the exact same animation and position as scrolling
tabs.forEach((tab, index) => {
  tab.addEventListener('click', (e) => {
    e.preventDefault();
    const scene = document.getElementById('wq-platform-scene');
    if (!scene) return;

    if (window.innerWidth <= 992) {
      // Mobile: trigger the exact mobile stage reveal animation
      if (typeof window.setMobileActiveStage === 'function') {
        window.setMobileActiveStage(index);
      }

      // Calculate corresponding scroll progress position to keep window scroll in sync
      // Stage 0: 0.12, Stage 1: 0.30, Stage 2: 0.48, Stage 3: 0.66, Stage 4: 0.84
      const progressMap = [0.10, 0.30, 0.50, 0.70, 0.90];
      const targetProgress = progressMap[index] !== undefined ? progressMap[index] : (index / 4);

      const rect = scene.getBoundingClientRect();
      const sceneTop = window.scrollY + rect.top;
      const scrollableDist = rect.height - window.innerHeight;
      const targetY = sceneTop + targetProgress * scrollableDist;

      window.scrollTo({ top: targetY, behavior: 'smooth' });
    } else {
      // Desktop: switchTab and scroll to corresponding pinned stage
      switchTab(index);
      const rect = scene.getBoundingClientRect();
      const sceneTop = window.scrollY + rect.top;
      const scrollableDist = rect.height - window.innerHeight;
      const targetY = sceneTop + (index / 4) * scrollableDist;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  });
});

// Manual swipe gesture navigation on mobile card container (horizontal swipe left/right for card exchange)
(function initMobileCardGestures() {
  const visualContainer = document.getElementById('tab-visuals');
  if (!visualContainer) return;

  let startX = 0;
  let startY = 0;

  visualContainer.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
  }, { passive: true });

  visualContainer.addEventListener('touchend', (e) => {
    if (window.innerWidth > 992 || !e.changedTouches || e.changedTouches.length === 0) return;
    const diffX = e.changedTouches[0].clientX - startX;
    const diffY = e.changedTouches[0].clientY - startY;

    // Detect horizontal swipe (horizontal movement exceeds vertical movement and is > 35px)
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < -35) {
        // Swipe left -> Next card
        const nextIdx = Math.min(activeTabIndex + 1, panels.length - 1);
        if (nextIdx !== activeTabIndex) {
          switchTab(nextIdx, 'down');
        }
      } else if (diffX > 35) {
        // Swipe right -> Previous card
        const prevIdx = Math.max(activeTabIndex - 1, 0);
        if (prevIdx !== activeTabIndex) {
          switchTab(prevIdx, 'up');
        }
      }
    }
  }, { passive: true });
})();

// Scroll-driven pinned sequence controller (Discrete scroll phases on mobile & desktop)
(function initPlatformScroll() {
  const scene = document.getElementById('wq-platform-scene');
  if (!scene) return;

  let lastY = window.scrollY;
  let ticking = false;

  function handleScroll() {
    const currentY = window.scrollY;
    const direction = currentY >= lastY ? 'down' : 'up';
    lastY = currentY;

    const rect = scene.getBoundingClientRect();
    const sceneHeight = rect.height;
    const windowH = window.innerHeight;
    const scrollableDist = sceneHeight - windowH;

    if (scrollableDist <= 0) return;

    if (window.innerWidth <= 992) {
      // Mobile 11-phase scroll progression:
      // State 0: Initial state (No cards, all 5 options clean)
      // State 1: Card 1 active
      // State 2: Card 1 exited
      // State 3: Card 2 active
      // State 4: Card 2 exited
      // State 5: Card 3 active
      // State 6: Card 3 exited
      // State 7: Card 4 active
      // State 8: Card 4 exited
      // State 9: Card 5 active
      // State 10: ONE PLATFORM complete -> Immediately starts next section with zero gap
      const progress = Math.min(Math.max(-rect.top / scrollableDist, 0), 1);

      let mobileStage = -1; // -1 means no card
      if (progress >= 0.04 && progress < 0.20) {
        mobileStage = 0; // State 1: Card 1
      } else if (progress >= 0.22 && progress < 0.38) {
        mobileStage = 1; // State 3: Card 2
      } else if (progress >= 0.40 && progress < 0.56) {
        mobileStage = 2; // State 5: Card 3
      } else if (progress >= 0.58 && progress < 0.74) {
        mobileStage = 3; // State 7: Card 4
      } else if (progress >= 0.76 && progress <= 1.0) {
        mobileStage = 4; // State 9: Card 5
      }

      setMobileActiveStage(mobileStage);
    } else {
      // Desktop: Direct scroll-driven progress mapping (0.0 to 1.0) into the 5 discrete features
      const progress = Math.min(Math.max(-rect.top / scrollableDist, 0), 1);
      let targetIndex = Math.min(Math.floor(progress * 5), 4);

      if (targetIndex !== activeTabIndex) {
        switchTab(targetIndex, direction);
      }
    }
  }

  let lastMobileStage = -1;

  function setMobileActiveStage(stage) {
    if (window.innerWidth > 992) return;
    if (stage === lastMobileStage) return; // Prevent unnecessary recalculations and KPI restarts

    const prevStage = lastMobileStage;
    lastMobileStage = stage;

    const stickyContainer = document.querySelector('.wq-platform-sticky');
    if (stickyContainer) {
      stickyContainer.classList.toggle('has-card-active', stage !== -1);
    }

    // Position cards under their respective option button on mobile
    tabs.forEach((tab, index) => {
      const isCurrent = index === stage;
      tab.classList.toggle('active', isCurrent);

      // Ensure each panel is placed in its mobile container slot under the option
      let slot = tab.nextElementSibling;
      if (!slot || !slot.classList.contains('wq-mobile-card-slot')) {
        slot = document.createElement('div');
        slot.className = 'wq-mobile-card-slot';
        tab.parentNode.insertBefore(slot, tab.nextSibling);
      }

      const panel = panels[index];
      if (panel && panel.parentNode !== slot) {
        slot.appendChild(panel);
      }

      if (isCurrent) {
        slot.classList.add('active');
        panel.classList.add('active');
        panel.classList.remove('covered');
        // Pre-reset and trigger KPI number counters only ONCE when entering this stage
        resetCardMetrics(stage);
        setTimeout(() => {
          if (lastMobileStage === stage) {
            triggerCardMetrics(stage);
          }
        }, 120);
      } else {
        slot.classList.remove('active');
        panel.classList.remove('active');
        panel.classList.add('covered');
      }
    });

    if (stage === -1) {
      tabs.forEach(t => t.classList.remove('active'));
    }
  }
  window.setMobileActiveStage = setMobileActiveStage;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', handleScroll, { passive: true });
  handleScroll();
})();

// Intersection / Viewport Visibility Trigger for KPI Counter Animation (Desktop only)
(function initKpiIntersectionObserver() {
  const driverCard = document.querySelector('.driver-nav-card');
  if (!driverCard || !('IntersectionObserver' in window)) return;

  let hasAnimatedThisEntry = false;

  const observer = new IntersectionObserver((entries) => {
    if (window.innerWidth <= 992) return;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!hasAnimatedThisEntry && activeTabIndex === 0) {
          animateDriverMetrics();
          hasAnimatedThisEntry = true;
        }
      } else {
        hasAnimatedThisEntry = false;
      }
    });
  }, {
    threshold: 0.25
  });

  observer.observe(driverCard);
})();

// Tweaks
window.addEventListener('message', e => {
  if (e.data.type === '__activate_edit_mode') document.getElementById('tweaks-panel').style.display = 'block';
  if (e.data.type === '__deactivate_edit_mode') document.getElementById('tweaks-panel').style.display = 'none';
});
window.parent.postMessage({type:'__edit_mode_available'},'*');

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{"accentColor":"#22c55e","heroTagline":"Smarter Waste. Cleaner Cities. Zero Guesswork.","ctaText":"Schedule a Free Demo"}/*EDITMODE-END*/;

function applyTweaks(t){
  document.documentElement.style.setProperty('--green-400', t.accentColor);
  document.documentElement.style.setProperty('--green-300', t.accentColor);
}
applyTweaks(TWEAK_DEFAULTS);

// ── FAQ accordion ──────────────────────────────────────────────
function toggleFaqAcc(btn) {
  var item = btn.closest('.faq-acc-item');
  var body = item.querySelector('.faq-acc-body');
  var inner = item.querySelector('.faq-acc-inner');
  var isOpen = item.classList.contains('faq-open');
  var allItems = document.querySelectorAll('.faq-acc-item');

  allItems.forEach(function(other) {
    if (other !== item && other.classList.contains('faq-open')) {
      closeFaqItem(other);
    }
  });

  if (isOpen) {
    closeFaqItem(item);
  } else {
    openFaqItem(item, body, inner, btn);
  }
}

function openFaqItem(item, body, inner, btn) {
  item.classList.add('faq-open');
  btn.setAttribute('aria-expanded', 'true');
  body.style.maxHeight = inner.scrollHeight + 'px';
}

function closeFaqItem(item) {
  var body = item.querySelector('.faq-acc-body');
  var btn = item.querySelector('.faq-acc-btn');

  item.classList.remove('faq-open');
  btn.setAttribute('aria-expanded', 'false');
  body.style.maxHeight = '0';
}

function filterFaq(clickedBtn, category) {
  var allPills = document.querySelectorAll('.faq-filter-btn');

  allPills.forEach(function(p) {
    p.classList.remove('faq-filter-active');
    p.setAttribute('aria-selected', 'false');
  });

  clickedBtn.classList.add('faq-filter-active');
  clickedBtn.setAttribute('aria-selected', 'true');

  document.querySelectorAll('.faq-acc-item.faq-open').forEach(function(item) {
    closeFaqItem(item);
  });

  var allItems = document.querySelectorAll('.faq-acc-item');
  var visible = 0;

  allItems.forEach(function(item) {
    var cat = item.getAttribute('data-category');
    var show = category === 'all' || cat === category;

    item.style.display = show ? '' : 'none';

    if (show) visible++;
  });

  var noResults = document.getElementById('faq-no-results');
  if (noResults) {
    noResults.style.display = visible === 0 ? 'block' : 'none';
  }
}

window.addEventListener('resize', function() {
  document.querySelectorAll('.faq-acc-item.faq-open').forEach(function(item) {
    var body = item.querySelector('.faq-acc-body');
    var inner = item.querySelector('.faq-acc-inner');

    if (body && inner) {
      body.style.maxHeight = inner.scrollHeight + 'px';
    }
  });
});

