// Behavioral checks for the carousel and modal; native dialog rendering needs a browser.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('commn/js/site.js', 'utf8');
const moduleSource = source.slice(source.indexOf('  const interviewTrack ='), source.indexOf('  // One-shot reveals.'));
function node() {
  const events = {}, attrs = {};
  return { style: {}, dataset: {},
    addEventListener(k, fn) { (events[k] ??= []).push(fn); },
    emit(k, e = {}) { for (const fn of events[k] || []) fn(e); },
    setAttribute(k, v) { attrs[k] = v; }, getAttribute(k) { return attrs[k] ?? null; },
    removeAttribute(k) { delete attrs[k]; }, focus() { this.focused = true; }
  };
}
const track = node(), dialog = node(), controls = node(), prev = node(), next = node(), counter = node(), close = node(), body = node(), pageBody = node(), title = node();
const dots = [0, 1, 2].map(i => Object.assign(node(), { dataset: { slide: String(i) } }));
track.scrollLeft = 0;
track.getBoundingClientRect = () => ({ left: 0 });
track.scrollTo = options => { track.lastScroll = options; track.scrollLeft = options.left; };
const cards = [0, 1, 2].map(i => {
  const card = node(), link = node();
  link.dataset.interview = String(i + 1).padStart(2, '0');
  link.closest = selector => selector === '.interview-card' ? card : link;
  card.querySelector = () => link;
  card.getBoundingClientRect = () => ({ left: i * 640 - track.scrollLeft });
  return card;
});
track.querySelectorAll = () => cards;
controls.querySelector = selector => ({ '[data-slide-prev]': prev, '[data-slide-next]': next, '[data-interview-current]': counter })[selector];
controls.querySelectorAll = () => dots;
dialog.querySelector = selector => selector === '[data-interview-body]' ? body : close;
dialog.getBoundingClientRect = () => ({ left: 20, right: 920, top: 20, bottom: 700 });
dialog.showModal = () => { dialog.open = true; };
dialog.close = () => { dialog.open = false; dialog.emit('close'); };
body.querySelector = () => title;
body.replaceChildren = content => { body.content = content; };
const document = {
  body: pageBody, documentElement: { clientWidth: 1000 },
  querySelector: selector => ({ '#interview-track': track, '#interview-dialog': dialog, '.interview-controls': controls })[selector],
  getElementById: id => ({ content: { cloneNode: () => ({ story: id }) } })
};
const window = Object.assign(node(), { scrollY: 1800, innerWidth: 1015, scrollTo(options) { this.lastScroll = options; } });
const reduced = { matches: false }, frames = [];
vm.runInNewContext(moduleSource, { document, window, reduced, getComputedStyle: () => ({ paddingRight: '0' }), requestAnimationFrame: fn => frames.push(fn) });
const sync = () => { track.emit('scroll'); while (frames.length) frames.shift()(); };
assert(prev.disabled); assert(!next.disabled);
next.emit('click'); sync(); assert.equal(track.scrollLeft, 640); assert.equal(counter.textContent, '02');
dots[2].emit('click'); sync(); assert(next.disabled); assert.equal(dots[2].getAttribute('aria-current'), 'true');
reduced.matches = true;
track.emit('keydown', { key: 'Home', target: { closest: () => null }, preventDefault() {} });
sync(); assert.equal(track.scrollLeft, 0); assert.equal(track.lastScroll.behavior, 'auto');
for (const [index, card] of cards.entries()) {
  const link = card.querySelector();
  track.emit('click', { target: link, preventDefault() {} });
  assert(dialog.open); assert.equal(body.content.story, `interview-story-0${index + 1}`);
  assert.equal(title.id, 'interview-dialog-title'); assert.equal(pageBody.style.position, 'fixed');
  close.emit('click'); assert(!dialog.open); assert(link.focused); assert.equal(window.lastScroll.top, 1800);
}
track.emit('click', { target: cards[0].querySelector(), preventDefault() {} });
dialog.emit('pointerdown', { clientX: 0, clientY: 0 });
dialog.emit('click', { clientX: 0, clientY: 0 }); assert(!dialog.open);
console.log('PASS: interview navigation, counter, endpoints, keyboard, reduced motion, individual stories, close/backdrop, scroll and focus restoration.');
