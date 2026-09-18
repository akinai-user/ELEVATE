"use strict";
(() => {
  document.documentElement.classList.add("has-js");
  const header = document.querySelector(".site-header");
  const nav = document.querySelector("#site-nav");
  const menuButton = document.querySelector(".menu-toggle");
  const serviceButton = document.querySelector("[data-service-toggle]");
  const serviceMenu = document.querySelector("#service-menu");
  const mobile = window.matchMedia("(max-width: 900px)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const background = [...document.querySelectorAll("main, .site-footer, .breadcrumbs, .to-top")];
  const setServices = (open, focus = false) => {
    serviceButton?.setAttribute("aria-expanded", String(open));
    if (serviceMenu) serviceMenu.hidden = !open;
    if (focus) serviceButton?.focus();
  };
  const setMenu = (open, focus = false) => {
    nav?.classList.toggle("is-open", open);
    menuButton?.setAttribute("aria-expanded", String(open));
    menuButton?.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    document.body.classList.toggle("menu-open", open);
    background.forEach(element => { element.inert = open; });
    if (!open) setServices(false);
    if (focus) menuButton?.focus();
  };
  menuButton?.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  serviceButton?.addEventListener("click", () => setServices(serviceButton.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("click", event => {
    if (!event.target.closest(".service-menu")) setServices(false);
  });
  header?.addEventListener("focusout", event => {
    if (!header.contains(event.relatedTarget)) setServices(false);
  });
  document.addEventListener("keydown", event => {
    const menuOpen = menuButton?.getAttribute("aria-expanded") === "true";
    if (event.key === "Escape") {
      if (serviceButton?.getAttribute("aria-expanded") === "true") setServices(false, true);
      else if (menuOpen) setMenu(false, true);
    }
    if (event.key === "Tab" && menuOpen) {
      const controls = [...header.querySelectorAll("a[href], button:not([disabled])")].filter(element => element.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });
  nav?.addEventListener("click", event => { if (event.target.closest("a")) setMenu(false); });
  mobile.addEventListener("change", () => setMenu(false));
  window.addEventListener("pagehide", () => setMenu(false));
  const updateHeight = () => {
    if (header) document.documentElement.style.setProperty("--header-height", `${header.offsetHeight}px`);
  };
  updateHeight();
  if ("ResizeObserver" in window && header) new ResizeObserver(updateHeight).observe(header);

  // A single text roll, matching the established header interaction. No animation library.
  document.querySelectorAll(".nav-link").forEach(link => {
    const wrap = document.createElement("span");
    wrap.className = "nav-roll";
    const original = document.createElement("span");
    original.textContent = link.textContent;
    const copy = original.cloneNode(true);
    copy.className = "nav-roll-copy";
    copy.setAttribute("aria-hidden", "true");
    wrap.append(original, copy);
    link.replaceChildren(wrap);
    let animations = [];
    const reset = () => { animations.forEach(animation => animation.cancel()); animations = []; };
    const play = () => {
      reset();
      if (reduced.matches || mobile.matches || !original.animate) return;
      animations = [original.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-105%)", opacity: 0 }], { duration: 600, easing: "cubic-bezier(.87,0,.13,1)", fill: "forwards" }), copy.animate([{ transform: "translateY(105%)" }, { transform: "translateY(0)" }], { duration: 400, easing: "cubic-bezier(.115,.405,.24,1)", fill: "forwards" })];
    };
    link.addEventListener("mouseenter", play);
    link.addEventListener("focus", () => { if (link.matches(":focus-visible")) play(); });
    reduced.addEventListener("change", reset);
    mobile.addEventListener("change", reset);
  });
  document.querySelectorAll("[data-year]").forEach(element => { element.textContent = String(new Date().getFullYear()); });
  const top = document.querySelector(".to-top");
  const hero = document.querySelector(".home-hero");
  const heroStage = hero?.querySelector(".hero-stage");
  const heroMotionButton = hero?.querySelector(".kv-motion-toggle");
  let heroPaused = false;
  let lastHeroPhase = -1;
  const updateHero = () => {
    if (!hero || !heroStage) return;
    const enabled = !reduced.matches && window.innerHeight >= 650;
    hero.classList.toggle("kv-enabled", enabled);
    const bounds = hero.getBoundingClientRect();
    const unit = Math.min(1200, window.innerHeight);
    const cursor = -bounds.top + window.innerHeight / 2;
    const phase = !enabled || cursor < unit ? 0 : cursor < unit * 2.5 ? 1 : 2;
    const past = bounds.bottom <= (header?.offsetHeight || 0);
    if (phase !== lastHeroPhase) {
      hero.setAttribute("data-kv-phase", String(phase));
      lastHeroPhase = phase;
    }
    document.body.classList.toggle("kv-dark", enabled && phase === 2 && !past);
    document.body.classList.toggle("kv-past-hero", past);
    hero.classList.toggle("kv-suspended", !enabled || past || bounds.top > window.innerHeight || document.hidden);
    if (heroMotionButton) heroMotionButton.hidden = !enabled;
  };
  heroMotionButton?.addEventListener("click", () => {
    heroPaused = !heroPaused;
    hero.classList.toggle("kv-paused", heroPaused);
    heroMotionButton.setAttribute("aria-pressed", String(heroPaused));
    heroMotionButton.setAttribute("aria-label", heroPaused ? "装飾アニメーションを再生" : "装飾アニメーションを停止");
    const icon = heroMotionButton.querySelector("span");
    if (icon) icon.textContent = heroPaused ? "▷" : "Ⅱ";
  });
  if (hero) document.addEventListener("visibilitychange", updateHero);
  reduced.addEventListener("change", updateHero);
  if (top) {
    let queued = false;
    const update = () => {
      queued = false;
      updateHero();
      top.hidden = window.scrollY < 600;
      const range = document.documentElement.scrollHeight - window.innerHeight;
      top.style.setProperty("--progress", String(range > 0 ? Math.min(100, Math.max(0, window.scrollY / range * 100)) : 0));
    };
    const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", schedule);
    update();
    top.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduced.matches ? "auto" : "smooth" });
      document.querySelector(".site-brand")?.focus({ preventScroll: true });
    });
  }
  // Keep the existing form backend: include the chosen topic in its existing message field.
  const topic = document.querySelector("#contact-topic");
  const message = document.querySelector('textarea[name="message"]');
  if (topic && message) {
    const labels = { hr: "人材サービスについて", "it-dx": "IT・DXサービスについて", general: "その他のご相談" };
    const query = new URLSearchParams(window.location.search).get("topic");
    if (Object.hasOwn(labels, query)) topic.value = query;
    const apply = () => {
      const body = message.value.replace(/^【(?:人材サービスについて|IT・DXサービスについて|その他のご相談)】\n?/, "");
      message.value = `【${labels[topic.value] || labels.general}】\n${body}`;
    };
    topic.addEventListener("change", apply);
    if (query && Object.hasOwn(labels, query) && !message.value) apply();
    const validate = () => {
      const body = message.value.replace(/^【[^\n]*】\s*/, "").trim();
      message.setCustomValidity(body ? "" : "ご相談内容をご入力ください。");
    };
    message.addEventListener("input", validate);
    topic.addEventListener("change", validate);
    message.form?.addEventListener("submit", () => { apply(); });
    validate();
  }

  // One-shot reveals. No scroll listeners, text splitting or animation dependencies.
  if ("IntersectionObserver" in window && !reduced.matches) {
    const selectors = [
      ".section-heading > *", ".section-lead",
      ".about-layout > *", ".business-panel", ".choice-card", ".reason-card", ".case-card",
      ".people-panel > img", ".people-panel > div > *", ".news-list article",
      ".company-band > *", ".contact-band .wrap > *", ".page-intro > *",
      ".career-card", ".steps > li", ".section .wrap > .text-link",
      ".subpage-hero > *", ".subpage .inner > h2", ".subpage .boxlist__item",
      ".subpage .steplist__item", ".subpage .introduction__item",
      ".subpage--lp .p-intro > h2", ".subpage--lp .p-intro__item",
      ".subpage--lp .p-features__item", ".subpage--lp .p-features__item02",
      ".subpage--lp .p-features__item03", ".subpage--lp .p-flow__list-item"
    ].join(", ");
    const candidates = [...document.querySelectorAll(selectors)];
    const candidateSet = new Set(candidates);
    // Never animate both a container and its descendants.
    const targets = candidates.filter(element => {
      for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        if (candidateSet.has(parent)) return false;
      }
      return true;
    });
    const finish = element => {
      element.classList.remove("reveal-pending", "reveal-visible");
      observer.unobserve(element);
    };
    const observer = new window.IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove("reveal-pending");
        entry.target.classList.add("reveal-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
    targets.forEach(element => {
      if (element.matches(".eyebrow, h1, h2, .head01-ttl__en, .head02-ttl__en")) element.classList.add("reveal-title");
      if (element.matches(".hero-visual, .people-panel > img")) element.classList.add("reveal-image");
      const siblings = [...element.parentElement.children].filter(child => candidateSet.has(child));
      element.style.setProperty("--reveal-delay", `${Math.min(siblings.indexOf(element), 2) * 85}ms`);
      // Critical first-screen content stays painted; only offscreen elements start hidden.
      if (element.getBoundingClientRect().top >= window.innerHeight) element.classList.add("reveal-pending");
      observer.observe(element);
      element.addEventListener("animationend", event => {
        if (event.target === element) finish(element);
      });
    });
    // Tab navigation and anchor navigation should expose their destination immediately.
    const expose = destination => {
      targets.forEach(element => {
        if (element === destination || element.contains(destination) || destination.contains(element)) finish(element);
      });
    };
    document.addEventListener("focusin", event => expose(event.target));
    const exposeHash = () => {
      let id;
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      const destination = id && document.getElementById(id);
      if (destination) expose(destination);
    };
    window.addEventListener("hashchange", exposeHash);
    exposeHash();
    reduced.addEventListener("change", () => {
      if (reduced.matches) { targets.forEach(finish); observer.disconnect(); }
    });
    window.addEventListener("pageshow", event => {
      if (event.persisted) { targets.forEach(finish); observer.disconnect(); }
    });
  }
})();
