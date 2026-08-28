// shared.js — the shared site nav + footer (markup + behavior).
// Used by index.html and cookies.html (and any future page).
// Depends on: css/index.css (design tokens, .wq-btn-primary) and
// css/nav-footer.css must both be linked on the page.
// WASTRAQ Shared Navigation & Footer
// Global Reload Routing Handler: Any page reload MUST navigate directly to "SMARTER WASTE. CLEANER CITIES. ZERO GUESSWORK." (index.html) at top (0,0)
(function handleGlobalReloadRedirect() {
  try {
    let isReload = false;
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries && navEntries.length > 0) {
      isReload = navEntries[0].type === 'reload';
    } else if (window.performance && window.performance.navigation) {
      isReload = window.performance.navigation.type === 1; // TYPE_RELOAD
    }

    if (isReload) {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      const path = window.location.pathname.toLowerCase();
      // Pages that are allowed to stay put on reload instead of bouncing to
      // the homepage — every real standalone page needs to be listed here,
      // since this reload-redirect logic runs on every page that includes
      // this shared script.
      const STANDALONE_PAGES = ['cookies.html', 'products.html', 'solutions.html', 'enterprise.html', 'about.html', 'blog.html', 'contact.html', 'partnership.html', 'careers.html', 'kuppam_blog.html', 'nmf_blog.html', 'help.html', 'help-articles.html', 'help-topic.html', 'terms-and-conditions.html', 'data-privacy.html', 'login.html', 'register.html'];
      const isHome = path.endsWith('index.html') || path.endsWith('/') || path === ''
        || STANDALONE_PAGES.some(p => path.endsWith(p));
      if (!isHome) {
        // Stop any further rendering or subpage script execution and redirect immediately to home
        window.location.replace('index.html?reload=true');
      } else {
        window.scrollTo(0, 0);
      }
    }
  } catch (e) {
    // Fallback if performance API is restricted
  }
})();

function injectNav(activePage = '') {
  const nav = `
  <nav class="wq-nav" id="wq-nav">
    <div class="wq-nav-inner">
      <a href="index.html" class="wq-logo" id="wq-nav-logo">
        <img src="assets/images/index_favicon.png" alt="WASTRAQ Logo" class="wq-nav-logo-icon" />
        <span class="logo-text">WASTRAQ</span><span class="tm">™</span>
      </a>
      <ul class="wq-nav-links">
        <li class="${activePage===''||activePage==='home'?'active':''}"><a href="index.html">Home</a></li>
        <li class="has-dropdown ${activePage==='products'?'active':''}">
          <a href="products.html">Products <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></a>
          <div class="wq-dropdown">
            <a href="products.html#core">TraqCore – The Core Platform</a>
            <a href="products.html#residential">Residential Collection</a>
            <a href="products.html#commercial">Commercial Collection</a>
            <a href="products.html#skip">Skip &amp; Bulk Hire</a>
            <a href="products.html#routeai">RouteTraq™ | Smart Routing</a>
            <a href="products.html#incab">In-Cab Navigation</a>
            <a href="products.html#crm">Customer Relationship Management</a>
            <a href="products.html#portal">Customer Portal</a>
            <a href="products.html#insights">Waste Insights &amp; Analytics</a>
            <a href="products.html#integrations">Integrations</a>
          </div>
        </li>
        <li class="has-dropdown ${activePage==='solutions'?'active':''}">
          <a href="solutions.html">Solutions <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></a>
          <div class="wq-dropdown">
            <a href="solutions.html#municipal">Municipal Utilities</a>
            <a href="solutions.html#collectors">Waste Collectors</a>
            <a href="enterprise.html">Enterprise</a>
          </div>
        </li>
        <li class="${activePage==='partnership'?'active':''}"><a href="partnership.html">Partnership</a></li>
        <li class="has-dropdown ${activePage==='about'?'active':''}">
          <a href="about.html">About <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></a>
          <div class="wq-dropdown">
            <a href="about.html">About Us</a>
            <a href="blog.html">Blog</a>
            <a href="contact.html">Contact</a>
          </div>
        </li>
      </ul>
      <div class="wq-nav-actions">
        <a href="login.html" class="wq-btn-ghost">Login</a>
        <a href="contact.html" class="wq-btn-primary">Schedule Demo</a>
      </div>
      <button class="wq-hamburger" onclick="toggleMobileNav()" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="wq-mobile-menu" id="wq-mobile-menu">
      <a href="index.html">Home</a>
      <a href="products.html">Products</a>
      <a href="solutions.html">Solutions</a>
      <a href="partnership.html">Partnership</a>
      <a href="about.html">About Us</a>
      <a href="contact.html">Contact</a>
      <a href="login.html">Login</a>
      <a href="contact.html" class="wq-btn-primary" style="margin-top:12px;display:block;text-align:center">Schedule Demo</a>
    </div>
  </nav>`;
  const navPlaceholder = document.getElementById('nav-placeholder');
  if (navPlaceholder) {
    navPlaceholder.innerHTML = nav;
  }
  // Scroll behavior
  window.addEventListener('scroll', () => {
    const n = document.getElementById('wq-nav');
    if (n) {
      if (window.scrollY > 40) n.classList.add('scrolled');
      else n.classList.remove('scrolled');
    }
  });
}

