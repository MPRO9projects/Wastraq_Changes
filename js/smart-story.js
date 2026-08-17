(() => {
  const section = document.getElementById('wq-smart-story');
  if (!section) return;

  const revealEls = section.querySelectorAll('.wq-story-reveal');
  const storyBlocks = section.querySelectorAll('.wq-story-block');
  const storyLineFill = section.querySelector('#wq-story-line-fill');
  const story = section.querySelector('.wq-smart-story-track');

  if (!story || !storyLineFill) return;

  revealEls.forEach((element) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.disconnect();
        }
      });
    }, { threshold: 0.14 });

    observer.observe(element);
  });

  let lastScrollY = window.scrollY;
  let scrollDirection = 'down';

  function updateDirection() {
    const currentY = window.scrollY;
    scrollDirection = currentY > lastScrollY ? 'down' : 'up';
    lastScrollY = currentY;
  }

  function updateStoryLine() {
    const rect = story.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const start = viewportHeight * 0.72;
    const end = -rect.height + viewportHeight * 0.32;
    let progress = (start - rect.top) / (start - end);
    progress = Math.max(0, Math.min(1, progress));
    storyLineFill.style.height = `${progress * 100}%`;
  }

  const storyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const block = entry.target;

      if (entry.isIntersecting) {
        block.classList.remove('scroll-down', 'scroll-up');
        block.classList.add('active');
      } else {
        block.classList.remove('active');
        if (scrollDirection === 'down') {
          block.classList.remove('scroll-up');
          block.classList.add('scroll-down');
        } else {
          block.classList.remove('scroll-down');
          block.classList.add('scroll-up');
        }
      }
    });
  }, { rootMargin: '-16% 0px -16% 0px', threshold: 0.18 });

  storyBlocks.forEach((block) => storyObserver.observe(block));

  window.addEventListener('scroll', () => {
    updateDirection();
    updateStoryLine();
  }, { passive: true });

  updateStoryLine();

  const workflowCards = section.querySelectorAll('.wq-workflow-card');
  let workflowIndex = 0;

  function highlightWorkflow() {
    workflowCards.forEach((card) => card.classList.remove('active-step'));
    if (workflowCards[workflowIndex]) {
      workflowCards[workflowIndex].classList.add('active-step');
      workflowIndex = (workflowIndex + 1) % workflowCards.length;
    }
  }

  const workflowTimer = setInterval(highlightWorkflow, 1250);

  if (workflowTimer) {
    section.addEventListener('mouseleave', () => highlightWorkflow());
  }
})();
