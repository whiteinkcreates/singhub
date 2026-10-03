import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const out='.hotel-package-qa',base='http://localhost:3100',slug='holiday-inn-express-la-mesa';
await mkdir(out,{recursive:true});const browser=await chromium.launch({args:['--no-sandbox']});
const results=[];
try{
 const publicContext=await browser.newContext();assert.equal((await publicContext.request.get(base+'/admin/hotels/'+slug+'/package')).status(),401);assert.equal((await publicContext.request.get(base+'/api/hotels/not-a-hotel/qr')).status(),404);await publicContext.close();
 const context=await browser.newContext({viewport:{width:1440,height:1100},httpCredentials:{username:'admin',password:'package-qa-only'}});const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const packagePath=base+'/admin/hotels/'+slug+'/package';assert.equal((await page.goto(packagePath,{waitUntil:'networkidle'})).status(),200);
 await page.getByRole('heading',{name:'Asset review',exact:true}).waitFor();assert.equal(await page.getByRole('link',{name:'Print production / PDF',exact:true}).count(),0);
 assert.equal((await context.request.get(packagePath+'/print?edition=guest&mode=production')).status(),404);
 await page.screenshot({path:out+'/package-review-desktop.png',fullPage:true});
 for(const edition of ['guest','concierge'])for(const format of ['elevator','desk-tent']){
  const url=packagePath+'/print?edition='+edition+'&format='+format+'&mode=draft&embed=1';assert.equal((await page.goto(url,{waitUntil:'networkidle'})).status(),200);await page.emulateMedia({media:'print'});
  const sheet=page.locator('[data-print-sheet]');const bounds=await sheet.boundingBox();assert.equal(Math.round(bounds.width),816);assert.equal(Math.round(bounds.height),1056);
  const images=await sheet.locator('img').evaluateAll(images=>images.map(image=>({src:image.src,loaded:image.complete&&image.naturalWidth>0})));assert.ok(images.every(image=>image.loaded),'all real images must load: '+JSON.stringify(images));
  await page.addScriptTag({path:'node_modules/jsqr/dist/jsQR.js'});
  const decoded=await page.locator('.collateral-scan img').first().evaluate(image=>{const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);return window.jsQR(pixels.data,pixels.width,pixels.height)?.data;});
  const target=new URL(decoded);assert.equal(target.origin,'https://singhub.app');assert.equal(target.pathname,'/hotelexperience/'+slug);assert.equal(target.searchParams.get('edition'),edition);assert.equal(target.searchParams.get('placement'),format);assert.equal(target.searchParams.get('utm_medium'),'qr');
  await page.screenshot({path:out+'/'+edition+'-'+format+'.png',fullPage:true});const pdf=await page.pdf({path:out+'/'+slug+'-'+edition+'-'+format+'-INTERNAL.pdf',preferCSSPageSize:true,printBackground:true});assert.equal((pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length,1,'one Letter page per asset');results.push({edition,format,decoded,imagesLoaded:true});
 }
 await page.emulateMedia({media:'screen'});await page.goto(packagePath,{waitUntil:'networkidle'});
 // Simulated review is stored only in this local fixture, never production.
 await page.getByLabel('Property photo cleared for public display and printed collateral').check();await page.getByLabel('Photo permission or license evidence').fill('CI fixture only. Simulated permission, not production approval.');await page.getByLabel('Hotel logo and custom theme reviewed for Concierge collateral').check();await page.getByLabel('Branding approval or source notes').fill('CI fixture only. Simulated brand review.');await page.getByRole('button',{name:'Save asset review',exact:true}).click();await page.getByRole('status').filter({hasText:'Review saved.'}).waitFor();await page.reload({waitUntil:'networkidle'});assert.equal(await page.getByRole('link',{name:'Print production / PDF',exact:true}).count(),4);
 const manifest=await (await context.request.get(packagePath+'/manifest')).json();assert.equal(manifest.productionReady.guest,true);assert.equal(manifest.outputs.length,4);
 for(const edition of ['guest','concierge'])for(const width of [390,1440]){
  await page.setViewportSize({width,height:844});const response=await page.goto(base+'/hotelexperience/'+slug+'?edition='+edition,{waitUntil:'networkidle'});assert.equal(response.status(),200);assert.equal(await page.locator('[data-hotel-edition]').getAttribute('data-hotel-edition'),edition);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.getByRole('button',{name:/^This week$/i}).click();await page.locator('a[href*="/venues/jts-tavern"]').first().waitFor();await page.screenshot({path:out+'/guest-flow-'+edition+'-'+width+'.png'});
 }
 assert.deepEqual(errors,[]);await writeFile(out+'/results.json',JSON.stringify(results,null,2));console.log('Hotel package passed: protected admin, approval/save/reload, four decodable QRs, four print PDFs and both mobile/desktop guest editions');await context.close();
}finally{await browser.close();}
