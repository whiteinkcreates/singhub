import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import ts from 'typescript';
function load(path){const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,URL,Error});return exports;}
const {hotelPackageDestination,packageReadiness}=load('src/lib/hotelPackage.ts');
const {hotelPlanReturnPath}=load('src/lib/hotelPlanReturn.ts');
test('all placement QR codes lead to one canonical hotel experience on production',()=>{
 const destinations=new Set();for(const edition of ['guest','concierge'])for(const format of ['elevator','desk-tent']){
 const url=new URL(hotelPackageDestination('holiday-inn-express-la-mesa',edition,format));assert.equal(url.origin,'https://singhub.app');assert.equal(url.pathname,'/hotelexperience/holiday-inn-express-la-mesa');assert.equal(url.searchParams.get('edition'),edition);assert.equal(url.searchParams.get('placement'),format);assert.equal(url.searchParams.get('utm_medium'),'qr');destinations.add(url.href);
 }assert.equal(destinations.size,4);
});
test('unreviewed media, stale approval and incomplete branding cannot unlock production',()=>{
 const profile={packageReview:{heroApproved:true,heroImageUrl:'https://example.com/hotel.jpg',rightsNote:'Hotel approved print use',brandApproved:true,brandLogoUrl:'https://example.com/logo.png',brandNote:'Hotel approved logo and palette'}};
 assert.equal(packageReadiness(profile.packageReview.heroImageUrl,profile.packageReview.brandLogoUrl,null).guest,false);
 assert.equal(packageReadiness('https://example.com/replacement.jpg',profile.packageReview.brandLogoUrl,profile).guest,false);
 assert.equal(packageReadiness(profile.packageReview.heroImageUrl,'https://example.com/new-logo.png',profile).concierge,false);
 assert.equal(packageReadiness(profile.packageReview.heroImageUrl,profile.packageReview.brandLogoUrl,profile).concierge,true);
 assert.equal(packageReadiness(undefined,undefined,profile,true).guest,false);
 assert.equal(packageReadiness('https://example.com/licensed.jpg',undefined,null,true).guest,true);
});
test('email callback preserves edition and merges plan parameters without a second question mark',()=>{
 const path=hotelPlanReturnPath('/hotelexperience/holiday-inn-express-la-mesa?edition=guest','jts-tavern',false);const url=new URL(path,'https://singhub.app');assert.equal(url.searchParams.get('edition'),'guest');assert.equal(url.searchParams.get('plan'),'jts-tavern');assert.equal(url.searchParams.get('saveHotel'),'0');assert.equal(path.split('?').length,2);assert.throws(()=>hotelPlanReturnPath('https://evil.example/path','jts-tavern',true));
});

test('sales sheet accepts its own placement and real screenshots match the selected property photo',()=>{
 const {packageFormat}=load('src/lib/hotelPackage.ts');assert.equal(packageFormat('sales-sheet'),'sales-sheet');
 const {hotelPackageScreenshot}=load('src/lib/hotelPackageScreenshots.ts');
 const hero='https://digital.ihg.com/is/image/ihg/holiday-inn-express-la-mesa-8924019411-4x3';
 assert.ok(hotelPackageScreenshot('holiday-inn-express-la-mesa',hero));
 assert.equal(hotelPackageScreenshot('holiday-inn-express-la-mesa','https://example.com/replacement.jpg'),null);
 assert.equal(hotelPackageScreenshot('unknown-hotel',hero),null);
});

test('URL intake resolves one registered property and stops ambiguous or unsafe inputs',()=>{
 const {resolveHotelPackageUrl}=load('src/lib/hotelPackageIntake.ts');const sources=[{slug:'hie',hotelSiteUrl:'https://www.ihg.com/holidayinnexpress/hotels/us/en/la-mesa/sanpd/hoteldetail'}];
 assert.equal(resolveHotelPackageUrl(sources[0].hotelSiteUrl+'/?utm_source=test',sources).slug,'hie');
 assert.equal(resolveHotelPackageUrl('https://www.ihg.com/',sources).status,'unmatched');
 assert.equal(resolveHotelPackageUrl('https://unknown.example/hotel',sources).status,'unmatched');
 assert.equal(resolveHotelPackageUrl('javascript:alert(1)',sources).status,'invalid');
 assert.equal(resolveHotelPackageUrl('https://user:pass@ihg.com/hotel',sources).status,'invalid');
 assert.equal(resolveHotelPackageUrl(sources[0].hotelSiteUrl,[...sources,...sources]).status,'unmatched');
});
