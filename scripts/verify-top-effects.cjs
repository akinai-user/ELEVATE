const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const callbacks = new Map();
let id=0;
const events={};
const cls=()=>{const s=new Set();return{add:x=>s.add(x),remove:x=>s.delete(x),contains:x=>s.has(x),toggle:(x,on)=>on?s.add(x):s.delete(x)}};
const style=()=>({values:{},setProperty(k,v){this.values[k]=v},removeProperty(k){delete this.values[k]}});
const lines=['人の力と技術力。','働く','未来を創造','する。'].map(textContent=>({textContent,style:style(),classList:cls()}));
const deco={textContent:'</ELEVATE>　<ELEVATE>'};
const eyebrow={textContent:'PEOPLE × TECHNOLOGY'};
const hero={classList:cls(),offsetHeight:800,querySelectorAll:()=>lines,querySelector:s=>s==='.hero__code'?deco:eyebrow,getBoundingClientRect:()=>({bottom:800})};
let reduceHandler;
const motion={matches:false,addEventListener:(event,fn)=>reduceHandler=fn};
const doc={hidden:false,querySelector:s=>s==='.hero'?hero:null,querySelectorAll:()=>[]};
vm.runInNewContext(fs.readFileSync('js/top-effects.js','utf8'),{
 document:doc,window:{scrollY:0,matchMedia:()=>motion,addEventListener:(name,fn)=>events[name]=fn},innerHeight:800,
 requestAnimationFrame:fn=>{callbacks.set(++id,fn);return id;},cancelAnimationFrame:n=>callbacks.delete(n),
 setInterval:()=>1,clearInterval:()=>{},
});
function tick(time){const pending=[...callbacks.values()];callbacks.clear();pending.forEach(fn=>fn(time));}
tick(0);assert.equal(lines[1].style.values['--typed'],'0');assert.equal(hero.classList.contains('is-mark-visible'),false);
tick(500);assert.equal(hero.classList.contains('is-catch-visible'),true);
assert.equal(lines[0].style.values['--typed'],'1');
tick(1500);assert.equal(hero.classList.contains('is-mark-visible'),true);assert.equal(hero.classList.contains('is-lines-visible'),false);
tick(1800);assert.equal(hero.classList.contains('is-lines-visible'),true);
tick(3400);assert.equal(hero.classList.contains('has-opening'),false);
assert.deepEqual(lines.map(l=>l.textContent),['人の力と技術力。','働く','未来を創造','する。']);
motion.matches=true;reduceHandler();assert.equal(callbacks.size,1); // only the layout refresh remains
assert.equal(deco.textContent,'</ELEVATE>　<ELEVATE>');
events.pagehide();assert.equal(hero.classList.contains('has-opening'),false);
console.log('Opening at 0 / 500 / 1500 / 1800 ms, unchanged text, reduced motion and page exit passed.');
