import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';
const source=readFileSync(new URL('../src/lib/hotelPhotoCandidates.server.ts',import.meta.url),'utf8');
const exports={};
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:()=>({})});
const {applyHotelPhoto,hotelDemoPhotos,licensedHotelPhotos}=exports;
test('every pending photo is private by default, even if accidentally saved as media',()=>{
 for(const [slug,candidate] of Object.entries(hotelDemoPhotos)){
  const publicGuide=applyHotelPhoto({slug,name:slug,heroImageUrl:candidate.imageUrl});
  assert.notEqual(publicGuide.heroImageUrl,candidate.imageUrl);
  assert.notEqual(publicGuide.heroCredit?.status,'permission-pending');
  const demo=applyHotelPhoto({slug,name:slug},true);
  assert.equal(demo.heroImageUrl,candidate.imageUrl);
  assert.equal(demo.heroCredit.status,'permission-pending');
 }
});
test('licensed fallbacks supply the original attribution and license',()=>{
 for(const [slug,candidate] of Object.entries(licensedHotelPhotos)){
  const guide=applyHotelPhoto({slug,name:slug});
  assert.equal(guide.heroImageUrl,candidate.imageUrl);
  assert.equal(guide.heroCredit.status,'licensed');
  assert.ok(guide.heroCredit.licenseUrl.startsWith('https://creativecommons.org/'));
 }
});
test('saved production media wins and never inherits unrelated attribution',()=>{
 for(const slug of Object.keys(hotelDemoPhotos)){
  const guide=applyHotelPhoto({slug,name:slug,heroImageUrl:'https://example.com/approved.jpg'},true);
  assert.equal(guide.heroImageUrl,'https://example.com/approved.jpg');
  assert.equal(guide.heroCredit,undefined);
 }
});
