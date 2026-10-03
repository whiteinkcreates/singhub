import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import ts from 'typescript';
function load({hostname='singhub.app',path='/hotel/holiday-inn-express-la-mesa',internal=false}={}) {
 const exports={};const window={location:{hostname,pathname:path,href:'https://'+hostname+path+'?utm_medium=qr&utm_campaign=hie&plan=jts-tavern&email=private%40example.com&code=secret'},localStorage:{getItem:()=>internal?'1':null}};
 const document={referrer:'',querySelector:()=>({dataset:{hotelSlug:'holiday-inn-express-la-mesa'}})};
 const source=readFileSync('src/lib/analytics.ts','utf8');
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,window,document,URL,URLSearchParams,Date});return {exports,window};
}
test('first hotel event boots Google commands before external script readiness and preserves canonical context',()=>{
 const {exports,window}=load();exports.trackEvent('hotel_guide_view');exports.trackEvent('hotel_plan_saved',{venue_slug:'jts-tavern'});
 const commands=Array.from(window.dataLayer,item=>Array.from(item));assert.deepEqual(commands.map(c=>c[0]),['js','config','event','event']);
 assert.equal(Array.isArray(window.dataLayer[0]),false);
 assert.equal(commands[2][2].hotel_slug,'holiday-inn-express-la-mesa');assert.equal(commands[3][2].venue_slug,'jts-tavern');
 assert.match(commands[2][2].page_location,/utm_medium=qr/);assert.doesNotMatch(commands[2][2].page_location,/secret|private|plan=/);
});
test('preview, admin, internal and disabled traffic never initialize or queue analytics',()=>{
 for(const options of [{hostname:'preview.vercel.app'},{path:'/admin/hotels'},{internal:true}]){const {exports,window}=load(options);exports.trackEvent('hotel_plan_saved');assert.equal(window.dataLayer,undefined);}
 const {exports,window}=load();window['ga-disable-'+exports.GA_MEASUREMENT_ID]=true;exports.trackEvent('hotel_guide_view');assert.equal(window.dataLayer,undefined);
});
test('analytics URLs keep campaign attribution without auth, guest email or plan query values',()=>{
 const {exports}=load();assert.equal(exports.analyticsLocation('https://singhub.app/account?source=hotel-hie&code=secret&email=private%40example.com#access_token=secret'),'https://singhub.app/account?source=hotel-hie');
});
