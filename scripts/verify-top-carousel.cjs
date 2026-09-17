const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
let config,intersect,reduceChange,playing=false;
const events={},cardEvents={},modalEvents={};
const pause={textContent:'Ⅱ',attrs:{},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,f){this[k]=f}};
const modal={open:false,addEventListener:(k,f)=>modalEvents[k]=f};
const carousel={querySelector:()=>({}),contains:e=>e==='focused-card',addEventListener:(k,f)=>cardEvents[k]=f};
const motion={matches:false,addEventListener:(k,f)=>reduceChange=f};
const document={hidden:false,activeElement:null,addEventListener:(k,f)=>events[k]=f,querySelectorAll:()=>[],querySelector:s=>({'.interview-slider':carousel,'.interview-autoplay':pause,'#interview-modal':modal}[s]||null)};
function Swiper(element,opts){config=opts;this.params={...opts};this.autoplay={stop:()=>playing=false,start:()=>playing=true};}
function IntersectionObserver(callback){intersect=callback;this.observe=()=>{}}
vm.runInNewContext(fs.readFileSync('js/script.js','utf8'),{document,window:{matchMedia:()=>motion,Swiper,IntersectionObserver},IntersectionObserver,requestAnimationFrame:fn=>fn()});
assert.equal(config.effect,'cards');assert.equal(config.speed,600);assert.equal(config.autoplay.delay,4000);assert.equal(playing,false);
intersect([{isIntersecting:true}]);assert.equal(playing,true);
pause.click();assert.equal(playing,false);assert.equal(pause.attrs['aria-pressed'],'true');
pause.click();assert.equal(playing,true);
document.hidden=true;events.visibilitychange();assert.equal(playing,false);
document.hidden=false;events.visibilitychange();assert.equal(playing,true);
modal.open=true;events.visibilitychange();assert.equal(playing,false);
modal.open=false;modalEvents.close();assert.equal(playing,true);
motion.matches=true;reduceChange();assert.equal(playing,false);
motion.matches=false;reduceChange();assert.equal(playing,true);
intersect([{isIntersecting:false}]);assert.equal(playing,false);
console.log('Cards effect, 4-second interval, 600-ms transition, user pause, hidden/offscreen/modal and reduced-motion pauses passed.');
