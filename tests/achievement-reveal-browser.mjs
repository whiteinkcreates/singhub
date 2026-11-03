import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";

const base=process.env.ACHIEVEMENT_QA_BASE_URL||"http://127.0.0.1:3117";
const out=".achievement-reveal-qa";
const server=process.env.ACHIEVEMENT_QA_BASE_URL?null:spawn(process.execPath,["node_modules/next/dist/bin/next","start","--port","3117"],{stdio:"ignore"});
let browser;
try{
 await mkdir(out,{recursive:true});
 for(let i=0;i<60;i++){
  try{if((await fetch(base+"/achievement-reveal-qa")).ok)break;}catch{}
  if(i===59)throw new Error("Achievement QA server not ready");
  await new Promise(resolve=>setTimeout(resolve,1000));
 }
 browser=await chromium.launch({args:["--no-sandbox"]});
 for(const width of [360,390,1440]){
  const page=await browser.newPage({viewport:{width,height:830}});
  const errors=[];page.on("pageerror",error=>errors.push(error.message));
  const result=await page.goto(base+"/achievement-reveal-qa",{waitUntil:"networkidle"});
  assert.equal(result.status(),200,"demo route at "+width);
  const dialog=page.getByRole("dialog");
  await dialog.waitFor({state:"visible"});
  await dialog.getByRole("heading",{name:"ACHIEVEMENT UNLOCKED"}).waitFor();
  await dialog.getByText("First Gig",{exact:true}).waitFor({state:"visible"});
  await dialog.getByText("Level I",{exact:true}).waitFor({state:"visible"});
  await page.waitForTimeout(1500);
  await page.screenshot({path:out+"/first-gig-"+width+".png"});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,"no horizontal overflow at "+width);
  await dialog.getByRole("button",{name:"Close demo"}).click();
  await dialog.waitFor({state:"hidden"});
  const second=page.getByRole("button",{name:/Replay Building a Setlist, Level II/});
  await second.click();
  await dialog.getByRole("heading",{name:"LEVEL UP"}).waitFor();
  await dialog.getByText("Level II",{exact:true}).waitFor();
  await page.waitForTimeout(1200);
  await page.screenshot({path:out+"/level-up-"+width+".png"});
  await dialog.getByRole("button",{name:"Close demo"}).click();
  await dialog.waitFor({state:"hidden"});
  assert.deepEqual(errors,[],"no runtime JS errors at "+width);
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:830},reducedMotion:"reduce"});
 await page.goto(base+"/achievement-reveal-qa",{waitUntil:"networkidle"});
 await page.getByRole("dialog").getByRole("heading",{name:"ACHIEVEMENT UNLOCKED"}).waitFor();
 await page.screenshot({path:out+"/reduced-motion.png"});
 await page.close();
 console.log("First Gig and Level II presentation, replay, responsive layout and reduced-motion QA passed.");
}finally{await browser?.close();server?.kill();}
