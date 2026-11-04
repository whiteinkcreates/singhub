import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const base='http://127.0.0.1:3123';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3123'],{stdio:'ignore',env:{...process.env,SINGHUB_ADMIN_PASSWORD:'fixture-local-only'}});
let browser;
try{
 await mkdir('.sales-support-qa',{recursive:true});
 for(let attempt=0;attempt<30;attempt++){try{if((await fetch(base+'/support')).ok)break;}catch{}if(attempt===29)throw new Error('Sales QA server not ready');await new Promise(resolve=>setTimeout(resolve,1000));}
 assert.equal((await fetch(base+'/admin/venue-comparison')).status,401,'admin sales kit stays protected');
 browser=await chromium.launch({args:['--no-sandbox']});
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900},httpCredentials:{username:'admin',password:'fixture-local-only',origin:base}});
  const page=await context.newPage();page.setDefaultTimeout(15_000);page.setDefaultNavigationTimeout(20_000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  let submission;
  await page.route('**/api/submit-listing',async route=>{submission=route.request().postDataJSON();await route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});});
  await page.goto(base+'/support?topic=sign-in&source=%2Faccount',{waitUntil:'domcontentloaded'});
  const form=page.getByRole('form',{name:'Report a SingHUB problem'});
  await form.getByLabel('What happened? *',{exact:true}).fill('The sign-in email link expired before I could use it.');
  await form.getByRole('button',{name:'Send problem report'}).click();
  await form.getByRole('status').waitFor();assert.equal(submission.submissionType,'support_request');assert.equal(submission.supportCategory,'sign_in');
  await page.goto(base+'/claim-listing',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Request free venue claim'}).waitFor();
  assert.match(await page.locator('main').innerText(),/does not automatically give editing rights or start a Partner subscription/);
  await page.goto(base+'/claim-listing?premium=true',{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('textarea[name="karaoke-details"]').getAttribute('required'),null,'inquiry does not require a completed karaoke schedule');
  await page.goto(base+'/venues/premium?venue=jts-tavern',{waitUntil:'domcontentloaded'});
  await page.getByRole('link',{name:'View live profile ↗'}).waitFor();
  assert.match(await page.locator('main').innerText(),/\$59/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),'public sales page fits viewport');
  await page.goto(base+'/admin/venue-comparison',{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:'Venue Sales Kit',exact:true}).waitFor();
  await page.getByLabel('Canonical public venue').selectOption('jts-tavern');
  const message=await page.getByLabel('Suggested venue message').inputValue();assert.match(message,/\/venues\/jts-tavern/);assert.match(message,/No paperwork or payment needed/);
  assert.equal(await page.locator('a[href="/venue-partner-terms"]').count(),0,'unmerged terms route is not presented as available');
  await page.getByText('Venue Partner terms pending review',{exact:true}).waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),'admin sales kit fits viewport');
  assert.deepEqual(errors,[]);await page.screenshot({path:'.sales-support-qa/sales-kit-'+width+'.png',fullPage:true});
  await context.close();console.log('Support, free claim, public sales explorer and protected sales kit passed at '+width+'px');
 }
}finally{await browser?.close();server.kill();}
