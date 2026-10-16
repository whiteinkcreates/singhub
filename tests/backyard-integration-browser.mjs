import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const base=process.env.INTEGRATION_BASE_URL||'http://127.0.0.1:3117';
const out=process.env.INTEGRATION_QA_OUTPUT||'/tmp/backyard-integration-qa';
const server=process.env.INTEGRATION_BASE_URL?null:spawn(process.execPath,['node_modules/next/dist/bin/next','start','--port','3117'],{stdio:'ignore'});
let browser;
const report=[];
try {
 await mkdir(out,{recursive:true});
 for(let attempt=0;attempt<60;attempt++) {
  try{if((await fetch(base)).ok)break;}catch{}
  if(attempt===59)throw Error('Preview server did not start');
  await new Promise(resolve=>setTimeout(resolve,1000));
 }
 browser=await chromium.launch({args:['--no-sandbox']});
 for(const width of [360,390,768,1440]) {
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  for(const path of ['/','/backyard','/places','/neighborhoods','/san-diego-karaoke','/venues/premium']) {
   const response=await page.goto(base+path,{waitUntil:'networkidle'});assert.equal(response.status(),200,path);
   await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('h1').count(),1,path+' single title');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,path+' overflow '+width);
   const menu=page.locator(width<=860?'nav[aria-label="Mobile navigation"]':'nav[aria-label="Primary"]').filter({visible:true});
   await menu.locator('summary').click();
   const backyard=menu.getByRole('link',{name:'The Backyard',exact:true});assert.ok(await backyard.isVisible());assert.equal(await backyard.getAttribute('href'),'/backyard');
   await menu.locator('summary').click();
   await page.screenshot({path:out+'/'+(path==='/'?'discover':path.slice(1).replaceAll('/','-'))+'-'+width+'.png'});
   const hero=page.locator('[data-page-hero]').first();
   if(await hero.count()){
    const before=await hero.boundingBox();await page.evaluate(()=>scrollTo(0,300));
    const after=await hero.boundingBox();
    assert.ok(after&&before&&Math.abs(after.y-before.y)<2,path+' sticky hero');
    await page.evaluate(()=>scrollTo(0,0));
   }
   if(path==='/'){
    await page.locator('[data-mode="week"]').click();await page.getByRole('button',{name:'Karaoke+',exact:true}).click();
    await page.getByRole('combobox',{name:'Karaoke+ day'}).selectOption('Thursday');
    await page.locator('#venue-search').fill('Camel');assert.ok(await page.locator('.venue-result').count()>0,'Camel Thursday overlap');
    await page.getByRole('combobox',{name:'Karaoke+ day'}).selectOption('Wednesday');assert.equal(await page.locator('.venue-result').count(),0,'Camel Wednesday exclusion');
    await page.locator('#venue-search').fill('Hearth');await page.getByRole('combobox',{name:'Karaoke+ day'}).selectOption('Tuesday');
    assert.match(await page.locator('#results-list').innerText(),/Trivia/i);
    await page.getByRole('combobox',{name:'Karaoke+ day'}).selectOption('Thursday');assert.match(await page.locator('#results-list').innerText(),/Steak/i);
   }
   if(path==='/backyard') {
    await page.getByRole('button',{name:'Other →',exact:true}).click();
    await page.getByLabel('What are you looking for?').fill('Bowling in La Mesa');
    await page.getByLabel('Email for a personal follow-up (optional)').fill('singer@example.com');
    let submitted;
    await page.route('**/api/submit-listing',async route=>{submitted=route.request().postDataJSON();await route.fulfill({json:{ok:true}});});
    await page.getByRole('button',{name:'Send my request'}).click();
    await page.getByText('Request received!',{exact:false}).waitFor();assert.equal(submitted.submitterContact,'singer@example.com');
    await page.screenshot({path:out+'/request-success-'+width+'.png'});
   }
   report.push({path,width,status:'passed'});
  }
  assert.deepEqual(errors,[],'browser runtime errors');await page.close();
 }
 await writeFile(out+'/report.json',JSON.stringify(report,null,2));console.log('24 responsive route checks, sticky heroes, navigation, Karaoke+ and mocked form passed.');
}finally{await browser?.close();server?.kill();}
