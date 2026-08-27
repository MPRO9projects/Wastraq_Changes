// careers.js — page-specific behavior for careers.html
// (Nav/footer are handled by the shared js/shared.js — this file only
// contains genuine page logic: the application form submit handler,
// the department filter, and the scroll-triggered card reveals.)

    (function () {
      /* ── WASTRAQ FastAPI backend ── */
      var WASTRAQ_API = (window.WASTRAQ_API_BASE || 'https://backend.wastraq.com');

      document.getElementById('cf-submit-btn').addEventListener('click', function () {
        var firstName = document.getElementById('cf-name').value.trim();
        var lastName  = document.getElementById('cf-lname').value.trim();
        var email     = document.getElementById('cf-email').value.trim();
        var position  = document.getElementById('cf-role').value;
        var cover     = document.getElementById('cf-message').value.trim();

        if (!firstName || !lastName || !email || !position || !cover) {
          alert('Please fill in all required fields.');
          return;
        }

        var btn      = document.getElementById('cf-submit-btn');
        btn.disabled = true;
        btn.innerHTML = 'Submitting…';

        var payload = {
          name:      firstName + ' ' + lastName,
          email:     email,
          phone: "'" + document.getElementById('cf-phone').value.trim(),
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
            alert('Submission failed. Please email careers@wastraq.com');
            console.error('Careers form error:', err);
          });
      });
    })();

    /* ── Department filter ────────────────────────── */
    function filterJobs(btn, dept) {
      /* Update button states */
      document.querySelectorAll('.car-dept-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      /* Filter job cards */
      var cards = document.querySelectorAll('.car-job-card');
      var visible = 0;

      cards.forEach(function (card) {
        var match = dept === 'all' || card.getAttribute('data-dept') === dept;
        card.style.display = match ? '' : 'none';
        if (match) visible++;
      });

      /* Update count and no-match message */
      var countEl = document.getElementById('job-count');
      if (countEl) countEl.textContent = visible;

      var noMatch = document.getElementById('car-no-match');
      if (noMatch) noMatch.style.display = visible === 0 ? 'block' : 'none';
    }

    /* ── Application form ─────────────────────────── */
    // function carSubmitForm() {
    //   var fname   = document.getElementById('car-fname');
    //   var lname   = document.getElementById('car-lname');
    //   var email   = document.getElementById('car-email');
    //   var role    = document.getElementById('car-role');
    //   var message = document.getElementById('car-message');
    //   var btn     = document.getElementById('car-submit-btn');

    //   /* Basic validation */
    //   var valid = true;
    //   [fname, lname, email, role, message].forEach(function(el) {
    //     if (!el.value.trim()) {
    //       el.style.borderColor = '#ef4444';
    //       el.style.boxShadow   = '0 0 0 3px rgba(239,68,68,.12)';
    //       valid = false;
    //     } else {
    //       el.style.borderColor = '';
    //       el.style.boxShadow   = '';
    //     }
    //   });

    //   /* Email format check */
    //   if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    //     email.style.borderColor = '#ef4444';
    //     email.style.boxShadow   = '0 0 0 3px rgba(239,68,68,.12)';
    //     valid = false;
    //   }

    //   if (!valid) return;

    //   /* Show loading state */
    //   btn.textContent = 'Sending...';
    //   btn.classList.add('submitted');
    //   btn.disabled = true;

    //   /* Simulate network delay then show success */
    //   setTimeout(function() {
    //     document.getElementById('car-apply-form-body').style.display = 'none';
    //     var success = document.getElementById('car-form-success');
    //     success.style.display = 'block';
    //   }, 1200);
    // }

    /* ── Scroll-triggered fade-in for sections ────── */
    (function () {
      var targets = document.querySelectorAll(
        '.car-benefit-card, .car-culture-card, .car-job-card, ' +
        '.car-process-step, .car-team-card, .car-contact-chip'
      );

      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

      targets.forEach(function (el, i) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(18px)';
        el.style.transition = 'opacity .45s ease ' + (i * 0.04) + 's, transform .45s ease ' + (i * 0.04) + 's';
        obs.observe(el);
      });
    })();
