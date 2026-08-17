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
 * - Logo glides to top-left and settles.
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
    document.body.classList.add('intro-active');
    document.body.classList.add('hero-pending');
    initLandfillTypewriter();
    initIntroInteractions();
  });

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
  // Skips straight to the finished state instead of making them wait it out.
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

    // Reveal the rest of the hero content immediately alongside the completed
    // headline — no staggered wait, since the user is already scrolling on.
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

      // Step 1: Logo + WASTRAQ appear together in the center
      introExperience.classList.add('intro-dismissed');
      document.body.classList.remove('intro-active');
      document.body.classList.add('hero-pending');

      if (flyingLogo) {
        flyingLogo.style.display = 'block';
        flyingLogo.style.opacity = '1';
        flyingLogo.style.visibility = 'visible';
        flyingLogo.classList.remove('flying-to-nav');
        flyingLogo.classList.remove('text-faded-out');
        flyingLogo.classList.remove('rotating-360');
        flyingLogo.classList.add('animating-center');

        // Trigger visible 360° rotation in center on scroll while WASTRAQ text stays visible
        setTimeout(() => {
          flyingLogo.classList.add('rotating-360');
          flyingLogo.classList.add('circuit-active');
        }, 100);
      }

      // Step 2: 360° rotation completes in center (1350ms) -> text & circuits smoothly fade
      setTimeout(() => {
        if (flyingLogo) {
          flyingLogo.classList.add('text-faded-out');
          flyingLogo.classList.remove('circuit-active');
        }
      }, 1350);

      // Step 3: Rotation fully finished -> Smoothly move & scale ONLY the logo toward top-left navbar position (1450ms)
      setTimeout(() => {
        if (flyingLogo) {
          flyingLogo.classList.remove('animating-center');
          flyingLogo.classList.add('flying-to-nav');
        }
      }, 1450);

      // Step 4: Logo settles in top-left (2150ms) -> Navbar smoothly slides/expands out directly from the logo (2180ms)
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

      // Reverse Step 1: Hero text, subtitle, and actions smoothly fade out
      document.body.classList.remove('hero-revealed');
      if (heroSubtitle) heroSubtitle.classList.remove('visible');
      if (heroActions) heroActions.classList.remove('visible');
      if (heroPills) heroPills.classList.remove('visible');
      isHeroTyped = false;

      // Reverse Step 2: Navbar smoothly retracts and slides back into the settled logo (550ms)
      document.body.classList.add('nav-retracting');
      document.body.classList.remove('navbar-settled');

      if (flyingLogo) {
        flyingLogo.style.display = 'block';
        flyingLogo.style.opacity = '1';
        flyingLogo.style.visibility = 'visible';
        flyingLogo.classList.remove('animating-center');
        flyingLogo.classList.add('flying-to-nav');
        flyingLogo.classList.add('text-faded-out');
        flyingLogo.classList.add('rotating-360');
      }

      // Reverse Step 3: Logo smoothly glides from top-left back to its original centered position (550ms)
      setTimeout(() => {
        document.body.classList.remove('nav-retracting');
        document.body.classList.add('hero-pending');

        if (flyingLogo) {
          flyingLogo.classList.remove('flying-to-nav');
          flyingLogo.classList.add('animating-center');
        }
      }, 550);

      // Reverse Step 4: Centered WASTRAQ text smoothly reappears + logo rotates smoothly back (1300ms)
      setTimeout(() => {
        if (flyingLogo) {
          flyingLogo.classList.remove('text-faded-out');
          flyingLogo.classList.add('circuit-active');
          flyingLogo.classList.remove('rotating-360');
        }
      }, 1300);

      // Reverse Step 5: Retract circuits into logo as landfill intro screen smoothly slides back down (2000ms)
      setTimeout(() => {
        if (flyingLogo) {
          flyingLogo.classList.remove('circuit-active');
        }
        introExperience.classList.remove('intro-dismissed');
      }, 2000);

      // Reverse Step 6: Clean reset of all state variables & start typewriter automatically from beginning on landfill page (2700ms)
      setTimeout(() => {
        document.body.classList.add('intro-active');
        document.body.classList.remove('hero-pending');
        if (flyingLogo) {
          flyingLogo.style.display = 'none';
          flyingLogo.style.opacity = '0';
          flyingLogo.style.visibility = 'hidden';
          flyingLogo.classList.remove('animating-center');
          flyingLogo.classList.remove('circuit-active');
          flyingLogo.classList.remove('text-faded-out');
          flyingLogo.classList.remove('rotating-360');
        }
        isIntroDismissed = false;
        isTransitioning = false;

        // Restart typewriter automatically from beginning
        initLandfillTypewriter();
      }, 2700);
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
        // Scrolling on while the hero headline is still typing: finish it
        // instantly and reveal the rest of the hero content, don't make the
        // user wait — the page keeps scrolling normally either way.
        if (e.deltaY > 0 && !isHeroTyped) {
          completeHeroTypingInstantly();
        }

        // Intro dismissed: if at top of page and user scrolls up, reverse back to intro
        if (window.scrollY <= 0 && e.deltaY < -18) {
          executeReverseTransition();
        }
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

        if (window.scrollY <= 0 && diffY < -35) {
          executeReverseTransition();
        }
      }
    }, { passive: true });

    // Fallback scroll listener
    window.addEventListener('scroll', () => {
      if (!isIntroDismissed && !isTransitioning && window.scrollY > 20) {
        executeForwardTransition();
        return;
      }

      // Catches scroll methods the wheel/touch handlers above can miss
      // (keyboard Page Down/Space, scrollbar drag, momentum scrolling).
      if (isIntroDismissed && !isHeroTyped && window.scrollY > 0) {
        completeHeroTypingInstantly();
      }
    }, { passive: true });
  }

})();
