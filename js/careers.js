/* ════════════════════════════════════════════════
   WASTRAQ CAREERS STANDALONE JAVASCRIPT
════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── API Configuration ────────────────────────── */
  var WASTRAQ_API = (window.WASTRAQ_API_BASE || 'https://backend.wastraq.com');

  /* ── Department Filter Function ────────────────── */
  window.filterJobs = function (btn, dept) {
    /* Update button states */
    document.querySelectorAll('.car-dept-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');

    /* Filter job cards */
    var cards = document.querySelectorAll('.car-job-card');
    var visible = 0;

    cards.forEach(function (card) {
      var match = (dept === 'all' || card.getAttribute('data-dept') === dept);
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });

    /* Update count and no-match message */
    var countEl = document.getElementById('job-count');
    if (countEl) countEl.textContent = visible;

    var noMatch = document.getElementById('car-no-match');
    if (noMatch) noMatch.style.display = (visible === 0) ? 'block' : 'none';
  };

  /* ── Form Submission Handler ────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var formEl = document.getElementById('career-form');
    if (!formEl) return;

    formEl.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstName = document.getElementById('cf-name').value.trim();
      var lastName  = document.getElementById('cf-lname').value.trim();
      var email     = document.getElementById('cf-email').value.trim();
      var position  = document.getElementById('cf-role').value;
      var cover     = document.getElementById('cf-message').value.trim();

      if (!firstName || !lastName || !email || !position || !cover) {
        alert('Please fill in all required fields.');
        return;
      }

      var phoneVal  = document.getElementById('cf-phone').value.trim();
      var btn       = document.getElementById('cf-submit-btn');
      btn.disabled  = true;
      btn.innerHTML = 'Submitting…';

      var payload = {
        name:      firstName + ' ' + lastName,
        email:     email,
        phone:     phoneVal ? "'" + phoneVal : "",
        position:  position,
        linkedin:  document.getElementById('cf-linkedin').value.trim(),
        coverNote: cover,
      };

      fetch(WASTRAQ_API + '/api/forms/careers', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Server error ' + res.status);
          return res.json();
        })
        .then(function (json) {
          if (json.success) {
            document.getElementById('career-form').style.display          = 'none';
            document.getElementById('career-success-state').style.display = 'block';
          } else {
            throw new Error(json.message || 'Submission failed');
          }
        })
        .catch(function (err) {
          btn.disabled  = false;
          btn.innerHTML = 'Send Application';
          alert('Submission failed. Please email info@wastraq.com');
          console.error('Careers form error:', err);
        });
    });
  });

  /* ── GSAP & ScrollTrigger Animations ────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    if (typeof gsap === 'undefined') return;

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.querySelectorAll('.car-hero-line, .car-hero-tag, .car-hero-desc, .car-hero-actions, .car-hero-stats, .car-benefit-card, .car-job-card, .car-process-step, .car-apply-info, .car-apply-form-card').forEach(function(el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    /* Hero Entrance Animation */
    var isMobile = window.innerWidth < 768;
    var headXOffset = isMobile ? 35 : 140;

    var heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (document.getElementById('car-hero-tag')) {
      heroTl.from('#car-hero-tag', { duration: 0.45, opacity: 0, y: -15 })
            .from('#car-hero-line1', { duration: 0.65, x: -headXOffset, opacity: 0 }, '-=0.2')
            .from('#car-hero-line2', { duration: 0.65, x: headXOffset, opacity: 0 }, '-=0.45')
            .from('#car-hero-desc', { duration: 0.55, y: 30, opacity: 0 }, '-=0.25')
            .from('#car-hero-actions', { duration: 0.5, y: 20, opacity: 0 }, '-=0.2')
            .from('#car-hero-stats', { duration: 0.5, y: 20, opacity: 0 }, '-=0.2');
    }

    /* Why WASTRAQ / Benefits Cards (Desktop Pinned vs Mobile Vertical) */
    if (window.ScrollTrigger) {
      gsap.matchMedia().add('(min-width: 901px)', function () {
        var section = document.getElementById('car-benefits-section');
        var cards = document.querySelectorAll('#car-benefits-stage .car-benefit-card');
        var dots = document.querySelectorAll('.car-benefits-dots .dot');

        if (!section || cards.length === 0) return;

        var numCards = cards.length;

        function setActiveCard(index) {
          cards.forEach(function (card, i) {
            if (i === index) {
              card.classList.add('active');
            } else {
              card.classList.remove('active');
            }
          });
          dots.forEach(function (dot, i) {
            if (i === index) {
              dot.classList.add('active');
            } else {
              dot.classList.remove('active');
            }
          });
        }

        cards.forEach(function (card, idx) {
          card.addEventListener('click', function () {
            setActiveCard(idx);
          });
        });

        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: '+=' + (numCards * 40) + '%',
          pin: true,
          scrub: 0.4,
          anticipatePin: 1,
          onUpdate: function (self) {
            var progress = self.progress;
            var activeIdx = Math.floor(progress * numCards);
            if (activeIdx >= numCards) activeIdx = numCards - 1;
            setActiveCard(activeIdx);
          }
        });
      });

      gsap.matchMedia().add('(max-width: 900px)', function () {
        gsap.from('#car-benefits-stage .car-benefit-card', {
          scrollTrigger: { trigger: '#car-benefits-section', start: 'top 85%' },
          duration: 0.5,
          opacity: 0,
          y: 25,
          stagger: 0.08,
          ease: 'power2.out'
        });
      });

      /* Culture / How We Work Text Reveal */
      var cultureTextEl = document.querySelector('.car-culture-text');
      if (cultureTextEl) {
        var cultureTextTl = gsap.timeline({
          scrollTrigger: { trigger: '.car-culture-text', start: 'top 82%' }
        });
        cultureTextTl
          .from('.car-culture-text .wq-section-tag', { duration: 0.45, opacity: 0, y: -15 })
          .from('#culture-heading', { duration: 0.55, opacity: 0, y: 25 }, '-=0.25')
          .from('.car-culture-text p', { duration: 0.5, opacity: 0, y: 20, stagger: 0.1 }, '-=0.3')
          .from('.car-culture-pill', { duration: 0.4, opacity: 0, y: 10, stagger: 0.06, ease: 'power2.out' }, '-=0.2');
      }

      /* Culture Cards Entrance */
      gsap.matchMedia().add('(min-width: 769px)', function () {
        var cultureCards = gsap.utils.toArray('.car-culture-card');
        if (cultureCards.length === 0) return;

        gsap.set(cultureCards, {
          x: function (i) { return 55 + i * 10; },
          y: function (i) { return 70 + i * 15; },
          opacity: 0,
          scale: 0.96
        });

        var cultureTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.car-culture-grid',
            start: 'top 75%',
            end: 'bottom 45%',
            scrub: 0.5
          }
        });

        cultureCards.forEach(function (card, i) {
          cultureTl.to(card, {
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            ease: 'power3.out'
          }, i * 0.18);
        });
      });

      gsap.matchMedia().add('(max-width: 768px)', function () {
        gsap.from('.car-culture-card', {
          scrollTrigger: { trigger: '.car-culture-visual', start: 'top 85%' },
          duration: 0.5,
          opacity: 0,
          y: 25,
          stagger: 0.08,
          ease: 'power2.out'
        });
      });

      /* Open Positions Cards Reveal */
      var jobsListEl = document.getElementById('jobs-list');
      if (jobsListEl) {
        gsap.from('.car-job-card', {
          scrollTrigger: { trigger: '#jobs-list', start: 'top 85%' },
          duration: 0.5,
          opacity: 0,
          y: 20,
          stagger: 0.08,
          ease: 'power2.out'
        });
      }

      /* Hiring Process Journey */
      if (!isMobile) {
        var processSec = document.getElementById('process-section');
        var lineFill = document.getElementById('process-line-fill');
        var steps = document.querySelectorAll('.car-process-step');

        if (processSec && lineFill && steps.length > 0) {
          var processTl = gsap.timeline({
            scrollTrigger: {
              trigger: processSec,
              start: 'top top',
              end: '+=120%',
              pin: true,
              scrub: 0.6,
              anticipatePin: 1
            }
          });

          processTl.to(steps[0], { opacity: 1, scale: 1.04, duration: 0.2 }, 0)
                   .to(lineFill, { scaleX: 0.33, duration: 0.5, ease: 'none' })
                   .to(steps[1], { opacity: 1, scale: 1.04, duration: 0.3 }, '-=0.2')
                   .to(lineFill, { scaleX: 0.66, duration: 0.5, ease: 'none' })
                   .to(steps[2], { opacity: 1, scale: 1.04, duration: 0.3 }, '-=0.2')
                   .to(lineFill, { scaleX: 1.0, duration: 0.5, ease: 'none' })
                   .to(steps[3], { opacity: 1, scale: 1.04, duration: 0.3 }, '-=0.2');

          ScrollTrigger.create({
            trigger: processSec,
            start: 'top top',
            end: '+=120%',
            onUpdate: function(self) {
              var prog = self.progress;
              steps.forEach(function(step, idx) {
                var threshold = idx / (steps.length - 1);
                if (prog >= threshold - 0.12) {
                  step.classList.add('active');
                } else {
                  step.classList.remove('active');
                }
              });
            }
          });
        }
      } else {
        document.querySelectorAll('.car-process-step').forEach(function(step) {
          gsap.to(step, {
            scrollTrigger: { trigger: step, start: 'top 85%' },
            opacity: 1,
            scale: 1,
            duration: 0.45
          });
        });
      }

      /* Application Form Entrance */
      var applySecEl = document.querySelector('.car-apply-section');
      if (applySecEl) {
        gsap.from('.car-apply-info', {
          scrollTrigger: { trigger: '.car-apply-section', start: 'top 80%' },
          duration: 0.6,
          opacity: 0,
          y: 30,
          ease: 'power2.out'
        });

        gsap.from('.car-apply-form-card', {
          scrollTrigger: { trigger: '.car-apply-section', start: 'top 80%' },
          duration: 0.6,
          opacity: 0,
          y: 30,
          ease: 'power2.out',
          onComplete: function() {
            gsap.from('.car-form-group', {
              duration: 0.35,
              opacity: 0,
              y: 15,
              stagger: 0.06,
              ease: 'power2.out'
            });
          }
        });
      }
    }
  });

})();
