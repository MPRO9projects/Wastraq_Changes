// nmf_blog.js — page-specific behavior for nmf_blog.html
// (Nav/footer are handled by the shared js/shared.js — this file only
// contains genuine page logic: the GSAP/ScrollTrigger reveal animation
// engine for this blog article, gated behind a prefers-reduced-motion
// check.)

    document.addEventListener('DOMContentLoaded', () => {
      // --------------------------------------------------
      // ACCESSIBILITY & ENVIRONMENT CHECKS
      // --------------------------------------------------
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        console.log('WASTRAQ Animations: Reduced motion preferred. Keeping static layout.');
        return;
      }

      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('WASTRAQ Animations: GSAP or ScrollTrigger not loaded.');
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      // Mobile responsive configuration (<768px)
      const isMobile = window.innerWidth <= 768;
      const moveY = isMobile ? 20 : 32;
      const moveX = isMobile ? 16 : 28;
      const staggerTime = isMobile ? 0.08 : 0.12;

      // --------------------------------------------------
      // NAVIGATION SCROLL BEHAVIOR (Hide on scroll down, show on scroll up)
      // --------------------------------------------------
      let lastScrollY = window.scrollY;
      window.addEventListener('scroll', () => {
        const nav = document.getElementById('wq-nav');
        if (!nav) return;
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
          if (currentScrollY > lastScrollY && currentScrollY > 250) {
            gsap.to(nav, { y: -90, duration: 0.35, ease: 'power2.out' });
          } else {
            gsap.to(nav, { y: 0, duration: 0.35, ease: 'power2.out' });
          }
        } else {
          gsap.to(nav, { y: 0, duration: 0.35, ease: 'power2.out' });
        }
        lastScrollY = currentScrollY;
      }, { passive: true });

      // Recalibrate ScrollTrigger positions after page assets load
      window.addEventListener('load', () => {
        ScrollTrigger.refresh();
      });

      // ==================================================
      // SECTION 1 — HERO ANIMATION (TITLE + CONTENT)
      // ==================================================
      const heroSec = document.querySelector('.article-hero');
      if (heroSec) {
        const heroMeta = heroSec.querySelector('.hero-meta');
        const heroTitle = heroSec.querySelector('h1');
        const heroSub = heroSec.querySelector('.hero-subtitle');
        const heroByline = heroSec.querySelector('.hero-byline');

        gsap.set([heroMeta, heroTitle, heroSub, heroByline], { opacity: 0, y: moveY });

        const heroTl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            gsap.set([heroMeta, heroTitle, heroSub, heroByline], { clearProps: 'transform,opacity' });
          }
        });
        heroTl
          .to(heroMeta, { opacity: 1, y: 0, duration: 0.65, delay: 0.1 })
          .to(heroTitle, { opacity: 1, y: 0, duration: 0.85 }, '-=0.35')
          .to(heroSub, { opacity: 1, y: 0, duration: 0.75 }, '-=0.5')
          .to(heroByline, { opacity: 1, y: 0, duration: 0.7 }, '-=0.45');
      }

      // ==================================================
      // SECTION 2 — CAPABILITY / STATS BANNER
      // ==================================================
      const statsBanner = document.querySelector('.stats-banner');
      if (statsBanner) {
        const statItems = statsBanner.querySelectorAll('.stat-item');

        gsap.set(statsBanner, { opacity: 0, y: moveY });
        if (statItems.length) gsap.set(statItems, { opacity: 0, y: moveY });

        const statsTl = gsap.timeline({
          scrollTrigger: {
            trigger: statsBanner,
            start: 'top 85%',
            once: true
          },
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            gsap.set(statsBanner, { clearProps: 'transform,opacity' });
            if (statItems.length) gsap.set(statItems, { clearProps: 'all' });
          }
        });

        statsTl.to(statsBanner, { opacity: 1, y: 0, duration: 0.75 });
        if (statItems.length) {
          statsTl.to(statItems, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: staggerTime
          }, '-=0.4');
        }
      }

      // ==================================================
      // SECTION 3 — TABLE OF CONTENTS
      // ==================================================
      const toc = document.querySelector('.toc');
      if (toc) {
        const tocHeading = toc.querySelector('h4');
        const tocItems = toc.querySelectorAll('li');

        gsap.set(toc, { opacity: 0, y: moveY });
        if (tocHeading) gsap.set(tocHeading, { opacity: 0, y: 15 });
        if (tocItems.length) gsap.set(tocItems, { opacity: 0, x: -15 });

        const tocTl = gsap.timeline({
          scrollTrigger: {
            trigger: toc,
            start: 'top 82%',
            once: true
          },
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            gsap.set(toc, { clearProps: 'transform,opacity' });
            if (tocHeading) gsap.set(tocHeading, { clearProps: 'transform,opacity' });
            if (tocItems.length) gsap.set(tocItems, { clearProps: 'all' });
          }
        });

        tocTl.to(toc, { opacity: 1, y: 0, duration: 0.7 });
        if (tocHeading) tocTl.to(tocHeading, { opacity: 1, y: 0, duration: 0.5 }, '-=0.4');
        if (tocItems.length) {
          tocTl.to(tocItems, {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out'
          }, '-=0.3');
        }
      }

      // ==================================================
      // SECTION 4 — WASTRAQ PLATFORM INTRODUCTION (#problem & #wastraq)
      // ==================================================
      // Sub-section 4A: #problem
      const problemH2 = document.querySelector('#problem');
      if (problemH2) {
        const problemElems = [];
        let curr = problemH2.nextElementSibling;
        while (curr && curr.id !== 'wastraq' && !curr.classList.contains('section-divider')) {
          if (curr.tagName !== 'BR') problemElems.push(curr);
          curr = curr.nextElementSibling;
        }

        gsap.set(problemH2, { opacity: 0, y: moveY });
        problemElems.forEach(el => {
          if (el.tagName === 'IMG') {
            gsap.set(el, { opacity: 0, y: moveY, scale: 0.97 });
          } else if (el.classList.contains('pull-quote')) {
            gsap.set(el, { opacity: 0, x: -moveX });
          } else {
            gsap.set(el, { opacity: 0, y: moveY });
          }
        });

        const problemTl = gsap.timeline({
          scrollTrigger: {
            trigger: problemH2,
            start: 'top 82%',
            once: true
          },
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            gsap.set(problemH2, { clearProps: 'transform,opacity' });
            if (problemElems.length) gsap.set(problemElems, { clearProps: 'transform,opacity' });
          }
        });

        problemTl.to(problemH2, { opacity: 1, y: 0, duration: 0.75 });
        problemElems.forEach((elem) => {
          if (elem.tagName === 'IMG') {
            problemTl.to(elem, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, '-=0.35');
          } else if (elem.classList.contains('pull-quote')) {
            problemTl.to(elem, { opacity: 1, x: 0, duration: 0.8 }, '-=0.3');
          } else {
            problemTl.to(elem, { opacity: 1, y: 0, duration: 0.65 }, '-=0.4');
          }
        });
      }

      // Sub-section 4B: #wastraq
      const wastraqH2 = document.querySelector('#wastraq');
      if (wastraqH2) {
        const featureBox = document.querySelector('.feature-box');
        const featureH4 = featureBox ? featureBox.querySelector('h4') : null;
        const featureItems = featureBox ? featureBox.querySelectorAll('.feature-list li') : [];

        const wastraqElems = [];
        let curr = wastraqH2.nextElementSibling;
        while (curr && curr.id !== 'iot' && !curr.classList.contains('section-divider')) {
          if (curr.tagName !== 'BR') wastraqElems.push(curr);
          curr = curr.nextElementSibling;
        }

        gsap.set(wastraqH2, { opacity: 0, y: moveY });
        if (wastraqElems.length) gsap.set(wastraqElems, { opacity: 0, y: moveY });
        if (featureBox) gsap.set(featureBox, { opacity: 0, y: moveY, scale: 0.98 });
        if (featureH4) gsap.set(featureH4, { opacity: 0, y: 15 });
        if (featureItems.length) gsap.set(featureItems, { opacity: 0, x: -14 });

        const wastraqTl = gsap.timeline({
          scrollTrigger: {
            trigger: wastraqH2,
            start: 'top 82%',
            once: true
          },
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            gsap.set(wastraqH2, { clearProps: 'transform,opacity' });
            if (wastraqElems.length) gsap.set(wastraqElems, { clearProps: 'transform,opacity' });
            if (featureBox) gsap.set(featureBox, { clearProps: 'transform,opacity' });
            if (featureH4) gsap.set(featureH4, { clearProps: 'transform,opacity' });
            if (featureItems.length) gsap.set(featureItems, { clearProps: 'all' });
          }
        });

        wastraqTl.to(wastraqH2, { opacity: 1, y: 0, duration: 0.75 });
        wastraqElems.forEach((elem) => {
          if (elem === featureBox) {
            wastraqTl.to(featureBox, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, '-=0.3');
            if (featureH4) wastraqTl.to(featureH4, { opacity: 1, y: 0, duration: 0.5 }, '-=0.4');
            if (featureItems.length) {
              wastraqTl.to(featureItems, {
                opacity: 1,
                x: 0,
                duration: 0.45,
                stagger: 0.05,
                ease: 'power2.out'
              }, '-=0.3');
            }
          } else {
            wastraqTl.to(elem, { opacity: 1, y: 0, duration: 0.65 }, '-=0.4');
          }
        });
      }

      // ==================================================
      // SECTION 5 — IoT WEIGHMENT (#iot)
      // ==================================================
      const iotH2 = document.querySelector('#iot');
      if (iotH2) {
        const iotSection = document.querySelector('.iot-section');
        const iotSecH3 = iotSection ? iotSection.querySelector('h3') : null;
        const iotSecP = iotSection ? iotSection.querySelector('p') : null;
        const iotCards = iotSection ? iotSection.querySelectorAll('.iot-card') : [];

        const iotParagraphs = [];
        let curr = iotH2.nextElementSibling;
        while (curr && curr !== iotSection && !curr.classList.contains('iot-video-wrapper') && !curr.classList.contains('section-divider')) {
          if (curr.tagName !== 'BR') iotParagraphs.push(curr);
          curr = curr.nextElementSibling;
        }

        gsap.set(iotH2, { opacity: 0, y: moveY });
        if (iotParagraphs.length) gsap.set(iotParagraphs, { opacity: 0, y: moveY });
        if (iotSection) gsap.set(iotSection, { opacity: 0, y: moveY });
        if (iotSecH3) gsap.set(iotSecH3, { opacity: 0, y: 18 });
        if (iotSecP) gsap.set(iotSecP, { opacity: 0, y: 15 });
        if (iotCards.length) gsap.set(iotCards, { opacity: 0, y: moveY });

        const iotTl = gsap.timeline({
          scrollTrigger: {
            trigger: iotH2,
            start: 'top 82%',
            once: true
          },
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            gsap.set(iotH2, { clearProps: 'transform,opacity' });
            if (iotParagraphs.length) gsap.set(iotParagraphs, { clearProps: 'transform,opacity' });
            if (iotSection) gsap.set(iotSection, { clearProps: 'transform,opacity' });
            if (iotSecH3) gsap.set(iotSecH3, { clearProps: 'transform,opacity' });
            if (iotSecP) gsap.set(iotSecP, { clearProps: 'transform,opacity' });
            if (iotCards.length) gsap.set(iotCards, { clearProps: 'all' });
          }
        });

        iotTl.to(iotH2, { opacity: 1, y: 0, duration: 0.75 });
        iotParagraphs.forEach(p => {
          iotTl.to(p, { opacity: 1, y: 0, duration: 0.65 }, '-=0.4');
        });

        if (iotSection) {
          iotTl.to(iotSection, { opacity: 1, y: 0, duration: 0.85 }, '-=0.3');
          if (iotSecH3) iotTl.to(iotSecH3, { opacity: 1, y: 0, duration: 0.5 }, '-=0.5');
          if (iotSecP) iotTl.to(iotSecP, { opacity: 1, y: 0, duration: 0.5 }, '-=0.35');
          if (iotCards.length) {
            iotTl.to(iotCards, {
              opacity: 1,
              y: 0,
              duration: 0.75,
              stagger: staggerTime
            }, '-=0.3');
          }
        }
      }

      // ==================================================
      // SECTION 6 — IoT VIDEO (.iot-video-wrapper)
      // ==================================================
      const videoWrapper = document.querySelector('.iot-video-wrapper');
      if (videoWrapper) {
        let prevP = videoWrapper.previousElementSibling;
        while (prevP && prevP.tagName === 'BR') prevP = prevP.previousElementSibling;

        let nextP = videoWrapper.nextElementSibling;
        const postVideoElems = [];
        while (nextP && !nextP.classList.contains('section-divider') && nextP.id !== 'operations') {
          if (nextP.tagName !== 'BR') postVideoElems.push(nextP);
          nextP = nextP.nextElementSibling;
        }

        if (prevP) gsap.set(prevP, { opacity: 0, y: moveY });
        gsap.set(videoWrapper, { opacity: 0, scale: 0.96, y: moveY });
        if (postVideoElems.length) gsap.set(postVideoElems, { opacity: 0, y: moveY });

        const videoTl = gsap.timeline({
          scrollTrigger: {
            trigger: prevP || videoWrapper,
            start: 'top 82%',
            once: true
          },
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            gsap.set(videoWrapper, { clearProps: 'transform,opacity' });
            if (prevP) gsap.set(prevP, { clearProps: 'transform,opacity' });
            if (postVideoElems.length) gsap.set(postVideoElems, { clearProps: 'transform,opacity' });
          }
        });

        if (prevP) videoTl.to(prevP, { opacity: 1, y: 0, duration: 0.65 });
        videoTl.to(videoWrapper, { opacity: 1, scale: 1, y: 0, duration: 0.9 }, prevP ? '-=0.3' : '+=0');
        postVideoElems.forEach(p => {
          videoTl.to(p, { opacity: 1, y: 0, duration: 0.65 }, '-=0.4');
        });
      }

      // ==================================================
      // SECTION 7 — SMART WASTE COLLECTION / OPERATIONS (#operations)
      // ==================================================
      const opsH2 = document.querySelector('#operations');
      if (opsH2) {
        const opsElems = [];
        let curr = opsH2.nextElementSibling;
        while (curr && curr.id !== 'tracking' && !curr.classList.contains('section-divider')) {
          if (curr.tagName !== 'BR') opsElems.push(curr);
          curr = curr.nextElementSibling;
        }

        gsap.set(opsH2, { opacity: 0, y: moveY });
        opsElems.forEach(el => {
          if (el.classList.contains('pull-quote')) {
            gsap.set(el, { opacity: 0, x: -moveX });
          } else {
            gsap.set(el, { opacity: 0, y: moveY });
          }
        });

        const opsTl = gsap.timeline({
          scrollTrigger: {
            trigger: opsH2,
            start: 'top 82%',
            once: true
          },
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            gsap.set(opsH2, { clearProps: 'transform,opacity' });
            if (opsElems.length) gsap.set(opsElems, { clearProps: 'transform,opacity' });
          }
        });

        opsTl.to(opsH2, { opacity: 1, y: 0, duration: 0.75 });
        opsElems.forEach(el => {
          if (el.classList.contains('pull-quote')) {
            opsTl.to(el, { opacity: 1, x: 0, duration: 0.85 }, '-=0.3');
          } else {
            opsTl.to(el, { opacity: 1, y: 0, duration: 0.65 }, '-=0.4');
          }
        });
      }

      // ==================================================
      // SECTION 8 — GPS FLEET TRACKING (#tracking)
      // ==================================================
      const trackingH2 = document.querySelector('#tracking');
      if (trackingH2) {
        const trackingElems = [];
        let curr = trackingH2.nextElementSibling;
        while (curr && curr.id !== 'kuppam' && !curr.classList.contains('section-divider')) {
          if (curr.tagName !== 'BR') trackingElems.push(curr);
          curr = curr.nextElementSibling;
        }

        gsap.set(trackingH2, { opacity: 0, y: moveY });
        trackingElems.forEach(el => {
          if (el.classList.contains('highlight-card')) {
            gsap.set(el, { opacity: 0, y: moveY, scale: 0.97 });
          } else if (el.classList.contains('pull-quote')) {
            gsap.set(el, { opacity: 0, x: -moveX });
          } else {
            gsap.set(el, { opacity: 0, y: moveY });
          }
        });

        const trackingTl = gsap.timeline({
          scrollTrigger: {
            trigger: trackingH2,
            start: 'top 82%',
            once: true
          },
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            gsap.set(trackingH2, { clearProps: 'transform,opacity' });
            if (trackingElems.length) gsap.set(trackingElems, { clearProps: 'transform,opacity' });
          }
        });

        trackingTl.to(trackingH2, { opacity: 1, y: 0, duration: 0.75 });
        trackingElems.forEach(el => {
          if (el.classList.contains('highlight-card')) {
            trackingTl.to(el, { opacity: 1, y: 0, scale: 1, duration: 0.85 }, '-=0.3');
          } else if (el.classList.contains('pull-quote')) {
            trackingTl.to(el, { opacity: 1, x: 0, duration: 0.8 }, '-=0.3');
          } else {
            trackingTl.to(el, { opacity: 1, y: 0, duration: 0.65 }, '-=0.4');
          }
        });
      }

      // ==================================================
      // SECTION 9 — KUPPAM CASE STUDY (#kuppam) & INNOVATIONS
      // ==================================================
      const kuppamH2 = document.querySelector('#kuppam');
      if (kuppamH2) {
        const kuppamImg = document.querySelector('img[src*="MRF.jpeg"]');
        const caseStudy = document.querySelector('.case-study');
        const caseHeader = caseStudy ? caseStudy.querySelector('.case-study-header') : null;
        const caseBodyParagraphs = caseStudy ? caseStudy.querySelectorAll('.case-study-body > p') : [];
        const caseChips = caseStudy ? caseStudy.querySelectorAll('.result-chip') : [];

        const kuppamIntroP = [];
        let curr = kuppamH2.nextElementSibling;
        while (curr && curr !== caseStudy && !curr.classList.contains('section-divider')) {
          if (curr.tagName !== 'BR') kuppamIntroP.push(curr);
          curr = curr.nextElementSibling;
        }

        const kuppamPostP = [];
        curr = caseStudy ? caseStudy.nextElementSibling : null;
        while (curr && curr.id !== 'innovations' && !curr.classList.contains('section-divider')) {
          if (curr.tagName !== 'BR') kuppamPostP.push(curr);
          curr = curr.nextElementSibling;
        }

        gsap.set(kuppamH2, { opacity: 0, y: moveY });
        if (kuppamIntroP.length) gsap.set(kuppamIntroP, { opacity: 0, y: moveY });
        if (caseStudy) gsap.set(caseStudy, { opacity: 0, y: moveY });
        if (caseHeader) gsap.set(caseHeader, { opacity: 0, y: 15 });
        if (caseBodyParagraphs.length) gsap.set(caseBodyParagraphs, { opacity: 0, y: 15 });
        if (caseChips.length) gsap.set(caseChips, { opacity: 0, scale: 0.9, y: 18 });
        if (kuppamPostP.length) gsap.set(kuppamPostP, { opacity: 0, y: moveY });

        const kuppamTl = gsap.timeline({
          scrollTrigger: {
            trigger: kuppamH2,
            start: 'top 82%',
            once: true
          },
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            gsap.set(kuppamH2, { clearProps: 'transform,opacity' });
            if (kuppamIntroP.length) gsap.set(kuppamIntroP, { clearProps: 'transform,opacity' });
            if (kuppamPostP.length) gsap.set(kuppamPostP, { clearProps: 'transform,opacity' });
            if (caseStudy) gsap.set(caseStudy, { clearProps: 'transform,opacity' });
            if (caseHeader) gsap.set(caseHeader, { clearProps: 'transform,opacity' });
            if (caseBodyParagraphs.length) gsap.set(caseBodyParagraphs, { clearProps: 'transform,opacity' });
            if (caseChips.length) gsap.set(caseChips, { clearProps: 'all' });
          }
        });

        kuppamTl.to(kuppamH2, { opacity: 1, y: 0, duration: 0.75 });
        kuppamIntroP.forEach(p => {
          if (p === kuppamImg) {
            kuppamTl.to(p, { opacity: 1, scale: 1, y: 0, duration: 0.85 }, '-=0.3');
          } else {
            kuppamTl.to(p, { opacity: 1, y: 0, duration: 0.65 }, '-=0.4');
          }
        });

        if (caseStudy) {
          kuppamTl.to(caseStudy, { opacity: 1, y: 0, duration: 0.85 }, '-=0.3');
          if (caseHeader) kuppamTl.to(caseHeader, { opacity: 1, y: 0, duration: 0.5 }, '-=0.5');
          caseBodyParagraphs.forEach(p => {
            kuppamTl.to(p, { opacity: 1, y: 0, duration: 0.55 }, '-=0.35');
          });
          if (caseChips.length) {
            kuppamTl.to(caseChips, {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.15,
              ease: 'back.out(1.2)',
              onStart: () => animateCaseStudyNumbers()
            }, '-=0.2');
          }
        }

        kuppamPostP.forEach(p => {
          kuppamTl.to(p, { opacity: 1, y: 0, duration: 0.65 }, '-=0.3');
        });
      }

      // Innovations Sub-section
      const innovationsH2 = document.querySelector('#innovations');
      if (innovationsH2) {
        const innovationGrid = document.querySelector('.innovation-grid');
        const innovationBadges = innovationGrid ? innovationGrid.querySelectorAll('.innovation-badge') : [];

        const innovationElems = [];
        let curr = innovationsH2.nextElementSibling;
        while (curr && curr.id !== 'global' && !curr.classList.contains('section-divider')) {
          if (curr.tagName !== 'BR') innovationElems.push(curr);
          curr = curr.nextElementSibling;
        }

        gsap.set(innovationsH2, { opacity: 0, y: moveY });
        if (innovationElems.length) gsap.set(innovationElems, { opacity: 0, y: moveY });
        if (innovationBadges.length) gsap.set(innovationBadges, { opacity: 0, y: moveY });

        const innovTl = gsap.timeline({
          scrollTrigger: {
            trigger: innovationsH2,
            start: 'top 82%',
            once: true
          },
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            gsap.set(innovationsH2, { clearProps: 'transform,opacity' });
            if (innovationElems.length) gsap.set(innovationElems, { clearProps: 'transform,opacity' });
            if (innovationBadges.length) gsap.set(innovationBadges, { clearProps: 'all' });
          }
        });

        innovTl.to(innovationsH2, { opacity: 1, y: 0, duration: 0.75 });
        innovationElems.forEach(el => {
          if (el === innovationGrid) {
            if (innovationBadges.length) {
              innovTl.to(innovationBadges, {
                opacity: 1,
                y: 0,
                duration: 0.75,
                stagger: staggerTime
              }, '-=0.3');
            }
          } else {
            innovTl.to(el, { opacity: 1, y: 0, duration: 0.65 }, '-=0.4');
          }
        });
      }

      // Global Section
      const globalH2 = document.querySelector('#global');
      if (globalH2) {
        const globalSection = document.querySelector('.global-section');

        const globalElems = [];
        let curr = globalH2.nextElementSibling;
        while (curr && curr.id !== 'cta' && !curr.classList.contains('cta-section')) {
          if (curr.tagName !== 'BR') globalElems.push(curr);
          curr = curr.nextElementSibling;
        }

        gsap.set(globalH2, { opacity: 0, y: moveY });
        if (globalElems.length) gsap.set(globalElems, { opacity: 0, y: moveY });

        const globalTl = gsap.timeline({
          scrollTrigger: {
            trigger: globalH2,
            start: 'top 82%',
            once: true
          },
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            gsap.set(globalH2, { clearProps: 'transform,opacity' });
            if (globalElems.length) gsap.set(globalElems, { clearProps: 'transform,opacity' });
            if (globalSection) gsap.set(globalSection, { clearProps: 'transform,opacity' });
          }
        });

        globalTl.to(globalH2, { opacity: 1, y: 0, duration: 0.75 });
        globalElems.forEach(el => {
          if (el === globalSection) {
            const secCards = globalSection.querySelectorAll('.step-card');
            gsap.set(globalSection, { opacity: 0, y: moveY });
            if (secCards.length) gsap.set(secCards, { opacity: 0, y: moveY });
            globalTl.to(globalSection, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3');
            if (secCards.length) {
              globalTl.to(secCards, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: staggerTime
              }, '-=0.4');
            }
          } else if (el.classList.contains('process-steps')) {
            const stepCards = el.querySelectorAll('.step-card');
            if (stepCards.length) {
              gsap.set(stepCards, { opacity: 0, y: moveY });
              globalTl.to(stepCards, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: staggerTime
              }, '-=0.3');
            }
          } else {
            globalTl.to(el, { opacity: 1, y: 0, duration: 0.65 }, '-=0.4');
          }
        });
      }

      // Smooth count-up animation for case study numbers
      function animateCaseStudyNumbers() {
        const numElements = document.querySelectorAll('.result-chip .num');
        numElements.forEach(el => {
          const rawText = el.textContent.trim();
          if (rawText.includes('100+')) {
            const counter = { value: 0 };
            gsap.to(counter, {
              value: 100,
              duration: 1.6,
              ease: 'power2.out',
              onUpdate: () => { el.textContent = Math.floor(counter.value) + '+'; }
            });
          } else if (rawText.includes('48')) {
            const counter = { value: 0 };
            gsap.to(counter, {
              value: 48,
              duration: 1.6,
              ease: 'power2.out',
              onUpdate: () => { el.textContent = '<' + Math.floor(counter.value) + 'h'; }
            });
          } else if (rawText.includes('100%')) {
            const counter = { value: 0 };
            gsap.to(counter, {
              value: 100,
              duration: 1.6,
              ease: 'power2.out',
              onUpdate: () => { el.textContent = Math.floor(counter.value) + '%'; }
            });
          }
        });
      }

      // ==================================================
      // SECTION 10 — CTA / FINAL SECTION (#cta) & AUTHOR BOX
      // ==================================================
      const ctaSection = document.querySelector('#cta');
      if (ctaSection) {
        const ctaH2 = ctaSection.querySelector('h2');
        const ctaP = ctaSection.querySelector('p');
        const ctaButtons = ctaSection.querySelectorAll('.btn-primary, .btn-secondary');
        const authorBox = document.querySelector('.author-box');
        const authorAvatar = authorBox ? authorBox.querySelector('.author-avatar') : null;
        const authorInfo = authorBox ? authorBox.querySelector('.author-info') : null;

        gsap.set(ctaSection, { opacity: 0, y: moveY, scale: 0.98 });
        if (ctaH2) gsap.set(ctaH2, { opacity: 0, y: 20 });
        if (ctaP) gsap.set(ctaP, { opacity: 0, y: 15 });
        if (ctaButtons.length) gsap.set(ctaButtons, { opacity: 0, y: 18 });
        if (authorBox) gsap.set(authorBox, { opacity: 0, y: moveY });
        if (authorAvatar) gsap.set(authorAvatar, { opacity: 0, scale: 0.8 });
        if (authorInfo) gsap.set(authorInfo, { opacity: 0, y: 15 });

        const ctaTl = gsap.timeline({
          scrollTrigger: {
            trigger: ctaSection,
            start: 'top 82%',
            once: true
          },
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            gsap.set(ctaSection, { clearProps: 'transform,opacity' });
            if (ctaH2) gsap.set(ctaH2, { clearProps: 'transform,opacity' });
            if (ctaP) gsap.set(ctaP, { clearProps: 'transform,opacity' });
            if (ctaButtons.length) gsap.set(ctaButtons, { clearProps: 'all' });
            if (authorBox) gsap.set([authorBox, authorAvatar, authorInfo], { clearProps: 'transform,opacity' });
          }
        });

        ctaTl.to(ctaSection, { opacity: 1, y: 0, scale: 1, duration: 0.85 });
        if (ctaH2) ctaTl.to(ctaH2, { opacity: 1, y: 0, duration: 0.6 }, '-=0.45');
        if (ctaP) ctaTl.to(ctaP, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');
        if (ctaButtons.length) {
          ctaTl.to(ctaButtons, {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.12,
            ease: 'power2.out'
          }, '-=0.3');
        }

        if (authorBox) {
          ctaTl.to(authorBox, { opacity: 1, y: 0, duration: 0.8 }, '-=0.2');
          if (authorAvatar) ctaTl.to(authorAvatar, { opacity: 1, scale: 1, duration: 0.5 }, '-=0.4');
          if (authorInfo) ctaTl.to(authorInfo, { opacity: 1, y: 0, duration: 0.5 }, '-=0.35');
        }
      }
    });
