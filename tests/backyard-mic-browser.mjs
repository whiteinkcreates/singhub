import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const base=process.env.BACKYARD_BASE_URL||'http://127.0.0.1:3118';
const server=process.env.BACKYARD_BASE_URL?null:spawn(process.execPath,['node_modules/next/dist/bin/next','start','--port','3118'],{stdio:'ignore'});
let browser;
try {
 for(let attempt=0;attempt<60;attempt++){
  try{if((await fetch(base+'/backyard')).ok)break;}catch{}
  if(attempt===59)throw Error('Backyard server did not start');
  await new Promise(resolve=>setTimeout(resolve,1000));
 }
 await mkdir('/tmp/backyard-mic-qa',{recursive:true});
 browser=await chromium.launch({args:['--no-sandbox']});
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/backyard?activity=football&day=Thursday',{waitUntil:'domcontentloaded'});
  const redwing=page.locator('article').filter({has:page.getByRole('heading',{name:'Redwing Bar & Grill',exact:true})});
  const badge=redwing.getByTestId('backyard-karaoke-badge');
  await badge.waitFor();
  assert.match(await badge.innerText(),/Karaoke Thursday|Karaoke tonight/i);
  assert.match(await badge.innerText(),/9:00 PM.*Ricky/i,'Thursday karaoke follows trivia at 9 PM');
  assert.doesNotMatch(await badge.innerText(),/7:00 PM/,'7 PM is trivia, not Thursday karaoke');
  await page.getByTestId('backyard-karaoke-toggle').click();
  await page.waitForURL(url=>url.searchParams.get('karaoke')==='1');
  await redwing.getByTestId('backyard-karaoke-badge').waitFor();
  assert.equal(new URL(page.url()).searchParams.get('day'),'Thursday','retain day filter');
  const allCards=page.locator('#backyard-results article');
  const cardCount=await allCards.count();
  assert.ok(cardCount>0);
  assert.equal(cardCount,await page.getByTestId('backyard-karaoke-badge').count(),'filtered results all have karaoke listed');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal overflow');
  await page.screenshot({path:`/tmp/backyard-mic-qa/football-${width}.png`,fullPage:true});
  await page.goto(base+'/backyard?activity=football&day=Monday',{waitUntil:'domcontentloaded'});
  const mondayRedwing=page.locator('article').filter({has:page.getByRole('heading',{name:'Redwing Bar & Grill',exact:true})});
  assert.match(await mondayRedwing.getByTestId('backyard-karaoke-badge').innerText(),/7:00 PM.*Ricky/i);
  assert.deepEqual(errors,[]);
  await page.close();
 }
 console.log('Backyard mic: Redwing Thursday/Monday times, preserved filters, matched-card badges, no overflow passed.');
}finally{await browser?.close();server?.kill();}
