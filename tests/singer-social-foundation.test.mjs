import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const policy=readFileSync(new URL('../src/lib/engagement/eligibility.ts',import.meta.url),'utf8');
const migration=readFileSync(new URL('../docs/sql/singer-social-foundation.sql',import.meta.url),'utf8');
test('Crew gate requires three verified, distinct venue nights',()=>{
 assert.match(policy,/CREW_MIN_VERIFIED_NIGHTS=3/);
 assert.match(policy,/new Set\(/);
 assert.match(policy,/e\.venueId===venueId/);
 assert.match(policy,/kj_confirmed/);
});
test('unverified actions never silently grant Crew or referral rewards',()=>{
 assert.match(migration,/singer_crew_qualifications/);
 assert.match(migration,/unique\(user_id,venue_id,nightlife_date\)/);
 assert.match(migration,/check\(referrer_id <> referred_user_id\)/);
 assert.match(migration,/referred_user_id uuid not null unique/);
 assert.doesNotMatch(migration,/create trigger .*award/i);
});
test('privacy defaults: identity undiscoverable and plans private',()=>{
 assert.match(migration,/discoverable boolean not null default false/);
 assert.match(migration,/visibility text not null default 'private'/);
 assert.match(migration,/revoke all on public\.singer_public_identities from public, anon, authenticated/);
 assert.match(migration,/revoke all on public\.singer_venue_plans from public,anon,authenticated/);
});
