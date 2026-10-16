"use client";
import {useState, type FormEvent} from "react";

export function OtherActivityRequest({source,compact=false}:{source:"discover"|"backyard";compact?:boolean}) {
  const [expanded,setExpanded]=useState(false);
  const [pending,setPending]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form=event.currentTarget;
    const values=new FormData(form);
    const activity=String(values.get("activity")||"").trim();
    const area=String(values.get("area")||"").trim();
    const when=String(values.get("when")||"").trim();
    const contact=String(values.get("contact")||"").trim();
    if(activity.length<3||activity.length>180) {setError("Tell us what you're looking for (3–180 characters).");return;}
    if(area.length>100||when.length>70||contact.length>200) {setError("Please shorten the details.");return;}
    if(contact&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {setError("Enter a valid email or leave it blank.");return;}
    setPending(true);setError("");setSuccess("");
    try {
      const response=await fetch("/api/submit-listing",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          submissionType:"activity_search_request",
          venueName:"",
          sourceLink:source==="discover"?"/":"/backyard",
          notes:["What they're searching for: "+activity,"When: "+(when||"Flexible"),"Area: "+(area||"San Diego area"),"Please review category coverage and look for qualifying venues."].join("\n"),
          submitterContact:contact,
          companyWebsite:String(values.get("company-website")||""),
        })
      });
      const data=await response.json() as {error?:string};
      if(!response.ok)throw new Error(data.error||"We couldn't send your request.");
      setSuccess("Request received! We'll research it and expand the listings when we can."+(contact?" If we find a match, we may email you.":""));
      form.reset();
    } catch(err) {setError(err instanceof Error?err.message:"Please try again.");}
    finally {setPending(false);}
  }
  return <div className={compact?"other-activity-compact":"rounded-xl border border-cyan-300/25 bg-cyan-300/[.05] p-4 text-white"}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>{compact?<span className="other-activity-prompt">Missing an activity?</span>:<><strong className="text-base font-black">Something else in mind?</strong><p className="mt-1 text-sm text-slate-300">Bowling tonight? Cornhole this weekend? Tell us what we&apos;re missing.</p></>}</div>
      <button type="button" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)} className="rounded-lg border border-cyan-300 px-4 py-2 text-sm font-extrabold text-cyan-200">{expanded?"Close":compact?"Request an activity →":"Other →"}</button>
    </div>
    {expanded&&<form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="hidden" aria-hidden="true"><label>Website<input name="company-website" tabIndex={-1} autoComplete="off"/></label></div>
      <label className="text-xs font-bold text-slate-200 sm:col-span-2">What are you looking for?
        <input name="activity" required minLength={3} maxLength={180} placeholder="Bowling near me tonight" className="mt-1 block w-full rounded-lg border border-white/20 bg-slate-950 px-3 py-3 text-base text-white"/>
      </label>
      <label className="text-xs font-bold text-slate-200">When?
        <select name="when" defaultValue="Tonight" className="mt-1 block w-full rounded-lg border border-white/20 bg-slate-950 px-3 py-3 text-base text-white">
          <option>Tonight</option><option>This week</option><option>This weekend</option><option>Anytime</option>
        </select>
      </label>
      <label className="text-xs font-bold text-slate-200">Where?
        <input name="area" maxLength={100} placeholder="Neighborhood or city (optional)" className="mt-1 block w-full rounded-lg border border-white/20 bg-slate-950 px-3 py-3 text-base text-white"/>
      </label>
      <label className="text-xs font-bold text-slate-200 sm:col-span-2">Email for a personal follow-up (optional)
        <input name="contact" type="email" maxLength={200} placeholder="you@example.com" className="mt-1 block w-full rounded-lg border border-white/20 bg-slate-950 px-3 py-3 text-base text-white"/>
      </label>
      <p className="text-xs text-slate-400 sm:col-span-2">A real person reviews requests. This isn&apos;t an instant search. We&apos;ll use requests to improve what SingHUB covers.</p>
      <button disabled={pending} type="submit" className="rounded-lg bg-fuchsia-400 px-5 py-3 font-black text-black disabled:opacity-50 sm:col-span-2">{pending?"Sending…":"Send my request"}</button>
    </form>}
    {error&&<p className="mt-3 text-sm text-red-300" role="alert">{error}</p>}
    {success&&<p className="mt-3 text-sm text-cyan-200" role="status">{success}</p>}
  </div>;
}
