// partnership.js — page-specific behavior for partnership.html
// Covers: the scroll-pinned hero→cards morph (fixes the layer-overlap bug),
// the Apply/Login modals, and the FAQ accordion.

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     1. SCROLL-PINNED HERO → CARDS MORPH
     Fixes the visual bug: .hero-editorial-layer and .morph-cards-layer
     are both position:absolute; inset:0 (stacked in the same spot by
     design, for a scroll-scrubbed cross-fade). With no JS, both show
     at full opacity at once. This computes scroll progress through the
     pinned #heroStage section and cross-fades between the two layers.
  ══════════════════════════════════════════════════════════ */
  function initHeroMorph() {
    const stage = document.getElementById('heroStage');
    const heroLayer = document.getElementById('heroEditorialLayer');
    const cardsLayer = document.getElementById('morphCardsLayer');
    const cardsContainer = document.getElementById('morphCardsContainer');
    if (!stage || !heroLayer || !cardsLayer) return;

    // Start both layers hidden until the first measurement runs, so there's
    // never a flash of the fully-overlapped state.
    heroLayer.style.transition = 'opacity .25s ease';
    cardsLayer.style.transition = 'opacity .25s ease';

    let ticking = false;

    function update() {
      ticking = false;
      const rect = stage.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const scrollable = rect.height - viewportH;

      if (scrollable <= 0) {
        // Section shorter than the viewport (e.g. small screens) — just show the cards.
        heroLayer.style.opacity = '0';
        heroLayer.style.pointerEvents = 'none';
        cardsLayer.style.opacity = '1';
        cardsLayer.style.pointerEvents = 'all';
        return;
      }

      // Progress through the pinned section: 0 = just pinned, 1 = about to unpin.
      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);

      // Cross-fade over the first 45% of the pinned scroll distance, then
      // hold on the cards for the remainder so they're comfortably readable.
      const fadeEnd = 0.45;
      const t = Math.min(progress / fadeEnd, 1);

      heroLayer.style.opacity = String(1 - t);
      heroLayer.style.pointerEvents = t >= 1 ? 'none' : 'all';
      cardsLayer.style.opacity = String(t);
      cardsLayer.style.pointerEvents = t <= 0 ? 'none' : 'all';
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();

    // Optional nicety: clicking a card brings it into focus (CSS already
    // has .active-focus / .has-center-focus styles for this).
    if (cardsContainer) {
      const cards = cardsContainer.querySelectorAll('.partnership-morph-card');
      cards.forEach((card) => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('button')) return; // let Apply/Login buttons handle their own click
          const alreadyFocused = card.classList.contains('active-focus');
          cards.forEach((c) => c.classList.remove('active-focus'));
          cardsContainer.classList.toggle('has-center-focus', !alreadyFocused);
          if (!alreadyFocused) card.classList.add('active-focus');
        });
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     2. APPLY / LOGIN MODALS
  ══════════════════════════════════════════════════════════ */
  function initModals() {
    const applyModal = document.getElementById('applyModal');
    const loginModal = document.getElementById('loginModal');

    function openModal(modal) {
      if (!modal) return;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeModal(modal) {
      if (!modal) return;
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    function selectPill(pillsContainer, pills, target) {
      pills.forEach((p) => p.classList.toggle('active', p === target));
    }

    // Apply modal — any .js-apply trigger opens it, pre-selecting data-open-type
    if (applyModal) {
      const typePills = Array.from(document.querySelectorAll('#typePills .modal-pill'));
      const typeSelect = document.getElementById('typeSelect');

      document.querySelectorAll('.js-apply').forEach((trigger) => {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          const type = trigger.getAttribute('data-open-type') || 'Reseller';
          const match = typePills.find((p) => p.getAttribute('data-type') === type);
          if (match) selectPill('#typePills', typePills, match);
          if (typeSelect) typeSelect.value = type;
          openModal(applyModal);
        });
      });

      typePills.forEach((pill) => {
        pill.addEventListener('click', () => {
          selectPill('#typePills', typePills, pill);
          if (typeSelect) typeSelect.value = pill.getAttribute('data-type');
        });
      });

      if (typeSelect) {
        typeSelect.addEventListener('change', () => {
          const match = typePills.find((p) => p.getAttribute('data-type') === typeSelect.value);
          if (match) selectPill('#typePills', typePills, match);
        });
      }

      const applyForm = document.getElementById('applyForm');
      if (applyForm) {
        applyForm.addEventListener('submit', (e) => {
          e.preventDefault();
          closeModal(applyModal);
          applyForm.reset();
        });
      }

      const closeBtn = document.getElementById('modalClose');
      if (closeBtn) closeBtn.addEventListener('click', () => closeModal(applyModal));
      applyModal.addEventListener('click', (e) => {
        if (e.target === applyModal) closeModal(applyModal);
      });
    }

    // Login modal — any .js-login trigger opens it, pre-selecting data-track-login
    if (loginModal) {
      const loginPills = Array.from(document.querySelectorAll('#loginTypePills .modal-pill'));

      document.querySelectorAll('.js-login').forEach((trigger) => {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          const track = trigger.getAttribute('data-track-login') || 'Reseller';
          const match = loginPills.find((p) => p.getAttribute('data-login-track') === track);
          if (match) selectPill('#loginTypePills', loginPills, match);
          openModal(loginModal);
        });
      });

      loginPills.forEach((pill) => {
        pill.addEventListener('click', () => selectPill('#loginTypePills', loginPills, pill));
      });

      const loginForm = document.getElementById('loginForm');
      if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          closeModal(loginModal);
          loginForm.reset();
        });
      }

      const loginClose = document.getElementById('loginClose');
      if (loginClose) loginClose.addEventListener('click', () => closeModal(loginModal));
      loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) closeModal(loginModal);
      });
    }

    // Esc closes whichever modal is open
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (applyModal && applyModal.classList.contains('open')) closeModal(applyModal);
      if (loginModal && loginModal.classList.contains('open')) closeModal(loginModal);
    });
  }

  /* ══════════════════════════════════════════════════════════
     3. FAQ ACCORDION
  ══════════════════════════════════════════════════════════ */
  function initFaqAccordion() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach((item) => {
      const question = item.querySelector('.faq-question');
      if (!question) return;
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        items.forEach((i) => i.classList.remove('active'));
        if (!isOpen) item.classList.add('active');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHeroMorph();
    initModals();
    initFaqAccordion();
  });
})();
