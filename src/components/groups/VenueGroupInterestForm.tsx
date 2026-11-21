"use client";

import {useState, type FormEvent} from "react";
import Link from "next/link";
import {trackEvent} from "@/lib/analytics";

export function VenueGroupInterestForm(){
  const [busy,setBusy]=useState(false);
  const [sent,setSent]=useState(false);
  const [error,setError]=useState("");
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    setBusy(true);setError("");
    const data=new FormData(e.currentTarget);
    const get=(key:string)=>String(data.get(key)||"").trim();
    const payload={
      submissionType:"venue_group_optin",
      venueName:get("venueName"),
      submitterName:get("name"),
      submitterContact:get("email"),
      neighborhood:get("area"),
      groupCapacity:get("capacity"),
      spaceType:get("spaceType"),
      bookingUrl:get("bookingUrl"),
      phone:get("phone"),
      notes:get("notes"),
      contactConsent:data.has("consent"),
      sourceLink:"/group-venues",
      companyWebsite:get("companyWebsite"),
    };
    try{
      const res=await fetch("/api/submit-listing",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const body=await res.json() as {error?:string};
      if(!res.ok)throw new Error(body.error||"Could not save your interest.");
      trackEvent("venue_group_optin_submit",{space_type:payload.spaceType,group_capacity:payload.groupCapacity});
      setSent(true);
    }catch(err){setError(err instanceof Error?err.message:"Unable to submit. Please retry.");}
    finally{setBusy(false);}
  }

  if(sent)return <div className="rounded-3xl border border-cyan-300/35 bg-cyan-300/10 p-8" role="status">
    <h2 className="text-3xl font-black">You're on our radar.</h2>
    <p className="mt-3 leading-7 text-slate-200">We've received your venue's group-booking interest. We'll review the details and reach out before making any introductions. This is not a booking, contract or paid membership.</p>
    <Link href="/venues/premium" className="mt-5 inline-block font-bold text-cyan-300 underline">Explore additional SingHUB venue tools</Link>
  </div>;

  const input="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 p-4 text-white focus:border-cyan-300 focus:outline-none";
  return <form onSubmit={submit} className="rounded-3xl border border-white/15 bg-slate-900/80 p-6 md:p-8">
    <h2 className="text-2xl font-black">Tell us what your space can do.</h2>
    <p className="mt-2 text-slate-300">A few quick details help us determine whether to send you possible group event opportunities. Private karaoke rooms, bars, restaurants and event spaces are welcome.</p>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <label className="text-sm font-bold">Venue name *<input name="venueName" required maxLength={140} className={input}/></label>
      <label className="text-sm font-bold">Your name *<input name="name" required autoComplete="name" maxLength={100} className={input}/></label>
      <label className="text-sm font-bold">Email *<input name="email" required type="email" autoComplete="email" maxLength={200} className={input}/></label>
      <label className="text-sm font-bold">Phone (optional)<input name="phone" type="tel" maxLength={40} autoComplete="tel" className={input}/></label>
      <label className="text-sm font-bold">Neighborhood / service area *<input name="area" required maxLength={160} placeholder="Convoy / Kearny Mesa, Downtown..." className={input}/></label>
      <label className="text-sm font-bold">Largest group you could accommodate *<select name="capacity" required defaultValue="" className={input}>
        <option value="" disabled>Select an estimate</option><option value="2–10">2 to 10</option><option value="11–20">11 to 20</option><option value="21–50">21 to 50</option><option value="51–100">51 to 100</option><option value="100+">More than 100</option><option value="Varies">Varies by setup</option>
      </select></label>
      <label className="text-sm font-bold md:col-span-2">How do groups use your space? *<select name="spaceType" required defaultValue="" className={input}>
        <option value="" disabled>Select the best fit</option><option value="Private karaoke rooms">Private karaoke rooms</option><option value="Reserved tables / public karaoke">Reserved tables / public karaoke</option><option value="Private event / full buyout">Private event / full buyout</option><option value="Multiple options">More than one of the above</option>
      </select></label>
      <label className="text-sm font-bold md:col-span-2">Reservations website (optional)<input type="url" name="bookingUrl" maxLength={300} placeholder="https://" className={input}/></label>
      <label className="text-sm font-bold md:col-span-2">Anything we should know? (optional)<textarea name="notes" rows={3} maxLength={1200} placeholder="Room capacities, private-event minimums, food/drink options, preferred days, booking contact..." className={input}/></label>
    </div>
    <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden"><label>Company website<input name="companyWebsite" tabIndex={-1} autoComplete="off"/></label></div>
    <label className="mt-6 flex items-start gap-3 text-sm leading-6 text-slate-300"><input name="consent" required type="checkbox" className="mt-1 accent-cyan-300"/><span>I agree SingHUB may contact me about possible group events. We'll ask permission before sharing my contact details with an organizer. <Link href="/privacy" className="text-cyan-300 underline">Privacy policy</Link>.</span></label>
    <p className="mt-4 text-xs leading-6 text-slate-400">Registering interest is free and doesn't enroll you in the $59/month Partner plan. There are no guaranteed referrals. Any referral fees or commercial terms would be discussed and agreed separately before proceeding.</p>
    {error&&<p role="alert" className="mt-4 rounded-xl border border-red-300/40 bg-red-500/10 p-3 text-red-200">{error}</p>}
    <button type="submit" disabled={busy} className="mt-6 rounded-xl bg-cyan-300 px-7 py-4 font-black text-slate-950 disabled:opacity-60">{busy?"Submitting...":"Register group-booking interest"}</button>
  </form>;
}
