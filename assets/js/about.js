(() => {
  function initAboutAnimations() {
    const selectors = '.fade-up, .slide-left, .slide-right, .slide-left-observe, .slide-right-observe, .feature-item';
    const elements = Array.from(document.querySelectorAll(selectors));
    if (!elements.length) return;

    const pending = [];

    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const isInitiallyVisible = rect.top < window.innerHeight * 0.94 && rect.bottom > 0;

      if (isInitiallyVisible || !('IntersectionObserver' in window)) {
        element.classList.add('show', 'show-immediately');
      } else {
        pending.push(element);
      }
    });

    if (!pending.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('show');
        currentObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -24px',
    });

    pending.forEach((element) => observer.observe(element));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutAnimations, { once: true });
  } else {
    initAboutAnimations();
  }
})();
