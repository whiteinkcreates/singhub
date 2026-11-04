import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source=readFileSync("src/lib/v2/achievementReveals.ts","utf8");
const exports={};
vm.runInNewContext(ts.transpileModule(source,{
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
}).outputText,{
 exports,require:name=>name==="./patchCatalog"?{PATCH_RULES:[
  {key:"first_gig",name:"First Gig",howToEarn:"Record your first karaoke performance in My SingHUB."},
  {key:"building_a_setlist",name:"Building a Setlist",howToEarn:"Record 10 performances for Level I; 20 for Level II."},
 ]}:null,
});
const {achievementDetails,achievementLevel,pendingAchievementEvents}=exports;
const event=(id,date,kind="unlocked",level=1)=>({
 id,badge_key:kind==="upgraded"?"building_a_setlist":"first_gig",
 badge_level:level,event_kind:kind,awarded_at:date,
});

test("old awards remain replayable but never auto-celebrate as just unlocked",()=>{
 const historical=event("kev-first","2026-10-13T19:30:58Z");
 const upgrade=event("kev-upgrade","2026-10-22T04:49:25Z","upgraded",2);
 const newlyEarned=event("next-gig","2026-11-05T12:00:00Z");
 const pending=pendingAchievementEvents([newlyEarned,upgrade,historical],new Set(),"2026-11-04T12:00:00Z");
 assert.deepEqual(Array.from(pending,item=>item.id),["next-gig"]);
});
test("acknowledgements prevent a repeat and same-session upgrades remain distinct",()=>{
 const first=event("event-1","2026-11-05T12:00:00Z");
 const second=event("event-2","2026-11-05T12:00:01Z","upgraded",2);
 const later=event("event-3","2026-11-05T12:00:02Z");
 const a=pendingAchievementEvents([later,first,second],new Set(["event-1"]),"2026-11-03T00:00:00Z");
 assert.deepEqual(Array.from(a,item=>item.id),["event-2","event-3"]);
 assert.equal(achievementDetails(second).isUpgrade,true);
 assert.match(achievementDetails(second).description,/20 performances recorded/);
 assert.equal(achievementDetails(second).level,"Level II");
});
test("bad baseline never triggers bogus first-login animation",()=>{
 const all=[event("old","2026-10-13T19:30:58Z")];
 assert.equal(pendingAchievementEvents(all,new Set(),null).length,0);
 assert.equal(pendingAchievementEvents(all,new Set(),"invalid").length,0);
});
test("catalog provides actual badge name and explanation",()=>{
 assert.equal(achievementDetails(event("x","2026-11-05T12:00:00Z")).name,"First Gig");
 assert.match(achievementDetails(event("x","2026-11-05T12:00:00Z")).description,/first karaoke performance/);
 assert.equal(achievementLevel(1),"Level I");
 assert.equal(achievementLevel(2),"Level II");
});
test("award presentation account privacy and staging constraints remain explicit",()=>{
 const component=readFileSync("src/components/v2/AchievementCelebrations.tsx","utf8");
 const sql=readFileSync("supabase/achievement-reveal-receipts.sql","utf8");
 const demo=readFileSync("src/app/achievement-reveal-qa/page.tsx","utf8");
 assert.match(component,/.eq\("user_id",uid\)/);
 assert.match(component,/event_id:active\.event\.id,user_id:userId/);
 assert.match(component,/active\.origin==="automatic"/);
 assert.match(component,/prefers-reduced-motion/);
 assert.match(component,/import\("gsap"\)/);
 assert.match(sql,/revoke all on public.singer_achievement_reveal_receipts from anon,authenticated/);
 assert.match(sql,/where e\.id = event_id and e\.user_id = user_id/);
 assert.match(sql,/alter table public.singer_achievement_reveal_receipts enable row level security/);
 assert.match(demo,/process\.env\.VERCEL_ENV==="production"/);
});
