document.addEventListener('DOMContentLoaded', async () => {
  await window.miecoComponentsReady;
  const cards = Array.from(document.querySelectorAll('.product-card'));
  const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
  const resultMessage = document.getElementById('resultMessage');
  const searchInput = document.querySelector('.search-form input[name="q"]');

  let activeFilter = 'all';
  let searchTerm = '';

  const normalizeText = (value) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();

  const applyFilters = () => {
    let visibleCount = 0;

    cards.forEach((card) => {
      const categoryMatch = activeFilter === 'all' || card.dataset.category === activeFilter;
      const content = normalizeText(`${card.dataset.search || ''} ${card.textContent}`);
      const searchMatch = !searchTerm || content.includes(normalizeText(searchTerm));
      const shouldShow = categoryMatch && searchMatch;

      card.classList.toggle('is-hidden', !shouldShow);
      if (shouldShow) visibleCount += 1;
    });

    if (!searchTerm && activeFilter === 'all') {
      resultMessage.textContent = '';
    } else if (visibleCount > 0) {
      resultMessage.textContent = `Đang hiển thị ${visibleCount} sản phẩm phù hợp.`;
    } else {
      resultMessage.textContent = 'Chưa tìm thấy sản phẩm phù hợp. Vui lòng thử từ khóa khác.';
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.toggle('active', item === button));
      applyFilters();
    });
  });

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
    searchTerm = initialQuery;
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchTerm = searchInput.value;
      applyFilters();
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal-up, .reveal-right').forEach((element) => observer.observe(element));
  applyFilters();
});
