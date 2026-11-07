import {test} from 'node:test';
import assert from 'node:assert/strict';
import {staleVerifiedChanges,EVENT_FACT_FIELDS,VENUE_FACT_FIELDS} from '../scripts/canonical-recency.mjs';
const published={event_id:'cheers-wed',last_verified:'2026-11-05',start_time:'8:30 PM',host_id:'ed-katie'};
const check=(candidate,current=published)=>staleVerifiedChanges([current],[candidate],{idColumn:'event_id',fields:EVENT_FACT_FIELDS});
test('blocks the observed Cheers rollback and stale host reassignment',()=>{
 const [conflict]=check({...published,last_verified:'2026-11-02',start_time:'8:00 PM',host_id:'different'});
 assert.deepEqual(conflict.fields,['start_time','host_id']);assert.equal(conflict.publishedDate,'2026-11-05');
});
test('allows unchanged facts, formatting-only coordinates, new rows and current or newer verification',()=>{
 assert.deepEqual(check({...published,last_verified:'2026-11-02',event_notes:'Evidence wording updated'}),[]);
 for(const last_verified of ['2026-11-05','2026-11-06'])assert.deepEqual(check({...published,last_verified,start_time:'9:00 PM'}),[]);
 assert.deepEqual(check({...published,event_id:'new'}),[]);
 assert.deepEqual(staleVerifiedChanges([{id:'v',last_verified:'2026-11-05',latitude:'32.7754'}],[{id:'v',last_verified:'2026-11-02',latitude:'32.775400'}],{idColumn:'id',fields:VENUE_FACT_FIELDS}),[]);
});
test('missing or invalid candidate evidence cannot overwrite a dated correction; benign prose stays editable',()=>{
 for(const last_verified of ['',undefined,'2026-02-30','not a date'])assert.equal(check({...published,last_verified,start_time:'8 PM'}).length,1);
 assert.deepEqual(check({...published,last_verified:'',description:'new description'}),[]);
 assert.deepEqual(check({...published,start_time:'8 PM'},{...published,last_verified:''}),[]);
 assert.deepEqual(staleVerifiedChanges([published],[],{idColumn:'event_id',fields:EVENT_FACT_FIELDS}),[],'existing archival/removal guards retain responsibility');
});
