import assert from "node:assert/strict";
import {mkdir,writeFile} from "node:fs/promises";
if(process.argv.includes("--prepare")){
 if(process.env.CI!=="true")throw new Error("Calendar browser fixture is CI only");
 await mkdir("src/app/weekly-calendar-qa",{recursive:true});
 await writeFile("src/app/weekly-calendar-qa/page.tsx",String.raw`"use client";
import {VenueMonthlyCalendar} from "@/components/venue/VenueMonthlyCalendar";
import "@/components/v2/styles/basic.css";
const dateParts=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Los_Angeles",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
const m=Object.fromEntries(dateParts.map(p=>[p.type,p.value]));
const today=m.year+"-"+m.month+"-"+m.day;
const next=new Date(today+"T12:00:00Z");next.setUTCDate(next.getUTCDate()+2);
const soon=next.toISOString().slice(0,10);
const events=[
 {date:today,title:"Theme Karaoke",time:"8 PM",category:"karaoke" as const,detail:"KJ verified"},
 {date:soon,title:"Community Open Mic",time:"7 PM",category:"community" as const,detail:"Local SingHUB night"},
 {date:soon,title:"Live Band",time:"9 PM",category:"live_music" as const},
];
export default function CalendarQa(){
 return <main className="v2-basic" style={{minHeight:"100vh",padding:12,background:"#080d17"}}>
   <VenueMonthlyCalendar events={events} venueName="Demo Partner" sourceUrl="https://example.com/events"/>
 </main>;
}
`);
 process.exit(0);
}
const {chromium}=await import("playwright");
const browser=await chromium.launch({args:["--no-sandbox"]});
const base=process.env.QA_BASE_URL||"http://localhost:3100";
await mkdir(".calendar-qa",{recursive:true});
try{
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  const page=await context.newPage();const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto(base+"/weekly-calendar-qa",{waitUntil:"networkidle"});
  await page.getByRole("heading",{name:"This week"}).waitFor();
  assert.ok(await page.getByText("Theme Karaoke").count()>0);
  assert.equal(await page.getByRole("button",{name:"Open full month"}).count(),1);
  await page.screenshot({path:".calendar-qa/week-"+width+".png",fullPage:true});
  await page.getByRole("button",{name:"Open full month"}).click();
  await page.getByRole("heading",{name:"Full month lineup"}).waitFor();
  assert.ok(await page.locator(".calendar-grid .calendar-day").count()>=28);
  await page.getByRole("button",{name:"Show this week"}).click();
  await page.getByRole("button",{name:"Next week"}).click();
  assert.ok(await page.getByText("No events posted").count()>0);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),"No horizontal overflow");
  assert.deepEqual(errors,[],"No JS errors");
  await context.close();
  console.log("Partner weekly/month calendar passed at "+width+"px");
 }
}finally{await browser.close();}
