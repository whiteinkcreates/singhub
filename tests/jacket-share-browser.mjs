import assert from "node:assert/strict";
import {mkdir,stat,writeFile} from "node:fs/promises";

if(process.argv.includes("--prepare")){
 if(process.env.CI!=="true")throw new Error("Jacket browser fixture can only be prepared in CI.");
 await mkdir("src/app/jacket-qa",{recursive:true});
 await writeFile("src/app/jacket-qa/page.tsx",String.raw`"use client";
import {useState} from "react";
import {MyJacket} from "@/components/v2/MyJacket";
import {JacketShareStudio} from "@/components/v2/JacketShareStudio";
import {PatchCase} from "@/components/v2/PatchCase";
import "@/components/v2/styles/account.css";
const awards=[
 {id:"a1",badge_key:"first_gig",badge_name:"First Gig",awarded_at:"2026-10-13T19:30:00Z",award_note:"Earned"},
 {id:"a2",badge_key:"mic_crawl",badge_name:"Mic Crawl",awarded_at:"2026-10-13T19:30:00Z",award_note:"Earned"},
];
export default function JacketQa(){
 const [ready,setReady]=useState(false);
 const [status,setStatus]=useState({busy:false,error:""});
 const patches=awards.map((a,i)=>({name:a.badge_name,className:"p"+(i+1)}));
 return <main className="v2-account" style={{maxWidth:700,margin:"auto",background:"#090d16",minHeight:"100vh",padding:12}}>
  <button onClick={()=>setReady(true)}>Load fixture account</button>
  <div className="jacket-thumb"><MyJacket skin="denim" patches={patches} performanceStars={43} onPatch={()=>{}}/></div>
  <p role="status" data-export-status>{status.busy?"Export in progress":status.error}</p>
  <section className="panel"><header className="patch-top"><strong>Patch Case</strong></header>
   <PatchCase awards={awards}/>
   <JacketShareStudio ready={ready} onStatusChange={setStatus} alias="MadHatter" awards={awards} patches={patches} skin="denim" performanceStars={43}/>
  </section>
 </main>;
}
`);
 process.exit(0);
}
const {chromium}=await import("playwright");
const browser=await chromium.launch({args:["--no-sandbox"]});
await mkdir(".jacket-qa",{recursive:true});
const base=process.env.QA_BASE_URL||"http://localhost:3100";
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},acceptDownloads:true});
  const page=await context.newPage();
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto(base+"/jacket-qa",{waitUntil:"networkidle"});
  assert.equal(await page.getByRole("button",{name:"Download jacket portrait"}).isEnabled(),false,"export gated before account loads");
  assert.equal(await page.locator(".jacket-thumb .performance-star").count(),18);
  assert.equal(await page.locator(".performance-star-overflow").innerText(),"+25");
  await page.getByRole("button",{name:"Load fixture account"}).click();
  assert.equal(await page.getByRole("button",{name:"Download jacket portrait"}).isEnabled(),true);
  assert.equal(await page.locator(".patch-catalog-item").count(),8);
  assert.equal(await page.locator(".patch-catalog-item.earned").count(),2);
  assert.equal(await page.locator(".patch-catalog-item.locked").count(),6);
  await page.getByRole("button",{name:/Building a Setlist/}).click();
  await page.getByText(/Record 10 performances/).first().waitFor();
  const sc=await page.locator(".patch-catalog-list").evaluate(el=>({max:el.scrollHeight,visible:el.clientHeight}));
  assert.ok(sc.max>sc.visible,"Patch case is scrollable");
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),"No mobile overflow");
  const [portrait]=await Promise.all([
   page.waitForEvent("download",{timeout:30000}),
   page.getByRole("button",{name:"Download jacket portrait"}).click(),
  ]);
  assert.match(portrait.suggestedFilename(),/singhub-madhatter-jacket-portrait\.png/);
  const pfile=".jacket-qa/portrait-"+width+".png";
  await portrait.saveAs(pfile);
  assert.ok((await stat(pfile)).size>20000,"Nonempty jacket portrait PNG");
  const [card]=await Promise.all([
   page.waitForEvent("download",{timeout:30000}),
   page.getByRole("button",{name:/Award card: First Gig/}).click(),
  ]);
  const cfile=".jacket-qa/first-gig-"+width+".png";
  await card.saveAs(cfile);
  assert.ok((await stat(cfile)).size>15000,"Nonempty earned award PNG");
  assert.deepEqual(errors,[],"No browser JavaScript failures");
  await page.route("**/images/singhub-v2/singhub-wordmark.png*",route=>route.abort());
  await page.evaluate(()=>{const logo=document.querySelector('[aria-hidden="true"] img');logo.src='/images/singhub-v2/singhub-wordmark.png?failure-test';});
  await page.getByRole("button",{name:"Download jacket portrait"}).click();
  await page.waitForFunction(()=>document.querySelector("[data-export-status]")?.textContent.includes("Export wasn't available"));
  assert.equal(await page.getByRole("button",{name:"Download jacket portrait"}).isEnabled(),true,"failed export can retry");
  await page.screenshot({path:".jacket-qa/case-"+width+".png",fullPage:true});
  await context.close();
  console.log("Jacket catalog, earned/locked states, portrait PNG and award card passed at "+width+"px");
 }
}finally{await browser.close();}
