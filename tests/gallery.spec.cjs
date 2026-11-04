const {chromium} = require('playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 for (const config of [
  {name:'desktop',width:1440,height:1000},
  {name:'phone-375',width:375,height:812,isMobile:true,hasTouch:true},
  {name:'phone-390',width:390,height:844,isMobile:true,hasTouch:true},
  {name:'phone-430',width:430,height:932,isMobile:true,hasTouch:true},
  {name:'ipad-mini',width:768,height:1024,isMobile:true,hasTouch:true},
  {name:'ipad-mini-landscape',width:1024,height:768,isMobile:true,hasTouch:true},
  {name:'small-phone',width:320,height:568,isMobile:true,hasTouch:true}
 ]) {
  const context = await browser.newContext({viewport:{width:config.width,height:config.height},isMobile:!!config.isMobile,hasTouch:!!config.hasTouch});
  const page = await context.newPage(); const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.BASE_URL || 'http://127.0.0.1:8768');
  await page.waitForFunction(()=>document.querySelectorAll('.plate').length===27);
  await page.screenshot({path:`/tmp/jmd-${config.name}.png`,fullPage:true});
  assert.equal(await page.locator('.plate').count(),27);
  assert.match(await page.locator('#hero img').getAttribute('src'),/^06.webp$/);
  assert.match(await page.locator('.plate').nth(7).locator('img').getAttribute('src'),/^06-s.webp$/);
  assert.equal(await page.locator('.plate').nth(7).locator('.number').textContent(),'08');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'No horizontal overflow');
  const bounds=await page.locator('.plate').evaluateAll(els=>els.map(el=>({w:el.clientWidth,r:el.querySelector('img').naturalWidth/el.querySelector('img').naturalHeight}))); assert(bounds.every(b=>b.w>50));
  if(config.width<=430){
   const rowWidths=await page.locator('.plate').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().width));
   const wallWidth=await page.locator('#plates').evaluate(el=>el.getBoundingClientRect().width);
   assert(rowWidths.every(w=>Math.abs(w-wallWidth)<1),'Every phone photo occupies full width');
  }
  await page.locator('#hero button').click();
  assert.equal(await page.locator('#viewer-count').textContent(),'08 / 27');
  await page.locator('#viewer-next').click();
  assert.equal(await page.locator('#viewer-count').textContent(),'09 / 27');
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('#viewer-count').textContent(),'08 / 27');
  await page.locator('#viewer-close').focus(); await page.keyboard.press('Shift+Tab');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'viewer-next');
  await page.keyboard.press('Tab'); assert.equal(await page.evaluate(()=>document.activeElement.id),'viewer-close');
  for(let i=0;i<30;i++) await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#viewer-count').textContent(),'11 / 27');
  assert.equal(await page.locator('#viewer-image').getAttribute('src'),'11.webp');
  await page.waitForFunction(()=>document.querySelector('#viewer-image').complete);
  await page.screenshot({path:`/tmp/jmd-${config.name}-viewer.png`});
  if(config.hasTouch){
   const session=await context.newCDPSession(page); const box=await page.locator('#viewer-stage').boundingBox();
   const x=box.x+box.width*.8,y=box.y+box.height*.5;
   await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
   for(let i=1;i<=8;i++)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-i*20,y}]});
   await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   assert.equal(await page.locator('#viewer-count').textContent(),'12 / 27','Actual touch swipe advances');
  }
  await page.keyboard.press('Escape'); assert.equal(await page.locator('#viewer').evaluate(el=>el.open),false);
  assert.equal(await page.evaluate(()=>document.activeElement.closest('#hero')!==null),true,'Focus restored');
  await page.locator('#hero button').click(); await page.locator('#viewer-close').click();
  assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
  await page.locator('.plate').nth(12).scrollIntoViewIfNeeded();
  const savedY = await page.evaluate(()=>scrollY);
  await page.locator('#about-link').evaluate(el=>el.click());
  await page.waitForURL('**/about.html');
  assert.equal(await page.locator('#plates').count(),0);
  assert.equal(await page.locator('.portrait').count(),1);
  await page.reload();
  await page.locator('#return-gallery').click();
  await page.waitForFunction(y=>Math.abs(scrollY-y)<5,savedY);
  await page.goBack(); await page.waitForURL('**/about.html');
  await page.goForward(); await page.waitForSelector('#plates');
  await page.locator('#inquiries-link').evaluate(el=>el.click());
  await page.waitForURL('**/inquiries.html');
  assert.equal(await page.locator('#inquiries-title').textContent(),'Say hello.');
  assert.equal(await page.locator('a[href^="mailto:"]').count(),0);
  await page.waitForFunction(()=>document.querySelector('#contact-status').textContent.includes('not available'));
  assert.equal(await page.locator('#contact-form').isVisible(),false);
  await page.locator('#return-gallery').click();
  await page.waitForSelector('#plates');
  await page.locator('#theme').click(); assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await page.reload(); assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  assert.deepEqual(errors,[]);
  console.log(`PASS ${config.name}: 27 images, order, overflow, viewer, rapid navigation, keyboard, touch, focus, theme`);
  await context.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
