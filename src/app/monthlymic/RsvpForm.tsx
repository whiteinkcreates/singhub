"use client";
import { FormEvent, useState } from "react";

export default function RsvpForm(){
 const [state,setState]=useState<"idle"|"saving"|"saved"|"failed">("idle");
 const [error,setError]=useState("");
 const [choice,setChoice]=useState<"going"|"next">("going");
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setState("saving");setError("");
  const f=new FormData(e.currentTarget);
  const payload={name:f.get("name"),email:f.get("email"),status:choice==="going"?"going":"interested",partySize:choice==="going"?Number(f.get("partySize")):1,availability:choice==="going"?"nov18":"neither",futureUpdates:choice==="next"||f.has("futureUpdates"),justDuet:choice==="going"&&f.has("justDuet"),photoPermission:choice==="going"&&f.has("photoPermission"),website:f.get("website"),source:new URLSearchParams(window.location.search).get("src")||"direct"};
  try{const r=await fetch("/api/monthlymic/rsvp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to save RSVP");setState("saved");}
  catch(ex){setState("failed");setError(ex instanceof Error?ex.message:"Unable to save RSVP");}
 }
 if(state==="saved")return <div role="status" className="rounded-2xl bg-cyan-300 p-6 font-bold text-slate-950">Thanks! We saved your choice. If you signed up for future MonthlyMic announcements, we’ll use your email for those updates.</div>;
 return <form onSubmit={submit} className="space-y-4 rounded-3xl border border-cyan-300/30 bg-slate-900 p-5 sm:p-7">
  <h2 className="text-2xl font-black">Join MonthlyMic</h2>
  <fieldset className="grid gap-2"><legend className="mb-2 text-sm font-semibold">What works for you?</legend><label className="flex gap-2"><input type="radio" name="attendanceChoice" checked={choice==="going"} onChange={()=>setChoice("going")}/> I’m coming November 18</label><label className="flex gap-2"><input type="radio" name="attendanceChoice" checked={choice==="next"} onChange={()=>setChoice("next")}/> Can’t make it. Tell me about the next MonthlyMic</label></fieldset>
  <p className="text-sm text-slate-300">Wednesday, November 18 at The Mesa. Arrive 6:30–7 PM. Bryon joins around 7:30. Free to attend; no SingHUB account required.</p>
  <div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
  <label className="block text-sm font-semibold">Your name<input name="name" required minLength={2} maxLength={100} autoComplete="name" className="mt-1 w-full rounded-lg bg-white p-3 text-slate-950"/></label>
  <label className="block text-sm font-semibold">Email<input name="email" required type="email" maxLength={254} autoComplete="email" className="mt-1 w-full rounded-lg bg-white p-3 text-slate-950"/></label>
  
  {choice==="going"&&<label className="block text-sm font-semibold">Group size<select name="partySize" className="mt-1 w-full rounded-lg bg-white p-3 text-slate-950">{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
  }
  {choice==="going"&&<label className="flex gap-3 text-sm"><input type="checkbox" name="justDuet" className="accent-cyan-300"/> I'm interested in JustDuet, the optional random duet partner draw.</label>}
  {choice==="going"&&<label className="flex gap-3 text-sm"><input type="checkbox" name="futureUpdates"/> Email me about future MonthlyMic meetups (optional).</label>}
  {choice==="going"&&<label className="flex gap-3 text-sm"><input type="checkbox" name="photoPermission" className="accent-cyan-300"/> SingHUB may feature photographs/video showing me from this event on its website, homepage and social media. I can decline and still attend. I can request removal of future use by contacting SingHUB.</label>}
  <p className="text-xs text-slate-400">We'll use your email for your selected MonthlyMic purpose only. Future meetup emails require the opt-in above (or choosing next time). You can unsubscribe by replying to a message. Anyone attending can tell the photographer they prefer not to be recorded.</p>
  {state==="failed"&&<p role="alert" className="text-rose-300">{error}</p>}
  <button disabled={state==="saving"} type="submit" className="w-full rounded-xl bg-fuchsia-500 px-5 py-3 font-black text-white disabled:opacity-50">{state==="saving"?"Saving...":{choice==="going"?"RSVP for November 18":"Keep me posted"}}</button>
 </form>
}
