"use strict";

document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initSearch();
  initComingSoonLinks();
  initCarousel();
  initRevealAnimations();
  initContactForm();
  updateCopyrightYear();
});

function initNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const navigation = document.querySelector("[data-navigation]");

  if (!toggle || !navigation) return;

  const closeMenu = () => {
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    const label = toggle.querySelector(".sr-only");
    if (label) label.textContent = "Mở menu";
  };

  const openMenu = () => {
    document.body.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    const label = toggle.querySelector(".sr-only");
    if (label) label.textContent = "Đóng menu";
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) closeMenu();
  });
}

function initSearch() {
  const forms = document.querySelectorAll("[data-search-form]");

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector('input[type="search"]');
      const query = normalizeText(input?.value || "");

      if (!query) {
        showToast("Vui lòng nhập từ khóa cần tìm.");
        input?.focus();
        return;
      }

      const routes = [
        { keywords: ["lien he", "contact", "dien thoai", "email"], url: "lienhe.html" },
        { keywords: ["san pham", "tinh nang", "bao bi", "hop", "khay"], url: "gioithieu.html#tinh-nang" },
        { keywords: ["vong doi", "phan huy", "chung chi", "moi truong"], url: "gioithieu.html#vong-doi" },
        { keywords: ["gioi thieu", "ve chung toi", "tam nhin", "su menh", "mieco", "mi eco"], url: "gioithieu.html" },
      ];

      const match = routes.find((route) => route.keywords.some((keyword) => query.includes(keyword)));

      if (match) {
        window.location.href = match.url;
      } else {
        showToast("Chưa tìm thấy nội dung phù hợp với từ khóa này.");
      }
    });
  });
}

function initComingSoonLinks() {
  document.querySelectorAll("[data-coming-soon]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showToast("Nội dung này đang được cập nhật.");
    });
  });
}

function initCarousel() {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;

  const track = carousel.querySelector("[data-carousel-track]");
  const slides = Array.from(track?.children || []);
  const previousButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const dotsContainer = carousel.querySelector("[data-carousel-dots]");

  if (!track || slides.length === 0 || !dotsContainer) return;

  let currentIndex = 0;
  let autoplayId = null;
  let pointerStartX = null;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const dots = slides.map((_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "carousel-dot";
    button.setAttribute("aria-label", `Chuyển đến ảnh ${index + 1}`);
    button.addEventListener("click", () => {
      goToSlide(index);
      restartAutoplay();
    });
    dotsContainer.appendChild(button);
    return button;
  });

  function goToSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === currentIndex;
      slide.setAttribute("aria-hidden", String(!active));
    });

    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === currentIndex;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function previousSlide() {
    goToSlide(currentIndex - 1);
  }

  function stopAutoplay() {
    if (autoplayId !== null) {
      window.clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  function startAutoplay() {
    if (prefersReducedMotion || slides.length < 2 || autoplayId !== null) return;
    autoplayId = window.setInterval(nextSlide, 6500);
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  previousButton?.addEventListener("click", () => {
    previousSlide();
    restartAutoplay();
  });

  nextButton?.addEventListener("click", () => {
    nextSlide();
    restartAutoplay();
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previousSlide();
      restartAutoplay();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextSlide();
      restartAutoplay();
    }
  });

  carousel.addEventListener("pointerdown", (event) => {
    pointerStartX = event.clientX;
  });

  carousel.addEventListener("pointerup", (event) => {
    if (pointerStartX === null) return;
    const distance = event.clientX - pointerStartX;
    pointerStartX = null;

    if (Math.abs(distance) < 48) return;
    distance > 0 ? previousSlide() : nextSlide();
    restartAutoplay();
  });

  carousel.addEventListener("pointercancel", () => {
    pointerStartX = null;
  });

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("focusout", startAutoplay);
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stopAutoplay() : startAutoplay();
  });

  goToSlide(0);
  startAutoplay();
}

function initRevealAnimations() {
  const elements = document.querySelectorAll("[data-reveal]");
  if (!elements.length) return;

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -30px" },
  );

  elements.forEach((element) => observer.observe(element));
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  const successMessage = document.querySelector("[data-form-success]");
  if (!form) return;

  const fields = Array.from(form.querySelectorAll("input, textarea"));
  const touched = new WeakSet();

  const getMessage = (field) => {
    const value = field.value.trim();

    if (field.validity.valueMissing || !value) return "Vui lòng nhập thông tin này.";
    if (field.validity.typeMismatch) return "Email chưa đúng định dạng.";
    if (field.hasAttribute("data-phone") && !/^[0-9+().\s-]{8,20}$/.test(value)) {
      return "Số điện thoại chỉ nên gồm số và các ký tự + ( ) . -";
    }
    if (field.validity.tooShort) return `Vui lòng nhập ít nhất ${field.minLength} ký tự.`;
    return "";
  };

  const validateField = (field, force = false) => {
    if (!force && !touched.has(field)) return field.checkValidity();

    const fieldWrapper = field.closest(".form-field");
    const error = fieldWrapper?.querySelector("[data-field-error]");
    const value = field.value.trim();
    const phoneValid = !field.hasAttribute("data-phone") || /^[0-9+().\s-]{8,20}$/.test(value);
    const valid = field.checkValidity() && value !== "" && phoneValid;

    field.classList.toggle("is-invalid", !valid);
    field.classList.toggle("is-valid", valid);
    field.setAttribute("aria-invalid", String(!valid));

    if (error) error.textContent = valid ? "" : getMessage(field);
    return valid;
  };

  fields.forEach((field) => {
    field.addEventListener("blur", () => {
      touched.add(field);
      validateField(field, true);
    });

    field.addEventListener("input", () => {
      if (touched.has(field)) validateField(field, true);
      if (successMessage) successMessage.hidden = true;
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    let firstInvalid = null;
    let valid = true;

    fields.forEach((field) => {
      touched.add(field);
      const fieldValid = validateField(field, true);
      if (!fieldValid) {
        valid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (!valid) {
      firstInvalid?.focus();
      return;
    }

    form.reset();
    fields.forEach((field) => {
      field.classList.remove("is-valid", "is-invalid");
      field.removeAttribute("aria-invalid");
      const error = field.closest(".form-field")?.querySelector("[data-field-error]");
      if (error) error.textContent = "";
    });

    window.setTimeout(() => {
      if (successMessage) {
        successMessage.hidden = false;
        successMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 0);
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      fields.forEach((field) => {
        field.classList.remove("is-valid", "is-invalid");
        field.removeAttribute("aria-invalid");
        const error = field.closest(".form-field")?.querySelector("[data-field-error]");
        if (error) error.textContent = "";
      });
      if (successMessage) successMessage.hidden = true;
    }, 0);
  });
}

function updateCopyrightYear() {
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
}

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
    .toLowerCase();
}

let toastTimeout = null;
function showToast(message) {
  const toast = document.querySelector("[data-toast]");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("is-visible");

  if (toastTimeout !== null) window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2800);
}
