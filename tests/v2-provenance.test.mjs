import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import postcss from 'postcss';
const fixtures='tests/fixtures/singhub-v2/';
const styles='src/components/v2/styles/';
const pages={discovery:'index',directory:'venues',hotel:'hotel',enhanced:'redwing',account:'singer',basic:'design-board'};
test('all approved assets remain byte-identical',async()=>{
 const hashes=JSON.parse(await readFile(fixtures+'assets.sha256.json','utf8'));
 assert.equal(Object.keys(hashes).length,16);
 for(const [name,hash] of Object.entries(hashes))assert.equal(createHash('sha256').update(await readFile('public/images/singhub-v2/'+name)).digest('hex'),hash,name);
});
for(const [template,page] of Object.entries(pages))test(template+' preserves recovered CSS declarations and breakpoints',async()=>{
 const html=await readFile(fixtures+page+'.html','utf8');
 const original=html.match(/<style>([\s\S]*?)<\/style>/)[1].replaceAll('assets/','/images/singhub-v2/');
 const recovered=await readFile(styles+'source-'+template+'.css','utf8');
 assert.equal(recovered,original,'source stylesheet differs from approved static HTML');
 const source=postcss.parse(original),ported=postcss.parse(await readFile(styles+template+'.css','utf8'));
 const declarations=root=>{const values=[];root.walkDecls(d=>values.push([d.prop,d.value,d.important]));return values};
 const expected=declarations(source),actual=declarations(ported);
 // Scoping adds a small reset before the literal source and explicit empty-media
 // and standalone-phone treatment afterward. Every original declaration stays ordered.
 const start=actual.findIndex((d,i)=>JSON.stringify(actual.slice(i,i+expected.length))===JSON.stringify(expected));
 assert.ok(start>=0,'an original CSS value was removed, reordered, or changed');
 const media=root=>{const values=[];root.walkAtRules('media',rule=>values.push(rule.params));return values};
 assert.deepEqual(media(ported),media(source),'approved breakpoints changed');
});
