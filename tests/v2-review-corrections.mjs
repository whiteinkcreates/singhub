import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.V2_BASE_URL||'http://localhost:3100';
const out=process.env.V2_REVIEW_OUTPUT||'/tmp/singhub-v2-corrections';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.V2_CHROME_PATH||undefined,args:['--no-sandbox']});
const report=[];
try{
 for(const width of [1440,390]){
  const context=await browser.newContext({ignoreHTTPSErrors:process.env.V2_PROXY_CERT==='1',viewport:{width,height:1000}});
  const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
  if(process.env.V2_ACCESS_URL)await page.goto(process.env.V2_ACCESS_URL,{waitUntil:'networkidle'});
  await page.goto(base+'/venues/the-lamplighter',{waitUntil:'networkidle'});
  const basicWidth=await page.locator('.app-view').evaluate(el=>el.getBoundingClientRect().width);
  assert.ok(width===1440?basicWidth>=1000:basicWidth<=width,'Basic responsive width');
  const venueUrl=page.url();await page.getByRole('button',{name:'SingHERE tonight',exact:true}).click();
  assert.equal(page.url(),venueUrl);await page.getByRole('dialog').getByText('Sign up with the KJ to get on the singing list.').waitFor();
  await page.getByRole('button',{name:'I just sang · Share'}).click();
  assert.match(await page.locator('.singhere-caption').innerText(),/^I just rocked the mic at The Lamplighter!/);
  await page.screenshot({path:out+'/singhere-'+width+'.png'});
  await page.getByRole('button',{name:'Close SingHERE'}).click();assert.equal(await page.locator('.singhere-dialog').count(),0);
  await page.screenshot({path:out+'/basic-'+width+'.png',fullPage:true});
  await page.goto(base+'/find-karaoke',{waitUntil:'networkidle'});
  const hosts=width===1440?page.locator('.primary-nav'):page.locator('.mobile-nav');assert.equal(await hosts.getByRole('link',{name:/Hosts$/}).count(),1);
  const media=await page.locator('.venue-preview').evaluateAll(els=>els.map(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,cardWidth:el.parentElement.getBoundingClientRect().width})));
  assert.ok(media.length>0,'Real listing media available');
  if(width===390)assert.ok(media.every(item=>Math.abs(item.height-196)<1),'Consistent mobile media height');
  else assert.ok(media.every(item=>item.width>=240),'Expanded desktop listing media');
  await page.screenshot({path:out+'/directory-'+width+'.png',fullPage:true});
  const totalCards=await page.locator('.venue-card').count();await page.locator('#venue-search').fill('bar');await page.waitForFunction(total=>document.querySelectorAll('#venue-list .venue-card').length<total,totalCards);await page.evaluate(()=>window.scrollTo(0,1800));
  const y=await page.evaluate(()=>scrollY);const first=page.locator('.venue-card').nth(3);assert.ok(await first.count());
  // DOM click keeps the current long-list position instead of scrolling the target into view.
  await Promise.all([page.waitForURL('**/venues/**'),first.evaluate(el=>el.click())]);
  await page.waitForLoadState('networkidle');
  if(await page.locator('.v2-basic').count())await page.getByRole('button',{name:'Go back'}).click();else await page.locator('.venue-back').click();
  await page.waitForURL('**/find-karaoke');await page.waitForLoadState('networkidle');
  await page.waitForFunction(()=>document.querySelector('#venue-search')?.value==='bar');
  await page.waitForFunction(expected=>Math.abs(scrollY-expected)<4,y);
  const returnedY=await page.evaluate(()=>scrollY);
  await page.goto(base+'/account',{waitUntil:'networkidle'});await page.getByLabel('Performance venue').selectOption('the-lamplighter');
  assert.match(await page.locator('.caption').innerText(),/^I just rocked the mic at The Lamplighter!/);
  assert.equal(await page.locator('#share-button').isEnabled(),true);
  assert.equal(await page.locator('.caption').getAttribute('data-share-url'),'/venues/the-lamplighter');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No horizontal overflow');
  assert.deepEqual(errors,[],'No browser exceptions');report.push({width,basicWidth,media,scrollBefore:y,scrollAfter:returnedY,errors});await context.close();
 }
 await writeFile(out+'/review.json',JSON.stringify(report,null,2));console.log('SingHERE, responsive profiles/photos, Hosts navigation, performance caption and list-state/scroll return passed at desktop and mobile sizes.');
}finally{await browser.close();}
