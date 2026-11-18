"use client";

import {useState,type FormEvent} from "react";

type IdentityMode = "anonymous" | "named";

export default function MonthlyMicFeedback() {
  const [mode,setMode]=useState<IdentityMode>("anonymous");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [success,setSuccess]=useState(false);

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(busy)return;
    const form=event.currentTarget;
    const data=new FormData(form);
    setBusy(true);
    setSuccess(false);
    setMessage("");
    const body={
      anonymous:mode==="anonymous",
      name:mode==="named"?String(data.get("name")||""):"",
      email:mode==="named"?String(data.get("email")||""):"",
      rating:data.get("rating")?Number(data.get("rating")):null,
      message:String(data.get("message")||""),
      website:String(data.get("website")||"")
    };
    try{
      const response=await fetch("/api/monthlymic/feedback",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify(body),cache:"no-store"
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"Your note could not be sent. Please try again.");
      setSuccess(true);
      setMessage("Thanks for the note! Corey will see it privately.");
      form.reset();
      setMode("anonymous");
    }catch(error){
      setMessage(error instanceof Error?error.message:"Unable to send. Please try again.");
    }finally{setBusy(false);}
  }

  return <section id="monthlymic-feedback" aria-labelledby="monthlymic-feedback-title" className="mt-10 rounded-3xl border border-fuchsia-400/30 bg-[#151a2b] p-5 sm:p-8">
    <p className="text-xs font-black uppercase tracking-[.2em] text-fuchsia-300">A note to the SingHUB guy</p>
    <h2 id="monthlymic-feedback-title" className="mt-2 text-3xl font-black text-white">How'd MonthlyMic go?</h2>
    <p className="mt-3 text-sm leading-6 text-slate-200">The good, the awkward, a suggestion for next time, or somewhere we should go next. Tell Corey. This goes to a <strong>private inbox</strong>, not a public review page.</p>
    <form onSubmit={submit} className="mt-6 space-y-5">
      <fieldset>
        <legend className="mb-3 text-sm font-bold text-white">Who is this from?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-bold ${mode==="anonymous"?"border-cyan-300 bg-cyan-300/10 text-white":"border-white/20 text-slate-200"}`}>
            <input type="radio" name="identity" value="anonymous" checked={mode==="anonymous"} onChange={()=>setMode("anonymous")} className="h-4 w-4 accent-cyan-300"/>
            Anonymous
          </label>
          <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-bold ${mode==="named"?"border-cyan-300 bg-cyan-300/10 text-white":"border-white/20 text-slate-200"}`}>
            <input type="radio" name="identity" value="named" checked={mode==="named"} onChange={()=>setMode("named")} className="h-4 w-4 accent-cyan-300"/>
            Use my name
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-400">Anonymous notes have no name or email attached.</p>
      </fieldset>
      {mode==="named"&&<div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-bold text-white">Your name
          <input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Name" className="mt-2 w-full rounded-lg border border-white/20 bg-white p-3 text-base text-slate-950"/>
        </label>
        <label className="block text-sm font-bold text-white">Email <span className="font-normal text-slate-300">(optional, for a reply)</span>
          <input name="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" className="mt-2 w-full rounded-lg border border-white/20 bg-white p-3 text-base text-slate-950"/>
        </label>
      </div>}
      <label className="block text-sm font-bold text-white">How was it? <span className="font-normal text-slate-300">(optional)</span>
        <select name="rating" defaultValue="" className="mt-2 w-full rounded-lg border border-white/20 bg-white p-3 text-base text-slate-950">
          <option value="">Just leaving a message</option>
          <option value="5">★★★★★  Loved it</option>
          <option value="4">★★★★  Good time</option>
          <option value="3">★★★  It was okay</option>
          <option value="2">★★  Could be better</option>
          <option value="1">★  Not for me</option>
        </select>
      </label>
      <label className="block text-sm font-bold text-white">Your message
        <textarea name="message" required minLength={10} maxLength={2000} rows={5} placeholder="What worked? What could be better? Who should host the next MonthlyMic?" className="mt-2 w-full rounded-lg border border-white/20 bg-white p-3 text-base text-slate-950"/>
      </label>
      <input name="website" type="text" autoComplete="off" tabIndex={-1} aria-hidden="true" className="absolute -left-[9999px] h-px w-px" />
      <p className="text-xs leading-5 text-slate-400">No account required. Your note won't be published or added to a mailing list.</p>
      <button type="submit" disabled={busy} className="w-full rounded-xl bg-fuchsia-500 px-5 py-3 font-black text-white disabled:opacity-60">{busy?"Sending...":"Send Corey a note"}</button>
      <p role="status" aria-live="polite" className={`text-sm ${success?"text-cyan-300":"text-amber-200"}`}>{message}</p>
    </form>
  </section>;
}
