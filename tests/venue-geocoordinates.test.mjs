import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const lines=readFileSync(new URL('../public/data/venues.tsv',import.meta.url),'utf8').trimEnd().split('\n').map(line=>line.split('\t'));
const columns=lines.shift();
const column=(name)=>columns.indexOf(name);
const rows=new Map(lines.map(values=>[values[column('id')],values]));
const expected={
 'venue-0018':[32.7684834,-117.0480876],
 'venue-0015':[32.8264005,-117.1558622],
 'venue-0003':[32.779081,-117.018113],
 'venue-0065':[32.8264005,-117.1558622],
 'venue-0081':[32.7132501,-117.0167705],
 'venue-0071':[32.9551213,-117.0550697],
 'venue-0035':[32.768446,-117.044277],
 'venue-0139':[32.9167641,-117.1139229]
};
test('address-reviewed San Diego venue pins remain near their correct places',()=>{
 for(const [id,coords] of Object.entries(expected)){
  const row=rows.get(id);
  assert.ok(row,'missing venue '+id);
  const actual=[Number(row[column('latitude')]),Number(row[column('longitude')])];
  assert.ok(actual.every(Number.isFinite),'invalid coordinates for '+id);
  assert.ok(Math.abs(actual[0]-coords[0])<0.003&&Math.abs(actual[1]-coords[1])<0.003,id+' pin drifted from its address area');
 }
});
test('Co-located Carriage House and Jin Music Studios are kept together without inventing offsets',()=>{
 const pos=(id)=>rows.get(id).slice(column('latitude'),column('longitude')+1);
 assert.deepEqual(pos('venue-0015'),pos('venue-0065'));
});
