import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import ts from 'typescript';

function nightlifeWeekday(date=new Date()){
 const parts=new Intl.DateTimeFormat('en-US',{weekday:'long',hour:'numeric',hourCycle:'h23',timeZone:'America/Los_Angeles'}).formatToParts(date);
 const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];const weekday=parts.find(p=>p.type==='weekday').value;const hour=Number(parts.find(p=>p.type==='hour').value);
 if(hour>=4)return weekday;return days[(days.indexOf(weekday)+6)%7];
}
const helpers={};
vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/tourStops.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{
 exports:helpers,Intl,Date,Map,Math,Number,
 require:id=>({
  '@/lib/eventOccurrence':{eventRunsOnNight:(event,weekday)=>event.karaokeDay===weekday},
  '@/lib/nightlifeTime':{getSanDiegoNightlifeWeekday:nightlifeWeekday},
 }[id]),
});

test('nightlife date rolls at 4am, including both DST transitions',()=>{
 for(const [instant,date] of [['2026-10-04T10:59:59Z','2026-10-03'],['2026-10-04T11:00:00Z','2026-10-04'],['2026-03-08T10:59:59Z','2026-03-07'],['2026-03-08T11:00:00Z','2026-03-08'],['2026-11-01T11:59:59Z','2026-10-31'],['2026-11-01T12:00:00Z','2026-11-01']])assert.equal(helpers.nightlifeDate(new Date(instant)),date);
});

test('location matching rejects distant, inaccurate, missing and invalid coordinates',()=>{
 const venue={latitude:32.77495,longitude:-117.0259};
 assert.equal(helpers.locationMatch({...venue,accuracy:30},venue),true);
 for(const location of [{latitude:32.77,longitude:-117.1,accuracy:20},{...venue,accuracy:500},{...venue,accuracy:-1},{...venue,latitude:NaN},null])assert.equal(helpers.locationMatch(location,venue),false);
 assert.equal(helpers.locationMatch({...venue,accuracy:30},{latitude:null,longitude:null}),false);
});

test('one TourStop per stable venue ID preserves first visit and counts returns',()=>{
 const visit={venue_id:'venue-1',venue_slug:'one',venue_name:'One',created_at:'2026-10-03T20:00:00Z',nightlife_date:'2026-10-03',method:'self_reported'};
 const result=helpers.collectTourStops([{...visit,created_at:'2026-10-04T20:00:00Z',venue_slug:'new-slug'},{...visit},{...visit,venue_id:'venue-2'}]);
 assert.equal(result.length,2);const one=result.find(v=>v.venue_id==='venue-1');assert.equal(one.visits,2);assert.equal(one.created_at,visit.created_at);
});

test('TourStop timing distinguishes early arrival, open karaoke and the 4am rollover',()=>{
 const event={karaokeDay:'Tuesday',startTime:'9:00 PM',recurring:true,recurrencePattern:'TRUE',eventNotes:''};
 const early=new Date('2026-10-07T03:30:00Z'); // Tue 8:30 PM PDT
 assert.equal(helpers.tourStopEligibility([event],early).phase,'early');
 const open=new Date('2026-10-07T04:30:00Z'); // Tue 9:30 PM PDT
 assert.equal(helpers.tourStopEligibility([event],open).phase,'open');
 const late=new Date('2026-10-07T10:30:00Z'); // Wed 3:30 AM PDT, still Tuesday nightlife
 assert.equal(helpers.tourStopEligibility([event],late).phase,'open');
 const rollover=new Date('2026-10-07T11:00:00Z'); // Wed 4:00 AM PDT
 assert.equal(helpers.tourStopEligibility([event],rollover).phase,'closed');
});

