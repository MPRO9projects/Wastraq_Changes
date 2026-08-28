/* =====================================================================
   WASTRAQ — Blog Page (standalone bundle)
   All custom JS the Blog page needs: the hero title letter-split entrance
   animation (with the gradient-clip text and word-spacing fixes applied
   during the Phase 1 responsive pass) and the card reveal/flip animation.
   No navbar/footer injection, no shared.js — this page's own content
   never used any shared.js helper beyond injectNav/injectFooter, both
   removed since this page never renders a navbar or footer.
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Split Title into Words and Characters for Side-to-Side Animation
  const titleEl = document.getElementById('blog-title');

  if (titleEl) {
    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Walk the text run char-by-char rather than String.split(' '):
        // split(' ') on a leading/trailing/doubled space produces empty ''
        // entries that get skipped — losing the space itself, not just an
        // empty word. That happens for every text node that starts with a
        // space, e.g. the " and circular economy" node right after
        // </strong>, causing that word to visually collide with the word
        // before it.
        const text = node.textContent;
        const fragment = document.createDocumentFragment();
        let i = 0;

        while (i < text.length) {
          if (text[i] === ' ') {
            const spaceSpan = document.createElement('span');
            spaceSpan.className = 'blog-char';
            spaceSpan.textContent = ' ';
            fragment.appendChild(spaceSpan);
            i++;
            continue;
          }

          let j = i;
          while (j < text.length && text[j] !== ' ') j++;
          const word = text.slice(i, j);

          const wordSpan = document.createElement('span');
          wordSpan.className = 'blog-word';
          for (let k = 0; k < word.length; k++) {
            const charSpan = document.createElement('span');
            charSpan.className = 'blog-char';
            charSpan.textContent = word[k];
            wordSpan.appendChild(charSpan);
          }
          fragment.appendChild(wordSpan);
          i = j;
        }

        return fragment;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false);
        Array.from(node.childNodes).forEach(child => {
          clone.appendChild(processNode(child));
        });
        return clone;
      }
      return node.cloneNode(true);
    };

    const newContent = document.createDocumentFragment();
    Array.from(titleEl.childNodes).forEach(child => {
      newContent.appendChild(processNode(child));
    });

    titleEl.innerHTML = '';
    titleEl.appendChild(newContent);

    // 1b. Re-apply the gradient-clip text effect per character.
    // Splitting the heading into individual .blog-char spans (above) broke
    // the gradient: -webkit-text-fill-color is inherited by the new child
    // spans, but the gradient `background` that makes that transparent
    // fill visible is NOT inherited (background properties never cascade),
    // so every split character rendered fully invisible. Fix: give each
    // character inside .blog-gradient-text its own slice of the same
    // gradient, positioned so the slices line up into one continuous
    // sweep across the whole phrase (a standard technique for per-letter
    // gradient text) — and it handles multi-line wraps too, since each
    // char's position is measured relative to the whole run's bounding box.
    titleEl.querySelectorAll('.blog-gradient-text').forEach((gradEl) => {
      const chars = Array.from(gradEl.querySelectorAll('.blog-char'));
      if (!chars.length) return;

      const rects = chars.map((c) => c.getBoundingClientRect());
      const minLeft = Math.min.apply(null, rects.map((r) => r.left));
      const minTop = Math.min.apply(null, rects.map((r) => r.top));
      const maxRight = Math.max.apply(null, rects.map((r) => r.right));
      const maxBottom = Math.max.apply(null, rects.map((r) => r.bottom));
      const totalWidth = Math.max(1, maxRight - minLeft);
      const totalHeight = Math.max(1, maxBottom - minTop);

      chars.forEach((c, i) => {
        const r = rects[i];
        c.style.backgroundImage = 'linear-gradient(90deg, #6FBB59 0%, #159D91 45%, #0750AD 100%)';
        c.style.backgroundSize = totalWidth + 'px ' + totalHeight + 'px';
        c.style.backgroundPosition = (-(r.left - minLeft)) + 'px ' + (-(r.top - minTop)) + 'px';
        c.style.webkitBackgroundClip = 'text';
        c.style.backgroundClip = 'text';
        c.style.webkitTextFillColor = 'transparent';
        c.style.color = 'transparent';
      });
    });
  }

  // 2. GSAP Animations
  if (window.gsap) {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth <= 768;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Animate Section Label
    tl.to('.blog-label', {
      opacity: 1,
      y: 0,
      duration: 0.6
    });

    // Animate Title Characters Side-to-Side into place
    const chars = gsap.utils.toArray('.blog-char');

    chars.forEach((char, i) => {
      if (char.textContent.trim() === '') return;

      const isOdd = i % 2 === 0;
      const xOffset = isOdd ? (isMobile ? -25 : -45) : (isMobile ? 25 : 45);
      const rot = isOdd ? -8 : 8;

      gsap.set(char, {
        opacity: 0,
        x: xOffset,
        y: 15,
        rotate: rot
      });
    });

    tl.to('.blog-char', {
      opacity: 1,
      x: 0,
      y: 0,
      rotate: 0,
      stagger: 0.025,
      duration: 0.75,
      clearProps: 'transform,rotate'
    }, "-=0.3");

    // Animate Subtitle Paragraph
    tl.to('.blog-sub', {
      opacity: 1,
      y: 0,
      duration: 0.7
    }, "-=0.4");

    // 3. ScrollTrigger for Cards Section (3D Card Flip)
    const blogCards = gsap.utils.toArray('.blog-cards-section .blog-card');
    if (blogCards.length > 0 && window.ScrollTrigger) {
      gsap.set(blogCards, {
        opacity: 0,
        y: isMobile ? 25 : 45,
        scale: isMobile ? 0.98 : 0.96,
        rotateY: (i) => (isMobile ? (i % 2 === 0 ? -4 : 4) : (i % 2 === 0 ? -10 : 10)),
        rotateX: isMobile ? 3 : 5,
        transformPerspective: 1200,
        transformOrigin: 'center center'
      });

      ScrollTrigger.batch(blogCards, {
        start: 'top 85%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateY: 0,
            rotateX: 0,
            stagger: isMobile ? 0.08 : 0.12,
            duration: 0.8,
            ease: 'power3.out',
            clearProps: 'transformPerspective,rotateY,rotateX'
          });
        }
      });
    }
  }
});
