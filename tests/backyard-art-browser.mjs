import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const base=process.env.ART_BASE_URL||'http://127.0.0.1:3118';
const server=process.env.ART_BASE_URL?null:spawn(process.execPath,['node_modules/next/dist/bin/next','start','--port','3118'],{stdio:'ignore'});
let browser;
try {
 for(let attempt=0;attempt<60;attempt++) {
  try {if((await fetch(base+'/backyard')).ok)break;}catch{}
  if(attempt===59)throw Error('Backyard server did not start');
  await new Promise(resolve=>setTimeout(resolve,1000));
 }
 await mkdir('/tmp/backyard-art-qa',{recursive:true});
 browser=await chromium.launch({args:['--no-sandbox']});
 for(const width of [390,1440]) {
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  assert.equal((await page.goto(base+'/backyard',{waitUntil:'domcontentloaded'})).status(),200);
  const tiles=page.locator('a[href^="/backyard?activity="]');
  await tiles.last().waitFor();
  assert.equal(await tiles.count(),11);
  assert.equal(await page.locator("article").count(),0,"venue cards wait for an activity choice");
  assert.equal(await page.locator("#backyard-results").count(),0);
  for(const tile of await tiles.all()) {
   await tile.scrollIntoViewIfNeeded();
   const img=tile.locator('img');
   await img.evaluate(image=>image.decode());
   assert.ok(await img.evaluate(image=>image.naturalWidth>0));
   const box=await img.boundingBox();assert.ok(Math.abs(box.width-box.height)<2,'art remains square');
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal overflow');
  await Promise.all([
   page.waitForURL(url=>url.searchParams.get('activity')==='bowling',{waitUntil:'domcontentloaded'}),
   tiles.filter({has:page.getByRole('heading',{name:'Bowling',exact:true})}).click(),
  ]);
  await page.getByRole('heading',{name:'Punch Bowl Social San Diego',exact:true}).waitFor();
  await page.waitForFunction(()=>document.querySelectorAll('article').length===1);
  assert.equal(new URL(page.url()).hash,'#backyard-results');
  await page.getByRole('heading',{name:'Bowling spots',exact:true}).waitFor();
  const results=page.locator('article');assert.equal(await results.count(),1);
  assert.match(await results.innerText(),/Bowling/);
  assert.doesNotMatch(await results.innerText(),/Shuffleboard|Arcade/,'bowling results show the relevant activity');
  await page.getByRole('combobox',{name:'Day to explore'}).selectOption('Monday');
  await Promise.all([
   page.waitForURL(url=>url.searchParams.get('activity')==='bowling'&&url.searchParams.get('day')==='Monday',{waitUntil:'domcontentloaded'}),
   page.getByRole('button',{name:'Explore',exact:true}).click(),
  ]);
  await page.getByRole('heading',{name:'Punch Bowl Social San Diego',exact:true}).waitFor();
  await page.screenshot({path:`/tmp/backyard-art-qa/bowling-${width}.png`,fullPage:true});
  await page.goto(base+'/backyard?activity=comedy',{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:'Grand Comedy Club and Pizzeria',exact:true}).waitFor();
  assert.equal(await page.locator('article').count(),1);
  assert.match(await page.locator('article').innerText(),/Comedy and open mic/);
  // Backyard karaoke indicators use the canonical nightly schedule, not a sports tag.
  await page.goto(base+'/backyard?activity=football&day=Thursday',{waitUntil:'domcontentloaded'});
  const redwing=page.locator('#backyard-results article').filter({has:page.getByRole('heading',{name:'Redwing Bar & Grill',exact:true})});
  await redwing.getByTestId('backyard-karaoke-badge').waitFor();
  const thursdayBadge=await redwing.getByTestId('backyard-karaoke-badge').innerText();
  assert.match(thursdayBadge,/9:00 PM.*Ricky/i,'Thursday karaoke is 9 PM with Ricky after 7 PM trivia');
  assert.doesNotMatch(thursdayBadge,/7:00 PM/,'7 PM is not Thursday karaoke');
  await page.getByTestId('backyard-karaoke-toggle').click();
  await page.waitForURL(url=>url.searchParams.get('karaoke')==='1'&&url.searchParams.get('day')==='Thursday');
  const filteredCards=page.locator('#backyard-results article');
  assert.ok(await filteredCards.count()>0,'filter retains Thursday karaoke venues');
  assert.equal(await filteredCards.count(),await page.getByTestId('backyard-karaoke-badge').count(),'only venues with karaoke appear');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'neon mic card has no horizontal overflow');
  await page.screenshot({path:`/tmp/backyard-art-qa/karaoke-neon-${width}.png`,fullPage:true});
  await page.goto(base+'/backyard',{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:'What are you here for?'}).scrollIntoViewIfNeeded();
  await page.screenshot({path:`/tmp/backyard-art-qa/tiles-${width}.png`,fullPage:true});
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('11 images load at mobile and desktop widths; square crops, overflow, Comedy and Bowling filters, and day-independent bowling passed.');
}finally {await browser?.close();server?.kill();}
