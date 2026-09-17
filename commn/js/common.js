"use strict";

(() => {
  const updateCurrentYear = () => {
    const year = String(new Date().getFullYear());
    document.querySelectorAll("[data-current-year]").forEach((element) => {
      element.textContent = year;
    });
  };

  const initStickyHeader = () => {
    const header = document.querySelector(".top-header");
    if (!header) return;

    const syncHeight = () => {
      document.documentElement.style.setProperty(
        "--sticky-header-height",
        `${header.getBoundingClientRect().height}px`,
      );
    };
    const hero = document.querySelector(".hero");
    if (hero) document.documentElement.classList.add("has-scroll-hero");
    const syncShadow = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      if (hero) {
        const visible = hero.getBoundingClientRect().bottom <= 0;
        header.classList.toggle("is-visible", visible);
        header.inert = !visible;
      }
    };

    syncHeight();
    syncShadow();
    if ("ResizeObserver" in window) new ResizeObserver(syncHeight).observe(header);
    else window.addEventListener("resize", syncHeight);
    window.addEventListener("scroll", syncShadow, { passive: true });
    window.addEventListener("resize", syncShadow);
    window.addEventListener("pageshow", syncShadow);
    if (hero && "ResizeObserver" in window) new ResizeObserver(syncShadow).observe(hero);
  };

  const initMenu = () => {
    const button = document.querySelector("[data-menu-button]");
    const navigation = document.querySelector("#global-nav");
    if (!button || !navigation) return;

    const backgroundElements = document.querySelectorAll(
      "main, .top-footer, [data-back-to-top]",
    );
    const originalInert = new Map();
    const close = (restoreFocus = false) => {
      const wasOpen = navigation.classList.contains("is-open");
      button.classList.remove("is-open");
      navigation.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "メニューを開く");
      originalInert.forEach((value, element) => { element.inert = value; });
      originalInert.clear();
      if (wasOpen && restoreFocus) button.focus();
    };
    const open = () => {
      navigation.classList.add("is-open");
      button.classList.add("is-open");
      document.body.classList.add("menu-open");
      button.setAttribute("aria-expanded", "true");
      button.setAttribute("aria-label", "メニューを閉じる");
      backgroundElements.forEach((element) => {
        originalInert.set(element, element.inert);
        element.inert = true;
      });
      navigation.scrollTop = 0;
      navigation.querySelector("a")?.focus({ preventScroll: true });
    };

    button.addEventListener("click", () => {
      if (navigation.classList.contains("is-open")) close(true);
      else open();
    });
    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => close());
    });
    document.addEventListener("keydown", (event) => {
      if (!navigation.classList.contains("is-open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
        return;
      }
      if (event.key !== "Tab") return;
      const controls = [...document.querySelectorAll(".top-header a, .top-header button")]
        .filter((element) => element.getClientRects().length && getComputedStyle(element).visibility !== "hidden");
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 767) close();
    });
  };

  const initRevealAnimations = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !("IntersectionObserver" in window) || !Element.prototype.animate) return;

    const animations = new Set();
    const observer = new IntersectionObserver((entries) => {
      let order = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (reducedMotion.matches) return;

        const animation = entry.target.animate(
          [
            { opacity: 0, transform: "translateY(22px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: 650,
            delay: Math.min(order++ * 80, 240),
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "backwards",
          },
        );
        animations.add(animation);
        animation.addEventListener("finish", () => animations.delete(animation), { once: true });
      });
    }, { threshold: 0.08 });

    const observe = () => {
      document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
    };
    if (document.body.classList.contains("is-loading")) {
      document.addEventListener("elevate:opening-complete", observe, { once: true });
    } else {
      observe();
    }

    reducedMotion.addEventListener("change", (event) => {
      if (!event.matches) return;
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    });
  };

  updateCurrentYear();
  initStickyHeader();
  initMenu();
  initRevealAnimations();
})();
