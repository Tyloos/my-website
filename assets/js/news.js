(() => {
  const normalize = (value) => value
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

  function initNewsFilters() {
    const grid = document.getElementById('newsGrid');
    const cards = Array.from(grid?.querySelectorAll('.news-card') || []);
    const filters = Array.from(document.querySelectorAll('.news-filter'));
    const searchInput = document.getElementById('newsSearch');
    const result = document.getElementById('newsResult');

    if (!grid || !cards.length) return;

    let currentFilter = 'all';
    let updateToken = 0;

    const setCardVisibility = (card, show, token) => {
      window.clearTimeout(Number(card.dataset.hideTimer || 0));

      if (show) {
        card.classList.remove('is-hidden');
        requestAnimationFrame(() => {
          if (token !== updateToken) return;
          card.classList.remove('is-filtering-out');
          card.animate([
            { opacity: 0, transform: 'translateY(12px) scale(.98)' },
            { opacity: 1, transform: 'translateY(0) scale(1)' },
          ], {
            duration: 320,
            easing: 'cubic-bezier(.22,1,.36,1)',
          });
        });
        return;
      }

      card.classList.add('is-filtering-out');
      const timer = window.setTimeout(() => {
        if (token !== updateToken) return;
        card.classList.add('is-hidden');
      }, 220);
      card.dataset.hideTimer = String(timer);
    };

    const update = () => {
      updateToken += 1;
      const token = updateToken;
      const query = normalize(searchInput?.value.trim() || '');
      let visible = 0;

      cards.forEach((card) => {
        const categoryMatches = currentFilter === 'all' || card.dataset.category === currentFilter;
        const haystack = normalize(`${card.dataset.search || ''} ${card.textContent || ''}`);
        const queryMatches = !query || haystack.includes(query);
        const show = categoryMatches && queryMatches;

        setCardVisibility(card, show, token);
        if (show) visible += 1;
      });

      if (result) {
        result.textContent = visible
          ? `Hiển thị ${visible} bài viết.`
          : 'Không tìm thấy bài viết phù hợp.';
      }
    };

    filters.forEach((button) => {
      button.addEventListener('click', () => {
        currentFilter = button.dataset.filter || 'all';
        filters.forEach((item) => item.classList.toggle('active', item === button));
        update();
      });
    });

    searchInput?.addEventListener('input', update);
    update();
  }

  function initDetails() {
    document.querySelectorAll('details').forEach((details) => {
      details.addEventListener('toggle', () => {
        if (!details.open) return;
        document.querySelectorAll('details[open]').forEach((other) => {
          if (other !== details && other.closest('.news-card') === details.closest('.news-card')) {
            other.open = false;
          }
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNewsFilters();
    initDetails();
  }, { once: true });
})();
