const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const classes = () => {
  const set = new Set();
  return { add: value => set.add(value), contains: value => set.has(value),
    toggle(value, enabled) { enabled ? set.add(value) : set.delete(value); } };
};
const events = {};
let bottom = 1600;
const header = { classList: classes(), getBoundingClientRect: () => ({height: 80}), inert: false };
const hero = { getBoundingClientRect: () => ({bottom}) };
vm.runInNewContext(fs.readFileSync('commn/js/common.js', 'utf8'), {
  document: {
    querySelector: selector => ({'.top-header':header, '.hero':hero}[selector] || null),
    querySelectorAll: () => [], documentElement: {style:{setProperty(){}},classList:classes()},
  },
  window: { scrollY:0, addEventListener:(name, callback) => {events[name] = callback;}, matchMedia:() => ({matches:true}) },
});
assert.equal(header.inert, true);
assert.equal(header.classList.contains('is-visible'), false);
bottom = 1; events.scroll();
assert.equal(header.classList.contains('is-visible'), false, 'Do not overlap even the last pixel of the hero');
bottom = 0; events.scroll();
assert.equal(header.classList.contains('is-visible'), true);
assert.equal(header.inert, false);
bottom = -200; events.pageshow();
assert.equal(header.classList.contains('is-visible'), true);
bottom = 300; events.resize();
assert.equal(header.inert, true);
const attributes = {};
let click;
const answer = {};
const button = {setAttribute:(key,value) => {attributes[key]=value;}, getAttribute:key => attributes[key], addEventListener:(name,handler) => {click=handler;}};
vm.runInNewContext(fs.readFileSync('commn/js/subpages.js', 'utf8'), {
  document: {querySelectorAll:selector => selector === '.faq-item' ? [{querySelector:selector => selector === '.faq-item__button' ? button : answer}] : []},
});
assert.equal(answer.hidden, true);
click(); assert.equal(answer.hidden, false); assert.equal(attributes['aria-expanded'], 'true');
click(); assert.equal(answer.hidden, true); assert.equal(attributes['aria-expanded'], 'false');
console.log('Header boundary, return scroll, restored position, resize and FAQ toggles verified.');
