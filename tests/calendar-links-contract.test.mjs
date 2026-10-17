import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../src/lib/engagement/calendarLinks.ts',import.meta.url),'utf8');
const route=readFileSync(new URL('../src/app/api/my-planned-appearances/route.ts',import.meta.url),'utf8');
test('calendar links require exact published opening and closing times',()=>{
 assert.match(src,/return null;/);
 assert.match(src,/calendarClock\(input.startTime\)/);
 assert.match(src,/calendarClock\(input.endTime\)/);
 assert.match(src,/offset=end<=start\?1:0/);
 assert.match(src,/ctz:'America\/Los_Angeles'/);
});
test('plans API carries optional calendar link without changing account design',()=>{
 assert.match(route,/calendarUrl:karaokeCalendarUrl/);
 assert.doesNotMatch(route,/singer_crew_qualifications|singer_venue_checkins/);
});
