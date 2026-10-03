import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.HOTEL_QA_BASE||'http://localhost:3100';
const out=process.env.HOTEL_QA_OUTPUT||'.hotel-qa';await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--no-sandbox']});const results=[];
try{
 for(const width of [390,1440])for(const [variant,path]of [['guide','/hotel/holiday-inn-express-la-mesa'],['concierge','/hotelexperience/holidayinnexpresslamesa']]){
  const context=await browser.newContext({viewport:{width,height:844},serviceWorkers:'block'});
  // Exercise production hostname gating against the local build. External GA and auth are test doubles.
  await context.route('https://singhub.app/**',async route=>{const u=new URL(route.request().url());const response=await route.fetch({url:base+u.pathname+u.search});await route.fulfill({response});});
  await context.route('https://www.googletagmanager.com/**',route=>route.fulfill({contentType:'application/javascript',body:''}));
  await context.route('**/auth/v1/otp*',route=>route.fulfill({status:400,json:{msg:'Test email service unavailable'}}));
  const page=await context.newPage();const captured=[];await page.exposeFunction('captureQaEvent',c=>captured.push(c));await page.addInitScript(()=>{const layer=[];const push=layer.push.bind(layer);layer.push=(...items)=>{for(const c of items)window.captureQaEvent(Array.from(c));return push(...items);};window.dataLayer=layer;});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto('https://singhub.app'+path+'?utm_medium=qr&utm_campaign=hotel_qa',{waitUntil:'networkidle'});assert.equal(response.status(),200);
  await page.waitForFunction(()=>Array.from(window.dataLayer||[]).some(c=>c[0]==='event'&&c[1]==='hotel_qr_visit'));
  const commands=()=>page.evaluate(()=>Array.from(window.dataLayer||[],c=>Array.from(c)).filter(c=>c[0]==='event'));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,variant+' page overflow '+width);
  if(variant==='guide'&&width===390){const ys=await page.locator('.mobile-nav a').evaluateAll(es=>es.map(e=>Math.round(e.getBoundingClientRect().y)));assert.equal(new Set(ys).size,1,'all five mobile tabs share one row');}
  const jts=page.locator('article').filter({has:page.locator('a[href*="/venues/jts-tavern"]')}).first();await jts.getByRole('button',{name:'Add to plan',exact:true}).click();
  const dialog=page.getByRole('dialog');await dialog.waitFor({state:'visible'});assert.ok(await page.getByLabel('Email address',{exact:true}).isVisible());
  const bounds=await dialog.boundingBox();assert.ok(bounds.width<=width-20);assert.ok(bounds.y>=0&&bounds.y+bounds.height<=844);
  await page.screenshot({path:out+'/'+variant+'-'+width+'-plan.png'});
  await page.getByLabel('Email address',{exact:true}).fill('qa@example.invalid');await page.getByRole('button',{name:'Save my plan',exact:true}).click();
  await page.getByRole('alert').first().waitFor();await page.waitForFunction(()=>Array.from(window.dataLayer||[]).some(c=>c[1]==='hotel_plan_error'));
  await page.getByRole('button',{name:'Close plan',exact:true}).click();
  await page.getByRole('button',{name:/^This week$/i}).click();assert.ok((await commands()).some(c=>c[1].endsWith('_toggle')&&c[2].mode==='week'));
  await page.screenshot({path:out+'/'+variant+'-'+width+'-week.png',fullPage:true});
  await page.locator('a[href*="/venues/jts-tavern"]').first().click();await page.waitForURL('**/venues/jts-tavern?source=*');
  await page.waitForFunction(()=>document.readyState==='complete');const events=captured.filter(c=>c[0]==='event');assert.ok(events.some(c=>c[1]===(variant==='guide'?'hotel_guide_venue_click':'hotel_experience_venue_click')&&c[2].hotel_slug==='holiday-inn-express-la-mesa'));
  assert.deepEqual(errors,[]);results.push({variant,width,events:events.map(c=>c[1]),overflow:false,planDialog:true,planError:true});await context.close();
 }
 await writeFile(out+'/results.json',JSON.stringify(results,null,2));console.log('Hotel desktop/mobile journeys and analytics passed: '+JSON.stringify(results));
}finally{await browser.close();}
