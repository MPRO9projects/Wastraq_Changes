// kuppam_blog.js — page-specific behavior for kuppam_blog.html
// (Nav/footer are handled by the shared js/shared.js — this file only
// contains genuine page logic: scroll progress bar, reveal-on-scroll
// animations, stat counters, the timeline SVG path-draw animation,
// photo/diff-row reveals, and the case-study card autoscroll.)

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
