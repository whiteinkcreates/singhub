import assert from "node:assert/strict";
import {mkdir,writeFile} from "node:fs/promises";
if(process.argv.includes("--prepare")){
 if(process.env.CI!=="true")throw new Error("Map QA fixture only in CI");
 await mkdir("src/app/discover-map-qa",{recursive:true});
 await writeFile("src/app/discover-map-qa/page.tsx",String.raw`"use client";
import {VenueMap} from "@/components/map/VenueMap";
import {TourMap} from "@/components/v2/TourMap";
import type {VenueListing} from "@/types";
import "@/components/v2/styles/account.css";
const venues=[
 {id:"venue-qa-1",slug:"deanos-pub",venueName:"Demo Karaoke Bar",city:"La Mesa",neighborhood:"La Mesa",latitude:32.7754,longitude:-117.0327,listingStatus:"verified",venueType:"bar"},
 {id:"venue-qa-2",slug:"the-lamplighter",venueName:"Demo Karaoke Room",city:"San Diego",neighborhood:"Mission Hills",latitude:32.751,longitude:-117.181,listingStatus:"claimed",venueType:"private_room"}
] as unknown as VenueListing[];
export default function MapQa(){return <main style={{padding:12,background:"#090c19",minHeight:"100vh",color:"#fff"}}>
 <VenueMap venues={venues} title="Karaoke Demo QA"/>
 <div className="v2-account" style={{marginTop:30}}>
   <TourMap venues={venues as (VenueListing & {latitude:number;longitude:number})[]}/>
 </div>
</main>}
`);
 process.exit(0);
}
const {chromium}=await import("playwright");
const browser=await chromium.launch({args:["--no-sandbox"]});
const base=process.env.QA_BASE_URL||"http://localhost:3100";
const tilePng=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=","base64");
await mkdir(".discover-map-qa",{recursive:true});
try{
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  const page=await context.newPage();const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.route("https://tile.openstreetmap.org/**",route=>route.fulfill({status:200,contentType:"image/png",body:tilePng}));
  await page.goto(base+"/discover-map-qa",{waitUntil:"networkidle"});
  await page.locator(".sh-discover-map .leaflet-tile-loaded").first().waitFor();
  await page.locator(".tour-map .leaflet-tile-loaded").first().waitFor();
  assert.equal(await page.locator(".singhub-sh-marker").count(),2);
  assert.equal(await page.locator(".singhub-sh-marker img[src$='sh-venue-pin-transparent.png']").count(),2);
  const map=page.locator(".sh-discover-map");
  assert.equal(await map.getAttribute("data-map-theme"),"night");
  const night=await map.locator(".leaflet-tile-loaded").first().evaluate(el=>getComputedStyle(el).filter);
  assert.notEqual(night,"none","Discover night applies tile tint");
  await map.getByRole("button",{name:"Street",exact:true}).click();
  assert.equal(await map.getAttribute("data-map-theme"),"street");
  assert.equal(await map.locator(".leaflet-tile-loaded").first().evaluate(el=>getComputedStyle(el).filter),"none");
  await map.getByRole("button",{name:"Night",exact:true}).click();
  assert.equal(await page.locator(".tour-map").getAttribute("data-map-theme"),"night");
  await page.screenshot({path:".discover-map-qa/SH-night-maps-"+width+".png",fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),"No horizontal overflow");
  assert.deepEqual(errors,[],"No JS errors");
  await context.close();
  console.log("Discover and Tour Night maps, official SH pins and Street toggle passed at "+width+"px");
 }
}finally{await browser.close();}
