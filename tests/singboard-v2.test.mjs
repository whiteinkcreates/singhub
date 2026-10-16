import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import vm from "node:vm";
import ts from "typescript";

function load(file,imports){
  const out={};
  vm.runInNewContext(
    ts.transpileModule(readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,
    {exports:out,require:id=>{if(!(id in imports))throw new Error("Unexpected test dependency: "+id);return imports[id];},
     URL,FormData,File:class{},Request,Headers,console,Date,Set,Map,Number,String,JSON,Math}
  );
  return out;
}
const categories=load("src/lib/singboard/categories.ts",{});

function postingFixture(poster){
  const written=[];
  const API=load("src/app/api/singboard/publish/route.ts",{
    "next/server":{NextResponse:{json:(body,opts)=>({body,status:opts?.status||200})}},
    "@/lib/venueData":{getVenueListings:async()=>[
      {id:"venue-123",slug:"real-room",venueName:"Real Room",neighborhood:"North Park"}]},
    "@/lib/hostData":{getActiveHosts:async()=>[
      {hostId:"host-123",slug:"kj-one",publicDisplayName:"KJ One"}]},
    "@/lib/singboard/categories":categories,
    "@/lib/singboard/cloudinary":{uploadSingBoardImage:async()=>{throw new Error("No upload in fixture");}},
    "@/lib/singboard/layout":{findSingBoardSlot:()=>({id:"A1"}),isSingBoardSlotOccupied:()=>false},
    "@/lib/singboard/repository":{
      getAuthorizedSingBoardPoster:async()=>poster,
      getActiveSingBoardFlyers:async()=>[],
      createSingBoardPost:async input=>{written.push(input);return "a80d5ed6-320e-4d8f-956f-3609bc5088f7";},
    },
  });
  function request(patch={}){
    const entries={accessCode:"private-contributor-code",postType:"note",
      category:"theme_karaoke",region:"central",eventDate:"2026-11-10",
      x:"29",y:"20",rotation:"-2",title:"Punk Rock Night",venueName:"Spoofed Venue",
      neighborhood:"Made Up",noteText:"Tonight we sing together!",noteColor:"yellow",
      ...patch};
    const form=new FormData();
    Object.entries(entries).forEach(([key,value])=>form.set(key,value));
    return {formData:async()=>form};
  }
  return {API,request,written};
}
test("approved venue posts use canonical identity, not spoofed venue fields",async()=>{
  const fx=postingFixture({id:"poster-1",poster_type:"venue",venue_id:"venue-123",host_id:null});
  const response=await fx.API.POST(fx.request());
  assert.equal(response.status,200);
  assert.equal(fx.written.length,1);
  assert.equal(fx.written[0].venueName,"Real Room");
  assert.equal(fx.written[0].venueSlug,"real-room");
  assert.equal(fx.written[0].neighborhood,"North Park");
  assert.equal(fx.written[0].category,"theme_karaoke");
  assert.equal(response.body.reviewStatus,"pending");
});
test("unlinked venue poster is blocked before writing",async()=>{
  const fx=postingFixture({id:"poster-2",poster_type:"venue",venue_id:null,host_id:null});
  const response=await fx.API.POST(fx.request());
  assert.equal(response.status,403);
  assert.equal(fx.written.length,0);
});
test("linked KJ post attaches to its host, but an unlinked legacy KJ remains board-only",async()=>{
  const linked=postingFixture({id:"poster-3",poster_type:"kj",venue_id:null,host_id:"host-123"});
  assert.equal((await linked.API.POST(linked.request())).status,200);
  assert.equal(linked.written[0].hostId,"host-123");
  assert.equal(linked.written[0].venueSlug,undefined);
  const legacy=postingFixture({id:"poster-4",poster_type:"kj",venue_id:null,host_id:null});
  assert.equal((await legacy.API.POST(legacy.request())).status,200);
  assert.equal(legacy.written[0].hostId,undefined);
});
test("wanted posts are hiring, while unsafe URLs and categories are rejected",async()=>{
  const fx=postingFixture({id:"poster-5",poster_type:"admin",venue_id:null,host_id:null});
  let response=await fx.API.POST(fx.request({postType:"wanted",category:"special_event"}));
  assert.equal(response.status,200);
  assert.equal(fx.written[0].category,"hiring");
  response=await fx.API.POST(fx.request({linkUrl:"javascript:alert(1)"}));
  assert.equal(response.status,400);
  response=await fx.API.POST(fx.request({category:"fake-category"}));
  assert.equal(response.status,400);
  assert.equal(fx.written.length,1);
});
test("inactive contributor cannot publish",async()=>{
  const fx=postingFixture(null);
  const response=await fx.API.POST(fx.request());
  assert.equal(response.status,403);
  assert.equal(fx.written.length,0);
});
test("moderation requires admin basic authorization and same-origin posting",async()=>{
  const calls=[];
  const api=load("src/app/api/admin/singboard-review/route.ts",{
    "next/server":{NextResponse:{json:(body,opts)=>({body,status:opts.status}),
      redirect:(url,status)=>({redirected:true,url:String(url),status})}},
    "@/lib/adminAccess":{isAdminAuthorizationHeaderValid:value=>value==="good-auth"},
    "@/lib/singboard/repository":{reviewSingBoardPost:async(id,action)=>{calls.push({id,action});}},
  });
  const url="https://singhub.app/api/admin/singboard-review";
  const request=(auth,origin,action="verify")=>{
    const form=new FormData();
    form.set("postId","a80d5ed6-320e-4d8f-956f-3609bc5088f7");
    form.set("action",action);
    return {url,headers:new Headers({"authorization":auth,"origin":origin}),formData:async()=>form};
  };
  assert.equal((await api.POST(request("bad-auth","https://singhub.app"))).status,401);
  assert.equal((await api.POST(request("good-auth","https://evil.example"))).status,403);
  assert.equal((await api.POST(request("good-auth","https://singhub.app","delete-all"))).status,400);
  assert.equal(calls.length,0);
  const accepted=await api.POST(request("good-auth","https://singhub.app","unpublish"));
  assert.equal(accepted.status,303);
  assert.equal(calls.length,1);
  assert.equal(calls[0].action,"unpublish");
});
