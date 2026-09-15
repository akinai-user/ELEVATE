"use strict";

(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const initHeroSlider = () => {
    const slider = document.querySelector("[data-hero-slider]");
    if (!slider) return;

    const slides = [...slider.querySelectorAll(".hero-slider__image")];
    const buttons = [...slider.querySelectorAll(".hero-pagination__button")];
    if (slides.length < 2 || slides.length !== buttons.length) return;

    const interval = 5000;
    let current = 0;
    let timer;

    const activate = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === current));
      buttons.forEach((button, buttonIndex) => {
        const active = buttonIndex === current;
        button.classList.toggle("is-active", active);
        if (active) button.setAttribute("aria-current", "true");
        else button.removeAttribute("aria-current");
        if (active) {
          button.classList.remove("is-active");
          void button.offsetWidth;
          button.classList.add("is-active");
        }
      });
    };

    const stop = () => window.clearTimeout(timer);
    const schedule = () => {
      stop();
      if (reducedMotion.matches || document.hidden) return;
      timer = window.setTimeout(() => {
        activate(current + 1);
        schedule();
      }, interval);
    };

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => {
        activate(index);
        schedule();
      });
    });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) activate(current);
      schedule();
    });
    reducedMotion.addEventListener("change", () => {
      activate(current);
      schedule();
    });

    activate(0);
    schedule();
  };

  const initInterviewSlider = () => {
    const carousel = document.querySelector(".interview-slider");
    if (!carousel || !window.Swiper) return;

    const slider = new window.Swiper(carousel, {
      slidesPerView: 1.08,
      spaceBetween: 14,
      speed: reducedMotion.matches ? 0 : 500,
      watchOverflow: true,
      navigation: {
        prevEl: "[data-carousel-prev]",
        nextEl: "[data-carousel-next]",
      },
      pagination: {
        el: carousel.querySelector(".swiper-pagination"),
        clickable: true,
      },
      keyboard: { enabled: true, onlyInViewport: true },
      a11y: {
        prevSlideMessage: "前のインタビュー",
        nextSlideMessage: "次のインタビュー",
        paginationBulletMessage: "{{index}}枚目のインタビューを表示",
        slideLabelMessage: "{{index}} / {{slidesLength}}",
      },
      breakpoints: {
        768: { slidesPerView: 2, spaceBetween: 17 },
        1024: { slidesPerView: 3, spaceBetween: 17 },
      },
    });

    reducedMotion.addEventListener("change", () => {
      slider.params.speed = reducedMotion.matches ? 0 : 500;
    });
    carousel.addEventListener("focusin", (event) => {
      const slide = event.target.closest(".swiper-slide");
      if (slide) slider.slideTo([...slider.slides].indexOf(slide));
    });
  };

  const initInterviewModal = () => {
    const modal = document.querySelector("#interview-modal");
    const cards = document.querySelectorAll("[data-interview]");
    if (!modal || !cards.length) return;

    const stories = [
      ["自分に合った働き方を相談できる環境に魅力を感じました。これまでの経験を整理しながら、新しい仕事への一歩を踏み出せました。", "営業として、お客様の課題を聞き、必要な人材やサービスを提案しています。相手の立場に立って考えることを大切にしています。", "相談してよかったと言っていただけることが一番のやりがいです。これからも信頼される担当者を目指したいです。"],
      ["事務の経験を活かしながら、新しい業務にも挑戦したいと思い入社しました。相談しやすい雰囲気が後押しになりました。", "書類作成やデータ管理など、チームが円滑に働くためのサポートをしています。正確さと、周囲への気配りを心がけています。", "日々の小さな改善が、チーム全体の働きやすさにつながることに喜びを感じます。できることを少しずつ増やしていきたいです。"],
      ["技術を磨きながら、自分に合ったプロジェクトに関わりたいと考えました。これからのキャリアについて話せたことが決め手でした。", "システムの開発や改善に取り組んでいます。使う人の声を聞き、チームでアイデアを共有しながら形にしています。", "自分たちの開発した仕組みが役立つ瞬間に達成感があります。新しい技術を学び、より良い提案ができるよう成長したいです。"],
      ["人の挑戦を支える仕事に興味がありました。一人ひとりの希望に向き合う姿勢に共感しました。", "仕事を探している方へのヒアリングや、企業との調整を担当しています。希望や不安を丁寧に伺うことを大切にしています。", "新しい職場で活躍しているという報告が励みになります。人と企業の双方に安心して頼っていただける存在になりたいです。"],
      ["未経験の業務にも挑戦できる環境を探していました。段階的に仕事を覚えていけることに安心感がありました。", "営業チームの資料準備や進行管理をサポートしています。先を見て準備することと、こまめな情報共有を意識しています。", "以前は難しかった仕事を任せてもらえるようになり、自信がつきました。これからも一つずつ挑戦を重ねていきたいです。"],
    ];
    const questions = [
      "入社のきっかけを教えてください。",
      "現在のお仕事内容は？",
      "仕事のやりがいと今後の目標は？",
    ];
    const image = modal.querySelector(".interview-modal__image");
    const number = modal.querySelector("[data-modal-number]");
    const title = modal.querySelector("#interview-modal-title");
    const role = modal.querySelector(".interview-modal__role");
    const content = modal.querySelector(".interview-modal__content");
    let opener;

    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const index = Number(card.dataset.interview) - 1;
        const story = stories[index];
        const photo = card.querySelector("img");
        const heading = card.querySelector("h3");
        if (!story || !photo || !heading || !image || !number || !title || !role || !content) return;

        image.src = photo.src;
        image.alt = photo.alt;
        number.textContent = String(index + 1).padStart(2, "0");
        title.textContent = heading.textContent;
        role.textContent = [...card.querySelectorAll("p span")]
          .map((tag) => tag.textContent)
          .join(" / ");
        content.replaceChildren(...questions.flatMap((question, questionIndex) => {
          const questionHeading = document.createElement("h3");
          const answer = document.createElement("p");
          questionHeading.textContent = question;
          answer.textContent = story[questionIndex];
          return [questionHeading, answer];
        }));
        opener = card;
        modal.showModal();
        modal.scrollTop = 0;
        document.body.classList.add("modal-open");
      });
    });

    modal.querySelector(".interview-modal__close")?.addEventListener("click", () => modal.close());
    let backdropPointerDown = false;
    const isOutside = (event) => {
      const rect = modal.getBoundingClientRect();
      return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    };
    modal.addEventListener("pointerdown", (event) => {
      backdropPointerDown = isOutside(event);
    });
    modal.addEventListener("click", (event) => {
      if (backdropPointerDown && isOutside(event)) modal.close();
      backdropPointerDown = false;
    });
    modal.addEventListener("close", () => {
      document.body.classList.remove("modal-open");
      opener?.focus({ preventScroll: true });
    });
  };

  const initBackToTop = () => {
    const button = document.querySelector("[data-back-to-top]");
    const hero = document.querySelector(".hero");
    if (!button || !hero) return;

    const header = document.querySelector(".top-header");
    let framePending = false;
    const sync = () => {
      const headerHeight = header?.getBoundingClientRect().height || 0;
      button.hidden = hero.getBoundingClientRect().bottom > headerHeight;
      framePending = false;
    };
    const scheduleSync = () => {
      if (framePending) return;
      framePending = true;
      requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync);
    window.addEventListener("pageshow", scheduleSync);
    if ("ResizeObserver" in window) new ResizeObserver(scheduleSync).observe(hero);
    button.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion.matches ? "auto" : "smooth",
      });
    });
  };

  initHeroSlider();
  initInterviewSlider();
  initInterviewModal();
  initBackToTop();
})();
