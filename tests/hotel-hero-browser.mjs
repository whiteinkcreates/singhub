// Isolated real-route QA. All database writes go to the loopback mock, never Supabase.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {chromium} from 'playwright';
const base='http://127.0.0.1:3100';
const slugs=['orli-la-jolla','grande-colonial','hard-rock-san-diego'];
const urls={
 'orli-la-jolla':'https://example.invalid/orli-approved.png',
 'grande-colonial':'https://thegrandecolonial.com/wp-content/uploads/2024/03/11202024_DroneExteriors_GrandeColonial_02.jpg',
 'hard-rock-san-diego':'https://hotel.hardrock.com/san-diego/files/6076/HRSD_Exterior_2200x1467.jpg',
};
const review=url=>({heroImageUrl:url,heroApproved:true,rightsNote:'Isolated QA fixture approval, not a production grant',brandApproved:false,brandLogoUrl:'',brandNote:'',reviewedAt:'2026-10-14'});
const media=(slug,approved=true)=>({heroImageUrl:urls[slug],heroAlt:slug+' exterior',heroPlacement:{desktop:{x:65,y:35,zoom:1},mobile:{x:19,y:50,zoom:1}},imageSource:'Isolated QA fixture',usageRights:'Isolated test only',...(approved?{packageReview:review(urls[slug])}:{})});
let records={};let readFails=false;let defaultsFail=false;
const mock=createServer(async(req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1:3101');const slug=url.searchParams.get('slug')?.replace(/^eq\./,'');
 if(readFails||(defaultsFail&&slug==='guest-guide-defaults')){res.writeHead(503);return res.end('{"message":"Simulated read failure"}');}
 let body='';for await(const chunk of req)body+=chunk;
 if(req.method==='POST'){const row=JSON.parse(body);records[row.slug]={media:row.media,updated_at:row.updated_at};res.writeHead(201);return res.end();}
 if(req.method==='PATCH'){const row=JSON.parse(body);records[slug]={...records[slug],...row};res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify([records[slug]]));}
 res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(records[slug]?[records[slug]]:[]));
});
await new Promise(r=>mock.listen(3101,'127.0.0.1',r));
const server=spawn('npm',['run','start','--','--hostname','127.0.0.1','--port','3100'],{env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:3101',SUPABASE_SERVICE_ROLE_KEY:'isolated-qa-service-key',SINGHUB_ADMIN_PASSWORD:'isolated-qa-password'},stdio:['ignore','pipe','pipe'],detached:true});
let logs='';server.stdout.on('data',b=>logs+=b);server.stderr.on('data',b=>logs+=b);
const out='.hotel-hero-qa';mkdirSync(out,{recursive:true});let browser;const results=[];
const auth='Basic '+Buffer.from('admin:isolated-qa-password').toString('base64');
try{
 for(let i=0;i<60;i++){try{if((await fetch(base+'/hotelexperience/orli-la-jolla',{signal:AbortSignal.timeout(1500)})).ok)break;}catch{}await new Promise(r=>setTimeout(r,500));}
 const bundled=process.env.HOTEL_QA_CHROMIUM_MODULE ? (await import(process.env.HOTEL_QA_CHROMIUM_MODULE)).default : null;
 browser=await chromium.launch({args:bundled?bundled.args:['--no-sandbox'],...(bundled?{executablePath:process.env.HOTEL_QA_CHROMIUM_EXECUTABLE||await bundled.executablePath()}:{} )});
 for(const width of [360,390,1440]){
  const context=await browser.newContext({viewport:{width,height:width===1440?900:844},serviceWorkers:'block'});
  const image=readFileSync('public/images/og/singhub-og.png');
  await context.route('https://**/*',route=>{
   if(route.request().resourceType()==='image')return route.fulfill({contentType:'image/png',body:image});
   return route.abort();
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const slug of slugs)for(const scenario of ['approved','empty-override','pending','staged','broken','absent','read-failure','defaults-failure']){
   readFails=scenario==='read-failure';defaultsFail=scenario==='defaults-failure';
   records={};
   let profile=media(slug);
   if(scenario==='empty-override')profile={...profile,heroImageUrl:'   ',heroAlt:'Wrong staged alt',heroPosition:'bottom'};
   if(scenario==='pending')profile=media(slug,false);
   if(scenario==='staged')profile={...media(slug,false),heroImageUrl:'https://example.invalid/unapproved-new.png',publishedHero:media(slug)};
   if(scenario!=='absent')records[slug]={media:profile,updated_at:'2026-10-14'};
   if(scenario==='broken')await context.route(urls[slug],route=>route.abort());
   const response=await page.goto(base+'/hotelexperience/'+slug+'?demo=1',{waitUntil:'networkidle'});assert.equal(response.status(),200);
   const hero=page.locator('[data-hotel-photo]');
   const expectsPhoto=['approved','staged','defaults-failure'].includes(scenario)||(scenario==='empty-override'&&slug!=='orli-la-jolla');
   console.log(slug,width,scenario,'expected',expectsPhoto,'actual',await hero.getAttribute('data-hotel-photo'));
   await page.waitForFunction(expected=>document.querySelector('[data-hotel-photo]')?.dataset.hotelPhoto===expected,expectsPhoto?'visible':'none');
   const html=await page.content();
   assert.ok(!html.includes('unapproved-new.png'),'pending URL absent from public serialized output');
   if(scenario==='pending')assert.ok(!html.includes(urls[slug]),'unapproved URL absent from HTML and OG metadata');
   if(!expectsPhoto)assert.ok((await hero.boundingBox()).height<=(width<=600?301:391),'compact no-photo hero');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   if(expectsPhoto){assert.equal(await hero.locator('img').first().getAttribute('src'),urls[slug]);}
   if(scenario==='empty-override'&&expectsPhoto)assert.notEqual(await hero.locator('img').first().getAttribute('alt'),'Wrong staged alt');
   await page.getByRole('button',{name:'This Week',exact:true}).click();assert.equal(await page.getByRole('button',{name:'This Week',exact:true}).getAttribute('aria-pressed'),'true');
   await page.getByRole('button',{name:'Tonight',exact:true}).click();
   const initial=await hero.boundingBox();await page.evaluate(()=>window.scrollTo(0,180));
   assert.ok(Math.abs((await hero.boundingBox()).y-initial.y)<2,'hero remains sticky');
   await page.evaluate(()=>window.scrollTo(0,0));
   if(['approved','broken','absent'].includes(scenario))await page.screenshot({path:`${out}/${slug}-${width}-${scenario}.png`});
   if(scenario==='broken')await context.unroute(urls[slug]);
   results.push({slug,width,scenario,photo:expectsPhoto,pass:true});
  }
  readFails=false;defaultsFail=false;
  assert.deepEqual(errors,[]);
  await context.close();
 }
 // Real admin route + mock persistence: stage, preserve, approve, reload.
 const slug='orli-la-jolla';records={[slug]:{media:media(slug),updated_at:'2026-10-14'}};
 const pending={...media(slug,false),heroImageUrl:'https://example.invalid/new-photo.png'};
 let response=await fetch(base+'/api/admin/hotel-profiles',{method:'PUT',headers:{authorization:auth,'Content-Type':'application/json'},body:JSON.stringify({slug,profile:pending})});
 assert.equal(response.status,200);let saved=(await response.json()).profile;assert.equal(saved.publishedHero.heroImageUrl,urls[slug]);
 response=await fetch(base+'/hotelexperience/'+slug);let html=await response.text();assert.ok(html.includes(urls[slug]));assert.ok(!html.includes(pending.heroImageUrl));
 response=await fetch(base+'/api/admin/hotel-profiles',{method:'PUT',headers:{authorization:auth,'Content-Type':'application/json'},body:JSON.stringify({slug,profile:{...saved,packageReview:review(pending.heroImageUrl)}})});
 assert.equal(response.status,200);saved=(await response.json()).profile;assert.equal(saved.publishedHero.heroImageUrl,pending.heroImageUrl);
 response=await fetch(base+'/hotelexperience/'+slug);html=await response.text();assert.ok(html.includes(pending.heroImageUrl));
 for(const path of ['/admin/hotels','/api/admin/hotel-profiles?slug='+slug,'/admin/hotels/'+slug+'/demo','/admin/hotels/concepts/andaz-san-diego'])assert.equal((await fetch(base+path)).status,401);
 console.log(`Passed ${results.length} hotel/viewport/state checks and admin stage/approve/reload/auth checks.`);
 writeFileSync(out+'/results.json',JSON.stringify(results,null,2));
}finally{await browser?.close();try{process.kill(-server.pid,'SIGTERM');}catch{}mock.closeAllConnections();mock.close();writeFileSync(out+'/server.log',logs);}
