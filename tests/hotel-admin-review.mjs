import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const base=process.env.V2_BASE_URL || 'http://localhost:3100';
const out='/tmp/singhub-hotel-admin-review';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.V2_CHROME_PATH,args:['--no-sandbox']});
try {
 const unauth=await browser.newContext();
 assert.equal((await unauth.request.get(base+'/api/admin/hotel-profiles?slug=pendry-san-diego')).status(),401);
 assert.equal((await unauth.request.get(base+'/admin/hotels')).status(),401);await unauth.close();
 const context=await browser.newContext({httpCredentials:{username:'admin',password:'local-hotel-review'},viewport:{width:1440,height:1000}});
 assert.equal((await context.request.put(base+'/api/admin/hotel-profiles',{data:{slug:'pendry-san-diego',profile:{heroImageUrl:'javascript:alert(1)',heroAlt:'x',heroPosition:'center',imageSource:'',usageRights:''}}})).status(),400);
 assert.equal((await context.request.get(base+'/api/admin/hotel-media?slug=not-a-hotel')).status(),400);
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // UI contract checks use an in-memory test service. Live persistence is tested separately.
 const saved=new Map();const mediaRequests=[];
 await page.route('**/api/admin/hotel-profiles**',async route=>{
  const request=route.request();const slug=new URL(request.url()).searchParams.get('slug');
  if(request.method()==='PUT') {const body=request.postDataJSON();saved.set(body.slug,body.profile);await route.fulfill({json:{ok:true,profile:body.profile}});}
  else await route.fulfill({json:{profile:saved.get(slug)||null}});
 });
 await page.route('**/api/admin/hotel-media**',async route=>{
  const slug=new URL(route.request().url()).searchParams.get('slug');mediaRequests.push(slug);
  await route.fulfill({json:{assets:slug==='ac-hotel-gaslamp'?[{publicId:'singhub/hotels/ac-hotel-gaslamp/test',url:base+'/images/singhub-v2/hotel-at-mark.png',width:500,height:500,format:'png'}]:[]}});
 });
 await page.goto(base+'/admin/hotels',{waitUntil:'networkidle'});
 assert.equal(await page.getByLabel('Hotel',{exact:true}).locator('option').count(),24);
 await page.getByLabel('Hotel',{exact:true}).selectOption('ac-hotel-gaslamp');
 await page.getByRole('button',{name:'Set as hero',exact:true}).click();
 await page.getByLabel('Hero focal point').selectOption('right');
 await page.getByLabel('Image description').fill('AC Hotel exterior');
 await page.getByLabel('Image source').fill('Hotel supplied');
 await page.getByLabel('Usage permission / license notes').fill('Commercial website use approved by hotel');
 await page.getByRole('button',{name:'Save hotel media',exact:true}).click();
 await page.getByRole('status').filter({hasText:'Saved.'}).waitFor();
 await page.reload({waitUntil:'networkidle'});await page.getByLabel('Hotel',{exact:true}).selectOption('ac-hotel-gaslamp');
 await page.getByLabel('Image description').filter({}).waitFor();
 await page.waitForFunction(()=>document.querySelector('input[maxlength="300"]')?.value==='AC Hotel exterior');
 assert.equal(await page.getByLabel('Hero focal point').inputValue(),'right');
 assert.equal(await page.getByLabel('Image source').inputValue(),'Hotel supplied');
 assert.ok(mediaRequests.includes('ac-hotel-gaslamp'));assert.ok(mediaRequests.includes('pendry-san-diego'));
 await page.screenshot({path:out+'/desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:out+'/mobile.png',fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
 await context.close();console.log('Hotel admin auth, validation, scoped chooser and desktop/mobile UI contract passed.');
} finally {await browser.close();}
