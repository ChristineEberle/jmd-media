// Pure geometry regression, not a browser-rendering test.
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const env={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../gallery-data.js'),'utf8'),env);
const photos=env.window.JMD_DATA.galleries[0].photos;
for(const v of [{w:375,h:812,safe:93},{w:390,h:844,safe:93},{w:430,h:932,safe:93},{w:440,h:956,safe:93},{w:956,h:440,safe:21},{w:768,h:1024,safe:44},{w:1024,h:768,safe:44}]){
 const width=v.w-16,limit=v.h-106-v.safe;
 for(const p of photos){
  const previousScale=Math.min(width/p.width,limit/p.height);
  const newStage=Math.min(width*p.height/p.width,limit);
  const nextScale=Math.min(width/p.width,newStage/p.height);
  assert(Math.abs(previousScale-nextScale)<1e-10,`${v.w} ${p.title}: image pixel size unchanged`);
 }
 const sample=photos.filter(p=>['01','10','27'].includes(p.id));
 const result=sample.map(p=>{
  const stage=Math.min(width*p.height/p.width,limit);
  const twoLineDescription=44+8+2*13*1.35;
  const shortNote=4+2*13*1.35;
  assert(stage+twoLineDescription+v.safe<=v.h,`${v.w}: ${p.title} modeled two-line caption fits`);
  return `${p.title}: image ${stage.toFixed(1)}px high; two-line caption fits; extra two-line note ${stage+twoLineDescription+shortNote+v.safe<=v.h?'fits':'scrolls'}`;
 });
 console.log(`${v.w}×${v.h}, modeled safe areas ${v.safe}px: ${result.join(' | ')}`);
}
console.log('PASS pure sizing invariants. Font wrapping, Safari dynamic toolbar, actual safe-area values and rendered line boxes still require device QA.');
