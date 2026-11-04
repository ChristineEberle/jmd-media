const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
process.chdir(path.resolve(__dirname,'..'));
class Element {
 constructor(id=''){this.id=id;this.children=[];this.hidden=false;this.style={};this.listeners={};this.attrs={};this.clientWidth=1200;this.dataset={};}
 append(...els){this.children.push(...els)}
 addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}
 dispatch(type,event={}){for(const f of this.listeners[type]||[])f(event)}
 setAttribute(key,value){this.attrs[key]=value}
 getAttribute(key){return this.attrs[key]}
 replaceWith(el){elements[this.id]=el}
 focus(){document.activeElement=this}
 showModal(){this.open=true}
 close(){this.open=false;this.dispatch('close')}
 setPointerCapture(){}
 querySelectorAll(){return ['viewer-close','viewer-prev','viewer-next'].map(id=>elements[id])}
}
const elements={};
const ids=['hero','gallery-title','collection-count','plates','theme','viewer','viewer-image','image-error','viewer-title','viewer-count','viewer-description','description-toggle','viewer-note','note-toggle','viewer-prev','viewer-next','viewer-close','viewer-stage'];
for(const id of ids)elements[id]=new Element(id);
const document={documentElement:new Element('html'),body:new Element('body'),activeElement:new Element('origin'),getElementById:id=>elements[id],createElement:tag=>new Element()};
const box={window:{},document,localStorage:{setItem(){}},matchMedia:()=>({matches:false,addEventListener(){}}),getComputedStyle:()=>({columnGap:'9'}),Image:class{},ResizeObserver:class{observe(){}},console};
vm.createContext(box);
vm.runInContext(fs.readFileSync('gallery-data.js','utf8'),box);
vm.runInContext(fs.readFileSync('gallery.js','utf8'),box);
assert.equal(elements.plates.children.length,27);
const run=code=>vm.runInContext(code,box);
run('openPhoto(7)'); assert.equal(elements['viewer-count'].textContent,'08 / 27');assert(elements.viewer.open);
assert.equal(document.activeElement.id,'viewer-close');
elements['viewer-next'].dispatch('click'); assert.equal(elements['viewer-count'].textContent,'09 / 27');
for(let i=0;i<30;i++)elements.viewer.dispatch('keydown',{key:'ArrowRight',preventDefault(){}});
assert.equal(elements['viewer-count'].textContent,'12 / 27');assert.equal(elements['viewer-image'].src,'12.webp');
assert(elements['viewer-description'].textContent);
elements['viewer-next'].dispatch('click');assert(elements['viewer-description'].textContent);
elements['viewer-stage'].dispatch('pointerdown',{isPrimary:true,pointerType:'touch',pointerId:1,clientX:300,clientY:200});
elements['viewer-stage'].dispatch('pointerup',{pointerId:1,clientX:100,clientY:201}); assert.equal(elements['viewer-count'].textContent,'14 / 27');
elements['viewer-stage'].dispatch('pointerdown',{isPrimary:true,pointerType:'touch',pointerId:2,clientX:300,clientY:200});
elements['viewer-stage'].dispatch('pointercancel');
elements['viewer-stage'].dispatch('pointerup',{pointerId:2,clientX:100,clientY:201});assert.equal(elements['viewer-count'].textContent,'14 / 27');
elements['viewer-close'].focus();elements.viewer.dispatch('keydown',{key:'Tab',shiftKey:true,preventDefault(){}});assert.equal(document.activeElement.id,'viewer-next');
elements.viewer.dispatch('keydown',{key:'Tab',shiftKey:false,preventDefault(){}});assert.equal(document.activeElement.id,'viewer-close');
elements['viewer-close'].dispatch('click');assert.equal(elements.viewer.open,false);assert.equal(document.activeElement.id,'origin');
run('openPhoto(26)');elements['viewer-next'].dispatch('click');assert.equal(elements['viewer-count'].textContent,'01 / 27');
console.log('PASS viewer logic: render, feature, next/previous/wrap, rapid navigation, description updates, synthetic pointer swipe/cancel, keyboard focus trap, close focus restoration. This is not browser/device QA.');

for(const viewport of [375,390,430]) { elements.plates.clientWidth=viewport-24;run('layoutWall()');assert(elements.plates.children.every(el=>parseFloat(el.style.width)===viewport-24),`Phone ${viewport}: every photo full width`); }
for(const viewport of [768,1024]) {elements.plates.clientWidth=viewport-32;run('layoutWall()');assert(elements.plates.children.some(el=>parseFloat(el.style.width)<viewport-32),`iPad mini ${viewport}: separate justified layout`);}
console.log('PASS layout logic: 375/390/430 single full-width rows; iPad mini 768/1024 separately retains justified rows. Pixel/device rendering not asserted.');
