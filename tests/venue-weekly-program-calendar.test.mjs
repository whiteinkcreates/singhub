import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source=readFileSync("src/lib/venueCalendarOccurrences.ts","utf8");
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const exports={};
const stubs={
  "@/lib/eventOccurrence":{
    eventRunsOnNight:(event,weekday)=>event.karaokeDay===weekday && event.recurring,
  },
  "@/lib/v2/presentation":{
    usable:value=>typeof value==="string"?value.trim():"",
    publicEventTimeLabel:event=>[event.startTime,event.endTime].filter(Boolean).join(" - ") || "Time pending",
  },
};
vm.runInNewContext(js,{exports,require:id=>{
  if(!(id in stubs))throw Error("unexpected import: "+id);
  return stubs[id];
}});
const {venueCalendarOccurrences}=exports;

const karaoke=[
  {eventId:"mon",karaokeDay:"Monday",startTime:"8 PM",endTime:"1 AM",hostName:"Ed & Katie",activeStatus:"active",recurring:true},
  {eventId:"wed",karaokeDay:"Wednesday",startTime:"8 PM",endTime:"1 AM",hostName:"Ed & Katie",activeStatus:"active",recurring:true},
];
const weekly=[
  {day:"Thursday",title:"Trivia with Estevan",time:"8:30 PM",detail:"Arrive around 8 PM",category:"trivia"},
  {day:"Sunday",title:"Customer Appreciation BBQ",time:"1 PM",detail:"With drink purchase",category:"community"},
];
const special=[
  {date:"2026-11-25",title:"Thanksgiving Buffet",time:"5 PM",category:"community"},
  {date:"2026-11-26",title:"Thanksgiving Buffet",time:"5 PM",category:"community"},
];
const list=(startDate,endDate,extras={})=>venueCalendarOccurrences({datedEvents:special,weeklyProgramming:weekly,karaokeEvents:karaoke,startDate,endDate,...extras});
const titles=items=>items.map(x=>x.date+" "+x.title);

test("a weekly venue calendar includes canonical karaoke and regular non-karaoke programming",()=>{
  const items=list("2026-11-01","2026-11-07");
  assert.deepEqual(JSON.parse(JSON.stringify(titles(items))),[
    "2026-11-01 Customer Appreciation BBQ",
    "2026-11-02 Karaoke with Ed & Katie",
    "2026-11-04 Karaoke with Ed & Katie",
    "2026-11-05 Trivia with Estevan",
  ]);
  assert.equal(items.find(x=>x.category==="karaoke").time,"8 PM - 1 AM");
});
test("dated specials appear alongside weekly programming in the month",()=>{
  const items=list("2026-11-22","2026-11-28");
  assert.equal(items.length,6);
  assert.equal(items.filter(x=>x.title==="Thanksgiving Buffet").length,2);
  assert.ok(items.some(x=>x.date==="2026-11-26"&&x.category==="trivia"));
});
test("specific dated program overrides recurring occurrence with the same title",()=>{
  const items=list("2026-11-01","2026-11-07",{
    datedEvents:[{date:"2026-11-05",title:"Trivia with Estevan",time:"9 PM",category:"trivia"}],
  });
  assert.equal(items.filter(x=>x.title==="Trivia with Estevan").length,1);
  assert.equal(items.find(x=>x.title==="Trivia with Estevan").time,"9 PM");
});
test("a date-specific karaoke cancellation overrides canonical karaoke on that date",()=>{
  const items=list("2026-11-01","2026-11-07",{
    datedEvents:[{date:"2026-11-02",title:"Karaoke canceled",category:"karaoke"}],
  });
  assert.equal(items.filter(x=>x.date==="2026-11-02").length,1);
  assert.ok(items.some(x=>x.title==="Karaoke canceled"));
});
test("unverified or inactive canonical karaoke never creates a calendar event",()=>{
  const items=list("2026-11-01","2026-11-07",{
    karaokeEvents:[{...karaoke[0],activeStatus:"inactive"},karaoke[1]],
  });
  assert.equal(items.filter(x=>x.category==="karaoke").length,1);
});
