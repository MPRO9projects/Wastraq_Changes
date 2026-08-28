// enterprise.js — page-specific behavior for enterprise.html
// (Nav/footer are handled by the shared js/shared.js — this file only
// contains genuine enterprise-page logic: Lenis smooth scroll, GSAP
// ScrollTrigger cinematic transitions, count-up stats, dashboard chart,
// process/traceability step animations, and auto-cycling cards.)

document.addEventListener('DOMContentLoaded', function() {

  // ── Lenis Smooth Scroll Setup ─────────────────────────────
  if (typeof Lenis !== 'undefined') {
    var lenis = new Lenis({
      duration: 1.2,
      easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      touchMultiplier: 1.5
    });
    lenis.on('scroll', function() {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
    });
    if (typeof gsap !== 'undefined') {
      gsap.ticker.add(function(time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // ── GSAP + ScrollTrigger Cinematic Section Transitions ─────
  function initCinematicScrollTransitions() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    if (window.innerWidth <= 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var sections = gsap.utils.toArray('section');
    sections.forEach(function(sec, i) {
      // Outgoing section: slight scale down + move upward (works scrolling UP and DOWN)
      if (i < sections.length - 1) {
        gsap.to(sec, {
          scale: 0.96,
          opacity: 0.88,
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: sec,
            start: 'bottom 95%',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true
          }
        });
      }

      // Incoming section: clip-path expansion + scale up from 0.96 to 1 (works scrolling UP and DOWN)
      if (i > 0) {
        gsap.fromTo(sec, {
          scale: 0.96,
          yPercent: 8,
          clipPath: 'inset(24px round 20px)'
        }, {
          scale: 1,
          yPercent: 0,
          clipPath: 'inset(0px round 0px)',
          ease: 'none',
          scrollTrigger: {
            trigger: sec,
            start: 'top bottom',
            end: 'top 15%',
            scrub: true,
            invalidateOnRefresh: true
          }
        });
      }

      // Ambient Background Parallax (20-30% slower)
      var bg = sec.querySelector('.hero-grid-bg, .esg-bg-grid, .hero-glow');
      if (bg) {
        gsap.to(bg, {
          yPercent: -20,
          ease: 'none',
          scrollTrigger: {
            trigger: sec,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      }

      // Visual Elements Parallax Depth
      var visual = sec.querySelector('#hero-visual, .cc-widget, .dash-slide-left, .mrf-op-grid, .ai-vision-stream, .logistics-map, .esg-kpi-grid, .trace-outer-grid, .benefit-grid');
      if (visual) {
        gsap.fromTo(visual, {
          y: 35,
          scale: 0.97
        }, {
          y: -15,
          scale: 1.0,
          ease: 'none',
          scrollTrigger: {
            trigger: sec,
            start: 'top 85%',
            end: 'bottom 15%',
            scrub: 1
          }
        });
      }

      // Text & Button Staggered Reveals (replays scrolling UP and DOWN)
      var textElems = sec.querySelectorAll('.t-eyebrow, .t-h1, .t-h2, .t-body, .t-body-hero, .hero-btns, .btn');
      if (textElems.length) {
        gsap.fromTo(textElems, {
          y: 30,
          opacity: 0
        }, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sec,
            start: 'top 78%',
            toggleActions: 'restart reverse restart reverse'
          }
        });
      }
    });
  }

  // ── Mouse Pointer Parallax (Hero Visual) ────────────────────
  function initMouseParallax() {
    if (window.innerWidth <= 768 || typeof gsap === 'undefined') return;
    var heroVisual = document.getElementById('hero-visual');
    if (!heroVisual) return;

    window.addEventListener('mousemove', function(e) {
      var cx = window.innerWidth / 2;
      var cy = window.innerHeight / 2;
      var dx = (e.clientX - cx) / cx;
      var dy = (e.clientY - cy) / cy;

      gsap.to(heroVisual, {
        x: dx * 8,
        y: dy * 8,
        duration: 0.8,
        ease: 'power2.out'
      });
    });
  }

  initCinematicScrollTransitions();
  initMouseParallax();

  // ── Scroll Progress Bar ────────────────────────────────────
  var pb = document.getElementById('scroll-progress');
  if (pb) {
    window.addEventListener('scroll', function() {
      var s = window.scrollY, m = document.documentElement.scrollHeight - window.innerHeight;
      pb.style.width = (m > 0 ? (s / m * 100) : 0) + '%';
    }, { passive: true });
  }

  // ── Universal Reveal & Card Scroll Observer (Works Scrolling UP & DOWN) ──
  var ro = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { 
        e.target.classList.add('in-view'); 
      } else {
        e.target.classList.remove('in-view');
      }
    });
  }, { threshold: 0.05, rootMargin: '60px 0px 60px 0px' });

  var cardSelectors = [
    '.reveal',
    '.metric-cell',
    '.cc-widget',
    '.dash-slide-left',
    '.slide-from-left',
    '.slide-from-right',
    '.cap-card',
    '.industry-card',
    '.mrf-op-card',
    '.esg-kpi-card',
    '.benefit-card',
    '.step-item',
    '.trace-step',
    '.card',
    '.intel-bullet',
    '.ai-feature',
    '.feature-item',
    '.industry-grid',
    '#benefit-grid',
    '.esg-metrics-panel',
    '.mrf-op-grid',
    '.process-step'
  ].join(',');

  document.querySelectorAll(cardSelectors).forEach(function(el) {
    ro.observe(el);
  });

  // ── Count-up Animation ─────────────────────────────────────
  var co = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      var el = e.target;
      if (e.isIntersecting) {
        if (!el.dataset.animating) {
          el.dataset.animating = 'true';
          var t = parseFloat(el.dataset.target), s = el.dataset.suffix || '';
          var isF = String(t).includes('.'), isTh = t >= 1000, start = 0, dur = 1600;
          
          function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1), ease = 1 - Math.pow(1 - p, 3), cur = t * ease;
            el.textContent = isF ? cur.toFixed(1) + s : isTh ? Math.round(cur).toLocaleString() + s : Math.round(cur) + s;
            if (p < 1) {
              el._rafId = requestAnimationFrame(step);
            } else {
              el.dataset.animating = '';
              el.dataset.done = 'true';
            }
          }
          el._rafId = requestAnimationFrame(step);
        }
      } else {
        if (el._rafId) cancelAnimationFrame(el._rafId);
        el.dataset.animating = '';
        el.dataset.done = '';
        var t = parseFloat(el.dataset.target), s = el.dataset.suffix || '';
        var isF = String(t).includes('.');
        el.textContent = (isF ? '0.0' : '0') + s;
      }
    });
  }, { threshold: 0.1, rootMargin: '50px 0px 50px 0px' });
  document.querySelectorAll('.count-up').forEach(function(el) { co.observe(el); });

  // ── ESG / Sustainability Intelligence Section Observer ─────
  var esgCopy = document.querySelector('.esg-copy-block');
  var esgPanel = document.querySelector('.esg-metrics-panel');

  if (esgCopy) {
    var esgCopyObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
        } else {
          e.target.classList.remove('in-view');
        }
      });
    }, { threshold: 0.1, rootMargin: '50px 0px 50px 0px' });
    esgCopyObs.observe(esgCopy);
  }

  if (esgPanel) {
    var esgPanelObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        var fills = e.target.querySelectorAll('.esg-bar-fill');
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          fills.forEach(function(bar, index) {
            setTimeout(function() {
              bar.style.width = bar.dataset.width;
            }, index * 120 + 150);
          });
        } else {
          e.target.classList.remove('in-view');
          fills.forEach(function(bar) {
            bar.style.width = '0%';
          });
        }
      });
    }, { threshold: 0.1, rootMargin: '50px 0px 50px 0px' });
    esgPanelObs.observe(esgPanel);
  }

  // ── KPI Bar Fill ───────────────────────────────────────────
  document.querySelectorAll('.kpi-bar-fill').forEach(function(el) {
    var w = el.dataset.width || '75%';
    el.style.width = '0%';
    var ob = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { 
          e.target.style.width = w; 
        } else {
          e.target.style.width = '0%';
        }
      });
    }, { threshold: 0.1, rootMargin: '50px 0px 50px 0px' });
    ob.observe(el);
  });

  // ── Process Flow Sequential 1-Second Pop Up ─────────────────
  var pf = document.getElementById('process-flow');
  if (pf) {
    var ps = pf.querySelectorAll('.process-step');
    var stepIdx = 0;
    var pfTimer = null;

    function stepPopUp() {
      ps.forEach(function(s, idx) {
        if (idx <= stepIdx) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
      stepIdx = (stepIdx + 1) % ps.length;
    }

    var pfObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          if (!pfTimer) {
            stepPopUp();
            pfTimer = setInterval(stepPopUp, 1000); // Exact 1-second speed per icon pop up
          }
        } else {
          if (pfTimer) {
            clearInterval(pfTimer);
            pfTimer = null;
          }
          ps.forEach(function(s) { s.classList.remove('active'); });
          stepIdx = 0;
        }
      });
    }, { threshold: 0.05, rootMargin: '100px 0px 100px 0px' });

    pfObs.observe(pf);
  }

  // ── Traceability Animation ─────────────────────────────────
  var tj = document.getElementById('trace-journey');
  if (tj) {
    var ts = tj.querySelectorAll('.trace-step');
    var to = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          if (!tj._animating) {
            tj._animating = true;
            var i = 0;
            if (tj._timer) clearInterval(tj._timer);
            tj._timer = setInterval(function() {
              if (ts[i]) ts[i].classList.add('active');
              i++; if (i >= ts.length) clearInterval(tj._timer);
            }, 300);
          }
        } else {
          tj._animating = false;
          if (tj._timer) clearInterval(tj._timer);
          ts.forEach(function(step) { step.classList.remove('active'); });
        }
      });
    }, { threshold: 0.1, rootMargin: '50px 0px 50px 0px' });
    to.observe(tj);
  }

  // ── Steps Animation ────────────────────────────────────────
  var sg = document.getElementById('steps-grid');
  if (sg) {
    var si = sg.querySelectorAll('.step-item');
    var stepPf = document.getElementById('steps-progress-fill');
    var so = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          if (!sg._animating) {
            sg._animating = true;
            if (stepPf) stepPf.style.width = '100%';
            var i = 0;
            if (sg._timer) clearInterval(sg._timer);
            sg._timer = setInterval(function() {
              if (si[i]) si[i].classList.add('active');
              i++; if (i >= si.length) clearInterval(sg._timer);
            }, 200);
          }
        } else {
          sg._animating = false;
          if (sg._timer) clearInterval(sg._timer);
          if (stepPf) stepPf.style.width = '0%';
          si.forEach(function(item) { item.classList.remove('active'); });
        }
      });
    }, { threshold: 0.1, rootMargin: '50px 0px 50px 0px' });
    so.observe(sg);
  }

  // ── Dashboard Chart ────────────────────────────────────────
  var dc = document.getElementById('dash-chart');
  if (dc && window.Chart) {
    var chartInstance = null;
    var dco = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          if (!chartInstance) {
            var ctx = dc.getContext('2d'), g = ctx.createLinearGradient(0, 0, 0, 110);
            g.addColorStop(0, 'rgba(22,163,74,0.25)'); g.addColorStop(1, 'rgba(22,163,74,0)');
            chartInstance = new Chart(dc, {
              type: 'line',
              data: {
                labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
                datasets: [
                  { label:'Recovery', data:[88,91,89,94,92,96,92], borderColor:'#4ade80', backgroundColor:g, fill:true, tension:0.4, pointRadius:3, pointBackgroundColor:'#4ade80', borderWidth:2 },
                  { label:'Target', data:[90,90,90,90,90,90,90], borderColor:'rgba(255,255,255,0.12)', borderDash:[4,4], fill:false, tension:0, pointRadius:0, borderWidth:1.5 }
                ]
              },
              options: {
                plugins:{ legend:{ display:false } },
                scales:{
                  x:{ ticks:{ color:'rgba(255,255,255,0.28)', font:{ size:9, family:"'JetBrains Mono'" } }, grid:{ color:'rgba(255,255,255,0.04)' }, border:{ display:false } },
                  y:{ ticks:{ color:'rgba(255,255,255,0.28)', font:{ size:9 }, stepSize:5 }, grid:{ color:'rgba(255,255,255,0.04)' }, border:{ display:false }, min:80, max:100 }
                },
                animation:{ duration:1200 }, responsive:true, maintainAspectRatio:false
              }
            });
          }
        } else {
          if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
          }
        }
      });
    }, { threshold: 0.1, rootMargin: '50px 0px 50px 0px' });
    dco.observe(dc);
  }

  // ── Live Feed Cycling ──────────────────────────────────────
  var fd = document.getElementById('feed-dot'), ft = document.getElementById('feed-text');
  if (fd && ft) {
    var feeds = [
      { c:'#4ade80', t:'MRF-BLR-01 \u00b7 Bale #4821 PET dispatched to Recycler GreenCircle' },
      { c:'#60a5fa', t:'AI \u00b7 12,402 SKUs classified \u00b7 99.2% confidence' },
      { c:'#a78bfa', t:'EPR \u00b7 Q2 target reached for Plastic Cat-I (FMCG client)' },
      { c:'#4ade80', t:'MRF-DEL-03 \u00b7 Inflow: 18.4t HDPE from Zone B collection run' },
      { c:'#60a5fa', t:'Route AI \u00b7 Vehicle KA-05 saved 11km \u2014 CO\u2082 avoided: 3.4kg' }
    ];
    var fi = 0;
    setInterval(function() {
      fi = (fi + 1) % feeds.length;
      fd.style.background = feeds[fi].c;
      ft.style.opacity = '0';
      setTimeout(function() { ft.textContent = feeds[fi].t; ft.style.opacity = '1'; }, 220);
    }, 2800);
  }

  // ── Industries "Who It's Built For" Sequential Reveal ──────
  var indGrid = document.getElementById('industry-grid');
  if (indGrid) {
    var indObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
        } else {
          e.target.classList.remove('in-view');
        }
      });
    }, { threshold: 0.05, rootMargin: '100px 0px 100px 0px' });
    indObs.observe(indGrid);
  }

  // ── Business Value (Benefits) Observer & Mouse Glow ────────
  var bg = document.getElementById('benefit-grid');
  var bh = document.querySelector('.benefits-header-block');

  if (bh) {
    var bhObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
        } else {
          e.target.classList.remove('in-view');
        }
      });
    }, { threshold: 0.05, rootMargin: '100px 0px 100px 0px' });
    bhObs.observe(bh);
  }

  if (bg) {
    var bgObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
        } else {
          e.target.classList.remove('in-view');
        }
      });
    }, { threshold: 0.05, rootMargin: '100px 0px 100px 0px' });
    bgObs.observe(bg);

    var bCards = bg.querySelectorAll('.benefit-card');
    bCards.forEach(function(card) {
      var glow = card.querySelector('.benefit-mouse-glow');
      if (glow) {
        card.addEventListener('mousemove', function(evt) {
          var rect = card.getBoundingClientRect();
          var x = evt.clientX - rect.left;
          var y = evt.clientY - rect.top;
          glow.style.left = x + 'px';
          glow.style.top = y + 'px';
        });
      }
    });
  }

  // ── ESG Progress Bar Fill Observer ────────────────────────
  var esgPanel = document.querySelector('.esg-metrics-panel');
  if (esgPanel) {
    var esgObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          var fills = e.target.querySelectorAll('.esg-bar-fill');
          fills.forEach(function(f) {
            f.style.width = f.dataset.width;
          });
        } else {
          e.target.classList.remove('in-view');
          var fills = e.target.querySelectorAll('.esg-bar-fill');
          fills.forEach(function(f) {
            f.style.width = '0%';
          });
        }
      });
    }, { threshold: 0.05, rootMargin: '100px 0px 100px 0px' });
    esgObs.observe(esgPanel);
  }

  // ── Auto-Functioning Cards Cycle (2 Seconds) ────────────────
  function setupAutoCyclingCards(gridSelector, cardSelector, activeClass) {
    var grid = document.querySelector(gridSelector);
    if (!grid) return;

    var cards = grid.querySelectorAll(cardSelector);
    if (!cards.length) return;

    var currentIndex = 0;
    var timer = null;
    var isHovered = false;

    function nextCard() {
      if (isHovered) return;
      cards.forEach(function(c) { 
        c.classList.remove(activeClass);
      });

      cards[currentIndex].classList.add(activeClass);
      currentIndex = (currentIndex + 1) % cards.length;
    }

    grid.addEventListener('mouseenter', function() {
      isHovered = true;
      cards.forEach(function(c) { 
        c.classList.remove(activeClass);
      });
    });

    grid.addEventListener('mouseleave', function() {
      isHovered = false;
    });

    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          if (!timer) {
            nextCard();
            timer = setInterval(nextCard, 2000); // Smooth 2s interval
          }
        } else {
          if (timer) {
            clearInterval(timer);
            timer = null;
          }
          cards.forEach(function(c) { 
            c.classList.remove(activeClass);
          });
        }
      });
    }, { threshold: 0.05, rootMargin: '100px 0px 100px 0px' });

    obs.observe(grid);
  }

  setupAutoCyclingCards('.cap-grid', '.cap-card', 'auto-active');
  setupAutoCyclingCards('#benefit-grid', '.benefit-card', 'auto-active');
  setupAutoCyclingCards('.mrf-op-grid', '.mrf-op-card', 'auto-active');
  setupAutoCyclingCards('#industry-grid', '.industry-card', 'auto-active');
  setupAutoCyclingCards('.esg-kpi-grid', '.esg-kpi-card', 'auto-active');

  // ── Reduced Motion ─────────────────────────────────────────
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(function(el) { el.classList.add('in-view'); });
  }

});
