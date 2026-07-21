(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initReveal() {
    const items = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;

    const pending = [];

    items.forEach((item) => {
      const delay = Number(item.dataset.delay || 0);
      item.style.setProperty('--reveal-delay', `${delay}ms`);

      const rect = item.getBoundingClientRect();
      const isInitiallyVisible = rect.top < window.innerHeight * 0.94 && rect.bottom > 0;

      // Nội dung đầu trang hiển thị ngay, không chạy animation khi vừa chuyển trang.
      if (reducedMotion || isInitiallyVisible || !('IntersectionObserver' in window)) {
        item.classList.add('is-visible', 'reveal-immediate');
      } else {
        pending.push(item);
      }
    });

    if (!pending.length || reducedMotion || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -24px',
    });

    pending.forEach((item) => observer.observe(item));
  }

  function initProgress() {
    const bar = document.querySelector('.page-progress span');
    if (!bar) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
      bar.style.transform = `scaleX(${progress})`;
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    update();
  }

  function initBackToTop() {
    const button = document.querySelector('.back-to-top');
    if (!button) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      button.classList.toggle('is-visible', window.scrollY > 500);
    };
    const requestUpdate = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    update();

    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

  function initTilt() {
    if (reducedMotion || !window.matchMedia('(hover: hover)').matches) return;

    document.querySelectorAll('[data-tilt]').forEach((card) => {
      let frame = 0;
      let nextX = 0;
      let nextY = 0;

      const render = () => {
        frame = 0;
        card.style.setProperty('--rotate-x', `${nextX.toFixed(2)}deg`);
        card.style.setProperty('--rotate-y', `${nextY.toFixed(2)}deg`);
      };

      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        nextY = (x - 0.5) * 4;
        nextX = (0.5 - y) * 4;

        if (!frame) frame = requestAnimationFrame(render);
      }, { passive: true });

      card.addEventListener('pointerleave', () => {
        nextX = 0;
        nextY = 0;
        if (!frame) frame = requestAnimationFrame(render);
      });
    });
  }

  function init() {
    initReveal();
    initProgress();
    initBackToTop();
    initTilt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
