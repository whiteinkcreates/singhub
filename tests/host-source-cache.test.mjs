import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import {test} from 'node:test';

function parseTsv(text){const [head,...lines]=text.trimEnd().split(/\r?\n/);const keys=head.split('\t');return lines.map(line=>Object.fromEntries(keys.map((key,i)=>[key,line.split('\t')[i]||''])));}
function loader(){
 const exports={},env={};let calls=0,fail=false,book='canonical';const cache=new Map();const keys=[];
 const rows=parseTsv(fs.readFileSync('public/data/kj_profiles.tsv','utf8'));
 const live=rows.map(row=>({...row,bio:row.slug==='dj-loy'?'New approved live profile':row.bio}));
 const imports={
 'node:fs':fs,'node:path':path,
    'react':{cache:fn=>fn}, // Identity tests do not simulate the React request dispatcher.
 'next/cache':{unstable_cache:(fn,parts,options)=>{assert.equal(options.revalidate,parts[0]==='singhub-host-sheet-rows-v3'?3600:300);return async(...args)=>{const key=JSON.stringify([parts,args]);keys.push(key);if(cache.has(key))return cache.get(key);const value=await fn(...args);cache.set(key,value);return value;};}},
 '@/lib/hostMedia.server':{getHostMediaOverrides:async()=>new Map([['dj-loy',{portraitUrl:'/fixture-portrait.webp',heroUrl:'/fixture-hero.webp'}]])},
 '@/lib/hostMedia':{HOST_DIRECTORY_MEDIA_KEY:'directory'},
 '@/lib/eventData':{getKaraokeEventListings:async()=>[]},
 '@/lib/nightlifeTime':{getSanDiegoNightlifeWeekday:()=> 'Tuesday'},
 '@/lib/googleSheets':{getGoogleSheetRows:async(_book,_tab,range)=>{assert.equal(range,"A:AZ","include AF signup links and optional public profile fields");calls++;if(fail)throw new Error('429');return live;},GoogleSheetsConfigurationError:class extends Error{}},
 '@/lib/sourceOfTruth':{getSourceSheetId:()=>book,getSourceTab:()=> 'hosts'},
 '@/lib/tsv':{parseTsv},'@/lib/venueData':{getVenueListings:async()=>[]},
 };
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/hostData.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{exports,require:id=>imports[id],process:{env,cwd:process.cwd},console:{error(){}}});
 return {read:exports.getActiveHosts,forVenue:exports.getVenueHostLinks,env,calls:()=>calls,keys,book:value=>{book=value;},fail:value=>{fail=value;}};
}
test('live fields remain default, successful reads are cached, and media overrides survive',async()=>{
 const l=loader();for(let i=0;i<3;i++){const host=(await l.read()).find(h=>h.slug==='dj-loy');assert.equal(host.bio,'New approved live profile');assert.equal(host.profileImageUrl,'/fixture-portrait.webp');assert.equal(host.heroImageUrl,'/fixture-hero.webp');}
 assert.equal((await l.read()).find(h=>h.slug==='art-ruiz').signupLink,'https://www.karafun.com/068874/');
 assert.equal(l.calls(),1);l.book('different-workbook');await l.read();assert.equal(l.calls(),2);assert.notEqual(l.keys[0],l.keys.at(-1));
});
test('failure falls back without poisoning the successful-read cache',async()=>{
 const l=loader();l.fail(true);const fallback=(await l.read()).find(h=>h.slug==='dj-loy');assert.match(fallback.bio,/Dirk/);l.fail(false);assert.equal((await l.read()).find(h=>h.slug==='dj-loy').bio,'New approved live profile');assert.equal(l.calls(),2);
});
test('explicit offline override bypasses Sheets without removing canonical KJ corrections',async()=>{
 const l=loader();l.env.HOST_PROFILES_LIVE_SHEETS='false';const hosts=await l.read();assert.equal(l.calls(),0);assert.match(hosts.find(h=>h.slug==='will').bio,/Friday and Sunday/);assert.equal(hosts.some(h=>h.slug==='james'),false);
});

test('venue profile links include only hosts matching the verified venue event',async()=>{
 const l=loader();
 const matches=await l.forVenue([{hostId:'will',hostName:'Will'}]);
 assert.ok(matches.some(host=>host.hostId==='will'),'linked host is retained');
 assert.ok(!matches.some(host=>host.hostId==='art-ruiz'),'unrelated host is excluded');
 assert.ok(matches.every(host=>!('bio' in host)&&!('schedule' in host)),'venue pages receive minimal host projections');
});
test('a venue with no identified host does not load the host directory',async()=>{
 const l=loader();
 assert.equal((await l.forVenue([])).length,0);
 assert.equal(l.calls(),0);
});
