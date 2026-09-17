"use strict";
(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const type = [...hero.querySelectorAll('.hero-type')];
  const deco = hero.querySelector('.hero__code');
  const eyebrow = hero.querySelector('.eyebrow');
  const originalDeco = deco?.textContent || '';
  const originalEyebrow = eyebrow?.textContent || '';
  const starts = [0, 500, 1000, 1500];
  const durations = type.map(line => Array.from(line.textContent).length * 40);
  let frame = 0;
  let scrambleFrame = 0;
  let periodic = 0;
  let openingDone = false;
  const finishOpening = () => {
    cancelAnimationFrame(frame);
    hero.classList.remove('has-opening');
    type.forEach(line => {
      line.style.removeProperty('--typed');
      line.classList.remove('is-typing');
    });
    openingDone = true;
    if (deco) deco.textContent = originalDeco;
    if (eyebrow) eyebrow.textContent = originalEyebrow;
  };
  // Use CSS clipping, so the accessible headline and original text never change.
  const open = () => {
    if (motion.matches || window.scrollY > hero.offsetHeight) { finishOpening(); return; }
    hero.classList.add('has-opening');
    type.forEach(line => line.style.setProperty('--typed', '0'));
    let start;
    const tick = (time) => {
      if (motion.matches) { finishOpening(); return; }
      if (start === undefined) start = time;
      const elapsed = time - start;
      type.forEach((line, i) => {
        const local = elapsed - starts[i];
        const count = Math.max(1, durations[i] / 40);
        const amount = Math.max(0, Math.min(1, Math.floor(local / 40 + 1) / count));
        line.style.setProperty('--typed', String(amount));
        line.classList.toggle('is-typing', local >= 0 && local < durations[i] + 300);
      });
      hero.classList.toggle('is-catch-visible', elapsed >= 500);
      hero.classList.toggle('is-mark-visible', elapsed >= 1500);
      hero.classList.toggle('is-lines-visible', elapsed >= 1800);
      if (elapsed < 3300) frame = requestAnimationFrame(tick);
      else finishOpening();
    };
    frame = requestAnimationFrame(tick);
  };
  const scramble = () => {
    if (!deco || motion.matches || !openingDone || document.hidden || hero.getBoundingClientRect().bottom <= 0) return;
    cancelAnimationFrame(scrambleFrame);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_<>/';
    let step = 0;
    let last = 0;
    const tick = time => {
      if (motion.matches || document.hidden) { deco.textContent = originalDeco; return; }
      if (time - last > 32) {
        last = time;
        deco.textContent = Array.from(originalDeco).map((char, i) => {
          if (/\s/.test(char) || i < step) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        step += 2;
      }
      if (step < originalDeco.length + 2) scrambleFrame = requestAnimationFrame(tick);
      else deco.textContent = originalDeco;
    };
    scrambleFrame = requestAnimationFrame(tick);
  };
  const startPeriodic = () => {
    clearInterval(periodic);
    if (!motion.matches) periodic = setInterval(scramble, 5000);
  };
  let revealObserver;
  if ('IntersectionObserver' in window && !motion.matches) {
    document.documentElement.classList.add('reference-reveals');
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('is-waiting');
        revealObserver.unobserve(entry.target);
      });
    }, {threshold: .08});
    document.querySelectorAll('[data-reference-reveal]').forEach(node => {
      node.classList.add('is-waiting');
      revealObserver.observe(node);
    });
  }
  const label = document.querySelector('.section-label');
  const sections = [...document.querySelectorAll('[data-section-label]')];
  const photo = document.querySelector('.message__visual');
  let scrollPending = false;
  const render = () => {
    scrollPending = false;
    if (label) {
      let selected = sections[0];
      sections.forEach(section => { if (section.getBoundingClientRect().top < innerHeight * .55) selected = section; });
      if (selected) {
        label.textContent = `[ ${selected.dataset.sectionLabel} ]`;
        label.classList.toggle('is-light', selected.classList.contains('service'));
      }
    }
    if (photo) {
      const rect = photo.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (rect.top - innerHeight / 2) / innerHeight));
      photo.style.setProperty('--photo-y', `${motion.matches ? 0 : progress * -26}px`);
    }
  };
  const schedule = () => {
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(render); }
  };
  motion.addEventListener('change', () => {
    if (motion.matches) {
      finishOpening();
      cancelAnimationFrame(scrambleFrame);
      if (deco) deco.textContent = originalDeco;
      revealObserver?.disconnect();
      document.querySelectorAll('.is-waiting').forEach(node => node.classList.remove('is-waiting'));
    }
    startPeriodic();
    schedule();
  });
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule);
  window.addEventListener('pagehide', () => {
    finishOpening();
    cancelAnimationFrame(scrambleFrame);
    clearInterval(periodic);
  });
  window.addEventListener('pageshow', () => { startPeriodic(); schedule(); });
  open();
  startPeriodic();
  render();
})();
