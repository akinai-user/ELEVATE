const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function element() {
  const attrs={}, listeners={}, tokens=new Set();
  return {hidden:false,inert:false,value:'',style:{setProperty(k,v){this[k]=v;}},offsetHeight:76,
    classList:{add(k){tokens.add(k);},remove(...keys){keys.forEach(k=>tokens.delete(k));},toggle(k,v){v?tokens.add(k):tokens.delete(k);},contains(k){return tokens.has(k);}},
    setAttribute(k,v){attrs[k]=v;},getAttribute(k){return attrs[k];},
    addEventListener(k,fn){(listeners[k]??=[]).push(fn);},emit(k,event={}){for(const fn of listeners[k]||[])fn(event);},
    focus(){this.focused=true;},setCustomValidity(v){this.validity=v;},getClientRects(){return [{}];},
    contains(){return false;},querySelectorAll(){return []},querySelector(){return null;}};
}
function environment({query='?topic=hr',reducedMotion=false,motionTargets=null,hero=null}={}) {
  const header=element(),nav=element(),menu=element(),toggle=element(),panel=element(),main=element(),footer=element(),top=element(),brand=element(),topic=element(),message=element(),form=element();
  menu.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-expanded','false');topic.value='general';message.form=form;
  const document=element(),window=element(),mobile=element(),reduced=element(); mobile.matches=true;reduced.matches=reducedMotion;
  const selectors={'.site-header':header,'#site-nav':nav,'.menu-toggle':menu,'[data-service-toggle]':toggle,'#service-menu':panel,'.to-top':top,'.site-brand':brand,'#contact-topic':topic,'textarea[name="message"]':message};
  document.querySelector=s=>s==='.home-hero'?hero:selectors[s]||null;
  document.querySelectorAll=s=>s==='main, .site-footer, .breadcrumbs, .to-top'?[main,footer,top]:s.includes('.section-heading > *')?(motionTargets||[]):[];
  document.getElementById=()=>null;
  document.documentElement=element();document.documentElement.scrollHeight=2000;document.body=element();
  header.querySelectorAll=()=>[brand,menu,toggle];
  window.matchMedia=s=>s.includes('max-width')?mobile:reduced;
  window.scrollY=0;window.innerHeight=800;window.location={search:query,hash:''};window.scrollTo=options=>{window.lastScroll=options;};
  if(motionTargets) window.IntersectionObserver=class {
    constructor(callback){this.callback=callback;this.observed=new Set();window.observer=this;}
    observe(target){this.observed.add(target);}
    unobserve(target){this.observed.delete(target);}
    disconnect(){this.observed.clear();this.disconnected=true;}
  };
  vm.runInNewContext(fs.readFileSync('commn/js/site.js','utf8'),{document,window,URLSearchParams,Date,requestAnimationFrame:fn=>fn()});
  return {document,window,mobile,reduced,header,nav,menu,toggle,panel,main,footer,top,brand,topic,message,form};
}
let env=environment();
assert.equal(env.topic.value,'hr');assert.equal(env.message.value,'【人材サービスについて】\n');assert(env.message.validity,'Topic alone must not pass validation');
env.message.value+='人員を増やしたい';env.message.emit('input');assert.equal(env.message.validity,'');
env.topic.value='it-dx';env.topic.emit('change');assert.equal(env.message.value,'【IT・DXサービスについて】\n人員を増やしたい');
env.form.emit('submit');assert.equal(env.message.value,'【IT・DXサービスについて】\n人員を増やしたい');
env.menu.emit('click');assert.equal(env.menu.getAttribute('aria-expanded'),'true');assert(env.main.inert);assert(env.nav.classList.contains('is-open'));
env.toggle.emit('click');assert.equal(env.panel.hidden,false);env.document.emit('keydown',{key:'Escape'});assert.equal(env.panel.hidden,true);assert(env.toggle.focused);assert(env.main.inert);
env.document.emit('keydown',{key:'Escape'});assert.equal(env.menu.getAttribute('aria-expanded'),'false');assert(!env.main.inert);assert(env.menu.focused);
env.menu.emit('click');env.document.activeElement=env.toggle;let prevented=false;env.document.emit('keydown',{key:'Tab',shiftKey:false,preventDefault(){prevented=true;}});assert(prevented);assert(env.brand.focused);
env.mobile.emit('change');assert(!env.main.inert);assert(!env.nav.classList.contains('is-open'));
env.toggle.emit('click');env.document.emit('click',{target:{closest(){return null;}}});assert(env.panel.hidden);
assert(env.top.hidden);env.window.scrollY=900;env.window.emit('scroll');assert(!env.top.hidden);assert.equal(env.top.style['--progress'],'75');env.top.emit('click');assert.equal(env.window.lastScroll.behavior,'smooth');assert(env.brand.focused);
env=environment({query:'?topic=unknown',reducedMotion:true});assert.equal(env.topic.value,'general');assert.equal(env.message.value,'');env.top.emit('click');assert.equal(env.window.lastScroll.behavior,'auto');
// Retained FAQ and upload validation.
const button=element(),answer=element(),input=element();input.files=[];const faq={querySelector:s=>s==='.faq-item__button'?button:answer};
vm.runInNewContext(fs.readFileSync('commn/js/subpages.js','utf8'),{document:{querySelectorAll:s=>s==='.faq-item'?[faq]:s==='input[type=file]'?[input]:[]}});
assert(answer.hidden);button.emit('click');assert(!answer.hidden);assert.equal(button.getAttribute('aria-expanded'),'true');button.emit('click');assert(answer.hidden);
input.files=[{size:6*1024*1024}];input.emit('change');assert(input.validity);input.files=[{size:1024}];input.emit('change');assert.equal(input.validity,'');
console.log('PASS: service menu, mobile menu, Escape, focus loop, resize cleanup, topic prefill/switch/body validation, scroll progress, reduced motion, FAQ and upload size.');

