"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {accountClient} from "@/lib/v2/singerAccount";
import {achievementDate,achievementDetails,pendingAchievementEvents,type AchievementEvent} from "@/lib/v2/achievementReveals";
import "./styles/achievementCelebrations.css";

type ActivePresentation={event:AchievementEvent;origin:"automatic"|"replay"|"demo"};

export function AchievementCelebrations({
 userId,alias,refreshKey,demoEvents,
}:{
 userId:string|null;
 alias?:string;
 refreshKey?:unknown;
 demoEvents?:AchievementEvent[];
}){
 const isDemo=Boolean(demoEvents);
 const [events,setEvents]=useState<AchievementEvent[]>([]);
 const [activatedAt,setActivatedAt]=useState<string|null>(null);
 const [acknowledged,setAcknowledged]=useState<Set<string>>(()=>new Set());
 const [active,setActive]=useState<ActivePresentation|null>(null);
 const [ready,setReady]=useState(false);
 const [notice,setNotice]=useState("");
 const [busy,setBusy]=useState(false);
 const [paused,setPaused]=useState(false);
 const dialogRef=useRef<HTMLDialogElement>(null);
 const stageRef=useRef<HTMLDivElement>(null);
 const pending=useMemo(()=>pendingAchievementEvents(events,acknowledged,activatedAt),[events,acknowledged,activatedAt]);

 // Read owner-scoped, server-issued events. A first visit records a baseline,
 // so old awards stay replayable but never masquerade as fresh unlocks.
 useEffect(()=>{
  let cancelled=false;
  if(isDemo){
   const examples=demoEvents||[];
   queueMicrotask(()=>{
    if(cancelled)return;
    setEvents(examples);setReady(true);setNotice("");
    if(examples[0])setActive({event:examples[0],origin:"demo"});
   });
   return()=>{cancelled=true;};
  }
  if(!userId){
   queueMicrotask(()=>{if(!cancelled){setEvents([]);setActivatedAt(null);setAcknowledged(new Set());setReady(false);setActive(null);}});
   return()=>{cancelled=true;};
  }
  async function load(){
   const uid=userId!;
   try{
    const client=accountClient();
    const eventResult=await client.from("singer_achievement_events")
     .select("id,badge_key,badge_level,event_kind,awarded_at")
     .eq("user_id",uid).order("awarded_at",{ascending:false});
    if(eventResult.error)throw eventResult.error;
    if(cancelled)return;
    const verified=(eventResult.data||[]).filter(item=>
     (item.event_kind==="unlocked"||item.event_kind==="upgraded")&&typeof item.id==="string"
    ) as AchievementEvent[];
    setEvents(verified);
    const baseline=client.from("singer_achievement_reveal_accounts");
    let started=await baseline.select("activated_at").eq("user_id",uid).maybeSingle();
    if(!started.error&&!started.data){
     const created=await client.from("singer_achievement_reveal_accounts")
      .insert({user_id:uid}).select("activated_at").single();
     if(created.error?.code==="23505"){
      started=await client.from("singer_achievement_reveal_accounts")
       .select("activated_at").eq("user_id",uid).maybeSingle();
     } else started=created;
    }
    if(cancelled)return;
    if(started.error||!started.data){
     // Migration may not be deployed yet. Replay still works, auto reveal is off.
     setActivatedAt(null);setAcknowledged(new Set());
     setNotice("Your award history is ready. Automatic celebrations are not enabled yet.");
    } else {
     const receipts=await client.from("singer_achievement_reveal_receipts")
      .select("event_id").eq("user_id",uid);
     if(cancelled)return;
     if(receipts.error){
      setActivatedAt(null);
      setNotice("Award history is ready, but new-award tracking is unavailable.");
     }else{
      setActivatedAt(started.data.activated_at);
      setAcknowledged(new Set((receipts.data||[]).map(row=>row.event_id)));
      setNotice("");
     }
    }
   }catch(error){
    if(!cancelled){
     setEvents([]);setActivatedAt(null);
     setNotice(error instanceof Error?error.message:"Achievement history could not load.");
    }
   }finally{if(!cancelled)setReady(true);}
  }
  void load();
  return()=>{cancelled=true;};
 },[userId,refreshKey,isDemo,demoEvents]);

 // One real, not-yet-acknowledged event at a time. Account refresh after
 // logging a song runs this check again; replays never change award state.
 useEffect(()=>{
  if(!userId||!ready||active||paused||pending.length===0||isDemo)return;
  queueMicrotask(()=>setActive(current=>current||{event:pending[0],origin:"automatic"}));
 },[userId,ready,active,paused,pending,isDemo]);

 useEffect(()=>{
  const dialog=dialogRef.current;
  if(!dialog||!active)return;
  if(!dialog.open)dialog.showModal();
  const stage=stageRef.current;
  let cancelled=false;
  let context:{revert:()=>void}|undefined;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(stage&&!reduced){
   void import("gsap").then(({gsap})=>{
    if(cancelled)return;
    context=gsap.context(()=>{
     gsap.timeline({defaults:{ease:"power3.out"}})
      .fromTo(".achievement-stage", {autoAlpha:0,scale:.94},{autoAlpha:1,scale:1,duration:.38})
      .fromTo(".achievement-spotlight",{autoAlpha:0,scaleY:.3},{autoAlpha:1,scaleY:1,duration:.58},"<")
      .fromTo(".achievement-medallion",{autoAlpha:0,scale:.4,rotation:-14},{autoAlpha:1,scale:1,rotation:0,duration:.88,ease:"back.out(1.9)"},"-=.24")
      .fromTo(".achievement-stage-heading",{autoAlpha:0,y:26},{autoAlpha:1,y:0,duration:.43},"-=.48")
      .fromTo(".achievement-stage-copy",{autoAlpha:0,y:20},{autoAlpha:1,y:0,duration:.38,stagger:.09},"-=.2")
      .fromTo(".achievement-stage-actions",{autoAlpha:0,y:18},{autoAlpha:1,y:0,duration:.32},"-=.08");
    },stage);
   }).catch(()=>{/* Keep content fully usable if animation fails to load. */});
  }
  return()=>{cancelled=true;context?.revert();if(dialog.open)dialog.close();};
 },[active]);

 async function finish(acknowledge:boolean){
  if(!active||busy)return;
  if(!acknowledge||active.origin!=="automatic"||!userId){
   if(active.origin==="automatic")setPaused(true);
   setActive(null);return;
  }
  setBusy(true);
  try{
   const {error}=await accountClient().from("singer_achievement_reveal_receipts")
    .insert({event_id:active.event.id,user_id:userId});
   if(error&&error.code!=="23505")throw error;
   setAcknowledged(previous=>new Set([...previous,active.event.id]));
   setNotice("");
  }catch{
   setNotice("We couldn't save that acknowledgement. You can replay this award from your history.");
   setPaused(true);
  }finally{
   setBusy(false);setActive(null);
  }
 }
 async function share(){
  if(!active||active.origin==="demo")return;
  const details=achievementDetails(active.event);
  const message=`I unlocked ${details.name} (${details.level}) on SingHUB! 🎤\n${details.description}\n\nFind your mic at singhub.app`;
  try{
   if(navigator.share)await navigator.share({title:"My SingHUB achievement",text:message,url:"https://singhub.app"});
   else if(navigator.clipboard){await navigator.clipboard.writeText(message);setNotice("Achievement caption copied. Ready to share.");}
   else setNotice("Sharing isn't supported in this browser.");
  }catch(error){
   if(!(error instanceof Error&&error.name==="AbortError"))setNotice("Sharing could not open. You can continue without sharing.");
  }
 }
 const selected=active?achievementDetails(active.event):null;
 return <>
  <section id="achievements" className="achievement-history" aria-label="Achievement history">
   <header className="achievement-history-head">
    <div><p className="achievement-eyebrow">BACKSTAGE AWARDS</p><h2>Your achievements</h2>
     <p>Every earned award has its own presentation. Replay any of them whenever you want.</p></div>
    <span className="achievement-history-total">{ready?events.length:"…"} award events</span>
   </header>
   {isDemo&&<p className="achievement-demo-note">DEMO ONLY. This award is fictional and does not change any singer account.</p>}
   {!userId&&!isDemo?<p className="achievement-history-empty">Sign in to see your real award history and presentations.</p>:null}
   {ready&&events.length===0?<p className="achievement-history-empty">Your award spotlight is waiting. Log performances and collect Tour Stops to earn your first patch.</p>:null}
   {events.length>0?<div className="achievement-history-grid">{events.map(event=>{
    const info=achievementDetails(event);
    const isNew=!isDemo&&pending.some(item=>item.id===event.id);
    return <button type="button" className="achievement-history-tile" key={event.id}
     onClick={()=>setActive({event,origin:isDemo?"demo":"replay"})} aria-label={`Replay ${info.name}, ${info.level}`}>
      <span className="achievement-history-symbol" aria-hidden="true">★</span>
      <span className="achievement-history-info"><strong>{info.name}</strong><small>{info.level} · {info.isUpgrade?"Level Up":"Unlocked"} · {achievementDate(event.awarded_at)}</small></span>
      {isNew?<span className="achievement-history-new">NEW</span>:<span className="achievement-history-play">REPLAY</span>}
     </button>;
   })}</div>:null}
   {notice?<p className="achievement-history-notice" role="status">{notice}</p>:null}
  </section>
  <dialog ref={dialogRef} className="achievement-theater" aria-labelledby="achievement-title"
   onCancel={event=>{event.preventDefault();void finish(false);}}
   onClick={event=>{if(event.target===event.currentTarget)void finish(false);}}>
   {active&&selected?<div className="achievement-stage" ref={stageRef}>
    <div className="achievement-spotlight" aria-hidden="true"/>
    <div className="achievement-stage-top">
     <img src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB"/>
     {active.origin==="demo"?<span className="achievement-demo-mark">DEMO</span>:null}
    </div>
    <p className="achievement-stage-eyebrow">{selected.isUpgrade?"YOUR NEXT LEVEL":"THE MIC IS YOURS"}</p>
    <h2 id="achievement-title" className="achievement-stage-heading">
     {selected.isUpgrade?"LEVEL UP":"ACHIEVEMENT UNLOCKED"}
    </h2>
    <div className="achievement-medallion" aria-hidden="true">
     <div className="achievement-medallion-center">
      <svg viewBox="0 0 90 100" width="96" height="108" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
       <rect x="29" y="7" width="32" height="51" rx="16" stroke="currentColor" strokeWidth="6"/>
       <path d="M18 41v4c0 17 12 29 27 29s27-12 27-29v-4M45 74v18M27 92h36" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
       <path d="M33 27h24M33 38h24" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      </svg>
     </div>
     <span className="achievement-medallion-label">{selected.level}</span>
    </div>
    <h3 className="achievement-stage-name achievement-stage-copy">{selected.name}</h3>
    <p className="achievement-stage-description achievement-stage-copy">{selected.description}</p>
    <p className="achievement-stage-person achievement-stage-copy">
     {alias?.trim()||"SingHUB singer"} · {achievementDate(active.event.awarded_at)}
    </p>
    <p className="achievement-stage-source achievement-stage-copy">Recorded activity may be singer-reported and is not independently verified.</p>
    <div className="achievement-stage-actions">
     {active.origin==="demo"?<button type="button" className="achievement-primary" onClick={()=>void finish(false)}>Close demo</button>:<>
      <button type="button" className="achievement-secondary" onClick={()=>void share()} disabled={busy}>Share award</button>
      <button type="button" className="achievement-primary" onClick={()=>void finish(active.origin==="automatic")} disabled={busy}>{busy?"Saving…":active.origin==="automatic"?"Continue":"Back to awards"}</button>
     </>}
    </div>
    {active.origin==="automatic"?<button className="achievement-stage-later" type="button" onClick={()=>void finish(false)} disabled={busy}>Not now</button>:null}
   </div>:null}
  </dialog>
 </>;
}
