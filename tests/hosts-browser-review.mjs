import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
const base=process.env.HOSTS_BASE_URL||'http://127.0.0.1:3102';
const output=process.env.HOSTS_OUTPUT||'tests/review-hosts';
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.V2_CHROME_PATH||'/tmp/singhub-browser/chrome-linux64/chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
const results=[];
for(const width of [1536,390]){
 const context=await browser.newContext({viewport:{width,height:1024},ignoreHTTPSErrors:true,acceptDownloads:true});const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 if(process.env.HOSTS_ACCESS_URL)await page.goto(process.env.HOSTS_ACCESS_URL);
 await page.goto(base+'/hosts');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);
 assert.equal(await page.locator('.host-appbar').count(),1);assert.ok(await page.locator('.host-directory-card').count()>0);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:`${output}/directory-${width}.png`,fullPage:true});
 const href=await page.locator('.host-directory-card').first().getAttribute('href');
 const query=await page.locator('.host-directory-card h3').first().innerText();
 await page.locator('#host-search').fill(query);await page.evaluate(()=>scrollTo(0,400));const y=await page.evaluate(()=>scrollY);
 await page.locator('.host-directory-card').first().click();await page.waitForURL('**'+href);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(300);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:`${output}/profile-${width}.png`,fullPage:true});
 const schedule=await page.locator('.host-schedule-row').allTextContents();
 await page.getByRole('button',{name:'Share profile',exact:true}).click();assert.ok(await page.locator('dialog').evaluate(el=>el.open));
 await page.locator('.host-trading-footer>img').waitFor();await page.waitForFunction(()=>document.querySelector('.host-trading-footer>img')?.complete);
 const qrLoaded=await page.locator('.host-trading-footer>img').evaluate(el=>el.naturalWidth>0);
 await page.screenshot({path:`${output}/share-${width}.png`,fullPage:true});
 if(qrLoaded){const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download image',exact:true}).click();const file=await download;await file.saveAs(`${output}/card-${width}.png`);assert.ok((await fs.stat(`${output}/card-${width}.png`)).size>10000);}
 await page.getByRole('button',{name:'Close share profile'}).click();await page.getByRole('link',{name:'Back to Hosts'}).click();await page.waitForURL('**/hosts');await page.waitForTimeout(500);
 assert.equal(await page.locator('#host-search').inputValue(),query);assert.ok(Math.abs(await page.evaluate(()=>scrollY)-y)<5);
 assert.deepEqual(errors,[]);results.push({width,href,schedule,qrLoaded,restoredY:y});await context.close();
}
await browser.close();await fs.writeFile(output+'/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
