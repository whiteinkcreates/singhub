import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import ts from 'typescript';
import crypto from 'node:crypto';

function fixture({presentationMode='staff_code'}={}){
 const tables={venue_offer_unlocks:[],venue_offer_registers:[]};
 function table(name){
  const rows=tables[name];
  return {
   select(){
    const filters={};
    const q={eq(key,value){filters[key]=value;return q;},maybeSingle(){const matches=rows.filter(row=>Object.entries(filters).every(([k,v])=>row[k]===v));return Promise.resolve({data:matches[0]||null,error:null});},single(){const matches=rows.filter(row=>Object.entries(filters).every(([k,v])=>row[k]===v));return Promise.resolve({data:matches[0]||null,error:matches.length?null:{code:'PGRST116'}});}};
    return q;
   },
   insert(value){
    const duplicate=rows.some(row=>(row.redemption_code&&row.redemption_code===value.redemption_code)||(row.user_id===value.user_id&&row.venue_id===value.venue_id&&row.nightlife_date===value.nightlife_date));
    const inserted=duplicate?null:{id:'unlock-'+(rows.length+1),...value,unlocked_at:'2026-10-06T20:00:00Z',redeemed_at:null,presentation_started_at:null,presented_at:null};
    if(inserted)rows.push(inserted);
    const result={data:inserted,error:duplicate?{code:'23505'}:null};
    const q={select(){return q;},single(){return Promise.resolve(result);}};return q;
   },
   async upsert(value){
    const index=rows.findIndex(row=>row.venue_slug===value.venue_slug);
    if(index>=0)rows[index]={...rows[index],...value};else rows.push({...value,created_at:'2026-10-06T20:00:00Z'});
    return {error:null};
   },
   update(patch){
    const filters={};
    const result=()=>{const row=rows.find(item=>Object.entries(filters).every(([k,v])=>item[k]===v));if(row)Object.assign(row,patch);return {data:row||null,error:null};};
    const q={eq(key,value){filters[key]=value;return q;},is(key,value){filters[key]=value;return q;},select(){return q;},single(){return Promise.resolve(result());},maybeSingle(){return Promise.resolve(result());}};return q;
   }
  };
 }
 const client={from:table};
 const api={};
 const imports={
  'server-only':{},
  'node:crypto':crypto,
  '@/lib/supabase/admin':{createAdminClient:()=>client},
  '@/lib/venueEnhancements.server':{getPersistedVenueEnhancement:async()=>({enabled:true,singhubOffer:{enabled:true,title:'$1 off drinks',detail:'During karaoke',terms:'One per guest',days:['Tuesday'],presentationMode}})},
  '@/lib/tourStops':{nightlifeDate:()=> '2026-10-06'},
 };
 vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/venueOffers.server.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{exports:api,require:id=>imports[id],Date,JSON,Math});
 return {api,tables};
}

test('Partner offer activates only on configured nights',async()=>{
 const {api}=fixture();
 assert.equal((await api.getActiveVenueOffer('one','Tuesday')).title,'$1 off drinks');
 assert.equal(await api.getActiveVenueOffer('one','Wednesday'),undefined);
});

test('confirmed TourStop unlocks one offer and register key redeems it once',async()=>{
 const {api,tables}=fixture();
 const first=await api.unlockVenueOffer({userId:'user-1',visitId:'visit-1',venueId:'venue-1',venueSlug:'one',nightlifeDate:'2026-10-06',weekday:'Tuesday'});
 assert.match(first.code,/^\d{6}$/);
 const again=await api.unlockVenueOffer({userId:'user-1',visitId:'visit-1',venueId:'venue-1',venueSlug:'one',nightlifeDate:'2026-10-06',weekday:'Tuesday'});
 assert.equal(again.code,first.code);assert.equal(tables.venue_offer_unlocks.length,1);
 const key=await api.rotateVenueRegisterKey('one');assert.ok(key.length>=20);assert.notEqual(tables.venue_offer_registers[0].token_hash,key);
 const bad=await api.redeemVenueOffer({venueSlug:'one',registerKey:'not-the-key',code:first.code});assert.equal(bad.status,401);
 const redeemed=await api.redeemVenueOffer({venueSlug:'one',registerKey:key,code:first.code});assert.equal(redeemed.ok,true);assert.equal(redeemed.alreadyRedeemed,false);assert.ok(redeemed.unlock.redeemedAt);
 const duplicate=await api.redeemVenueOffer({venueSlug:'one',registerKey:key,code:first.code});assert.equal(duplicate.ok,true);assert.equal(duplicate.alreadyRedeemed,true);
});

