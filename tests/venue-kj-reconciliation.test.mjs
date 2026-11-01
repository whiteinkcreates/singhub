import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {test} from 'node:test';
import ts from 'typescript';

function parseTsv(content) {
  const [header,...lines]=content.split(/\r?\n/).filter(Boolean);
  const keys=header.split('\t');
  return lines.map(line=>Object.fromEntries(keys.map((key,i)=>[key,line.split('\t')[i]||''])));
}

async function loadHosts({sheet=false, explicitRodney=false,rodneyName}={}) {
  const rows=parseTsv(fs.readFileSync('public/data/kj_profiles.tsv','utf8'));
  const events=parseTsv(fs.readFileSync('public/data/events_by_night.tsv','utf8')).map(row=>({
    eventId:row.event_id,venueSlug:row.venue_slug,venueName:row.venue_name,
    karaokeDay:row.karaoke_day,startTime:row.start_time,endTime:row.end_time,
    hostId:row.host_id||undefined,hostName:row.host_name,
  }));
  if(explicitRodney)for(const event of events)if(event.venueSlug==='hearth-house'){
    event.hostId='rodney';
    if(rodneyName!==undefined)event.hostName=rodneyName;
  }
  const output={};
  const imports={
    'node:fs':fs,'node:path':path,
    'next/cache':{unstable_cache:fn=>fn},
    '@/lib/hostMedia.server':{getHostMediaOverrides:async()=>new Map()},
    '@/lib/hostMedia':{},
    '@/lib/eventData':{getKaraokeEventListings:async()=>events},
    '@/lib/nightlifeTime':{getSanDiegoNightlifeWeekday:()=> 'Tuesday'},
    '@/lib/googleSheets':{getGoogleSheetRows:async()=>sheet?rows:null,GoogleSheetsConfigurationError:class extends Error{}},
    '@/lib/sourceOfTruth':{getSourceSheetId:()=>'',getSourceTab:()=>''},
    '@/lib/tsv':{parseTsv},
    '@/lib/venueData':{getVenueListings:async()=>[]},
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/hostData.ts','utf8'),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true},
  }).outputText,{exports:output,require:id=>imports[id],process,console});
  return output.getActiveHosts({includeMedia:false});
}

for(const sheet of [false,true])test(`pending Rodney identity cannot attach Hearth House through ${sheet?'Sheets':'fallback'} loading`,async()=>{
  for(const options of [{},{explicitRodney:true},{explicitRodney:true,rodneyName:''},{explicitRodney:true,rodneyName:'TBD'}]){
    const hosts=await loadHosts({sheet,...options});
    const gigs=host=>Object.values(host.schedule).flat();
    const rodney=hosts.find(host=>host.hostId==='rodney');
    assert.ok(gigs(rodney).some(gig=>gig.venueId==='werewolf'));
    assert.ok(!gigs(rodney).some(gig=>gig.venueId==='hearth-house'));
    assert.ok(!hosts.some(host=>host.hostId==='james'));
    const company=gigs(hosts.find(host=>host.hostId==='all-mic-long'));
    for(const venue of ['gingers','tonys-martini-bar','kaminskis-sports-lounge'])assert.ok(company.some(gig=>gig.venueId===venue));
    for(const id of ['mikey-mic','devyn-conover'])assert.ok(!gigs(hosts.find(host=>host.hostId===id)).some(gig=>['gingers','tonys-martini-bar'].includes(gig.venueId)));
  }
});

test('sync retains sourced weekly events with unknown time without publishing unverified leads',()=>{
  const source=fs.readFileSync('scripts/sync-public-data.mjs','utf8');
  const body=source.slice(source.indexOf('function buildEvents('),source.indexOf('function eventDayKey('));
  const clean=value=>String(value??'').trim();
  const context={VERIFIED_STATUSES:new Set(['verified','verified_schedule']),clean,key:value=>clean(value).toLowerCase(),truthy:value=>/^(true|yes|1)$/i.test(clean(value)),isBooleanCell:value=>/^(true|false|yes|no|1|0)$/i.test(clean(value)),isTbd:value=>!clean(value)||/^(tbd|unknown)$/i.test(clean(value)),dayList:value=>value==='Wednesday'?['Wednesday']:[]};
  vm.createContext(context);vm.runInContext(body,context);
  const venue={id:'venue-0050',slug:'saddle-bar',venue_name:'Saddle Bar'};
  const base={event_id:'weekly-saddle-bar-wednesday',venue_id:venue.id,venue_slug:venue.slug,karaoke_day:'Wednesday',start_time:'TBD',end_time:'TBD',host_display_name:'TBD',recurring:'Weekly',active_status:'active',app_visible:'TRUE',review_status:'verified_official_current_schedule_needs_host_end_time',source_primary:'https://thesaddlebar.com/'};
  for(const [changes,count] of [[{},1],[{start_time:''},1],[{review_status:'verified_direct_user_confirmation'},1],[{review_status:'verified_direct_schedule'},1],[{review_status:'flyer_verified_current_schedule'},1],[{review_status:'verified_schedule'},1],[{review_status:'needs_review'},0],[{review_status:'unverified'},0],[{source_primary:''},0],[{app_visible:'FALSE'},0],[{active_status:'inactive'},0],[{recurring:'One-time: 2026-10-14'},0]]){
    const report=Object.fromEntries(['eventsInvalidAppVisibility','eventsSkippedAppHidden','eventsSkippedInactive','eventReferencesMissingVenues','eventSlugMismatches','eventsSkippedMissingDayOrStart','publicRowsWithTbd'].map(key=>[key,[]]));
    const events=context.buildEvents([{...base,...changes}],[venue],report);
    assert.equal(events.length,count);
    if(count){assert.equal(events[0].host_id,'');assert.equal(events[0].generated,'FALSE');assert.ok(['TBD',''].includes(events[0].start_time));}
  }
});
