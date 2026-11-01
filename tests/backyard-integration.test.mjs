import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import ts from 'typescript';

function load(file, overrides={}) {
 const exports={};
 vm.runInNewContext(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{
  exports,require:id=>id in overrides?overrides[id]:id.startsWith('@/')?load('src/'+id.slice(2)+'.ts',overrides):{},Intl,Date,Set,Map,console,
 });
 return exports;
}
const presentation=load('src/lib/v2/presentation.ts');
test('start-time buckets are exclusive across midnight and boundary times',()=>{
 const windows=['before-8','8-to-9','9-to-10','10-plus'];
 for(const [time,expected] of [['12 AM','10-plus'],['3:59 AM','10-plus'],['4 AM','before-8'],['7:59 PM','before-8'],['8 PM','8-to-9'],['9 PM','9-to-10'],['10 PM','10-plus'],['23:59','10-plus']]) {
  assert.deepEqual(windows.filter(window=>presentation.matchesKaraokeStart(time,window)),[expected],time);
 }
 assert.equal(presentation.matchesKaraokeStart('Unknown','before-8'),false);
});
const plus=load('src/lib/karaokePlusOverlap.ts');
const event=day=>({karaokeDay:day,recurring:true,recurrencePattern:'weekly'});
test('Karaoke+ requires karaoke on selected day; Backyard amenities stay independent',()=>{
 const events=[event('Thursday'),event('Saturday')];
 assert.equal(plus.plusNight('camels-bar-grill',events,'Thursday').eligible,true);
 assert.equal(plus.plusNight('camels-bar-grill',events,'Wednesday').eligible,false);
 assert.ok(plus.venueAmenities('camels-bar-grill').includes('Cornhole'));
 assert.equal(plus.scheduledExtrasOnDay('camels-bar-grill','Wednesday').length,0);
 assert.equal(plus.scheduledExtrasOnDay('camels-bar-grill','Thursday').length,0,'unconfirmed football cannot create a day badge');
 assert.equal(plus.scheduledExtrasOnDay('camels-bar-grill','Saturday')[0].status,'venue_published');
});
test('programmed extras do not leak days or turn amenities into schedule badges',()=>{
 const events=['Tuesday','Wednesday','Thursday'].map(event);
 assert.match(plus.plusNight('hearth-house',events,'Tuesday').scheduled[0].title,/Trivia/);
 assert.equal(plus.plusNight('hearth-house',events,'Wednesday').scheduled.length,0);
 assert.ok(plus.plusNight('hearth-house',events,'Wednesday').eligible);
 assert.match(plus.plusNight('hearth-house',events,'Thursday').scheduled[0].title,/Steak/);
 assert.equal(plus.plusNight('unlisted',events,'Tuesday').eligible,false);
});

function routeFixture({webhookOk=true, emailOk=true}={}) {
 const exports={},calls=[];
 const env={SINGHUB_SUBMISSIONS_WEBHOOK_URL:'https://inbox.example.test',SINGHUB_SUBMISSIONS_WEBHOOK_SECRET:'fixture',RESEND_API_KEY:'fixture',SINGHUB_SUBMISSIONS_TO:'owner@example.test',SINGHUB_SUBMISSIONS_FROM:'SingHUB <notify@example.test>'};
 const mockFetch=async(url,init)=>{calls.push({url,body:JSON.parse(init.body)});return url===env.SINGHUB_SUBMISSIONS_WEBHOOK_URL?new Response(JSON.stringify({ok:webhookOk}),{status:webhookOk?200:500}):new Response('{}',{status:emailOk?200:500});};
 vm.runInNewContext(ts.transpileModule(readFileSync('src/app/api/submit-listing/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{
  exports,process:{env},console:{error(){}},require:id=>id==='@/lib/operationalAlerts.server'?{notifySingHubOperator:async(subject,text)=>{const sent=await mockFetch('https://api.resend.com/emails',{method:'POST',body:JSON.stringify({subject,text,to:['owner@example.test']})});return sent.ok;}}:{NextResponse:{json:Response.json}},
  fetch:mockFetch,
 });
 const submit=contact=>exports.POST(new Request('https://singhub.example.test/api/submit-listing',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({submissionType:'activity_search_request',notes:'Please find bowling in La Mesa this weekend.',submitterContact:contact,sourceLink:'/backyard'})}));
 return {calls,submit};
}
test('normal optional email passes and request reaches inbox plus owner notification',async()=>{
 for(const contact of ['you@example.com','singer@example.com','']){
  const {calls,submit}=routeFixture();assert.equal((await submit(contact)).status,200);
  assert.equal(calls.length,2);assert.equal(calls[0].body.payload.submitterContact,contact);
  assert.equal(calls[1].url,'https://api.resend.com/emails');
  assert.deepEqual(calls[1].body.to,['owner@example.test']);
  assert.match(calls[1].body.text,/bowling in La Mesa/);
 }
});
test('invalid contact is rejected before external writes; inbox failure is not success',async()=>{
 const bad=routeFixture();assert.equal((await bad.submit('bad email')).status,400);assert.equal(bad.calls.length,0);
 const failed=routeFixture({webhookOk:false});assert.equal((await failed.submit('you@example.com')).status,502);assert.equal(failed.calls.length,1);
});
test('saved request remains successful if optional email transport fails',async()=>{
 const {calls,submit}=routeFixture({emailOk:false});assert.equal((await submit('you@example.com')).status,200);assert.equal(calls.length,2);
});
test('all independent hero keys survive V2 integration',()=>{
 const {SITE_HERO_KEYS}=load('src/lib/hostMedia.ts');
 for(const key of ['singhub-backyard-hero','singhub-radar-hero','singhub-neighborhoods-hero','singhub-san-diego-karaoke-hero','singhub-partner-offers-hero'])assert.ok(SITE_HERO_KEYS.includes(key),key);
});
