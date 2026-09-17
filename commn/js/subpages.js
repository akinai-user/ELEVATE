"use strict";
(() => {
  document.querySelectorAll('.faq-item').forEach((item, index) => {
    const button = item.querySelector('.faq-item__button');
    const answer = item.querySelector('.faq-item__answer');
    if (!button || !answer) return;
    answer.id = `faq-answer-${index}`;
    button.setAttribute('aria-controls', answer.id);
    button.setAttribute('aria-expanded', 'false');
    answer.hidden = true;
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      answer.hidden = expanded;
    });
  });
  document.querySelectorAll('.form__file').forEach((group) => {
    const input = group.querySelector('input[type=file]');
    const button = group.querySelector('.form__file-btn');
    const text = group.querySelector('.form__file-text');
    if (!input || !button) return;
    button.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      if (text) text.textContent = [...input.files].map(file => file.name).join('、') || '選択されていません';
    });
  });
  document.querySelectorAll('input[type=file]').forEach((input) => {
    input.addEventListener('change', () => {
      input.setCustomValidity([...input.files].some(file => file.size > 5 * 1024 * 1024)
        ? 'ファイル容量は、5MBまででお願いします。' : '');
    });
  });
})();
