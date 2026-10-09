import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function fixture(){
 const events=[];
 const client={
  auth:{getUser:async(token)=>({data:{user:token==='good-token'?{id:'singer-test',email_confirmed_at:'2026-10-09'}:null},error:null})},
  from(table){
   assert.equal(table,'singer_location_attempts');
   return {
    select(){
     const q={eq(){return q;},gte:async()=>({count:events.length,error:null})};
     return q;
    },
    insert:async(row)=>{
     events.push(row);
     return {error:null};
    }
   };
  }
 };
 const api={};
 const imports={
  'next/server':{NextResponse:Response},
  '@/lib/supabase/admin':{createAdminClient:()=>client},
  '@/lib/venueData':{getVenueListings:async()=>[{id:'venue-0017',slug:'pal-joeys',venueName:"Pal Joey's Cocktail Lounge",metro:'san-diego'}]},
  '@/lib/publicVenueFilters':{getPublicVenues:venues=>venues},
  '@/lib/markets':{getMarketConfig:market=>market==='san-diego'?{status:'live'}:undefined},
 };
 vm.runInNewContext(ts.transpileModule(readFileSync('src/app/api/location-attempts/route.ts','utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}
 }).outputText,{
  exports:api,require:id=>imports[id],URL,Date,Response,JSON,console,Object,Set
 });
 function post(input,token='good-token',origin='https://singhub.app'){
  return api.POST(new Request('https://singhub.app/api/location-attempts',{
   method:'POST',headers:{Authorization:'Bearer '+token,Origin:origin},
   body:JSON.stringify(input)
  }));
 }
 return {post,events};
}

test('location buttons record GPS success and rejections for both actions, without coordinates',async()=>{
 const {post,events}=fixture();
 assert.equal((await post({venueSlug:'pal-joeys',action:'venue',outcome:'failure',phase:'api',reason:'too_far',accuracyBand:'76-150m'})).status,204);
 assert.equal((await post({venueSlug:'pal-joeys',action:'tour',outcome:'failure',phase:'browser',reason:'permission_denied'})).status,204);
 assert.equal((await post({venueSlug:'pal-joeys',action:'venue',outcome:'success',phase:'api',accuracyBand:'0-25m'})).status,204);
 assert.equal(events.length,3);
 assert.equal(events[0].user_id,'singer-test');
 assert.equal(events[0].venue_id,'venue-0017');
 assert.equal(events[0].reason,'too_far');
 assert.equal(events[1].reason,'permission_denied');
 assert.equal(events[2].reason,null);
 assert.equal(events[2].outcome,'success');
 for(const event of events){
  assert.equal('latitude' in event,false);
  assert.equal('longitude' in event,false);
  assert.equal('location' in event,false);
  assert.equal('ip' in event,false);
  assert.equal('user_agent' in event,false);
  assert.equal(event.source,'app');
 }
});
test('location tracking rejects wrong origin, anonymous requests, malformed events and unknown venues',async()=>{
 const {post,events}=fixture();
 const ok={venueSlug:'pal-joeys',action:'venue',outcome:'failure',phase:'api',reason:'too_far'};
 assert.equal((await post(ok,'bad-token')).status,401);
 assert.equal((await post(ok,'good-token','https://evil.example')).status,403);
 assert.equal((await post({...ok,venueSlug:'not-a-venue'})).status,404);
 assert.equal((await post({...ok,latitude:32.79,longitude:-117.08})).status,400,'raw GPS coordinates must never enter telemetry');
 assert.equal((await post({...ok,reason:'invented'})).status,400);
 assert.equal((await post({...ok,outcome:'success'})).status,400,'success cannot carry error reason');
 assert.equal((await post({...ok,accuracyBand:'34.543 m'})).status,400);
 assert.equal(events.length,0);
});
test('excessive diagnostics are throttled per authenticated singer',async()=>{
 const {post,events}=fixture();
 const input={venueSlug:'pal-joeys',action:'tour',outcome:'failure',phase:'browser',reason:'gps_timeout'};
 for(let i=0;i<30;i++)assert.equal((await post(input)).status,204);
 assert.equal((await post(input)).status,429);
 assert.equal(events.length,30);
});
test('client instruments browser GPS errors, API rejections and successful check-ins',()=>{
 const source=readFileSync('src/components/v2/TourStopCheckIn.tsx','utf8');
 assert.match(source,/logLocationButtonOutcome/);
 assert.match(source,/report\('success'\)/);
 assert.match(source,/report\('failure',responseReason\)/);
 assert.match(source,/report\('failure',error\.diagnosticReason\)/);
 assert.match(source,/stage==='network'\?'network_error'/);
 assert.match(source,/gpsAccuracyBand/);
});

test('venue and karaoke GPS buttons are primary, while self-report stays available',()=>{
 const page=readFileSync('src/components/v2/TourStopCheckIn.tsx','utf8');
 const css=readFileSync('src/components/v2/tourStops.css','utf8');
 for(const method of ["checkIn('venue','location_matched')","checkIn('tour','location_matched')"]){
  assert.ok(page.includes('className="gig-gps-primary" disabled={pending} onClick={()=>void '+method+'}'));
 }
 for(const method of ["checkIn('venue','self_reported')","checkIn('tour','self_reported')"]){
  assert.ok(page.includes('className="gig-self-report" disabled={pending} onClick={()=>void '+method+'}'));
 }
 assert.match(css,/\.gig-actions button\.gig-gps-primary/);
 assert.match(css,/\.gig-actions button\.gig-self-report/);
});
test('performance stars show honest, subtle SR provenance without inventing verification',()=>{
 const jacket=readFileSync('src/components/v2/MyJacket.tsx','utf8');
 const account=readFileSync('src/components/v2/MySingHubTemplate.tsx','utf8');
 const css=readFileSync('src/components/v2/styles/account.css','utf8');
 assert.match(jacket,/star-sr/);
 assert.match(jacket,/Self-reported performance/);
 assert.match(account,/SR.*singer-reported song/);
 assert.match(account,/song-star.*Self-reported performance/);
 assert.match(css,/\.performance-star \.star-sr/);
 assert.match(css,/\.star-source-note/);
 assert.match(css,/\.song-star abbr/);
});
