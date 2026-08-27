// help-articles.js — page-specific behavior for help-articles.html
// (Nav/footer are handled by the shared js/shared.js — this file only
// contains genuine page logic: the category filter, read-more toggle,
// scroll-spy table of contents, hash-link navigation, and the email
// subscribe widget.)

/* Filter */
function filterArticles(btn, cat) {
  document.querySelectorAll('.ha-filter-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');

  var articles = document.querySelectorAll('.ha-article');
  var visible = 0;
  articles.forEach(function(a) {
    var show = cat === 'all' || a.getAttribute('data-cat') === cat;
    a.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  var noRes = document.getElementById('ha-no-results');
  noRes.style.display = visible === 0 ? 'block' : 'none';
  document.getElementById('ha-count').textContent = 'Showing ' + visible + ' update' + (visible !== 1 ? 's' : '');
}

/* Toggle Read More */
function toggleArticle(id, btn) {
  var el = document.getElementById(id);
  var isExpanded = el.classList.contains('expanded');
  if (isExpanded) {
    el.classList.remove('expanded');
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg> Read full release notes';
    btn.setAttribute('aria-expanded', 'false');
  } else {
    el.classList.add('expanded');
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 15l-6-6-6 6"/></svg> Collapse';
    btn.setAttribute('aria-expanded', 'true');
  }
}

/* Active TOC on scroll */
var tocLinks = document.querySelectorAll('.ha-toc-link[href^="#"]');
var obs = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) {
      tocLinks.forEach(function(l) { l.classList.remove('active'); });
      var link = document.querySelector('.ha-toc-link[href="#' + e.target.id + '"]');
      if (link) link.classList.add('active');
    }
  });
}, { rootMargin: '-72px 0px -70% 0px' });
document.querySelectorAll('.ha-article[id]').forEach(function(a) { obs.observe(a); });

/* Hash navigation on load */
if (window.location.hash) {
  setTimeout(function() {
    var target = document.querySelector(window.location.hash);
    if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }, 300);
}

/* ── WASTRAQ Subscribe Widget ── */
  (function () {
    'use strict';

    /* ── Email validation helper ── */
    function isValidEmail(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    }

    /* ── UI helpers ── */
    function setError(msg) {
      var el = document.getElementById('ha-subscribe-error');
      el.textContent = msg;
      el.style.display = msg ? 'block' : 'none';
    }
    function setLoading(loading) {
      var btn   = document.getElementById('ha-subscribe-btn');
      var input = document.getElementById('ha-subscribe-email');
      btn.disabled   = loading;
      input.disabled = loading;
      btn.textContent = loading ? 'Submitting…' : 'Notify Me';
    }
    function showSuccess() {
      document.getElementById('ha-subscribe-form').style.display   = 'none';
      document.getElementById('ha-subscribe-success').style.display = 'block';
    }

    /* ── Main subscribe function (called by onclick) ── */
    window.wastraqSubscribe = function () {
      var input = document.getElementById('ha-subscribe-email');
      var email = (input.value || '').trim();

      /* 1 — Validate */
      if (!email) {
        setError('Please enter your email address.');
        input.focus();
        return;
      }
      if (!isValidEmail(email)) {
        setError('Please enter a valid email address.');
        input.focus();
        return;
      }
      setError('');
      setLoading(true);

      /* 2 — Determine the correct API base URL */
      var apiBase = (window.WASTRAQ_API_BASE || '').replace(/\/+$/, '');

      /* Detect file:// protocol – fetch will always fail in this context */
      if (window.location.protocol === 'file:') {
        setLoading(false);
        setError(
          'Cannot connect: open this page via a local server, not file://. ' +
          'Run: python3 -m http.server 8000'
        );
        console.error(
          '[WASTRAQ Subscribe] fetch() blocked.\n' +
          'You are opening the page as file:// — browsers block cross-origin requests from file://.\n' +
          'Fix: cd into your project folder and run:\n' +
          '  python3 -m http.server 8000\n' +
          'Then open: http://localhost:8000/help-articles.html'
        );
        return;
      }

      if (!apiBase || apiBase === 'https://backend.wastraq.com') {
        /* Check if we're already on localhost — if so, backend should be running */
        var isLocalhost = (
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1'
        );
        if (!isLocalhost) {
          /* We're on a real domain but API base is still localhost — not configured */
          console.warn(
            '[WASTRAQ Subscribe] WASTRAQ_API_BASE is pointing to localhost but you are on ' +
            window.location.hostname + '.\n' +
            'Fix: Update the <script> tag at the top of help-articles.html:\n' +
            '  window.WASTRAQ_API_BASE = "https://your-api-domain.com";'
          );
        }
      }

      var endpoint = (apiBase || 'https://backend.wastraq.com') + '/api/forms/subscribe';

      /* POST to FastAPI backend */
      fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email, type: 'subscription' }),
      })
        .then(function (res) {
          if (!res.ok) {
            return res.json().catch(function () {
              /* JSON parse failed on error response */
              throw new Error('Server returned status ' + res.status + '. Is the backend running?');
            }).then(function (body) {
              throw new Error(body.detail || body.message || ('Server error ' + res.status));
            });
          }
          return res.json();
        })
        .then(function (data) {
          setLoading(false);
          if (data.success) {
            input.value = '';
            showSuccess();
          } else {
            setError(data.message || 'Submission failed. Please try again.');
          }
        })
        .catch(function (err) {
          setLoading(false);

          /* Categorise the error for the user */
          var msg = err.message || '';
          var userMsg;

          if (
            msg.indexOf('Failed to fetch') !== -1 ||
            msg.indexOf('NetworkError') !== -1 ||
            msg.indexOf('Load failed') !== -1 ||
            msg.indexOf('fetch') !== -1
          ) {
            userMsg =
              'Cannot reach the server. Make sure your FastAPI backend is running: ' +
              'uvicorn main:app --reload --port 8000';
          } else if (msg.indexOf('CORS') !== -1 || msg.indexOf('cross-origin') !== -1) {
            userMsg =
              'CORS error — add your site domain to ALLOWED_ORIGINS in backend/.env, then restart the server.';
          } else if (msg.indexOf('status 422') !== -1) {
            userMsg = 'Invalid data sent to the server. Please check your email address.';
          } else {
            userMsg = 'Something went wrong. Please try again or email support@wastraq.io';
          }

          setError(userMsg);
          console.error('[WASTRAQ Subscribe] Error:', err.message, '\nEndpoint:', endpoint);
        });
    };

    /* Allow pressing Enter in the email field */
    document.addEventListener('DOMContentLoaded', function () {
      var input = document.getElementById('ha-subscribe-email');
      if (input) {
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            window.wastraqSubscribe();
          }
        });
        /* Clear error on input change */
        input.addEventListener('input', function () {
          document.getElementById('ha-subscribe-error').style.display = 'none';
        });
      }
    });

  })();
