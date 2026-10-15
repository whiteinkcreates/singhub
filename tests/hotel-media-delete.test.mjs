import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
const asset={publicId:'singhub/hotels/grande-colonial/photo',url:'https://res.cloudinary.com/demo/image/upload/v1/singhub/hotels/grande-colonial/photo.jpg'};
function load(file,require=()=>({})){const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require,URL,Request,Response,console});return exports;}
const {hotelAssetAssignments}=load('src/lib/hotelMediaUsage.ts');
function harness({profiles=[],readError=null,assets=[asset]}={}){
 const deleted=[];
 const route=load('src/app/api/admin/hotel-media/route.ts',name=>{
  if(name==='next/server')return {NextResponse:{json:(body,init)=>Response.json(body,init)}};
  if(name.endsWith('venueMediaCloudinary'))return {listVenueMedia:async()=>assets,deleteVenueMedia:async(...args)=>deleted.push(args)};
  if(name.endsWith('supabase/admin'))return {createAdminClient:()=>({from:()=>({select:async()=>({data:profiles,error:readError})})})};
  if(name.endsWith('hotelMediaUsage'))return {hotelAssetAssignments};
  if(name.endsWith('hotelProfiles.server'))return {CURATED_SECTION_FALLBACK:{}};
  if(name.endsWith('hotelPhotoCandidates.server'))return {licensedHotelPhotos:{},hotelDemoPhotos:{}};
  if(name.endsWith('hotelGuides'))return {hotelGuides:[],getHotelGuide:slug=>slug==='grande-colonial'?{}:null};
  if(name.endsWith('hotelProfiles'))return {GUEST_GUIDE_DEFAULTS_SLUG:'guest-guide-defaults'};
  throw new Error(name);
 });
 const request=(body={},origin='https://singhub.app')=>new Request('https://singhub.app/api/admin/hotel-media',{method:'DELETE',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify({slug:'grande-colonial',publicId:asset.publicId,...body})});
 return {route,deleted,request};
}
test('hotel upload deletion is scoped to a registered library and same-origin admin request',async()=>{
 const h=harness();assert.equal((await h.route.DELETE(h.request({},'https://other.example'))).status,403);
 assert.equal((await h.route.DELETE(h.request({slug:'unknown'}))).status,400);
 assert.equal((await h.route.DELETE(h.request({publicId:'another-library/photo'}))).status,404);
 assert.equal(h.deleted.length,0);
});
test('assigned staged/published heroes and shared lifestyle images cannot be deleted',async()=>{
 for(const media of [{heroImageUrl:asset.url},{publishedHero:{heroImageUrl:asset.url}},{walkableImageUrl:asset.url},{quickRideImageUrl:asset.url.replace('/upload/','/upload/c_crop,w_300/')},{standoutImageUrl:asset.url}]){
  const h=harness({profiles:[{slug:'another-hotel',media}]});
  assert.equal((await h.route.DELETE(h.request())).status,409);assert.equal(h.deleted.length,0);
 }
});
test('usage-read failure fails closed; unused upload deletion calls the hotels folder only',async()=>{
 const failed=harness({readError:{message:'offline'}});assert.equal((await failed.route.DELETE(failed.request())).status,500);assert.equal(failed.deleted.length,0);
 const h=harness();const result=await h.route.DELETE(h.request());assert.equal(result.status,200);
 assert.equal(h.deleted[0][0],asset.publicId);assert.equal(h.deleted[0][1],'grande-colonial');assert.equal(h.deleted[0][2],'hotels');
});
