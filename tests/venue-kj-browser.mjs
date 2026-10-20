import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const base=process.env.RECONCILIATION_BASE_URL||'http://127.0.0.1:3100';
const checks=[
  ['/venues/hearth-house',/Rodney/,/hosted by James/i],
  ['/venues/gingers',/ALL MIC LONG/,/Hosted by Mikey Mic/i],
  ['/venues/tonys-martini-bar',/ALL MIC LONG/,/Hosted by DJ Devyn/i],
  ['/venues/poways-irish-pub',/Danielle Dolphin/,null],
  ['/venues/way-point-saloon',/Danielle Dolphin and Cody/,null],
  ['/venues/saddle-bar',/Wednesday|WED/,null],
  ['/venues/1st-street-bar-encinitas',/1st Street Bar/,null],
  ['/venues/katys-diner',/first.*last|last.*first/i,null],
  ['/hosts/all-mic-long',/Tony|Ginger/,null],
  ['/hosts/rodney',/Werewolf/,/Hearth House/],
  ['/hosts/mikey-mic',/hosting nights are being confirmed/,/Affiliated with ALL MIC LONG/],
  ['/hosts/devyn-conover',/DJ Devyn/,/Tony.s Martini/],
  ['/hosts/danielle-dolphin',/Poway|Way Point/,null],
  ['/hosts/ed-katie',/University Heights/,null],
  ['/hosts/jason-g',/Savor Entertainment/,null],
  ['/hosts/kj-glyph',/College Area/,null],
];
await mkdir('.venue-kj-qa',{recursive:true});
const browser=await chromium.launch({args:['--no-sandbox']});
try{
  for(const width of [390,1440]){
    const page=await browser.newPage({viewport:{width,height:900}});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    for(const [route,expected,absent] of checks){
      const response=await page.goto(base+route,{waitUntil:'domcontentloaded'});
      assert.equal(response.status(),200,route);
      const text=await page.locator('main').innerText();
      assert.match(text,expected,route);
      if(absent)assert.doesNotMatch(text,absent,route);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' overflow');
      await page.screenshot({path:'.venue-kj-qa/'+route.slice(1).replaceAll('/','-')+'-'+width+'.png',fullPage:true});
    }
    await page.goto(base+'/hosts/dj-glyph',{waitUntil:'domcontentloaded'});
    assert.ok(page.url().endsWith('/hosts/kj-glyph'));
    assert.equal((await page.goto(base+'/hosts/james',{waitUntil:'domcontentloaded'})).status(),404);
    assert.deepEqual(errors,[]);
    await page.close();
  }
  console.log('16 venue/KJ routes, legacy redirect and inactive James passed at phone and desktop widths.');
}finally{await browser.close();}
