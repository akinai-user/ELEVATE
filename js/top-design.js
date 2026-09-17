"use strict";
(() => {
  const hero = document.querySelector('.hero');
  const header = document.querySelector('.top-header');
  const service = document.querySelector('.service');
  if (!hero || !header || !service) return;
  const cards = [...service.querySelectorAll('.service-card')];
  const tabs = [...service.querySelectorAll('[data-service]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 1000px)');
  const track = service.querySelector('.service__orbit-track');
  const number = service.querySelector('.service__large-number');
  let current = -1;
  let lastScrollPanel = -1;
  let pending = false;
  const activate = (index) => {
    if (index === current) return;
    current = index;
    cards.forEach((card, i) => {
      card.classList.toggle('is-active', i === index);
      card.inert = i !== index;
    });
    tabs.forEach((tab, i) => {
      tab.classList.toggle('is-active', i === index);
      tab.setAttribute('aria-pressed', String(i === index));
    });
    service.classList.toggle('is-second', index === 1);
    service.style.setProperty('--orbit-turn', `${-180 * index}deg`);
    if (number) number.textContent = String(index + 1).padStart(2, '0');
  };
  activate(0);
  service.classList.add('is-interactive');
  tabs.forEach((tab, index) => tab.addEventListener('click', () => {
    activate(index);
    service.style.setProperty('--orbit-progress', String((index + 1) / cards.length));
  }));
  const render = () => {
    pending = false;
    const visible = hero.getBoundingClientRect().bottom <= 0 || document.body.classList.contains('menu-open');
    header.classList.toggle('is-visible', visible);
    header.inert = !visible;
    if (!reducedMotion.matches) {
      const scroller = !desktop.matches && track ? track : service;
      const rect = scroller.getBoundingClientRect();
      const travel = Math.max(1, scroller.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      service.style.setProperty('--orbit-progress', String(progress));
      const index = progress < .5 ? 0 : 1;
      if (index !== lastScrollPanel) {
        lastScrollPanel = index;
        // Do not move keyboard focus into a panel becoming inert.
        if (!cards.some(card => card.contains(document.activeElement))) activate(index);
      }
    }
  };
  const schedule = () => {
    if (!pending) { pending = true; requestAnimationFrame(render); }
  };
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  reducedMotion.addEventListener('change', schedule);
  desktop.addEventListener('change', schedule);
  render();
})();
