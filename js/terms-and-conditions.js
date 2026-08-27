// terms-and-conditions.js — page-specific behavior for terms-and-conditions.html
// (Nav/footer are handled by the shared js/shared.js — this file only
// contains genuine page logic: the scroll progress bar, the TOC
// scroll-spy, smooth-scroll TOC links, and section fade-in animation.)
//
// Dropped from the source: a tcToggleMenu() mobile-nav toggle and a
// dynamic-copyright-year snippet, both leftover dead code targeting a
// hand-rolled nav/footer this page never should have had alongside the
// real shared nav-placeholder/footer-placeholder (no matching elements
// exist once the shared nav/footer are used, so both would have been
// no-ops/silently failed anyway).

/* ── Scroll progress bar ── */
window.addEventListener('scroll', function() {
  var doc = document.documentElement;
  var pct = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
  document.getElementById('tc-progress-bar').style.width = pct + '%';
}, { passive: true });

/* ── TOC active link tracking via IntersectionObserver ── */
var sections = document.querySelectorAll('.tc-section[id]');
var tocLinks = document.querySelectorAll('.tc-toc-list a');
var navH     = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
) || 72;

var sectionObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      tocLinks.forEach(function(a) { a.classList.remove('tc-active'); });
      var link = document.querySelector(
        '.tc-toc-list a[href="#' + entry.target.id + '"]'
      );
      if (link) link.classList.add('tc-active');
    }
  });
}, {
  rootMargin: '-' + (navH + 36) + 'px 0px -62% 0px',
  threshold: 0
});
sections.forEach(function(s) { sectionObserver.observe(s); });

/* ── Smooth scroll for TOC links ── */
tocLinks.forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    var target = document.querySelector(link.getAttribute('href'));
    if (target) {
      var offset = target.getBoundingClientRect().top + window.scrollY - navH - 24;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  });
});

/* ── Fade-in animation for sections on scroll ── */
var animObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.style.opacity  = '1';
      entry.target.style.transform = 'translateY(0)';
      animObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.06 });

document.querySelectorAll('.tc-section').forEach(function(el) {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(16px)';
  el.style.transition = 'opacity .45s ease, transform .45s ease';
  animObserver.observe(el);
});
