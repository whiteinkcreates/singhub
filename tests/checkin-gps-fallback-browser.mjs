import assert from 'node:assert/strict';
import {mkdir,writeFile,appendFile} from 'node:fs/promises';

if(process.argv.includes('--prepare')){
 if(process.env.CI!=='true')throw new Error('GPS check-in browser fixture is CI-only.');
 await appendFile(process.env.GITHUB_ENV,
  'NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:3101\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=isolated-gps-qa\n');
 await mkdir('src/app/gps-recovery-qa',{recursive:true});
 await writeFile('src/app/gps-recovery-qa/page.tsx',String.raw`"use client";
import {TourStopCheckIn} from '@/components/v2/TourStopCheckIn';
import '@/components/v2/styles/account.css';
export default function GpsRecoveryQa(){
 return <main className="v2-account" style={{minHeight:'100vh',padding:'40px 18px'}}>
  <TourStopCheckIn venueSlug="pal-joeys" venueName="Pal Joey's Cocktail Lounge"/>
 </main>;
}
`);
 process.exit(0);
}

const {chromium}=await import('playwright');
const browser=await chromium.launch({args:['--no-sandbox']});
await mkdir('.gps-recovery-qa',{recursive:true});
const base=process.env.QA_BASE_URL||'http://localhost:3100';
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:860}});
  await context.grantPermissions(['geolocation'],{origin:base});
  await context.setGeolocation({latitude:32.7909005,longitude:-117.0832842,accuracy:35});
  const errors=[];
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  // Isolated, authenticated test singer. No real account or Supabase rows touched.
  const user={id:'gps-test-user',email:'gps-test@example.invalid',email_confirmed_at:'2026-10-08'};
  const session={
   access_token:'gps-test-token',refresh_token:'gps-test-refresh',
   expires_at:Math.floor(Date.now()/1000)+3600,
   expires_in:3600,token_type:'bearer',user
  };
  await context.addCookies([{
   name:'sb-127-auth-token',value:'base64-'+Buffer.from(JSON.stringify(session)).toString('base64url'),
   domain:'localhost',path:'/'
  }]);
  await page.route('**/auth/v1/**',route=>route.fulfill({contentType:'application/json',body:JSON.stringify(user)}));
  let venueSaved=false,tourSaved=false;
  const submissions={venue:[],tour:[]};
  await page.route('**/api/venue-checkins**',async route=>{
   if(route.request().method()!=='POST'){
    await route.fulfill({contentType:'application/json',body:JSON.stringify({
     checkin:venueSaved?{id:'checkin-1',method:'self_reported'}:null,offerUnlock:null
    })});return;
   }
   const body=route.request().postDataJSON();
   submissions.venue.push(body);
   assert.equal(body.venueSlug,'pal-joeys');
   if(body.method==='location_matched'){
    assert.equal(typeof body.location?.latitude,'number');
    await route.fulfill({status:422,contentType:'application/json',
     body:JSON.stringify({error:'Your phone reported a position outside the check-in radius.',code:'too_far'})});
    return;
   }
   assert.equal(body.method,'self_reported');
   venueSaved=true;
   await route.fulfill({contentType:'application/json',
    body:JSON.stringify({checkedIn:true,alreadyCheckedIn:false,tourStopCollected:false})});
  });
  await page.route('**/api/tour-stops**',async route=>{
   if(route.request().method()!=='POST'){
    await route.fulfill({contentType:'application/json',body:JSON.stringify({
     visit:tourSaved?{status:'confirmed',method:'self_reported'}:null,
     eligibility:{phase:'open',open:true,reason:'Karaoke is underway.',startTime:'9:00 PM'}
    })});return;
   }
   const body=route.request().postDataJSON();
   submissions.tour.push(body);
   assert.equal(body.venueSlug,'pal-joeys');
   if(body.method==='location_matched'){
    await route.fulfill({status:422,contentType:'application/json',
     body:JSON.stringify({error:'Your phone does not appear close enough. GPS can drift indoors.',code:'too_far'})});
    return;
   }
   assert.equal(body.method,'self_reported');
   tourSaved=true;
   await route.fulfill({contentType:'application/json',
    body:JSON.stringify({collected:true,status:'confirmed',venueName:"Pal Joey's Cocktail Lounge"})});
  });
  await page.goto(base+'/gps-recovery-qa',{waitUntil:'networkidle'});
  await page.locator('.gig-check-in-button').click();
  await page.getByRole('button',{name:'Collect Tour Stop with GPS'}).waitFor();
  await page.getByRole('button',{name:'Check in with my location'}).click();
  await page.getByRole('button',{name:'Check in here · Self-reported'}).waitFor();
  assert.match(await page.locator('.gig-gps-recovery').innerText(),/GPS can drift indoors/);
  await page.screenshot({path:'.gps-recovery-qa/venue-fallback-'+width+'.png'});
  await page.getByRole('button',{name:'Check in here · Self-reported'}).click();
  await page.getByText('Venue check-in saved').waitFor();
  assert.equal(venueSaved,true);
  await page.getByRole('button',{name:'Collect Tour Stop with GPS'}).click();
  await page.getByRole('button',{name:'Collect Tour Stop · Self-reported'}).waitFor();
  await page.screenshot({path:'.gps-recovery-qa/tour-fallback-'+width+'.png'});
  await page.getByRole('button',{name:'Collect Tour Stop · Self-reported'}).click();
  await page.getByText('Tour Stop collected').waitFor();
  assert.equal(tourSaved,true);
  assert.deepEqual(submissions.venue.map(v=>v.method),['location_matched','self_reported']);
  assert.deepEqual(submissions.tour.map(v=>v.method),['location_matched','self_reported']);
  assert.equal(await page.getByRole('button',{name:'Collect Tour Stop · Self-reported'}).count(),0);
  assert.deepEqual(errors,[]);
  console.log('GPS rejection offered labeled self-report check-ins at '+width+'px');
  await context.close();
 }
}finally{await browser.close();}