function apiFixture(){
 const rows=[];let phase='open';
 function from(){
  return {
   select(_columns,_options){
    const filters={};
    const q={
     eq(key,value){filters[key]=value;return q;},
     order(){return q;},
     maybeSingle(){const matches=rows.filter(row=>Object.entries(filters).every(([k,v])=>row[k]===v));return Promise.resolve({data:matches[0]||null,error:null});},
     then(resolve){const matches=rows.filter(row=>Object.entries(filters).every(([k,v])=>row[k]===v));return Promise.resolve({data:matches,count:matches.length,error:null}).then(resolve);}
    };return q;
   },
   async insert(row){
    if(rows.some(r=>r.user_id===row.user_id&&r.venue_id===row.venue_id&&r.nightlife_date===row.nightlife_date))return {error:{code:'23505'}};
    rows.push({id:'visit-'+(rows.length+1),...row,created_at:new Date().toISOString()});return {error:null};
   },
   update(patch){
    const filters={};
    const q={eq(key,value){filters[key]=value;for(const row of rows)if(Object.entries(filters).every(([k,v])=>row[k]===v))Object.assign(row,patch);return q;},then(resolve){return Promise.resolve({error:null}).then(resolve);}};
    return q;
   }
  };
 }
 const client={auth:{getUser:async(token)=>({data:{user:token==='test-token'?{id:'test-user',email_confirmed_at:'2026-01-01'}:null},error:null})},from};
 const api={};const imports={
  'next/server':{NextResponse:Response},
  '@/lib/supabase/admin':{createAdminClient:()=>client},
  '@/lib/venueData':{getVenueListings:async()=>[{id:'venue-1',slug:'one',venueName:'One',neighborhood:'La Mesa',latitude:32.77,longitude:-117.02}]},
  '@/lib/publicVenueFilters':{getPublicVenues:v=>v},
  '@/lib/eventData':{getKaraokeEventsByVenueSlug:async()=>[{karaokeDay:nightlifeWeekday(),startTime:'9:00 PM',recurring:true,recurrencePattern:'TRUE',eventNotes:''}]},
  '@/lib/tourStops':{...helpers,tourStopEligibility:()=>({phase,open:phase==='open',weekday:nightlifeWeekday(),startTime:'9:00 PM',reason:phase==='early'?'You’re early.':'TourStop check-in is open until 4 AM.'})},
 };
 vm.runInNewContext(ts.transpileModule(readFileSync('src/app/api/tour-stops/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:api,require:id=>imports[id],URL,JSON,Response});
 return {api,rows,setPhase:value=>{phase=value;}};
}

test('API authenticates, validates canonical venue, prevents duplicates and retains no GPS',async()=>{
 const {api,rows}=apiFixture();
 const post=(body,token='test-token',origin='https://singhub.app')=>api.POST(new Request('https://singhub.app/api/tour-stops',{method:'POST',headers:{Authorization:'Bearer '+token,Origin:origin},body:JSON.stringify(body)}));
 assert.equal((await post({venueSlug:'one',method:'self_reported'},'bad-token')).status,401);
 assert.equal((await post({venueSlug:'invented',method:'self_reported'})).status,404);
 assert.equal((await post({venueSlug:'one',method:'self_reported'},'test-token','https://other.example')).status,403);
 assert.equal((await post({venueSlug:'one',method:'location_matched',location:{latitude:0,longitude:0,accuracy:10}})).status,422);
 const first=await (await post({venueSlug:'one',method:'self_reported',user_id:'someone-else',nightlife_date:'2099-01-01'})).json();assert.equal(first.collected,true);
 const duplicate=await (await post({venueSlug:'one',method:'self_reported'})).json();assert.equal(duplicate.alreadyCheckedIn,true);assert.equal(rows.length,1);assert.equal(rows[0].user_id,'test-user');assert.notEqual(rows[0].nightlife_date,'2099-01-01');assert.equal('location' in rows[0],false);
 const response=await api.GET(new Request('https://singhub.app/api/tour-stops',{headers:{Authorization:'Bearer test-token'}}));assert.equal((await response.json()).stops.length,1);
 const missing=await api.GET(new Request('https://singhub.app/api/tour-stops'));assert.equal(missing.status,401);
});

test('early arrival stays pending until the user confirms they are still there after karaoke starts',async()=>{
 const {api,rows,setPhase}=apiFixture();
 const post=()=>api.POST(new Request('https://singhub.app/api/tour-stops',{method:'POST',headers:{Authorization:'Bearer test-token',Origin:'https://singhub.app'},body:JSON.stringify({venueSlug:'one',method:'self_reported'})}));
 setPhase('early');
 const early=await (await post()).json();assert.equal(early.pending,true);assert.equal(rows[0].status,'pending');
 let collection=await (await api.GET(new Request('https://singhub.app/api/tour-stops',{headers:{Authorization:'Bearer test-token'}}))).json();assert.equal(collection.stops.length,0);
 setPhase('open');
 const confirmed=await (await post()).json();assert.equal(confirmed.confirmedFromPending,true);assert.equal(rows[0].status,'confirmed');assert.ok(rows[0].confirmed_at);
 collection=await (await api.GET(new Request('https://singhub.app/api/tour-stops',{headers:{Authorization:'Bearer test-token'}}))).json();assert.equal(collection.stops.length,1);
});
