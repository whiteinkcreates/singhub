import assert from 'node:assert/strict';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';
function load(file) {
 const exports={};
 const source=readFileSync(file,'utf8');
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,URL,Date,require:name=>name==='server-only'?{}:load(path.resolve(path.dirname(file),name+'.ts'))});
 return exports;
}
const exports=load(path.resolve('src/lib/hotelPhotoCandidates.server.ts'));
const {applyHotelPhoto,hotelDemoPhotos,licensedHotelPhotos}=exports;
test('every pending photo is private by default, even if accidentally saved as media',()=>{
 for(const [slug,candidate] of Object.entries(hotelDemoPhotos)){
  const publicGuide=applyHotelPhoto({slug,name:slug,heroImageUrl:candidate.imageUrl});
  assert.notEqual(publicGuide.heroImageUrl,candidate.imageUrl);
  assert.notEqual(publicGuide.heroCredit?.status,'permission-pending');
  assert.notEqual(publicGuide.heroCredit?.status,'illustrative');
  const demo=applyHotelPhoto({slug,name:slug},true);
  assert.equal(demo.heroImageUrl,candidate.imageUrl);
  assert.equal(demo.heroCredit.status,candidate.credit.status);
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

const {resolveHotelPhoto}=exports;
const {parseHotelMediaProfile}=load(path.resolve('src/lib/hotelProfiles.ts'));
const {retainPublishedHero}=load(path.resolve('src/lib/hotelHero.ts'));
const registered={slug:'grande-colonial',name:'Grande Colonial',heroImageUrl:'https://example.com/registry.jpg',heroAlt:'Registered exterior',heroPosition:'left',heroPlacement:{desktop:{x:20,y:30,zoom:1}}};
const review=url=>({heroImageUrl:url,heroApproved:true,rightsNote:'Approved by property contact for public display',brandApproved:false,brandLogoUrl:'',brandNote:'',reviewedAt:'2026-10-14'});
const profile=(url,approved=false)=>({heroImageUrl:url,heroAlt:'Replacement exterior',heroPosition:'right',imageSource:'Property contact',usageRights:'Permission recorded',...(approved?{packageReview:review(url)}:{})});
test('arbitrary unreviewed and stale approval URLs never publish, including registry URLs',()=>{
 for(const media of [null,profile('https://example.com/new.jpg'),{...profile('https://example.com/new.jpg'),packageReview:review('https://example.com/stale.jpg')}]) {
  assert.equal(resolveHotelPhoto(registered,media).heroImageUrl,undefined);
 }
});
test('empty override preserves approved registry image and its own crop and alt',()=>{
 for(const url of ['', '   ']) {
  const media={...profile(url),packageReview:review(registered.heroImageUrl)};
  const hotel=resolveHotelPhoto(registered,media);
  assert.equal(hotel.heroImageUrl,registered.heroImageUrl);
  assert.equal(hotel.heroAlt,registered.heroAlt);
  assert.equal(hotel.heroPosition,'left');
  assert.equal(hotel.heroPlacement,registered.heroPlacement);
 }
});
test('approved media wins as one asset; pending candidate needs exact approval',()=>{
 const media=profile('https://example.com/new.jpg',true);
 assert.equal(resolveHotelPhoto(registered,media).heroPosition,'right');
 assert.equal(resolveHotelPhoto(registered,media).heroImageUrl,media.heroImageUrl);
 const candidate=hotelDemoPhotos['orli-la-jolla'];
 assert.equal(resolveHotelPhoto({...registered,slug:'orli-la-jolla'},profile(candidate.imageUrl)).heroImageUrl,undefined);
 assert.equal(resolveHotelPhoto({...registered,slug:'orli-la-jolla'},profile(candidate.imageUrl,true)).heroImageUrl,candidate.imageUrl);
 assert.notEqual(resolveHotelPhoto({...registered,slug:'andaz-san-diego'},profile(hotelDemoPhotos['andaz-san-diego'].imageUrl,true)).heroImageUrl,hotelDemoPhotos['andaz-san-diego'].imageUrl);
});
test('replacement stays staged, preserves last approved asset through reload, and explicit approval promotes it',()=>{
 const old=profile('https://example.com/old.jpg',true);
 const staged=retainPublishedHero(profile('https://example.com/new.jpg'),old);
 const reloaded=parseHotelMediaProfile(JSON.parse(JSON.stringify(staged)));
 assert.equal(resolveHotelPhoto(registered,reloaded).heroImageUrl,old.heroImageUrl);
 assert.equal(resolveHotelPhoto(registered,reloaded,true).heroImageUrl,staged.heroImageUrl);
 const approved=retainPublishedHero({...reloaded,packageReview:review(staged.heroImageUrl)},reloaded);
 assert.equal(resolveHotelPhoto(registered,approved).heroImageUrl,staged.heroImageUrl);
 const crop=retainPublishedHero({...approved,heroPosition:'top'},approved);
 assert.equal(resolveHotelPhoto(registered,crop).heroPosition,'top');
 const revoked=retainPublishedHero({...crop,packageReview:{...crop.packageReview,heroApproved:false}},crop);
 assert.equal(resolveHotelPhoto(registered,revoked).heroImageUrl,undefined);
});
test('client snapshot cannot replace server-approved history and sections-only saves retain it',()=>{
 const old=profile('https://example.com/old.jpg',true);
 const forged=profile('https://example.com/forged.jpg',true);
 const staged=retainPublishedHero({...profile('https://example.com/new.jpg'),publishedHero:forged},old);
 assert.equal(staged.publishedHero.heroImageUrl,old.heroImageUrl);
 const sections=retainPublishedHero({...staged,walkableImageAlt:'Updated section'},staged);
 assert.equal(resolveHotelPhoto(registered,sections).heroImageUrl,old.heroImageUrl);
 assert.equal(retainPublishedHero({...profile('https://example.com/new.jpg'),publishedHero:forged},null).publishedHero,undefined);
});
test('licensed fallback resets unrelated crop, alt and credit; parser rejects stale approval',()=>{
 const hotel=resolveHotelPhoto({...registered,slug:'omni-san-diego'},profile('https://example.com/unreviewed.jpg'));
 assert.equal(hotel.heroImageUrl,licensedHotelPhotos['omni-san-diego'].imageUrl);
 assert.equal(hotel.heroPosition,undefined);
 assert.equal(hotel.heroPlacement,undefined);
 assert.equal(hotel.heroCredit.status,'licensed');
 assert.throws(()=>parseHotelMediaProfile({...profile('https://example.com/new.jpg'),packageReview:review('https://example.com/old.jpg')}));
 assert.ok(parseHotelMediaProfile({...profile(''),packageReview:review(registered.heroImageUrl)}));
});

test('staging a new photo also retains approved registered media when the old override was empty',()=>{
 const previous={...profile(''),packageReview:review(registered.heroImageUrl)};
 const staged=retainPublishedHero(profile('https://example.com/new.jpg'),previous,registered);
 assert.equal(resolveHotelPhoto(registered,staged).heroImageUrl,registered.heroImageUrl);
 assert.equal(resolveHotelPhoto(registered,staged).heroPosition,'left');
});
