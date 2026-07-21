(() => {
  const certificateContent = {
    iso: {
      title: 'ISO 9001:2015',
      text: 'Chứng nhận hệ thống quản lý chất lượng cho quy trình kiểm soát nguyên liệu, sản xuất, kiểm tra và bàn giao sản phẩm.',
      code: 'MIECO-ISO-DEMO-2026',
    },
    fda: {
      title: 'Food Contact Compliance',
      text: 'Hồ sơ tham chiếu cho sản phẩm được thiết kế để tiếp xúc trực tiếp với thực phẩm trong điều kiện sử dụng phù hợp.',
      code: 'MIECO-FDA-DEMO-2026',
    },
    sgs: {
      title: 'SGS Product Testing',
      text: 'Báo cáo kiểm nghiệm mẫu về độ bền, khả năng chịu nhiệt và các chỉ tiêu an toàn cơ bản của sản phẩm.',
      code: 'MIECO-SGS-DEMO-2026',
    },
    compost: {
      title: 'Compostable Standard',
      text: 'Hồ sơ đánh giá mẫu về khả năng phân rã và phù hợp với quy trình ủ công nghiệp trong điều kiện được kiểm soát.',
      code: 'MIECO-ECO-DEMO-2026',
    },
  };

  function initCounters() {
    const counters = Array.from(document.querySelectorAll('[data-count]'));
    if (!counters.length) return;

    const runCounter = (element) => {
      if (element.dataset.counted === 'true') return;
      element.dataset.counted = 'true';
      const target = Number(element.dataset.count || 0);
      const duration = 800;
      const start = performance.now();

      const update = (time) => {
        const progress = Math.min(1, (time - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = String(Math.round(target * eased)).padStart(2, '0');
        if (progress < 1) requestAnimationFrame(update);
      };

      requestAnimationFrame(update);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(runCounter);
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach((counter) => observer.observe(counter));
  }

  function initCertificateModal() {
    const modal = document.getElementById('certificateModal');
    if (!modal) return;

    const title = document.getElementById('certificateModalTitle');
    const text = document.getElementById('certificateModalText');
    const code = modal.querySelector('.modal-code');
    let lastTrigger = null;

    const open = (key, trigger) => {
      const content = certificateContent[key];
      if (!content) return;
      lastTrigger = trigger;
      title.textContent = content.title;
      text.textContent = content.text;
      code.textContent = `Document No: ${content.code}`;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      modal.querySelector('.modal-close')?.focus();
    };

    const close = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      lastTrigger?.focus();
    };

    document.querySelectorAll('[data-certificate]').forEach((button) => {
      button.addEventListener('click', () => open(button.dataset.certificate, button));
    });

    modal.querySelectorAll('[data-close-modal]').forEach((item) => {
      item.addEventListener('click', close);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initCounters();
    initCertificateModal();
  }, { once: true });
})();
