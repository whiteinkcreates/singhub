import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import {validBannerImageUrl} from '../scripts/check-public-data.mjs';

function rows(name) {
  const [header,...lines]=readFileSync(`public/data/${name}.tsv`,'utf8').trimEnd().split('\n');
  const keys=header.split('\t');
  return lines.map(line=>Object.fromEntries(line.split('\t').map((value,i)=>[keys[i],value])));
}
const venues=rows('venues');
const events=rows('events_by_night');
test('canonical media accepts existing local venue images and rejects missing or escaping paths',()=>{
  assert.equal(validBannerImageUrl('/images/venues/north-bar-taps.jpg'),true);
  assert.equal(validBannerImageUrl('/images/venues/missing-venue.jpg'),false);
  assert.equal(validBannerImageUrl('/images/../../package.json'),false);
  assert.equal(validBannerImageUrl('/images/venues/north-bar-taps.jpg?pretend=1'),false);
});
test('Pour House, Kimball and Brass Rail retain distinct canonical identities and schedules',()=>{
  for(const [slug,id,days] of [['the-pour-house-oceanside','venue-0136',['Monday','Tuesday']],['kimball-coastal-eatery','venue-0137',['Thursday']],['the-brass-rail','venue-0138',['Thursday','Saturday','Tuesday']]]) {
    assert.equal(venues.find(v=>v.slug===slug)?.id,id);
    const schedule=events.filter(e=>e.venue_slug===slug);
    assert.deepEqual(schedule.map(e=>e.karaoke_day).sort(),days.sort());
    assert.ok(schedule.every(e=>e.venue_id===id&&e.generated==='FALSE'));
  }
});
test('November verified monthly karaoke is not silently promoted to weekly',()=>{
 const brass=events.find(e=>e.event_id==='monthly-the-brass-rail-last-tuesday');
 const barley=events.find(e=>e.event_id==='monthly-barley-sword-escondido-second-thursday');
 const flicks=events.find(e=>e.event_id==='weekly-flicks-monday');
 const jimmy=events.find(e=>e.event_id==='weekly-jimmy-os-del-mar-thursday');
 assert.match(brass?.recurring||'',/last Tuesday monthly/i);
 assert.match(barley?.recurring||'',/2nd Thursday monthly/i);
 assert.equal(flicks?.start_time,'9:00 PM');
 assert.equal(flicks?.end_time,'TBD');
 assert.equal(jimmy?.start_time,'TBD');
 assert.equal(jimmy?.end_time,'TBD');
});

test('newer 710 verification survives canonical reconciliation and stale Winston host credit does not',()=>{
  const schedule=events.filter(e=>e.venue_slug==='710-beach-club');
  assert.deepEqual(schedule.map(e=>e.karaoke_day).sort(),['Friday','Sunday','Thursday','Tuesday']);
  assert.ok(schedule.every(e=>e.last_verified==='2026-10-07'));
  assert.equal(venues.find(v=>v.slug==='regal')?.city,'La Mesa');
  const friday=events.find(e=>e.event_id==='event-winstons-friday');
  assert.equal(friday.host_name,'TBD');
  assert.doesNotMatch(friday.event_notes,/with Corey Glasper/);
});
test('Ramona and Valley Center are included in the San Diego County public market',()=>{
  const exports={};
  const source=readFileSync('src/lib/sanDiegoMarket.ts','utf8');
  vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:()=>({isPublicVenue:()=>true})});
  for(const city of ['Ramona','Valley Center','Fallbrook','La Mesa']) assert.equal(exports.isSanDiegoRegionVenue({city}),true);
  assert.equal(exports.isSanDiegoRegionVenue({city:'Boston'}),false);
  // All public venues tagged to a local market must survive the app's geographic filter.
  const sdMarkets=new Set(['Downtown','Central San Diego','Coastal San Diego','East County','South Bay','North County']);
  const local=venues.filter(venue=>sdMarkets.has(venue.market));
  assert.ok(local.length>=100,'unexpectedly low public San Diego inventory; review intentional removals');
  for(const venue of local) assert.equal(exports.isSanDiegoRegionVenue({city:venue.city}),true,`${venue.id} ${venue.venue_name} (${venue.city}) is absent from San Diego discovery`);
});

test('JT Friday uses Corey-confirmed Will without changing the other nights',()=>{
 const schedule=events.filter(e=>e.venue_slug==='jts-tavern');
 assert.equal(schedule.length,7);
 const friday=schedule.find(e=>e.karaoke_day==='Friday');
 assert.equal(friday.host_name,'Will');
 assert.equal(friday.host_display_name,'Will');
 assert.equal(friday.last_verified,'2026-10-02');
 assert.equal(schedule.find(e=>e.karaoke_day==='Monday').host_name,'Brian The Lion');
 assert.equal(schedule.find(e=>e.karaoke_day==='Saturday').host_name,'Brandon');
 assert.equal(schedule.find(e=>e.karaoke_day==='Sunday').host_name,'Will');
});

test('expired September one-time events are archived and JT copy matches Friday host',()=>{
 assert.ok(!events.some(e=>['event-mcguffies-karaoke-2026-09-23','event-mcguffies-karaoke-2026-09-30'].includes(e.event_id)));
 const jt=venues.find(v=>v.slug==='jts-tavern');
 assert.match(jt.description,/Will hosts Friday/);
 assert.doesNotMatch(jt.description,/Friday through Sunday hosts are not yet confirmed/);
 assert.match(venues.find(v=>v.slug==='710-beach-club').food_highlights,/late menu/);
 assert.equal(venues.find(v=>v.slug==='the-north-bar-escondido').age_policy,'21+');
});

test('venue descriptions stay synchronized with November verified karaoke nights',()=>{
 const bySlug=(slug)=>venues.find(venue=>venue.slug===slug);
 assert.match(bySlug('flicks')?.description||'',/Monday karaoke starting at 9 PM/);
 assert.match(bySlug('jimmy-os-del-mar')?.description||'',/Tuesday and Thursday karaoke/);
 assert.match(bySlug('the-brass-rail')?.description||'',/Saturday daytime karaoke every week/);
 assert.match(bySlug('the-brass-rail')?.description||'',/last-Tuesday-of-month karaoke/);
 assert.match(bySlug('barley-sword-brewing-escondido')?.description||'',/second Thursday of each month/);
 for(const slug of ['flicks','jimmy-os-del-mar','the-brass-rail','barley-sword-brewing-escondido']){
  assert.match(bySlug(slug)?.source_3||'',/direct email|Operations email|GM direct email/);
 }
});
