import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.V2_BASE_URL||'http://localhost:3100';
const reference=process.env.V2_REFERENCE_URL||'http://localhost:3101';
const out=process.env.V2_REVIEW_OUTPUT||'/tmp/singhub-v2-review';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.V2_CHROME_PATH||undefined,args:['--no-sandbox']});
const review=[];
const routes=[['discovery','/','index.html'],['directory','/find-karaoke','venues.html'],['basic','/venues/the-lamplighter','design-board.html'],['enhanced','/venues/barlando','redwing.html'],['hotel','/hotel/pendry-san-diego','hotel.html'],['account','/account','singer.html']];
try{
 for(const width of [1440,390])for(const [name,path,file] of routes){
  const pair={name,width,screenshots:[],notes:[]};
  for(const [kind,url] of [['production',base+path],['reference',reference+'/'+file]]){
   const page=await browser.newPage({ignoreHTTPSErrors:process.env.V2_PROXY_CERT==='1',viewport:{width,height:1000}});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   const response=await page.goto(url,{waitUntil:'networkidle'});assert.equal(response.status(),200,url);
   await page.evaluate(()=>document.fonts.ready);
   if(name==='basic'&&kind==='reference')await page.evaluate(()=>{
    const panel=document.querySelector('[data-panel="basic"]');document.body.replaceChildren(panel);panel.classList.add('active');Object.assign(panel.style,{height:'auto',maxWidth:'430px',margin:'0 auto',minHeight:'100vh',overflow:'visible',background:'var(--bg)'});
   });
   assert.deepEqual(errors,[],url+' runtime errors');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,url+' horizontal overflow');
   const screenshot=out+'/'+name+'-'+kind+'-'+width+'.png';await page.screenshot({path:screenshot,fullPage:true});pair.screenshots.push(screenshot);
   pair[kind]=await page.locator('h1').first().evaluate(el=>{const c=getComputedStyle(el),r=el.getBoundingClientRect();return {text:el.textContent,font:c.fontFamily,size:c.fontSize,line:c.lineHeight,width:r.width,height:r.height}});
   if(kind==='production'){
    if(name==='discovery'){
     await page.locator('[data-mode="week"]').click();assert.equal(await page.locator('.v2-discovery.week-mode').count(),1);
     await page.locator('#venue-search').fill('no-room-matches-this-token');assert.equal(await page.locator('#empty-state.show').count(),1);
     await page.locator('#venue-search').fill('lamplighter');assert.ok(await page.locator('.venue-result').count()>0);
    }
    if(name==='directory'){
     await page.locator('#open-filters').click();assert.equal(await page.locator('#filter-sheet').evaluate(el=>el.open),true);
     await page.getByRole('button',{name:'Close filters'}).click();
     await page.locator('[data-quick-filter="private rooms"]').click();assert.ok(await page.locator('#venue-list .venue-card').count()>0);
    }
    if(name==='basic'){
     await page.getByRole('button',{name:'Save',exact:true}).click();if(await page.locator('.v2-basic').count()){assert.match(await page.locator('.toast').innerText(),/unavailable|not saved/);}else{await page.waitForURL('**/account?save=*');assert.equal(await page.locator('dialog[open]').count(),1);await page.goto(base+path,{waitUntil:'networkidle'});}
     await page.getByRole('button',{name:'Review',exact:true}).click();assert.equal(await page.getByRole('dialog',{name:/Review The Lamplighter/}).count(),1);await page.getByRole('button',{name:'Close review'}).click();
    }
    if(name==='hotel'){
     await page.locator('.plan-add').first().click();assert.equal(await page.locator('#plan-modal').isVisible(),true);
     await page.route('**/auth/v1/otp*',route=>route.abort());await page.locator('#plan-email').fill('review@example.invalid');await page.locator('.plan-submit').click();assert.match(await page.locator('.toast').innerText(),/unavailable|fetch|network|error/i);assert.equal(await page.locator('#plan-count').innerText(),'0');
     await page.locator('.plan-close').click();await page.locator('[data-mode="week"]').click();assert.equal(await page.locator('.v2-hotel.week-mode').count(),1);
    }
    if(name==='account'){
     await page.locator('[data-open-jacket]').first().click();assert.equal(await page.locator('#jacket-modal').evaluate(el=>el.open),true);
     await page.locator('#jacket-modal [data-skin="neon"]').click();assert.match(await page.locator('#jacket-modal [data-jacket-image]').getAttribute('src'),/neon/);
     await page.locator('#zoom-range').fill('1.8');assert.equal(await page.locator('#jacket-zoom').evaluate(el=>el.style.getPropertyValue('--zoom')),'1.8');
     await page.locator('#close-jacket').click();
    }
   }
   await page.close();
  }
  assert.equal(pair.production.font,pair.reference.font,name+' heading font');assert.equal(pair.production.size,pair.reference.size,name+' heading size');assert.equal(pair.production.line,pair.reference.line,name+' heading line height');
  if(pair.production.text===pair.reference.text){assert.equal(pair.production.width,pair.reference.width,name+' heading width');assert.equal(pair.production.height,pair.reference.height,name+' heading height');}
  pair.notes.push('Canonical data, missing media, and empty account records require visual review; screenshots are not an automatic pixel-parity approval.');review.push(pair);
 }
 await writeFile(out+'/review.json',JSON.stringify(review,null,2));console.log('Desktop/mobile routes, font metrics, overflow, runtime errors and interactions passed. Screenshots: '+out);
}finally{await browser.close();}