test('venue check-in unlocks an offer without requiring a Tour Stop',async()=>{
 const {api,tables}=fixture();
 const unlocked=await api.unlockVenueOffer({userId:'user-2',checkinId:'checkin-9',venueId:'venue-9',venueSlug:'one',nightlifeDate:'2026-10-06',weekday:'Tuesday'});
 assert.ok(unlocked.code);
 assert.equal(tables.venue_offer_unlocks[0].checkin_id,'checkin-9');
 assert.equal('visit_id' in tables.venue_offer_unlocks[0],false);
 const repeated=await api.unlockVenueOffer({userId:'user-2',checkinId:'checkin-9',venueId:'venue-9',venueSlug:'one',nightlifeDate:'2026-10-06',weekday:'Tuesday'});
 assert.equal(repeated.code,unlocked.code);
 const unavailable=await api.unlockVenueOffer({userId:'user-3',checkinId:'checkin-3',venueId:'venue-3',venueSlug:'one',nightlifeDate:'2026-10-07',weekday:'Wednesday'});
 assert.equal(unavailable,undefined);
});

test('one-time presentation is shown without a register code and never claims redemption',async()=>{
 const {api,tables}=fixture({presentationMode:'one_time'});
 const offer=await api.unlockVenueOffer({userId:'one-time-user',checkinId:'one-time-checkin',venueId:'venue-10',venueSlug:'one',nightlifeDate:'2026-10-06',weekday:'Tuesday'});
 assert.equal(offer.presentationMode,'one_time');
 assert.equal(offer.code,undefined);
 const opened=await api.changeVenueOfferPresentation({userId:'one-time-user',venueSlug:'one',action:'open'});
 assert.equal(opened.ok,true);
 assert.ok(opened.offer.presentationStartedAt);
 const reopened=await api.changeVenueOfferPresentation({userId:'one-time-user',venueSlug:'one',action:'open'});
 assert.equal(reopened.ok,true);
 assert.equal(reopened.recovered,true);
 const presented=await api.changeVenueOfferPresentation({userId:'one-time-user',venueSlug:'one',action:'close'});
 assert.equal(presented.ok,true);
 assert.ok(presented.offer.presentedAt);
 const after=await api.changeVenueOfferPresentation({userId:'one-time-user',venueSlug:'one',action:'open'});
 assert.equal(after.ok,false);
 assert.equal(after.status,409);
 assert.equal(tables.venue_offer_unlocks[0].redeemed_at,null);
 const stranger=await api.changeVenueOfferPresentation({userId:'another-user',venueSlug:'one',action:'close'});
 assert.equal(stranger.status,404);
});

test('one-time presentation cannot reopen after recovery expires',async()=>{
 const {api,tables}=fixture({presentationMode:'one_time'});
 await api.unlockVenueOffer({userId:'expiry-user',checkinId:'checkin',venueId:'venue-11',venueSlug:'one',nightlifeDate:'2026-10-06',weekday:'Tuesday'});
 tables.venue_offer_unlocks[0].presentation_started_at=new Date(Date.now()-120000).toISOString();
 const result=await api.changeVenueOfferPresentation({userId:'expiry-user',venueSlug:'one',action:'open'});
 assert.equal(result.ok,false);
 assert.equal(result.status,409);
});

test('staff-code offers cannot enter one-time presentation endpoint',async()=>{
 const {api}=fixture();
 await api.unlockVenueOffer({userId:'staff-user',checkinId:'checkin',venueId:'venue-12',venueSlug:'one',nightlifeDate:'2026-10-06',weekday:'Tuesday'});
 const result=await api.changeVenueOfferPresentation({userId:'staff-user',venueSlug:'one',action:'open'});
 assert.equal(result.status,409);
});