function toggleMobileNav() {
  const menu = document.getElementById('wq-mobile-menu');
  if (menu) menu.classList.toggle('open');
}

function injectFooter() {
  const footer = `
  <footer class="wq-footer">
    <div class="wq-footer-top">
      <div class="wq-footer-brand">
        <a href="index.html" class="wq-logo wq-logo-light">
          <img src="assets/images/index_favicon.png" alt="WASTRAQ Logo" class="wq-nav-logo-icon" />
          <span class="logo-text">WASTRAQ</span><span class="tm">™</span>
        </a>
        <p>Intelligent waste management software for smart, sustainable, and profitable operations worldwide.</p>
        <div class="wq-social">
          <a href="https://www.linkedin.com/company/wastraq/" target="_blank" aria-label="LinkedIn"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg></a>
          <a href="https://www.facebook.com/share/1cgPJo54ic/" target="_blank" aria-label="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></a>
          <a href="https://youtube.com/@wastraq?si=Kzb9-58Q3Zh1gxQT" target="_blank" aria-label="YouTube"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg></a>
          <a href="https://www.instagram.com/wastraq?igsh=MXE1eGdzeGI0bDE5Nw==" target="_blank" aria-label="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm0 2h10c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3zm5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.5-2.5a1 1 0 100 2 1 1 0 000-2z"/></svg></a>
        </div>
      </div>
      <div class="wq-footer-cols">
        <div class="wq-footer-col">
          <h4>Products</h4>
          <a href="products.html#core">TraqCore Platform</a>
          <a href="products.html#commercial">Commercial Collection</a>
          <a href="products.html#residential">Residential Collection</a>
          <a href="products.html#skip">Skip &amp; Bulk Hire</a>
          <a href="products.html#crm">CRM</a>
          <a href="products.html#incab">In-Cab Navigation</a>
          <a href="products.html#portal">Customer Portal</a>
          <a href="products.html#insights">Waste Insights</a>
          <a href="products.html#integrations">Integrations</a>
        </div>
        <div class="wq-footer-col">
          <h4>Solutions</h4>
          <a href="solutions.html#municipal">Municipal Utilities</a>
          <a href="solutions.html#collectors">Waste Collectors</a>
          <h4 style="margin-top:24px">Partnership</h4>
          <a href="partnership.html">Become a Partner</a>
        </div>
        <div class="wq-footer-col">
          <h4>Company</h4>
          <a href="about.html">About Us</a>
          <a href="blog.html">Blog</a>
          <a href="contact.html">Contact Us</a>
          <a href="careers.html">Careers</a>
          <a href="#">Help Centre</a>
          <a href="terms-and-conditions.html">Terms of Service</a>
          <a href="data-privacy.html">Data Privacy Policy</a>
          <a href="cookies.html">Read Cookie Policy</a>
          <a href="#">Security Policy</a>
        </div>
      </div>
    </div>
    <div class="wq-footer-bottom">
      <span>© 2026 WASTRAQ – All rights reserved</span>
      <span>Developed by <strong><a href="https://www.mpro9.in/" target="_blank" rel="noopener noreferrer">M PRO9 Pvt. Ltd.</a></strong></span>
    </div>
  </footer>`;
  document.getElementById('footer-placeholder').innerHTML = footer;
}

// Animate on scroll (replays when scrolling away and returning)
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('anim-in');
      } else {
        e.target.classList.remove('anim-in');
      }
    });
  }, { threshold: 0.22 });
  document.querySelectorAll('.anim').forEach(el => observer.observe(el));
}

// Counter animation
function animateCounters() {
  const counters = document.querySelectorAll('.wq-counter');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target);
    const suffix = counter.dataset.suffix || '';
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      counter.textContent = Math.floor(current) + suffix;
    }, 24);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  // Counter trigger
  const statSection = document.querySelector('.wq-stats');
  if (statSection) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { animateCounters(); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(statSection);
  }
});

