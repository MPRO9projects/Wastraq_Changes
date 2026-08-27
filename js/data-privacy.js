// data-privacy.js — page-specific behavior for data-privacy.html
// (Nav/footer are handled by the shared js/shared.js — this file only
// contains genuine page logic: the scroll progress bar, the TOC
// scroll-spy, and smooth-scroll TOC links.)

    // ── Scroll progress bar ──
    window.addEventListener('scroll', () => {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      document.getElementById('prv-progress-bar').style.width = pct + '%';
    });

    // ── TOC active state on scroll ──
    const sections = document.querySelectorAll('.prv-section[id]');
    const tocLinks = document.querySelectorAll('.prv-toc-links a');
    const navH = 72;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tocLinks.forEach(a => a.classList.remove('active'));
          const active = document.querySelector(`.prv-toc-links a[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: `-${navH + 40}px 0px -60% 0px`, threshold: 0 });

    sections.forEach(s => observer.observe(s));

    // ── Smooth scroll for TOC links ──
    tocLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          window.scrollTo({ top: target.offsetTop - navH - 24, behavior: 'smooth' });
        }
      });
    });
