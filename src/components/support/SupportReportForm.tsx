"use client";

import {useEffect, useState, type FormEvent} from "react";
import {trackEvent} from "@/lib/analytics";

type Category = "sign_in" | "check_in_offer" | "listing" | "other";
const labels:Record<Category,string> = {
  sign_in: "Sign in, email link or code",
  check_in_offer: "Check-in, rewards or Partner Offer",
  listing: "Missing or incorrect venue / KJ info",
  other: "Something else",
};

export function SupportReportForm() {
  const [category,setCategory]=useState<Category>("sign_in");
  const [pagePath,setPagePath]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const topic=params.get("topic");
    const selectedCategory:Category=topic==="check-in"?"check_in_offer":topic==="listing"?"listing":topic==="other"?"other":"sign_in";
    const from=params.get("source")||"";
    const source=from.startsWith("/")&&!from.startsWith("//")?from:
      document.referrer.startsWith(window.location.origin)?new URL(document.referrer).pathname:"";
    queueMicrotask(()=>{
      setCategory(selectedCategory);
      setPagePath(source.slice(0,250));
    });
  },[]);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const form=event.currentTarget;
    const fd=new FormData(form);
    const details=String(fd.get("details")||"").trim();
    const contact=String(fd.get("email")||"").trim();
    if(details.length<15){setError("Tell us a little more about what happened (at least 15 characters).");return;}
    setError("");setSuccess("");setBusy(true);
    const payload={
      submissionType:"support_request",
      venueName:"SingHUB support",
      submitterName:String(fd.get("name")||"").trim().slice(0,120),
      submitterContact:contact,
      sourceLink:pagePath,
      companyWebsite:String(fd.get("company-website")||""),
      supportCategory:category,
      notes:[
        `Support category: ${labels[category]}`,
        `Affected page: ${pagePath||"Not supplied"}`,
        `What happened: ${details}`,
        `Expected result: ${String(fd.get("expected")||"Not supplied").trim().slice(0,500)}`,
      ].join("\n\n"),
    };
    try{
      const response=await fetch("/api/submit-listing",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const result=await response.json() as {error?:string};
      if(!response.ok)throw new Error(result.error||"Could not send your report.");
      setSuccess("Report received. Thanks for helping us catch this. If you supplied an email, we can follow up for more details.");
      trackEvent("support_report_submit",{category});
      form.reset();setPagePath("");
    }catch(e){setError(e instanceof Error?e.message:"Could not send your report. Email hello@singhub.app instead.");}
    finally{setBusy(false);}
  }
  const input="mt-2 w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-300 focus:outline-none";
  return <form onSubmit={submit} className="mt-9 rounded-3xl border border-white/15 bg-white/[0.04] p-5 sm:p-8" aria-label="Report a SingHUB problem">
    <div className="hidden" aria-hidden="true"><label>Company website<input type="text" name="company-website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="sm:col-span-2 text-sm font-bold text-slate-100">What needs help?
        <select value={category} onChange={e=>setCategory(e.target.value as Category)} className={input}>
          {Object.entries(labels).map(([value,label])=><option value={value} key={value}>{label}</option>)}
        </select>
      </label>
      <label className="sm:col-span-2 text-sm font-bold text-slate-100">Which page were you on? (optional)
        <input value={pagePath} onChange={e=>setPagePath(e.target.value.slice(0,250))} className={input} placeholder="/account" />
      </label>
      <label className="sm:col-span-2 text-sm font-bold text-slate-100">What happened? *
        <textarea required name="details" rows={5} maxLength={1200} className={input} placeholder="For example: I tapped my sign-in email, returned to SingHUB, and saw an expired link message." />
      </label>
      <label className="sm:col-span-2 text-sm font-bold text-slate-100">What were you trying to do? (optional)
        <textarea name="expected" rows={2} maxLength={500} className={input} />
      </label>
      <label className="text-sm font-bold text-slate-100">Name (optional)<input name="name" maxLength={120} className={input}/></label>
      <label className="text-sm font-bold text-slate-100">Email for a reply (optional)<input name="email" type="email" maxLength={160} className={input}/></label>
    </div>
    <p className="mt-4 text-xs leading-5 text-slate-400">Your report goes to the SingHUB review inbox. Please don&apos;t include sign-in codes, passwords, or payment details. You can report an issue without signing in.</p>
    {error&&<p role="alert" className="mt-4 rounded-xl border border-red-300/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}
    {success&&<p role="status" className="mt-4 rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-3 text-sm text-cyan-100">{success}</p>}
    <button type="submit" disabled={busy} className="mt-6 rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950 hover:bg-cyan-200 disabled:opacity-60">{busy?"Sending report...":"Send problem report"}</button>
  </form>;
}
