"use strict";

(() => {
  const hero = document.querySelector(".hero");
  if (hero) {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stage = hero.querySelector(".hero__stage");
    const cue = hero.querySelector(".hero__scroll");
    let scheduled = false;
    const renderHero = () => {
      scheduled = false;
      hero.classList.toggle("is-scroll-ready", !motion.matches);
      const distance = Math.max(1, hero.offsetHeight - stage.offsetHeight);
      const progress = motion.matches ? 0 : Math.max(0, Math.min(1, (-hero.getBoundingClientRect().top) / distance));
      const opening = Math.min(1, progress / .8);
      const ease = opening * opening * (3 - 2 * opening);
      const side = window.innerWidth < 768 ? 10 : 22;
      hero.style.setProperty("--sky-top", `${50 * (1 - ease)}%`);
      hero.style.setProperty("--sky-side", `${side * (1 - ease)}%`);
      hero.style.setProperty("--sky-bottom", `${50 * (1 - ease)}%`);
      hero.style.setProperty("--sky-scale", String(1.12 - .12 * ease));
      hero.style.setProperty("--title-y", "0vh");
      hero.style.setProperty("--title-opacity", String(1 - Math.max(0, (progress - .82) / .18)));
      const white = Math.max(0, Math.min(1, (opening - .2) / .35));
      const color = [25, 61, 80].map(channel => Math.round(channel + (255 - channel) * white));
      hero.style.setProperty("--title-color", `rgb(${color.join(" ")})`);
      cue.style.opacity = String(1 - Math.min(1, progress * 5));
    };
    const scheduleHero = () => {
      if (!scheduled) { scheduled = true; requestAnimationFrame(renderHero); }
    };
    window.addEventListener("scroll", scheduleHero, { passive: true });
    window.addEventListener("resize", scheduleHero);
    window.addEventListener("pageshow", scheduleHero);
    motion.addEventListener("change", scheduleHero);
    renderHero();
  }
  const service = document.querySelector(".service");
  const secondCard = service?.querySelector(".service-card:nth-child(2)");
  if (secondCard && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      service.classList.toggle("is-second-service", entry.isIntersecting);
    }, { rootMargin: "-15% 0px -15% 0px", threshold: .15 }).observe(secondCard);
  }
  // 大画面ではホバー／キーボードフォーカスに合わせて写真パネルを拡張。
  // タッチ端末はCSSの横スクロール。リンクの1回タップでそのまま移動。
  const menu = document.querySelector(".seekers-grid");
  if (menu) {
    const cards = [...menu.querySelectorAll(".seeker-card")];
    const activate = (selected) => cards.forEach((card) => {
      card.classList.toggle("is-active", card === selected);
    });
    if (cards.length) {
      activate(cards[0]);
      menu.classList.add("is-ready");
      cards.forEach((card) => {
        card.addEventListener("pointerenter", (event) => {
          if (event.pointerType === "mouse" && !menu.contains(document.activeElement)) activate(card);
        });
        card.addEventListener("focus", () => activate(card));
      });
    }
  }
})();
