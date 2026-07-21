const sliderWrapper = document.getElementById('slider-wrapper');
  const images = sliderWrapper ? sliderWrapper.querySelectorAll('img') : [];
  const sliderDots = document.getElementById('slider-dots');
  let current = 0, interval;

  // Tạo dot cho mỗi ảnh
  images.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'dot';
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      current = i;
      updateSlider();
      resetAuto();
    });
    sliderDots?.appendChild(dot);
  });
  const dots = sliderDots ? sliderDots.querySelectorAll('.dot') : [];

  // Cập nhật slider
  function updateSlider() {
    if (!sliderWrapper) return;
    sliderWrapper.style.transform = `translateX(-${current * (100 / images.length)}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function nextSlide() {
    current = (current + 1) % images.length;
    updateSlider();
  }

  function startAuto() {
    interval = setInterval(nextSlide, 7000);
  }

  function resetAuto() {
    clearInterval(interval);
    startAuto();
  }

  window.addEventListener('load', () => {
    updateSlider();
    startAuto();
  });

  // Ngăn kéo ảnh
  images.forEach(img => img.addEventListener('dragstart', e => e.preventDefault()));

  // Kéo chuột ngang
  let isDragging = false, startX = 0;
  sliderWrapper?.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.pageX;
    sliderWrapper.style.cursor = 'grabbing';
  });

  sliderWrapper?.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const diff = e.pageX - startX;
    if (Math.abs(diff) > 50) {
      current = diff > 0
        ? (current - 1 + images.length) % images.length
        : (current + 1) % images.length;
      updateSlider();
      resetAuto();
      isDragging = false;
    }
  });

  ['mouseup', 'mouseleave'].forEach(evt =>
    sliderWrapper?.addEventListener(evt, () => {
      isDragging = false;
      sliderWrapper.style.cursor = 'grab';
    })
  );

  // Dot nav và floating header
  const snapContainer = document.querySelector('.snap-container');
  const sections = document.querySelectorAll('.snap-section');
  const navDots = document.querySelectorAll('.dot-nav .dot');
  const floatingHeader = document.getElementById('floatingHeader');

  navDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      sections[i].scrollIntoView({ behavior: 'smooth' });
    });
  });

  if (snapContainer) snapContainer.addEventListener('scroll', () => {
    let active = 0;
    sections.forEach((sec, i) => {
      if (sec.getBoundingClientRect().top <= window.innerHeight / 2) active = i;
    });
    navDots.forEach((d, i) => d.classList.toggle('active', i === active));
    floatingHeader?.classList.toggle('show', active !== 0);
    floatingHeader?.classList.toggle('hidden', active === 0);
  });

  // Cuộn mượt bằng chuột
  let isScrolling = false;
  if (snapContainer && window.matchMedia('(min-width: 901px)').matches) snapContainer.addEventListener('wheel', function(e) {
    e.preventDefault();
    if (isScrolling) return;
    isScrolling = true;
    const dir = e.deltaY > 0 ? 1 : -1;
    const idx = Array.from(sections).findIndex(sec =>
      sec.getBoundingClientRect().top >= -1 && sec.getBoundingClientRect().top < window.innerHeight
    );
    const target = Math.max(0, Math.min(sections.length - 1, idx + dir));
    sections[target].scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => isScrolling = false, 800);
  }, { passive: false });
