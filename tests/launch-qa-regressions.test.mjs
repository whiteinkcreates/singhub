import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import ts from 'typescript';

function module(path, require=name=>name.includes('eventOccurrence')?module('../src/lib/eventOccurrence.ts'):{getDistanceInMiles:()=>0}) {
 const source=readFileSync(new URL(path,import.meta.url),'utf8');
 const exports={};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require,URL,Date,Response});
 return exports;
}
const {safeNextPath}=module('../src/lib/authRedirect.ts');
test('email callbacks preserve hotel plans and reject external redirect tricks',()=>{
 const origin='https://singhub.app';
 assert.equal(safeNextPath('/hotel/pendry-san-diego?plan=happy-does&saveHotel=1',origin),'/hotel/pendry-san-diego?plan=happy-does&saveHotel=1');
 for(const input of [null,'https://other.example','//other.example','/\\\\other.example','/\n/other.example']) assert.equal(safeNextPath(input,origin),'/account');
});
const {makeVenueRow,filterRows,selectHotelStandouts}=module('../src/lib/v2/presentation.ts');
const venue={venueName:'Example',neighborhood:'Gaslamp',venueType:'live_bar',listingStatus:'verified',vibeTags:[]};
const event=day=>({karaokeDay:day,startTime:'9:00 PM'});
test('tonight includes scheduled bars and reservable rooms, excluding other nights',()=>{
 const today=makeVenueRow({...venue,slug:'today'},[event('Thursday')],'Thursday');
 const tomorrow=makeVenueRow({...venue,slug:'tomorrow'},[event('Friday')],'Thursday');
 const rooms=makeVenueRow({...venue,slug:'rooms',venueType:'private_room'},[],'Thursday');
 assert.equal(today.rhythm,'1 night');
 assert.deepEqual(Array.from(filterRows([today,tomorrow,rooms],'','','tonight'),r=>r.venue.slug),['today','rooms']);
 assert.deepEqual(Array.from(filterRows([today,tomorrow,rooms],'private rooms','','tonight'),r=>r.venue.slug),['rooms']);
});
test('standouts require a distinctive reason and include at most one private-room choice',()=>{
 const rows=[{slug:'ordinary',standoutReason:'Karaoke tonight',venueType:'live_bar'},{slug:'rooms1',standoutReason:'Private-room karaoke',venueType:'private_room'},{slug:'rooms2',standoutReason:'Private-room karaoke',venueType:'private_room'},{slug:'band',standoutReason:'Live-band karaoke',venueType:'live_bar'},{slug:'stage',standoutReason:'Full-stage karaoke',venueType:'live_bar'},{slug:'late',standoutReason:'Karaoke most nights',venueType:'live_bar'}];
 assert.deepEqual(Array.from(selectHotelStandouts(rows),r=>r.slug),['rooms1','band','stage']);
});

const {eventRunsOnNight,monthlyOrdinal,biweeklyAnchor}=module('../src/lib/eventOccurrence.ts');
test('monthly and anchored biweekly dates honor San Diego nightlife rollover',()=>{
 const monthly={...event('Friday'),recurring:false,recurrencePattern:'Monthly',eventNotes:'First-Friday monthly karaoke'};
 assert.equal(monthlyOrdinal(monthly),1);
 assert.equal(eventRunsOnNight(monthly,'Friday',new Date('2026-10-02T19:00:00Z')),true);
 assert.equal(eventRunsOnNight(monthly,'Friday',new Date('2026-10-09T19:00:00Z')),false);
 assert.equal(eventRunsOnNight(monthly,'Friday',new Date('2026-10-03T08:00:00Z')),true);
 const twice={...event('Thursday'),recurring:false,recurrencePattern:'Twice monthly'};
 assert.equal(eventRunsOnNight(twice,'Thursday',new Date('2026-10-01T19:00:00Z')),false);
 const biweekly={...event('Wednesday'),recurring:false,recurrencePattern:'Every other Wednesday beginning 2026-10-07',eventNotes:'Biweekly series anchored to 2026-10-07'};
 assert.equal(biweeklyAnchor(biweekly)?.toISOString().slice(0,10),'2026-10-07');
 assert.equal(eventRunsOnNight(biweekly,'Wednesday',new Date('2026-10-07T19:00:00Z')),true);
 assert.equal(eventRunsOnNight(biweekly,'Wednesday',new Date('2026-10-14T19:00:00Z')),false);
 assert.equal(eventRunsOnNight(biweekly,'Wednesday',new Date('2026-10-21T19:00:00Z')),true);
 assert.equal(eventRunsOnNight(biweekly,'Wednesday',new Date('2026-10-22T08:00:00Z')),true);
 const weekly={...event('Wednesday'),recurring:true,recurrencePattern:'TRUE',eventNotes:'Amy hosts 1st/3rd Wednesdays; Lindsey hosts 2nd/4th/5th.'};
 assert.equal(eventRunsOnNight(weekly,'Wednesday',new Date('2026-10-14T19:00:00Z')),true);
});
test('calendar exports monthly and anchored biweekly recurrence, omitting unanchored dates',async()=>{
 const events=[{...event('Tuesday'),eventId:'monthly',endTime:'1:00 AM',recurring:false,recurrencePattern:'3rd Tuesday monthly',eventNotes:'Every third Tuesday'}, {...event('Wednesday'),eventId:'biweekly',endTime:'11:00 PM',recurring:false,recurrencePattern:'Every other Wednesday beginning 2026-10-07',eventNotes:'Biweekly series anchored to 2026-10-07'}, {...event('Wednesday'),eventId:'unanchored',endTime:'12:00 AM',recurring:false,recurrencePattern:'Every other Wednesday'}];
 const api=module('../src/app/api/v2/calendar/route.ts',name=>name.includes('eventOccurrence')?module('../src/lib/eventOccurrence.ts'):name.includes('eventData')?{getKaraokeEventsByVenueSlug:async()=>events}:name.includes('venueData')?{getVenueListingBySlug:async()=>({...venue,slug:'example',address:'Address'})}:name.includes('publicVenueFilters')?{isPublicVenue:()=>true}:{});
 const response=await api.GET({nextUrl:new URL('https://singhub.app/api/v2/calendar?venue=example')});
 assert.equal(response.status,200);
 const calendar=await response.text();
 assert.match(calendar,/RRULE:FREQ=MONTHLY;BYDAY=3TU/);
 assert.match(calendar,/RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=WE/);
 assert.match(calendar,/DTEND;TZID=America\/Los_Angeles:\d{8}T010000/);
 assert.doesNotMatch(calendar,/unanchored/);
 assert.equal((calendar.match(/BEGIN:VEVENT/g)||[]).length,2);
});