// Reveal regressions: first paint, observer lifetime, focus, history and OS settings.
function motionElement(top){
  const target=element();target.matches=()=>false;
  target.getBoundingClientRect=()=>({top});
  target.parentElement={children:[target],parentElement:null};
  return target;
}
const first=motionElement(100),offscreen=motionElement(1200),nested=motionElement(1300);
nested.parentElement=offscreen;
env=environment({motionTargets:[first,offscreen,nested]});
assert(!first.classList.contains('reveal-pending'),'First-screen content must stay painted');
assert(offscreen.classList.contains('reveal-pending'));
assert(!env.window.observer.observed.has(nested),'Do not animate nested containers twice');
env.window.observer.callback([{target:offscreen,isIntersecting:false}]);
assert(offscreen.classList.contains('reveal-pending'));
env.window.observer.callback([{target:offscreen,isIntersecting:true}]);
assert(!offscreen.classList.contains('reveal-pending'));assert(offscreen.classList.contains('reveal-visible'));
assert(!env.window.observer.observed.has(offscreen),'Unobserve after first reveal');
offscreen.emit('animationend',{target:offscreen});assert(!offscreen.classList.contains('reveal-visible'));
let focusTarget=motionElement(1500);env=environment({motionTargets:[focusTarget]});
env.document.emit('focusin',{target:focusTarget});assert(!focusTarget.classList.contains('reveal-pending'));
let anchorTarget=motionElement(1600);env=environment({motionTargets:[anchorTarget]});
env.document.getElementById=id=>id==='destination'?anchorTarget:null;
env.window.location.hash='#destination';env.window.emit('hashchange');assert(!anchorTarget.classList.contains('reveal-pending'));
let reducedTarget=motionElement(1500);env=environment({motionTargets:[reducedTarget],reducedMotion:true});
assert(!env.window.observer);assert(!reducedTarget.classList.contains('reveal-pending'));
env=environment({motionTargets:[reducedTarget]});env.reduced.matches=true;env.reduced.emit('change');
assert(!reducedTarget.classList.contains('reveal-pending'));assert(env.window.observer.disconnected);
let historyTarget=motionElement(1700);env=environment({motionTargets:[historyTarget]});
env.window.emit('pageshow',{persisted:true});assert(!historyTarget.classList.contains('reveal-pending'));assert(env.window.observer.disconnected);
console.log('PASS: reveal first paint, nested filtering, one-shot observation, animation cleanup, focus/anchor visibility, reduced motion and back-forward restoration.');

const hero=element(),stage=element(),motionButton=element(),motionIcon=element();let heroTop=0;
hero.offsetHeight=3600;stage.offsetHeight=800;
hero.querySelector=s=>s==='.hero-stage'?stage:s==='.kv-motion-toggle'?motionButton:null;
motionButton.querySelector=()=>motionIcon;
hero.getBoundingClientRect=()=>({top:heroTop,bottom:heroTop+hero.offsetHeight});
env=environment({hero});
assert.equal(hero.getAttribute('data-kv-phase'),'0');assert(hero.classList.contains('kv-enabled'));
heroTop=-399;env.window.emit('scroll');assert.equal(hero.getAttribute('data-kv-phase'),'0');
heroTop=-401;env.window.emit('scroll');assert.equal(hero.getAttribute('data-kv-phase'),'1');
heroTop=-1599;env.window.emit('scroll');assert.equal(hero.getAttribute('data-kv-phase'),'1');
heroTop=-1601;env.window.emit('scroll');assert.equal(hero.getAttribute('data-kv-phase'),'2');
assert(env.document.body.classList.contains('kv-dark'));
heroTop=-3700;env.window.emit('scroll');assert(!env.document.body.classList.contains('kv-dark'));
assert(env.document.body.classList.contains('kv-past-hero'));assert(hero.classList.contains('kv-suspended'));
heroTop=-800;env.window.emit('scroll');assert.equal(hero.getAttribute('data-kv-phase'),'1');
heroTop=0;env.window.emit('scroll');assert.equal(hero.getAttribute('data-kv-phase'),'0');
assert(!hero.classList.contains('kv-suspended'));
motionButton.emit('click');assert(hero.classList.contains('kv-paused'));assert.equal(motionButton.getAttribute('aria-pressed'),'true');
motionButton.emit('click');assert(!hero.classList.contains('kv-paused'));assert.equal(motionButton.getAttribute('aria-pressed'),'false');
env.document.hidden=true;env.document.emit('visibilitychange');assert(hero.classList.contains('kv-suspended'));
env.document.hidden=false;env.document.emit('visibilitychange');assert(!hero.classList.contains('kv-suspended'));
heroTop=-1800;env.window.emit('scroll');env.reduced.matches=true;env.reduced.emit('change');
assert.equal(hero.getAttribute('data-kv-phase'),'0');assert(!hero.classList.contains('kv-enabled'));assert(motionButton.hidden);
assert(!env.document.body.classList.contains('kv-dark'));
env.reduced.matches=false;env.window.innerHeight=500;env.window.emit('resize');assert(!hero.classList.contains('kv-enabled'));
env.window.innerHeight=800;env.window.emit('resize');assert(hero.classList.contains('kv-enabled'));
env.window.emit('pageshow',{persisted:true});assert.equal(hero.getAttribute('data-kv-phase'),'2');
console.log('PASS: three hero phases/boundaries, reverse scrolling, header reset, offscreen/tab suspension, pause control, reduced-motion/short-screen fallback and history restoration.');
