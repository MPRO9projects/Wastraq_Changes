/* ════════════════════════════════════════════════
   WASTRAQ HELP CENTER STANDALONE JAVASCRIPT (SPA)
════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── API Configuration ────────────────────────── */
  var WASTRAQ_API = (window.WASTRAQ_API_BASE || 'https://backend.wastraq.com');

  /* ── TOPIC METADATA REGISTRY ───────────────────── */
  var TOPIC_DATA = {
    'platform-setup': {
      title: 'Platform Setup & Configuration',
      desc: 'Account setup, user management, onboarding, IoT sensor connection, API authentication, and platform configuration guides.',
      count: '18+',
      icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>'
    },
    'supervisor-dashboard': {
      title: 'Supervisor Dashboard & Live Operations',
      desc: 'Live fleet visibility, dispatch management, exception handling, performance analytics, and compliance reporting for supervisors.',
      count: '24+',
      icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><path d="M3 17a4 4 0 004 4h3"/></svg>'
    },
    'driver-app': {
      title: 'Driver App (iOS & Android)',
      desc: 'The WASTRAQ Driver App guides for iOS and Android — installation, navigation, collection confirmation, issue reporting, and 7-day offline mode.',
      count: '16+',
      icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>'
    },
    'route-optimization': {
      title: 'RouteTraq — Route Optimization AI',
      desc: 'AI-powered route planning for waste collection fleets. Configure collection zones, run frequency, vehicle capacity, and road constraints.',
      count: '19+',
      icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
    },
    'fleet-management': {
      title: 'Fleet Management & Telemetry',
      desc: 'Vehicle registry, maintenance tracking, driver assignments, fuel reporting, and telemetry integration for municipal and commercial fleets.',
      count: '15+',
      icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>'
    },
    'billing': {
      title: 'Billing and Invoicing Automation',
      desc: 'Automated billing cycles, custom invoice templates, payment processing, Xero/QuickBooks integration, and subscription management documentation.',
      count: '14+',
      icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>'
    }
  };

  /* ── SEARCH INDEX REGISTRY ─────────────────────── */
  var SEARCH_INDEX = [
    { title: 'Android Installation and Setup Guide', cat: 'Driver App', view: 'topic', param: 'driver-app' },
    { title: 'iOS Installation and Setup Guide', cat: 'Driver App', view: 'topic', param: 'driver-app' },
    { title: 'Running the RouteTraq AI Optimizer', cat: 'Route Optimization', view: 'topic', param: 'route-optimization' },
    { title: 'Configuring User Roles and Permissions', cat: 'Administration', view: 'topic', param: 'platform-setup' },
    { title: 'Setting Up Automated Billing Cycles', cat: 'Billing', view: 'topic', param: 'billing' },
    { title: 'Connecting IoT Bin-Level Sensors', cat: 'IoT Integration', view: 'topic', param: 'platform-setup' },
    { title: 'Live Fleet Tracking Overview', cat: 'Fleet Management', view: 'topic', param: 'fleet-management' },
    { title: 'Customer Portal Setup and Branding', cat: 'Customer Portal', view: 'topic', param: 'platform-setup' },
    { title: 'RouteTraq AI — Dynamic Fill-Level Re-Routing (v4.8.0)', cat: 'Release Notes', view: 'articles', param: 'route' },
    { title: 'Billing Automation — Custom Invoice Templates (v4.7.0)', cat: 'Release Notes', view: 'articles', param: 'billing' },
    { title: 'Driver App 7-Day Offline Mode (v4.6.2)', cat: 'Release Notes', view: 'articles', param: 'driver' },
    { title: 'Municipal Compliance Reporting Module (v4.6.0)', cat: 'Release Notes', view: 'articles', param: 'municipal' }
  ];

  /* ── CLIENT-SIDE SPA ROUTER ─────────────────────── */
  window.navigateToView = function (viewId, param) {
    var hashStr = '#' + viewId;
    if (param) hashStr += '=' + param;
    window.location.hash = hashStr;
  };

  function handleHashRoute() {
    var hash = window.location.hash.replace(/^#/, '');
    var viewName = 'home';
    var param = '';

    if (hash) {
      var parts = hash.split('=');
      viewName = parts[0];
      param = parts[1] || '';
    }

    var views = {
      'home': document.getElementById('help-home-view'),
      'topic': document.getElementById('help-topic-view'),
      'articles': document.getElementById('help-articles-view')
    };

    /* Hide all views */
    Object.keys(views).forEach(function (key) {
      if (views[key]) views[key].hidden = true;
    });

    /* Activate target view */
    if (viewName === 'topic' && views['topic']) {
      views['topic'].hidden = false;
      setupTopicView(param || 'platform-setup');
    } else if (viewName === 'articles' && views['articles']) {
      views['articles'].hidden = false;
      setupArticlesView(param || 'all');
    } else {
      if (views['home']) views['home'].hidden = false;
      document.getElementById('page-doc-title').textContent = 'WASTRAQ Help Center | Support & User Assistance';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.addEventListener('hashchange', handleHashRoute);
  document.addEventListener('DOMContentLoaded', handleHashRoute);

  window.scrollAppToSupport = function() {
    var ctaEl = document.getElementById('support-cta');
    if (ctaEl) {
      ctaEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = 'mailto:info@wastraq.com';
    }
  };

  /* ── TOPIC VIEW LOGIC ───────────────────────────── */
  function setupTopicView(topicKey) {
    var info = TOPIC_DATA[topicKey] || TOPIC_DATA['platform-setup'];

    /* Update Header */
    var iconEl = document.getElementById('ht-hero-icon');
    if (iconEl) iconEl.innerHTML = info.icon;

    var titleEl = document.getElementById('ht-title');
    if (titleEl) titleEl.textContent = info.title;

    var breadcrumbEl = document.getElementById('ht-breadcrumb-title');
    if (breadcrumbEl) breadcrumbEl.textContent = info.title;

    var descEl = document.getElementById('ht-desc');
    if (descEl) descEl.textContent = info.desc;

    var headingEl = document.getElementById('ht-topic-heading');
    if (headingEl) headingEl.textContent = info.title + ' Articles';

    var countStat = document.getElementById('ht-article-count-stat');
    if (countStat) countStat.textContent = info.count;

    document.getElementById('page-doc-title').textContent = info.title + ' | WASTRAQ Help Center';

    /* Update Active Link */
    document.querySelectorAll('#ht-topic-nav .ht-sidebar-link').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href.indexOf(topicKey) !== -1) {
        link.classList.add('ht-active');
      } else {
        link.classList.remove('ht-active');
      }
    });

    /* Filter Articles */
    var articles = document.querySelectorAll('#ht-articles-list .ht-article-card');
    var visibleCount = 0;

    articles.forEach(function (card) {
      var cat = card.getAttribute('data-cat');
      if (cat === topicKey || topicKey === 'all') {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    var noRes = document.getElementById('ht-no-results');
    if (noRes) noRes.style.display = (visibleCount === 0) ? 'block' : 'none';
  }

  window.htFilterArticles = function (query) {
    var q = (query || '').trim().toLowerCase();
    var articles = document.querySelectorAll('#ht-articles-list .ht-article-card');
    var visibleCount = 0;

    articles.forEach(function (card) {
      var isVisible = card.style.display !== 'none';
      if (isVisible) {
        var text = (card.textContent + ' ' + (card.getAttribute('data-tags') || '')).toLowerCase();
        var match = !q || text.includes(q);
        card.style.display = match ? 'flex' : 'none';
        if (match) visibleCount++;
      }
    });

    var noRes = document.getElementById('ht-no-results');
    if (noRes) noRes.style.display = (visibleCount === 0) ? 'block' : 'none';
  };

  window.htToggle = function (id, btn) {
    var body = document.getElementById('body-' + id);
    if (!body) return;
    var isOpen = body.classList.contains('open');
    body.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    btn.innerHTML = isOpen
      ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg> Read full article'
      : 'Collapse ↑';
  };

  /* ── ARTICLES VIEW LOGIC ────────────────────────── */
  function setupArticlesView(catFilter) {
    document.getElementById('page-doc-title').textContent = 'Platform Updates & Release Notes | WASTRAQ Help Center';

    var btns = document.querySelectorAll('.ha-filter-btn');
    btns.forEach(function (b) {
      var onclickAttr = b.getAttribute('onclick') || '';
      if (onclickAttr.indexOf("'" + catFilter + "'") !== -1) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    var articles = document.querySelectorAll('.ha-article');
    var visible = 0;
    articles.forEach(function (a) {
      var show = (catFilter === 'all' || a.getAttribute('data-cat') === catFilter);
      a.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    var noRes = document.getElementById('ha-no-results');
    if (noRes) noRes.style.display = (visible === 0) ? 'block' : 'none';
    var countEl = document.getElementById('ha-count');
    if (countEl) countEl.textContent = 'Showing ' + visible + ' update' + (visible !== 1 ? 's' : '');
  }

  window.filterArticles = function (btn, cat) {
    document.querySelectorAll('.ha-filter-btn').forEach(function (b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');

    var articles = document.querySelectorAll('.ha-article');
    var visible = 0;
    articles.forEach(function (a) {
      var show = (cat === 'all' || a.getAttribute('data-cat') === cat);
      a.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    var noRes = document.getElementById('ha-no-results');
    if (noRes) noRes.style.display = (visible === 0) ? 'block' : 'none';
    var countEl = document.getElementById('ha-count');
    if (countEl) countEl.textContent = 'Showing ' + visible + ' update' + (visible !== 1 ? 's' : '');
  };

  window.toggleArticle = function (id, btn) {
    var el = document.getElementById(id);
    if (!el) return;
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
  };

  /* ── FAQ ACCORDION LOGIC ────────────────────────── */
  window.toggleFaq = function (btn) {
    var item   = btn.closest('.hc-faq-item');
    var body   = item.querySelector('.hc-faq-body');
    var isOpen = item.classList.contains('open');

    document.querySelectorAll('.hc-faq-item.open').forEach(function (el) {
      el.classList.remove('open');
      el.querySelector('.hc-faq-btn').setAttribute('aria-expanded', 'false');
      el.querySelector('.hc-faq-body').style.maxHeight = '0';
    });

    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      body.style.maxHeight = body.querySelector('.hc-faq-inner').scrollHeight + 'px';
    }
  };

  /* ── SEARCH OVERLAY LOGIC ───────────────────────── */
  var searchInput   = document.getElementById('hc-search');
  var searchResults = document.getElementById('hc-search-results');

  window.hcSearchInput = function (q) {
    var trimmed = q.trim().toLowerCase();
    if (!trimmed || trimmed.length < 2) {
      searchResults.innerHTML = '';
      searchResults.classList.remove('visible');
      return;
    }
    var matches = SEARCH_INDEX.filter(function (item) {
      return item.title.toLowerCase().includes(trimmed) || item.cat.toLowerCase().includes(trimmed);
    }).slice(0, 6);

    if (matches.length === 0) {
      searchResults.innerHTML = '<div class="hc-search-empty">No results found for "' + q + '"</div>';
      searchResults.classList.add('visible');
      return;
    }

    searchResults.innerHTML = matches.map(function (item) {
      var href = '#' + item.view + '=' + item.param;
      return '<a class="hc-search-result-item" href="' + href + '" onclick="navigateToView(\'' + item.view + '\', \'' + item.param + '\'); return false;">' +
        '<div class="hc-search-result-icon">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
        '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div class="hc-search-result-text">' + item.title + '</div>' +
          '<div class="hc-search-result-cat">' + item.cat + '</div>' +
        '</div>' +
        '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7c9177" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>' +
      '</a>';
    }).join('') + '<div class="hc-search-footer">Click result to view &nbsp;·&nbsp; <span style="color:var(--green-600);cursor:pointer" onclick="navigateToView(\'articles\', \'all\')">Browse all articles</span></div>';

    searchResults.classList.add('visible');
  };

  window.hcSearchFocus = function () {
    if (searchInput && searchInput.value.trim().length > 1) {
      searchResults.classList.add('visible');
    }
  };

  window.hcSearchBlur = function () {
    setTimeout(function () {
      if (searchResults) searchResults.classList.remove('visible');
    }, 200);
  };

  window.hcDoSearch = function () {
    if (searchInput) {
      window.hcSearchInput(searchInput.value);
    }
  };

  window.hcSetSearch = function (text) {
    if (searchInput) {
      searchInput.value = text;
      window.hcSearchInput(text);
      searchInput.focus();
    }
  };

  if (searchInput) {
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var first = searchResults.querySelector('.hc-search-result-item');
        if (first && searchResults.classList.contains('visible')) {
          first.click();
        } else {
          window.hcDoSearch();
        }
      }
      if (e.key === 'Escape') {
        searchResults.classList.remove('visible');
        searchInput.blur();
      }
    });
  }

  /* ── EMAIL SUBSCRIBE HANDLER ────────────────────── */
  window.wastraqSubscribe = function () {
    var input = document.getElementById('ha-subscribe-email');
    var errEl = document.getElementById('ha-subscribe-error');
    var btn   = document.getElementById('ha-subscribe-btn');

    if (!input) return;
    var email = (input.value || '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errEl.textContent = 'Please enter a valid email address.';
      errEl.style.display = 'block';
      input.focus();
      return;
    }

    errEl.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Submitting…';

    fetch(WASTRAQ_API + '/api/forms/subscribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: email, type: 'subscription' }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Server returned status ' + res.status);
        return res.json();
      })
      .then(function (data) {
        btn.disabled = false;
        btn.textContent = 'Notify Me';
        if (data.success) {
          document.getElementById('ha-subscribe-form').style.display   = 'none';
          document.getElementById('ha-subscribe-success').style.display = 'block';
        } else {
          errEl.textContent = data.message || 'Submission failed. Please try again.';
          errEl.style.display = 'block';
        }
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = 'Notify Me';
        document.getElementById('ha-subscribe-form').style.display   = 'none';
        document.getElementById('ha-subscribe-success').style.display = 'block';
      });
  };

  /* ── GSAP ANIMATIONS ────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    if (typeof gsap === 'undefined') return;

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    gsap.from('.hc-hero-inner', { duration: 0.6, opacity: 0, y: 20, ease: 'power2.out' });
  });

})();
