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
    const syncShadow = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    syncHeight();
    syncShadow();
    if ("ResizeObserver" in window) new ResizeObserver(syncHeight).observe(header);
    else window.addEventListener("resize", syncHeight);
    window.addEventListener("scroll", syncShadow, { passive: true });
  };

  const initMenu = () => {
    const button = document.querySelector("[data-menu-button]");
    const navigation = document.querySelector("#global-nav");
    if (!button || !navigation) return;

    const desktopMedia = window.matchMedia("(min-width: 768px)");
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
    desktopMedia.addEventListener("change", (event) => {
      if (event.matches) close();
    });
  };

  const initServiceMenu = () => {
    const navigation = document.querySelector("#global-nav");
    const serviceLink = navigation?.querySelector(
      ':scope > a[href$="service/index.html"]',
    );
    if (!navigation || !serviceLink) return;

    const desktopMedia = window.matchMedia("(min-width: 768px)");
    const services = [
      {
        label: "総合人材派遣サービス",
        path: "staffing/index.html",
      },
      {
        label: "IT・DX事業",
        path: "dx/index.html",
      },
    ];
    let wrapper;

    const close = () => {
      if (!wrapper) return;
      wrapper.classList.remove("is-open");
      serviceLink.setAttribute("aria-expanded", "false");
    };
    const open = () => {
      if (!wrapper) return;
      wrapper.classList.add("is-open");
      serviceLink.setAttribute("aria-expanded", "true");
    };
    const build = () => {
      if (wrapper || !desktopMedia.matches) return;

      wrapper = document.createElement("div");
      wrapper.className = "service-navigation";
      serviceLink.before(wrapper);
      wrapper.append(serviceLink);

      const panel = document.createElement("div");
      panel.className = "service-menu";
      panel.id = "service-menu";
      panel.setAttribute("role", "group");
      panel.setAttribute("aria-label", "サービス内容のサブメニュー");

      services.forEach(({ label, path }) => {
        const link = document.createElement("a");
        const text = document.createElement("span");
        const arrow = document.createElement("span");

        link.className = "service-menu__link hover-trigger";
        link.href = new URL(path, serviceLink.href).href;
        text.className = "service-menu__label hover-underline";
        text.textContent = label;
        arrow.className = "service-menu__arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";
        link.append(text, arrow);
        panel.append(link);
      });

      wrapper.append(panel);
      serviceLink.setAttribute("aria-controls", panel.id);
      serviceLink.setAttribute("aria-expanded", "false");

      wrapper.addEventListener("pointerenter", (event) => {
        if (event.pointerType !== "touch") open();
      });
      wrapper.addEventListener("pointerleave", close);
      wrapper.addEventListener("focusin", open);
      wrapper.addEventListener("focusout", () => {
        requestAnimationFrame(() => {
          if (wrapper && !wrapper.contains(document.activeElement)) close();
        });
      });
      wrapper.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        serviceLink.focus({ preventScroll: true });
        close();
      });
    };
    const destroy = () => {
      if (!wrapper) return;
      close();
      serviceLink.removeAttribute("aria-controls");
      serviceLink.removeAttribute("aria-expanded");
      wrapper.before(serviceLink);
      wrapper.remove();
      wrapper = undefined;
    };

    build();
    desktopMedia.addEventListener("change", () => {
      if (desktopMedia.matches) build();
      else destroy();
    });
  };

  const initRevealAnimations = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !("IntersectionObserver" in window) || !Element.prototype.animate) return;

    const animations = new Set();
    const directions = new WeakMap();
    const observer = new IntersectionObserver((entries) => {
      let order = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (reducedMotion.matches) return;

        const animation = entry.target.animate(
          [
            { opacity: 0, translate: `${directions.get(entry.target) || -44}px 0`, filter: "blur(3px)" },
            { opacity: 1, translate: "0 0", filter: "blur(0)" },
          ],
          {
            duration: 850,
            delay: Math.min(order++ * 65, 195),
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "backwards",
          },
        );
        animations.add(animation);
        animation.addEventListener("finish", () => animations.delete(animation), { once: true });
      });
    }, { threshold: 0.08 });

    const observe = () => {
      const candidates = document.querySelectorAll(
        "main [data-reveal], main h2, main h3, main p, main img, main .advance-form__row",
      );
      let index = 0;
      candidates.forEach((element) => {
        // 親子を同時に動かさず、カードや文章のまとまりを保つ。
        if (element.closest("dialog, .swiper-wrapper, .visually-hidden, [aria-hidden='true']") ||
            element.parentElement.closest("[data-reveal]")) return;
        if (!element.hasAttribute("data-reveal") &&
            element.parentElement.closest(".advance-form__row")) return;
        directions.set(element, element.dataset.reveal === "right" ? 44 :
          element.dataset.reveal === "left" ? -44 : index++ % 2 ? 44 : -44);
        observer.observe(element);
      });
    };
    const observeWhenReady = () => {
      if (document.body.matches(".is-loading, .is-page-entering")) return;
      observe();
    };
    if (document.body.matches(".is-loading, .is-page-entering")) {
      document.addEventListener("elevate:opening-complete", observeWhenReady, { once: true });
      document.addEventListener("elevate:page-transition-complete", observeWhenReady, { once: true });
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

  const initHeroTitleMotion = () => {
    const title = document.querySelector("main h1");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!title || reducedMotion.matches || !Element.prototype.animate) return;

    let animation;
    const play = () => {
      if (animation) return;
      title.classList.add("motion-hero-title");
      animation = title.animate(
        [
          { clipPath: "inset(0 100% 0 0)", opacity: 0, transform: "translateY(0.55em)", filter: "blur(5px)" },
          { clipPath: "inset(0 0 0 0)", opacity: 1, transform: "translateY(0)", filter: "blur(0)" },
        ],
        {
          duration: 1150,
          delay: 120,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "backwards",
        },
      );
    };

    const playWhenReady = () => {
      if (document.body.matches(".is-loading, .is-page-entering")) return;
      play();
    };
    if (document.body.matches(".is-loading, .is-page-entering")) {
      document.addEventListener("elevate:opening-complete", playWhenReady, { once: true });
      document.addEventListener("elevate:page-transition-complete", playWhenReady, { once: true });
    } else {
      requestAnimationFrame(play);
    }
    reducedMotion.addEventListener("change", (event) => {
      if (!event.matches) return;
      animation?.cancel();
      title.classList.remove("motion-hero-title");
    }, { once: true });
  };

  const initMagneticButtons = () => {
    const media = window.matchMedia(
      "(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let cleanup;
    const sync = () => {
      cleanup?.();
      cleanup = undefined;
      if (!media.matches) return;
      const controller = new AbortController();
      const options = { signal: controller.signal, passive: true };
      const buttons = [...document.querySelectorAll(
        ".header-button, .pill, .dx-hero__button, .dispatch-contact__button, " +
        ".advance-form__submit, .mobile-menu-cta, .mobile-menu-contact, [data-magnetic]",
      )];
      buttons.forEach((button) => {
        button.classList.add("motion-magnetic");
        button.addEventListener("pointermove", (event) => {
          if (event.pointerType !== "mouse" || button.matches(":disabled")) return;
          const rect = button.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
          const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
          button.style.setProperty("--magnetic-x", `${x.toFixed(2)}px`);
          button.style.setProperty("--magnetic-y", `${y.toFixed(2)}px`);
          button.style.setProperty("--magnetic-scale", "1.025");
        }, options);
        const reset = () => {
          button.style.setProperty("--magnetic-x", "0px");
          button.style.setProperty("--magnetic-y", "0px");
          button.style.setProperty("--magnetic-scale", "1");
        };
        button.addEventListener("pointerleave", reset, options);
        button.addEventListener("pointercancel", reset, options);
        button.addEventListener("blur", reset, options);
      });
      cleanup = () => {
        controller.abort();
        buttons.forEach((button) => {
          button.classList.remove("motion-magnetic");
          button.style.removeProperty("--magnetic-x");
          button.style.removeProperty("--magnetic-y");
          button.style.removeProperty("--magnetic-scale");
        });
      };
    };
    sync();
    media.addEventListener("change", sync);
  };

  const initCardTilt = () => {
    const media = window.matchMedia(
      "(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let cleanup;
    const sync = () => {
      cleanup?.();
      cleanup = undefined;
      if (!media.matches) return;
      const controller = new AbortController();
      const options = { signal: controller.signal, passive: true };
      const cards = [...document.querySelectorAll(
        ".service-card, .seeker-card, .interview-card, .staffing-business-card, " +
        ".dx-service-card, .dispatch-benefit, [data-tilt]",
      )].filter(card => !card.matches("[data-no-tilt]"));
      const resets = new Map();

      cards.forEach((card) => {
        card.classList.add("motion-tilt-card");
        const glare = document.createElement("span");
        glare.className = "motion-card-glare";
        glare.setAttribute("aria-hidden", "true");
        card.append(glare);
        let frame = 0;
        let nextEvent;
        const render = () => {
          frame = 0;
          if (!nextEvent) return;
          const rect = card.getBoundingClientRect();
          const px = Math.max(0, Math.min(1, (nextEvent.clientX - rect.left) / rect.width));
          const py = Math.max(0, Math.min(1, (nextEvent.clientY - rect.top) / rect.height));
          card.style.setProperty("--tilt-x", `${((0.5 - py) * 5).toFixed(2)}deg`);
          card.style.setProperty("--tilt-y", `${((px - 0.5) * 6).toFixed(2)}deg`);
          card.style.setProperty("--tilt-lift", "-4px");
          card.style.setProperty("--tilt-scale", "1.008");
          card.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
          card.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
          card.classList.add("is-tilting");
        };
        card.addEventListener("pointermove", (event) => {
          if (event.pointerType !== "mouse") return;
          nextEvent = event;
          if (!frame) frame = requestAnimationFrame(render);
        }, options);
        const reset = () => {
          cancelAnimationFrame(frame);
          frame = 0;
          nextEvent = undefined;
          card.classList.remove("is-tilting");
          card.style.setProperty("--tilt-x", "0deg");
          card.style.setProperty("--tilt-y", "0deg");
          card.style.setProperty("--tilt-lift", "0px");
          card.style.setProperty("--tilt-scale", "1");
        };
        card.addEventListener("pointerleave", reset, options);
        card.addEventListener("pointercancel", reset, options);
        resets.set(card, reset);
      });
      cleanup = () => {
        controller.abort();
        cards.forEach((card) => {
          resets.get(card)?.();
          card.classList.remove("motion-tilt-card", "is-tilting");
          card.querySelector(":scope > .motion-card-glare")?.remove();
          ["--tilt-x", "--tilt-y", "--tilt-lift", "--tilt-scale", "--glare-x", "--glare-y"]
            .forEach(property => card.style.removeProperty(property));
        });
      };
    };
    sync();
    media.addEventListener("change", sync);
  };

  const initPointerParallax = () => {
    const media = window.matchMedia(
      "(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let cleanup;
    const sync = () => {
      cleanup?.();
      cleanup = undefined;
      if (!media.matches) return;
      const controller = new AbortController();
      const options = { signal: controller.signal, passive: true };
      const decorations = [...document.querySelectorAll(".floating-background__orb, .dx-orb")];
      if (!decorations.length) return;
      let frame = 0;
      let x = 0;
      let y = 0;
      let targetX = 0;
      let targetY = 0;
      const draw = () => {
        x += (targetX - x) * 0.075;
        y += (targetY - y) * 0.075;
        decorations.forEach((decoration, index) => {
          const depth = 0.45 + (index % 4) * 0.24;
          decoration.style.setProperty("--orb-pointer-x", `${(x * depth).toFixed(2)}px`);
          decoration.style.setProperty("--orb-pointer-y", `${(y * depth).toFixed(2)}px`);
        });
        if (Math.hypot(targetX - x, targetY - y) < 0.08) {
          x = targetX;
          y = targetY;
          frame = 0;
          return;
        }
        frame = requestAnimationFrame(draw);
      };
      const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
      window.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse") return;
        targetX = (event.clientX / window.innerWidth - 0.5) * 28;
        targetY = (event.clientY / window.innerHeight - 0.5) * 22;
        schedule();
      }, options);
      document.documentElement.addEventListener("pointerleave", () => {
        targetX = 0;
        targetY = 0;
        schedule();
      }, options);
      cleanup = () => {
        controller.abort();
        cancelAnimationFrame(frame);
        decorations.forEach((decoration) => {
          decoration.style.removeProperty("--orb-pointer-x");
          decoration.style.removeProperty("--orb-pointer-y");
        });
      };
    };
    sync();
    media.addEventListener("change", sync);
  };

  const initScrollMotion = () => {
    const media = window.matchMedia(
      "(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let cleanup;
    const sync = () => {
      cleanup?.();
      cleanup = undefined;
      if (!media.matches) return;
      const controller = new AbortController();
      const options = { signal: controller.signal, passive: true };
      const root = document.documentElement;
      const orbs = [...document.querySelectorAll(".dx-orb")];
      let frame = 0;
      let parallaxFrame = 0;
      let target = window.scrollY;
      let expected = target;
      let previous = 0;
      const locked = () => document.body.matches(".is-loading, .menu-open, .modal-open") ||
        document.querySelector("dialog[open]");
      const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const stop = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        previous = 0;
        target = window.scrollY;
      };
      const draw = (time) => {
        if (locked() || Math.abs(window.scrollY - expected) > 3) { stop(); return; }
        const elapsed = previous ? Math.min(time - previous, 50) : 16;
        previous = time;
        target = Math.max(0, Math.min(maxScroll(), target));
        const position = window.scrollY;
        const next = position + (target - position) * (1 - Math.exp(-elapsed / 105));
        const settled = Math.abs(target - next) < 1 || Math.abs(next - position) < 0.5;
        window.scrollTo({ top: settled ? target : next, behavior: "instant" });
        expected = window.scrollY;
        frame = settled ? 0 : requestAnimationFrame(draw);
        if (settled) previous = 0;
      };
      const nestedScroll = (targetElement, delta) => {
        for (let node = targetElement; node instanceof Element && node !== document.body; node = node.parentElement) {
          if (node.matches("input, textarea, select, [contenteditable]:not([contenteditable='false']), iframe")) return true;
          const overflow = getComputedStyle(node).overflowY;
          if (/(auto|scroll)/.test(overflow) && node.scrollHeight > node.clientHeight &&
              (delta < 0 ? node.scrollTop > 0 : node.scrollTop + node.clientHeight < node.scrollHeight - 1)) return true;
        }
        return false;
      };
      window.addEventListener("wheel", (event) => {
        if (event.defaultPrevented || !event.cancelable || event.ctrlKey || event.metaKey || event.shiftKey ||
            Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY || locked() ||
            nestedScroll(event.target, event.deltaY)) { stop(); return; }
        const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
        if (!frame) { target = window.scrollY; expected = target; }
        // 方向を戻した時は溜まった慣性を解消する。
        if (Math.sign(delta) !== Math.sign(target - window.scrollY)) target = window.scrollY;
        const next = Math.max(0, Math.min(maxScroll(), target + delta));
        if (next === window.scrollY && !frame) return;
        event.preventDefault();
        target = next;
        if (!frame) frame = requestAnimationFrame(draw);
      }, { signal: controller.signal, passive: false });
      const parallax = () => {
        parallaxFrame = 0;
        const pageOffset = -Math.min(36, window.scrollY * 0.025);
        root.style.setProperty("--scroll-parallax", `${pageOffset}px`);
        root.style.setProperty("--scroll-parallax-reverse", `${pageOffset * -0.7}px`);
        orbs.forEach((orb, index) => {
          const rect = orb.parentElement.getBoundingClientRect();
          if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;
          const offset = Math.max(-45, Math.min(45, -rect.top * (index % 2 ? 0.06 : 0.1)));
          orb.style.setProperty("--orb-scroll-y", `${offset}px`);
        });
      };
      const schedule = () => { if (!parallaxFrame) parallaxFrame = requestAnimationFrame(parallax); };
      window.addEventListener("scroll", schedule, options);
      window.addEventListener("resize", () => { stop(); schedule(); }, options);
      window.addEventListener("pointerdown", stop, options);
      window.addEventListener("keydown", stop, options);
      window.addEventListener("blur", stop, options);
      document.addEventListener("visibilitychange", stop, options);
      schedule();
      cleanup = () => {
        controller.abort();
        stop();
        cancelAnimationFrame(parallaxFrame);
        root.style.removeProperty("--scroll-parallax");
        root.style.removeProperty("--scroll-parallax-reverse");
        orbs.forEach(orb => orb.style.removeProperty("--orb-scroll-y"));
      };
    };
    sync();
    media.addEventListener("change", sync);
  };

  const initPageTransitions = () => {
    const storageKey = "elevate:page-transition";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !Element.prototype.animate) {
      try { sessionStorage.removeItem(storageKey); } catch { /* 保存不可の場合は何もしない。 */ }
      return;
    }

    const layer = document.createElement("div");
    const mark = document.createElement("span");
    layer.className = "page-transition";
    layer.setAttribute("aria-hidden", "true");
    mark.className = "page-transition__mark";
    mark.textContent = "ELEVATE";
    layer.append(mark);
    document.body.append(layer);
    let leaving = false;
    let navigated = false;
    let pendingHref = "";
    let navigationTimer;

    const activate = () => layer.classList.add("is-active");
    const deactivate = () => {
      layer.getAnimations().forEach(animation => animation.cancel());
      mark.getAnimations().forEach(animation => animation.cancel());
      layer.classList.remove("is-active");
      layer.style.removeProperty("clip-path");
      const wasEntering = document.body.classList.contains("is-page-entering");
      document.body.classList.remove("is-page-entering", "is-page-leaving");
      leaving = false;
      navigated = false;
      pendingHref = "";
      clearTimeout(navigationTimer);
      if (wasEntering) document.dispatchEvent(new Event("elevate:page-transition-complete"));
    };
    const animateMark = (reverse = false) => mark.animate(
      reverse
        ? [{ opacity: 1, letterSpacing: ".32em" }, { opacity: 0, letterSpacing: ".55em" }]
        : [{ opacity: 0, letterSpacing: ".55em" }, { opacity: 1, letterSpacing: ".32em" }],
      { duration: 520, delay: reverse ? 0 : 120, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "both" },
    );

    let arrivedFromTransition = false;
    try {
      arrivedFromTransition = sessionStorage.getItem(storageKey) === "1";
      if (arrivedFromTransition) sessionStorage.removeItem(storageKey);
    } catch {
      arrivedFromTransition = false;
    }
    if (arrivedFromTransition) {
      document.body.classList.add("is-page-entering");
      activate();
      layer.style.clipPath = "inset(0 0 0 0)";
      animateMark(true);
      const entry = layer.animate(
        [{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 0 0 100%)" }],
        { duration: 720, easing: "cubic-bezier(0.76, 0, 0.24, 1)", fill: "forwards" },
      );
      entry.addEventListener("finish", deactivate, { once: true });
    }

    const canTransition = (event, anchor) => {
      if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
          event.shiftKey || event.altKey || anchor.hasAttribute("download") ||
          (anchor.target && anchor.target !== "_self") || anchor.matches("[data-no-transition]")) return false;
      const url = new URL(anchor.href, window.location.href);
      if (!["http:", "https:", "file:"].includes(url.protocol) || url.origin !== window.location.origin) return false;
      if (url.href === window.location.href) return false;
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return false;
      return true;
    };
    document.addEventListener("click", (event) => {
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!canTransition(event, anchor) || leaving) return;
      event.preventDefault();
      leaving = true;
      pendingHref = anchor.href;
      document.body.classList.add("is-page-leaving");
      activate();
      animateMark();
      const cover = layer.animate(
        [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
        { duration: 680, easing: "cubic-bezier(0.76, 0, 0.24, 1)", fill: "forwards" },
      );
      const navigate = () => {
        if (navigated || !pendingHref) return;
        navigated = true;
        clearTimeout(navigationTimer);
        try { sessionStorage.setItem(storageKey, "1"); } catch { /* 保存不可でも遷移は続ける。 */ }
        window.location.assign(pendingHref);
      };
      cover.addEventListener("finish", navigate, { once: true });
      navigationTimer = window.setTimeout(navigate, 1200);
    });
    window.addEventListener("pageshow", (event) => {
      if (event.persisted || leaving) deactivate();
    });
    reducedMotion.addEventListener("change", (event) => {
      if (!event.matches) return;
      if (leaving) {
        navigated = true;
        clearTimeout(navigationTimer);
        window.location.assign(pendingHref);
      } else {
        deactivate();
      }
    });
  };

  const initPointerEffects = () => {
    const media = window.matchMedia(
      "(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let cleanup;
    const sync = () => {
      cleanup?.();
      cleanup = undefined;
      if (!media.matches || !Element.prototype.animate) return;

      const controller = new AbortController();
      const options = { signal: controller.signal, passive: true };
      const layer = document.createElement("div");
      layer.className = "pointer-effects";
      layer.setAttribute("aria-hidden", "true");
      const follower = document.createElement("div");
      follower.className = "pointer-follower";
      layer.append(follower);
      document.body.append(layer);
      const ripples = new Map();
      let frame = 0;
      let lastTime = 0;
      let visible = false;
      let x = 0;
      let y = 0;
      let targetX = 0;
      let targetY = 0;
      const hide = () => {
        visible = false;
        follower.classList.remove("is-visible", "is-interactive");
        cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
      };
      const draw = (time) => {
        const elapsed = lastTime ? Math.min(time - lastTime, 64) : 16;
        lastTime = time;
        const ease = 1 - Math.exp(-elapsed / 65);
        x += (targetX - x) * ease;
        y += (targetY - y) * ease;
        const settled = Math.hypot(targetX - x, targetY - y) < 0.1;
        if (settled) { x = targetX; y = targetY; }
        follower.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        frame = settled ? 0 : requestAnimationFrame(draw);
        if (settled) lastTime = 0;
      };
      const blocked = (target) => (
        !(target instanceof Element) ||
        target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), iframe, dialog[open]') ||
        document.querySelector("dialog[open]")
      );
      const move = (event) => {
        if (event.pointerType !== "mouse" || blocked(event.target)) { hide(); return; }
        targetX = event.clientX;
        targetY = event.clientY;
        if (!visible) {
          x = targetX;
          y = targetY;
          follower.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          visible = true;
          follower.classList.add("is-visible");
        }
        follower.classList.toggle("is-interactive", Boolean(
          event.target.closest('a[href], button:not(:disabled), [role="button"], summary, label'),
        ));
        if (!frame) frame = requestAnimationFrame(draw);
      };
      const clearRipples = () => {
        ripples.forEach((animation, node) => { animation.cancel(); node.remove(); });
        ripples.clear();
      };
      document.addEventListener("pointermove", move, options);
      document.addEventListener("pointerover", move, options);
      document.addEventListener("pointerout", (event) => {
        if (!event.relatedTarget) hide();
      }, options);
      document.addEventListener("pointercancel", hide, options);
      window.addEventListener("blur", () => { hide(); clearRipples(); }, options);
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) { hide(); clearRipples(); }
      }, options);
      document.addEventListener("scroll", hide, { ...options, capture: true });
      document.addEventListener("keydown", hide, options);
      document.addEventListener("click", (event) => {
        if (!event.detail || event.button !== 0 ||
            (event.pointerType && event.pointerType !== "mouse") || blocked(event.target)) return;
        if (ripples.size >= 6) {
          const [node, animation] = ripples.entries().next().value;
          animation.cancel();
          node.remove();
          ripples.delete(node);
        }
        const ripple = document.createElement("span");
        ripple.className = "pointer-ripple";
        ripple.style.left = `${event.clientX}px`;
        ripple.style.top = `${event.clientY}px`;
        layer.append(ripple);
        const animation = ripple.animate([
          { transform: "translate(-50%, -50%) scale(0.25)", opacity: 0.75 },
          { transform: "translate(-50%, -50%) scale(1.5)", opacity: 0 },
        ], { duration: 580, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
        ripples.set(ripple, animation);
        animation.addEventListener("finish", () => {
          ripple.remove();
          ripples.delete(ripple);
        }, { once: true });
      }, options);
      // ネイティブdialogの表示中は、背景側の装飾を停止する。
      const observer = new MutationObserver(() => {
        if (document.querySelector("dialog[open]")) { hide(); clearRipples(); }
      });
      observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
      cleanup = () => {
        controller.abort();
        observer.disconnect();
        hide();
        clearRipples();
        layer.remove();
      };
    };
    sync();
    media.addEventListener("change", sync);
  };

  updateCurrentYear();
  initStickyHeader();
  initMenu();
  initServiceMenu();
  initPageTransitions();
  initHeroTitleMotion();
  initRevealAnimations();
  initMagneticButtons();
  initCardTilt();
  initPointerParallax();
  initPointerEffects();
  initScrollMotion();
})();
