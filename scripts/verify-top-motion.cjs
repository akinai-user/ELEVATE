const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const classes = () => {
 const s = new Set();
 return {add: x => s.add(x),contains:x=>s.has(x),toggle:(x,on)=>on?s.add(x):s.delete(x)};
};
let heroBottom=900, serviceTop=900, trackTop=900;
const properties = {};
const track = {offsetHeight:1800, getBoundingClientRect:()=>({top:trackTop})};
const number = {};
const events={};
const cards=[0,1].map(()=>({classList:classes(),inert:false,contains:()=>false}));
const tabs=[0,1].map(()=>({classList:classes(),attrs:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){this[k]=fn;}}));
const header={classList:classes()};
const hero={getBoundingClientRect:()=>({bottom:heroBottom})};
const service={classList:classes(),style:{setProperty:(k,v)=>properties[k]=v},querySelector:s=>s==='.service__orbit-track'?track:number,offsetHeight:1800,getBoundingClientRect:()=>({top:serviceTop}),querySelectorAll:s=>s==='.service-card'?cards:tabs};
const desktop={matches:true,addEventListener(){}};
const reduce={matches:false,addEventListener(){}};
vm.runInNewContext(fs.readFileSync('js/top-design.js','utf8'),{
 document:{querySelector:s=>({'.hero':hero,'.top-header':header,'.service':service}[s]),body:{classList:classes()},activeElement:null},
 window:{innerHeight:800,matchMedia:s=>s.includes('1000')?desktop:reduce,addEventListener:(k,f)=>events[k]=f},
 requestAnimationFrame:fn=>fn(),
});
assert.equal(header.inert,true);
assert.equal(cards[0].inert,false);assert.equal(cards[1].inert,true);
heroBottom=1;events.scroll();assert.equal(header.inert,true);
heroBottom=0;events.scroll();assert.equal(header.inert,false);
serviceTop=-600;events.scroll();assert.equal(cards[0].inert,true);assert.equal(tabs[1].attrs['aria-pressed'],'true');
tabs[0].click();assert.equal(cards[0].inert,false);
events.scroll();assert.equal(cards[0].inert,false,'Manual choice must persist within the same scroll segment');
serviceTop=-100;events.scroll();assert.equal(cards[0].inert,false);
heroBottom=200;events.pageshow();assert.equal(header.inert,true);
desktop.matches=false;trackTop=-700;events.resize();assert.equal(cards[1].inert,false);
assert.equal(properties['--orbit-progress'],'0.7');
assert.equal(properties['--orbit-turn'],'-180deg');
assert.equal(number.textContent,'02');
trackTop=-100;events.scroll();assert.equal(cards[0].inert,false);
reduce.matches=true;desktop.matches=true;tabs[0].click();serviceTop=-800;events.scroll();assert.equal(cards[0].inert,false);
console.log('Header boundary, reverse scroll, services on scroll/click, mobile and reduced motion passed.');
