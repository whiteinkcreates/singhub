"use client";
import { FormEvent, useState } from "react";

export default function RsvpForm(){
 const [state,setState]=useState<"idle"|"saving"|"saved"|"failed">("idle");
 const [error,setError]=useState("");
 const [nextTime,setNextTime]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setState("saving");setError("");
  const f=new FormData(e.currentTarget);
  const payload={name:f.get("name"),email:f.get("email"),status:nextTime?"interested":"going",partySize:nextTime?1:Number(f.get("partySize")),availability:nextTime?"neither":"nov18",futureUpdates:nextTime||f.has("futureUpdates"),justDuet:!nextTime&&f.has("justDuet"),photoPermission:!nextTime&&f.has("photoPermission"),website:f.get("website"),source:new URLSearchParams(window.location.search).get("src")||"direct"};
  try{const r=await fetch("/api/monthlymic/rsvp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to save RSVP");setState("saved");}
  catch(ex){setState("failed");setError(ex instanceof Error?ex.message:"Unable to save RSVP");}
 }
 if(state==="saved")return <div role="status" className="rounded-2xl bg-cyan-300 p-6 font-bold text-slate-950">{nextTime?"You’re on the list for future MonthlyMic announcements! 🎤":"RSVP received for November 18! 🎤 Shirt purchases are separate through WhiteInk Creates."}</div>;
 return <form onSubmit={submit} className="space-y-4 rounded-3xl border border-cyan-300/30 bg-slate-900 p-5 sm:p-7">
  <h2 className="text-2xl font-black">MonthlyMic signup</h2>
  <fieldset className="grid gap-3"><legend className="mb-2 font-semibold">Choose one:</legend><label className="flex gap-2"><input type="radio" name="signupType" checked={!nextTime} onChange={()=>setNextTime(false)}/> I’m coming November 18</label><label className="flex gap-2"><input type="radio" name="signupType" checked={nextTime} onChange={()=>setNextTime(true)}/> Can’t make it? Notify me about future MonthlyMic meetups</label></fieldset>
  <p className="text-sm text-slate-300">Wednesday, November 18 at The Mesa. Arrive 6:30–7 PM. Free to attend; no SingHUB account required.</p>
  <div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
  <label className="block text-sm font-semibold">Your name<input name="name" required minLength={2} maxLength={100} autoComplete="name" className="mt-1 w-full rounded-lg bg-white p-3 text-slate-950"/></label>
  <label className="block text-sm font-semibold">Email<input name="email" required type="email" maxLength={254} autoComplete="email" className="mt-1 w-full rounded-lg bg-white p-3 text-slate-950"/></label>
  
  {!nextTime&&<label className="block text-sm font-semibold">Group size<select name="partySize" className="mt-1 w-full rounded-lg bg-white p-3 text-slate-950">{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}</select></label>}
  {!nextTime&&<label className="flex gap-3 text-sm"><input type="checkbox" name="futureUpdates"/> Also email me future MonthlyMic announcements (optional).</label>}
  {!nextTime&&<label className="flex gap-3 text-sm"><input type="checkbox" name="justDuet" className="accent-cyan-300"/> I&apos;m interested in JustDuet, the optional random duet partner draw.</label>}
  {!nextTime&&<label className="flex gap-3 text-sm"><input type="checkbox" name="photoPermission" className="accent-cyan-300"/> SingHUB may feature photographs/video showing me from this event on its website, homepage and social media. I can decline and still attend. I can request removal of future use by contacting SingHUB.</label>}
  <p className="text-xs text-slate-400">Your email will only be used for your RSVP and, if selected, future MonthlyMic announcements. Reply to any future announcement to opt out. Anyone attending can tell the photographer they prefer not to be recorded.</p>
  {state==="failed"&&<p role="alert" className="text-rose-300">{error}</p>}
  <button disabled={state==="saving"} type="submit" className="w-full rounded-xl bg-fuchsia-500 px-5 py-3 font-black text-white disabled:opacity-50">{state==="saving"?"Saving...":nextTime?"Keep me posted":"RSVP for November 18"}</button>
 </form>
}
