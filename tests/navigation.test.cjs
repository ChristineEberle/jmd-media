const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../site.js'),'utf8');
const storage=new Map();
function boot(kind,url){
 const listeners={}; const element=()=>({attrs:{},events:{},addEventListener(k,v){this.events[k]=v},setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]},focus(){this.focused=true}});
 const theme=element(),about=kind==='gallery'?element():null,back=kind==='about'?element():null;
 if(back)back.href='./index.html';
 const root={dataset:{},style:{}};
 const state={scroll:null,replaced:null};
 const env={document:{documentElement:root,getElementById:id=>({theme,'about-link':about,'return-gallery':back}[id])},matchMedia:()=>({matches:false,addEventListener(){}}),localStorage:{setItem(){}},sessionStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},location:{href:url,origin:new URL(url).origin},scrollY:1400,URL,Number,JSON,history:{state:null,replaceState(a,b,url){state.replaced=url}},addEventListener:(k,v)=>listeners[k]=v,requestAnimationFrame:fn=>fn(),scrollTo:arg=>state.scroll=arg.top};
 vm.runInNewContext(source,env);return{about,back,listeners,state};
}
const gallery=boot('gallery','https://example.org/index.html');gallery.about.events.click();
assert.equal(JSON.parse(storage.get('jmd-gallery-return')).y,1400);
const about=boot('about','https://example.org/about.html');assert.equal(about.back.href,'https://example.org/index.html?return=gallery');
const restored=boot('gallery',about.back.href);assert.equal(restored.state.replaced,'/index.html');restored.listeners.pageshow();assert.equal(restored.state.scroll,1400);assert(restored.about.focused);
storage.clear();assert.equal(boot('about','https://example.org/about.html').back.href,'./index.html');
storage.set('jmd-gallery-return',JSON.stringify({url:'https://other.example/',y:2}));assert.equal(boot('about','https://example.org/about.html').back.href,'./index.html');
console.log('PASS navigation logic: same-tab About route, saved gallery position, contextual return, URL cleanup, focus, direct-link fallback, cross-origin rejection. Browser Back/Forward still needs real browser QA.');
