import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const basic=read('src/components/v2/BasicVenueTemplate.tsx');
const editorial=read('src/components/v2/EditorialVenueTemplate.tsx');
const quick=read('src/components/v2/VenueQuickActions.tsx');
const follow=read('src/components/v2/FollowVenue.tsx');
const chair=read('src/components/v2/TipAChair.tsx');
const quickCss=read('src/components/v2/styles/venueEngagement.css');
const chairCss=read('src/components/v2/tipChair.css');

test('all venue types expose the shared quick actions with Follow, Save, Share and Directions',()=>{
 for(const page of [basic,editorial]){
  assert.match(page,/<VenueQuickActions venueId=\{venue.id\}/);
  assert.doesNotMatch(page,/<FollowVenue /,'Follow should live inside the shared action rail');
 }
 for(const text of ['FollowVenue','Venue saved','Share sheet opened','Directions opened'])assert.ok(quick.includes(text),text);
 assert.match(quick,/role="group"/);
 assert.match(quickCss,/venue-follow-control/);
});

test('Tip a Chair remains an essential feature, not Enhanced-only',()=>{
 for(const page of [basic,editorial])assert.match(page,/events.length>0\?<TipAChair|events.length>0\?<div className="ve-planning-rail"><TipAChair/);
 assert.ok(basic.indexOf('<TipAChair')<basic.indexOf('<TourStopCheckIn'),'Chair should precede check-in in Basic');
 assert.ok(editorial.indexOf('ve-planning-rail')<editorial.indexOf('ve-content-grid'),'Chair should appear above the programming grid');
});

test('no separate follow card or oversized illustration reintroduced',()=>{
 assert.doesNotMatch(follow,/Keep this room on your radar/);
 assert.doesNotMatch(chair,/TippedBarstoolIcon|tip-chair-stool/);
 assert.doesNotMatch(chairCss,/min-height:\s*100px/);
 assert.doesNotMatch(basic,/secondary-actions/);
 assert.doesNotMatch(editorial,/className="ve-actions"/);
});

test('No default Not going choice and no false alerts/attendance claims',()=>{
 assert.doesNotMatch(chair,/'Not going'/);
 assert.match(chair,/current\?\.plan\?<button className="tip-chair-clear"/);
 assert.match(chair,/not confirmed attendance, a reservation or a check-in/);
 assert.match(follow,/No push or email alerts/);
});
