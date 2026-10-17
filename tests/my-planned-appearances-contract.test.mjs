import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const route=readFileSync(new URL('../src/app/api/my-planned-appearances/route.ts',import.meta.url),'utf8');
test('My plans endpoint is authenticated and scoped only to the current user',()=>{
 assert.match(route,/db\.auth\.getUser\(token\)/);
 assert.match(route,/\.eq\('user_id',auth\.user\.id\)/);
 assert.match(route,/Cache-Control':'private, no-store/);
});
test('Only upcoming published karaoke is returned, not claimed attendance',()=>{
 assert.match(route,/karaokeRunsOnDate\(event,plan\.nightlife_date\)/);
 assert.match(route,/getPublicVenues\(await getVenueListings\(\)\)/);
 assert.match(route,/Planned appearances are not confirmed attendance/);
 assert.doesNotMatch(route,/singer_crew_qualifications|singer_venue_visits/);
});
