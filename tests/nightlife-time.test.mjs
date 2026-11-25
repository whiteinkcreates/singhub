import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

const exports = {};
const source = readFileSync(new URL('../src/lib/nightlifeTime.ts', import.meta.url), 'utf8');
vm.runInNewContext(
  ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
  { exports, Intl, Date },
);
const { getSanDiegoNightlifeWeekday } = exports;

test('Friday hotel visits use Friday after the San Diego 4 a.m. rollover', () => {
  assert.equal(getSanDiegoNightlifeWeekday(new Date('2026-10-02T10:59:59Z')), 'Thursday');
  assert.equal(getSanDiegoNightlifeWeekday(new Date('2026-10-02T11:00:00Z')), 'Friday');
  assert.equal(getSanDiegoNightlifeWeekday(new Date('2026-10-02T18:53:34Z')), 'Friday');
});

test('after-midnight guests keep Friday until Saturday at 4 a.m.', () => {
  assert.equal(getSanDiegoNightlifeWeekday(new Date('2026-10-03T07:00:00Z')), 'Friday');
  assert.equal(getSanDiegoNightlifeWeekday(new Date('2026-10-03T10:59:59Z')), 'Friday');
  assert.equal(getSanDiegoNightlifeWeekday(new Date('2026-10-03T11:00:00Z')), 'Saturday');
});

test('rollover follows San Diego through both daylight-saving transitions', () => {
  for (const [before, after, previous, current] of [
    ['2026-03-08T10:59:59Z', '2026-03-08T11:00:00Z', 'Saturday', 'Sunday'],
    ['2026-11-01T11:59:59Z', '2026-11-01T12:00:00Z', 'Saturday', 'Sunday'],
    ['2026-10-05T10:59:59Z', '2026-10-05T11:00:00Z', 'Sunday', 'Monday'],
  ]) {
    assert.equal(getSanDiegoNightlifeWeekday(new Date(before)), previous);
    assert.equal(getSanDiegoNightlifeWeekday(new Date(after)), current);
  }
});

const occurrenceExports = {};
const occurrenceSource = readFileSync(new URL('../src/lib/eventOccurrence.ts', import.meta.url), 'utf8');
vm.runInNewContext(
 ts.transpileModule(occurrenceSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
 { exports: occurrenceExports, Intl, Date },
);
const { eventRunsOnNight, getVenueNightCancellation, effectiveEventForNight, getEventOverride } = occurrenceExports;

test('Grand Comedy Wednesday is cancelled only for November 25, 2026', () => {
 const event = {
  eventId:'weekly-grand-comedy-club-wednesday',
  venueSlug:'grand-comedy-club',
  karaokeDay:'Wednesday',
  recurring:true,
  recurrencePattern:'TRUE',
  dateOverrides:[{
    eventId:'weekly-grand-comedy-club-wednesday',
    venueSlug:'grand-comedy-club',
    nightlifeDate:'2026-11-25',
    status:'canceled'
  }],
 };
 const cancelledNight=new Date('2026-11-26T01:00:00Z');
 const rollover=new Date('2026-11-26T10:59:00Z');
 const nextWednesday=new Date('2026-12-03T01:00:00Z');
 assert.equal(eventRunsOnNight(event,'Wednesday',cancelledNight),false);
 assert.equal(eventRunsOnNight(event,'Wednesday',rollover),false);
 assert.equal(getVenueNightCancellation([event],cancelledNight)?.nightlifeDate,'2026-11-25');
 assert.equal(eventRunsOnNight(event,'Wednesday',nextWednesday),true);
 assert.equal(getVenueNightCancellation([event],nextWednesday),undefined);
});

test('one-night Grand Comedy cancellation cannot suppress unrelated Wednesday karaoke', () => {
 const other={eventId:'weekly-somewhere-wednesday',venueSlug:'somewhere',karaokeDay:'Wednesday',recurring:true,recurrencePattern:'TRUE'};
 assert.equal(eventRunsOnNight(other,'Wednesday',new Date('2026-11-26T01:00:00Z')),true);
 const content=readFileSync(new URL('../src/lib/v2/presentation.ts', import.meta.url),'utf8');
 assert.match(content,/cancellation\?'Not happening tonight'/);
});

test('future-dated time and host changes only affect their selected night', () => {
 const base = {eventId:'weekly-test-friday',venueSlug:'test',karaokeDay:'Friday',startTime:'8:00 PM',
 endTime:'12:00 AM',hostName:'Original KJ',hostId:'original',recurring:true,recurrencePattern:'TRUE',
 dateOverrides:[
  {eventId:'weekly-test-friday',venueSlug:'test',nightlifeDate:'2026-11-27',status:'time_changed',startTime:'9:30 PM',endTime:'1:00 AM'},
  {eventId:'weekly-test-friday',venueSlug:'test',nightlifeDate:'2026-12-04',status:'host_changed',hostName:'Substitute KJ'}
 ]};
 const friday=new Date('2026-11-28T05:00:00Z');
 const nextFriday=new Date('2026-12-05T05:00:00Z');
 const thirdFriday=new Date('2026-12-12T05:00:00Z');
 assert.equal(eventRunsOnNight(base,'Friday',friday),true);
 assert.equal(effectiveEventForNight(base,friday).startTime,'9:30 PM');
 assert.equal(effectiveEventForNight(base,friday).endTime,'1:00 AM');
 assert.equal(effectiveEventForNight(base,friday).hostName,'Original KJ');
 assert.equal(effectiveEventForNight(base,nextFriday).hostName,'Substitute KJ');
 assert.equal(effectiveEventForNight(base,nextFriday).hostId,undefined);
 assert.equal(effectiveEventForNight(base,nextFriday).startTime,'8:00 PM');
 assert.equal(effectiveEventForNight(base,thirdFriday).hostName,'Original KJ');
 assert.equal(effectiveEventForNight(base,thirdFriday).startTime,'8:00 PM');
 assert.equal(base.startTime,'8:00 PM');
 assert.equal(base.hostName,'Original KJ');
 assert.equal(getEventOverride(base,thirdFriday),undefined);
});
