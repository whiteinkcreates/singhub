import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
const route=readFileSync(new URL('../src/app/api/venue-plans/route.ts',import.meta.url),'utf8');
const dates=readFileSync(new URL('../src/lib/engagement/chairDates.ts',import.meta.url),'utf8');
const ui=readFileSync(new URL('../src/components/v2/TipAChair.tsx',import.meta.url),'utf8');
test('plans require a verified identity, published karaoke and a future date',()=>{
 assert.match(route,/auth.getUser\(token\)/);
 assert.match(route,/karaokeRunsOnDate\(event,date\)/);
 assert.match(route,/validChairDate\(date,upcomingNightlifeDates\(\)\)/);
 assert.match(route,/origin!==new URL\(request.url\).origin/);
});
test('intent never turns into verified presence or performance',()=>{
 assert.match(route,/visibility:'private'/);
 assert.doesNotMatch(route,/singer_crew_qualifications|singer_performances|singer_venue_checkins/);
 assert.match(ui,/not confirmed attendance/);
});
test('plan can be cancelled and stays tied to verified user',()=>{
 assert.match(route,/intent==='none'/);
 assert.match(route,/\.eq\('user_id',auth.user.id\)/);
 assert.match(dates,/nightlifeDate\(now\)/);
});
