import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
await mkdir('.map-live-qa',{recursive:true});
const browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{for(const width of [390,1440]){
 const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('https://singhub.app/discover',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Map view',exact:true}).click();
 await page.locator('.leaflet-container[data-map-state="ready"][data-map-style="night"]').waitFor({timeout:60000});
 assert.ok(await page.locator('.singhub-venue-map-marker').count()>0);
 assert.equal(await page.locator('.singhub-venue-map-marker').count(),await page.locator('.leaflet-marker-icon').count());
 assert.equal(await page.locator('.leaflet-container canvas').evaluate(el=>getComputedStyle(el).filter),'none');
 assert.equal(await page.locator('.singhub-private-room-tag').count(),2);
 await page.screenshot({path:'.map-live-qa/night-'+width+'.png'});
 await page.getByRole('button',{name:'Street',exact:true}).click();
 await page.locator('.leaflet-container[data-map-state="ready"][data-map-style="street"]').waitFor({timeout:60000});
 await page.screenshot({path:'.map-live-qa/street-'+width+'.png'});
 await page.getByRole('button',{name:'Night',exact:true}).click();
 await page.locator('.leaflet-container[data-map-state="ready"][data-map-style="night"]').waitFor({timeout:60000});
 await page.getByRole('button',{name:'Close map',exact:true}).click();
 assert.deepEqual(errors,[]);
 await page.close();console.log('PRODUCTION native vector map, light alternative, SH pins and private rooms passed at '+width+'px');
}}catch(error){for(const context of browser.contexts())for(const page of context.pages())if(!page.isClosed()){await page.screenshot({path:'.map-live-qa/failure.png',fullPage:true}).catch(()=>{});console.log((await page.locator('body').innerText()).slice(-1500));}throw error;}finally{await browser.close();}
