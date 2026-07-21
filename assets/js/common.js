(() => {
  const COMPONENT_EVENT = 'mieco:components-ready';
  const CACHE_VERSION = 'v4';
  const CACHE_KEYS = {
    header: `mieco:${CACHE_VERSION}:header`,
    footer: `mieco:${CACHE_VERSION}:footer`,
  };

  function readCache(key) {
    try {
      return sessionStorage.getItem(key) || '';
    } catch {
      return '';
    }
  }

  function writeCache(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Trình duyệt có thể chặn sessionStorage; website vẫn hoạt động bằng fetch.
    }
  }

  async function fetchComponent(path) {
    const response = await fetch(path, {
      cache: 'default',
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error(`Không tải được component: ${path} (${response.status})`);
    }

    return response.text();
  }

  function configureHeader(host) {
    const page = host.dataset.page || '';
    const homeLink = host.querySelector('[data-nav="home"]');

    if (page === 'home' && homeLink) {
      homeLink.setAttribute('href', '#section1');
    }

    host.querySelectorAll('[data-nav]').forEach((link) => {
      const isActive = link.dataset.nav === page;
      link.classList.toggle('active', isActive);

      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function injectHeader(host, html) {
    if (!html || host.dataset.componentHydrated === 'true') return;

    host.innerHTML = html;
    host.classList.add('mieco-shared-header', 'component-ready');
    host.dataset.componentHydrated = 'true';
    configureHeader(host);
  }

  function injectFooter(host, html) {
    if (!html || host.dataset.componentHydrated === 'true') return;

    host.innerHTML = html;
    host.classList.add('component-ready');
    host.dataset.componentHydrated = 'true';
  }

  function hydrateCachedComponents() {
    const headerHtml = readCache(CACHE_KEYS.header);
    const footerHtml = readCache(CACHE_KEYS.footer);

    if (headerHtml) {
      document.querySelectorAll('[data-component="header"]').forEach((host) => {
        injectHeader(host, headerHtml);
      });
    }

    if (footerHtml) {
      document.querySelectorAll('[data-component="footer"]').forEach((host) => {
        injectFooter(host, footerHtml);
      });
    }
  }

  function bindSearchForms() {
    document.querySelectorAll('.search-form').forEach((form) => {
      if (form.dataset.bound === 'true') return;
      form.dataset.bound = 'true';

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = form.querySelector('input[name="q"], input[type="search"], input[type="text"]');
        const query = input ? input.value.trim() : '';
        const onProductPage = window.location.pathname.endsWith('/sanpham.html')
          || window.location.pathname.endsWith('sanpham.html');

        if (onProductPage) {
          const url = new URL(window.location.href);
          if (query) url.searchParams.set('q', query);
          else url.searchParams.delete('q');
          window.history.replaceState({}, '', url);
          input?.dispatchEvent(new Event('input', { bubbles: true }));
          document.getElementById('danh-muc')?.scrollIntoView({ behavior: 'smooth' });
          return;
        }

        window.location.href = query
          ? `sanpham.html?q=${encodeURIComponent(query)}`
          : 'sanpham.html';
      });
    });
  }

  function bindInternalHeaderLinks() {
    document.querySelectorAll('.menu a[href^="#"]').forEach((link) => {
      if (link.getAttribute('href') === '#' || link.dataset.bound === 'true') return;
      link.dataset.bound = 'true';

      link.addEventListener('click', (event) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  function bindPagePrefetch() {
    const links = Array.from(document.querySelectorAll('.menu a[href$=".html"]'));
    const prefetched = new Set();

    const prefetch = (href) => {
      if (!href || prefetched.has(href)) return;
      prefetched.add(href);

      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      link.as = 'document';
      document.head.appendChild(link);
    };

    links.forEach((link) => {
      if (link.dataset.prefetchBound === 'true') return;
      link.dataset.prefetchBound = 'true';

      const href = link.getAttribute('href');
      const warm = () => prefetch(href);
      link.addEventListener('pointerenter', warm, { once: true, passive: true });
      link.addEventListener('focus', warm, { once: true });
      link.addEventListener('touchstart', warm, { once: true, passive: true });
    });

    const warmAll = () => links.forEach((link) => prefetch(link.getAttribute('href')));
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(warmAll, { timeout: 1800 });
    } else {
      window.setTimeout(warmAll, 900);
    }
  }

  function bindComponents() {
    bindSearchForms();
    bindInternalHeaderLinks();
    bindPagePrefetch();
  }

  async function loadComponents() {
    const headerHosts = Array.from(document.querySelectorAll('[data-component="header"]'));
    const footerHosts = Array.from(document.querySelectorAll('[data-component="footer"]'));

    const headerRequest = headerHosts.length
      ? fetchComponent('components/header.html')
      : Promise.resolve('');
    const footerRequest = footerHosts.length
      ? fetchComponent('components/footer.html')
      : Promise.resolve('');

    const [headerResult, footerResult] = await Promise.allSettled([
      headerRequest,
      footerRequest,
    ]);

    if (headerResult.status === 'fulfilled' && headerResult.value) {
      writeCache(CACHE_KEYS.header, headerResult.value);
      headerHosts.forEach((host) => {
        if (host.dataset.componentHydrated !== 'true') injectHeader(host, headerResult.value);
      });
    } else if (headerResult.status === 'rejected') {
      console.error(headerResult.reason);
    }

    if (footerResult.status === 'fulfilled' && footerResult.value) {
      writeCache(CACHE_KEYS.footer, footerResult.value);
      footerHosts.forEach((host) => {
        if (host.dataset.componentHydrated !== 'true') injectFooter(host, footerResult.value);
      });
    } else if (footerResult.status === 'rejected') {
      console.error(footerResult.reason);
    }

    bindComponents();
    document.dispatchEvent(new CustomEvent(COMPONENT_EVENT));
  }

  // common.js được đặt cuối trang và dùng defer, nên DOM đã có thể hydrate ngay.
  // Từ lần chuyển trang thứ hai trở đi, header/footer xuất hiện tức thì từ sessionStorage.
  hydrateCachedComponents();
  bindComponents();

  window.miecoComponentsReady = new Promise((resolve) => {
    const start = () => {
      loadComponents()
        .catch((error) => {
          console.error(error);
          document.querySelectorAll('[data-component]').forEach((host) => {
            if (!host.innerHTML.trim()) {
              host.innerHTML = '<p class="component-error">Không tải được thành phần dùng chung. Hãy mở website bằng Live Server.</p>';
            }
          });
        })
        .finally(resolve);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
      start();
    }
  });
})();
