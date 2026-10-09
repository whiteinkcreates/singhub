import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function fixture(){
 const rows=[];let offerEnabled=true;
 const visits=[];
 const today='2026-10-08';
 const client={
  auth:{getUser:async(token)=>({data:{user:token==='valid-token'?{id:'user-1',email_confirmed_at:'2026-10-08'}:null},error:null})},
  from(name){
   assert.equal(name,'singer_venue_checkins');
   return {
    select(){
     const filters={};
     const q={
      eq(key,value){filters[key]=value;return q;},
      maybeSingle:async()=>({data:rows.find(row=>Object.entries(filters).every(([key,value])=>row[key]===value))||null,error:null}),
      single:async()=>({data:rows.find(row=>Object.entries(filters).every(([key,value])=>row[key]===value))||null,error:null})
     };
     return q;
    },
    insert(value){
     const duplicate=rows.some(row=>row.user_id===value.user_id&&row.venue_id===value.venue_id&&row.checked_in_on===value.checked_in_on);
     const inserted=duplicate?null:{id:'checkin-1',...value,checked_in_at:new Date().toISOString()};
     if(inserted)rows.push(inserted);
     const q={select(){return q;},single:async()=>({data:inserted,error:duplicate?{code:'23505'}:null})};
     return q;
    }
   };
  }
 };
 const output={};
 const imports={
  'next/server':{NextResponse:Response},
  '@/lib/supabase/admin':{createAdminClient:()=>client},
  '@/lib/venueData':{getVenueListings:async()=>[{id:'venue-1',slug:'one',venueName:'One',neighborhood:'La Mesa',metro:'san-diego',latitude:32.77,longitude:-117.02}]},
  '@/lib/publicVenueFilters':{getPublicVenues:venues=>venues},
  '@/lib/markets':{getMarketConfig:id=>id==='san-diego'?{status:'live'}:{status:'staging'}},
  '@/lib/tourStops':{
   nightlifeDate:()=>today,
   locationMatchReason:(location)=>location&&location.accuracy<=150?null:'low_accuracy'
  },
  '@/lib/venueOffers.server':{
   getVenueOfferUnlock:async()=>undefined,
   unlockVenueOffer:async(input)=>{
    visits.push(input);
    return offerEnabled?{title:'Venue deal',code:'321987'}:undefined;
   }
  }
 };
 vm.runInNewContext(ts.transpileModule(readFileSync('src/app/api/venue-checkins/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{
  exports:output,require:id=>imports[id],URL,JSON,Response,Date,Intl,console
 });
 function request(method,body,token='valid-token',origin='https://singhub.app'){
  return new Request('https://singhub.app/api/venue-checkins'+(method==='GET'?'?venueSlug=one':''),{
   method,headers:{Authorization:'Bearer '+token,Origin:origin},...(method==='POST'?{body:JSON.stringify(body)}:{})
  });
 }
 return {api:output,rows,visits,request,setOfferEnabled:value=>{offerEnabled=value;}};
}

test('venue check-in saves without any karaoke schedule and never awards a Tour Stop',async()=>{
 const {api,rows,visits,request}=fixture();
 const response=await api.POST(request('POST',{venueSlug:'one',method:'self_reported',user_id:'attacker'}));
 assert.equal(response.status,200);
 const data=await response.json();
 assert.equal(data.checkedIn,true);
 assert.equal(data.tourStopCollected,false);
 assert.equal(data.offerUnlock.code,'321987');
 assert.equal(rows.length,1);
 assert.equal(rows[0].user_id,'user-1');
 assert.equal(rows[0].method,'self_reported');
 assert.equal('location' in rows[0],false);
 assert.equal(visits[0].checkinId,'checkin-1');
 assert.equal(visits[0].visitId,undefined);
});
test('repeat venue check-in is idempotent and remains eligible for an offer',async()=>{
 const {api,rows,request}=fixture();
 await api.POST(request('POST',{venueSlug:'one',method:'self_reported'}));
 const result=await (await api.POST(request('POST',{venueSlug:'one',method:'self_reported'}))).json();
 assert.equal(result.alreadyCheckedIn,true);
 assert.equal(rows.length,1);
});
test('offer may be unavailable even though venue check-in succeeds',async()=>{
 const {api,request,setOfferEnabled}=fixture();setOfferEnabled(false);
 const result=await (await api.POST(request('POST',{venueSlug:'one',method:'self_reported'}))).json();
 assert.equal(result.checkedIn,true);
 assert.equal(result.offerUnlock,undefined);
});
test('rejects spoofed GPS, cross-origin, unauthenticated and unknown venue',async()=>{
 const {api,rows,request}=fixture();
 assert.equal((await api.POST(request('POST',{venueSlug:'one',method:'self_reported'},'invalid'))).status,401);
 assert.equal((await api.POST(request('POST',{venueSlug:'one',method:'self_reported'},'valid-token','https://foreign.example'))).status,403);
 assert.equal((await api.POST(request('POST',{venueSlug:'bad',method:'self_reported'}))).status,404);
 const response=await api.POST(request('POST',{venueSlug:'one',method:'location_matched',location:{accuracy:500}}));
 assert.equal(response.status,422);
 assert.equal((await response.json()).code,'low_accuracy');
 assert.equal(rows.length,0);
});
test('GET returns venue presence, separate from Tour Stops',async()=>{
 const {api,request}=fixture();
 await api.POST(request('POST',{venueSlug:'one',method:'self_reported'}));
 const response=await api.GET(request('GET'));
 assert.equal(response.status,200);
 const result=await response.json();
 assert.equal(result.checkin.id,'checkin-1');
 assert.equal(result.offerUnlock,undefined);
});
