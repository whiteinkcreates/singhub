"use client";
import {useState,type FormEvent} from "react";
import Link from "next/link";
import {trackEvent} from "@/lib/analytics";
export function KjInterestForm(){
 const [busy,setBusy]=useState(false),[sent,setSent]=useState(false),[error,setError]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setError("");setBusy(true);
  const form=e.currentTarget,data=new FormData(form);
  const get=(key:string)=>String(data.get(key)||"").trim();
  const payload={
   submissionType:"kj_booking_optin",submitterName:get("name"),submitterContact:get("email"),
   hostName:get("stageName"),neighborhood:get("area"),bookingRate:get("rate"),equipment:get("equipment"),
   bookingUrl:get("bookingUrl"),phone:get("phone"),notes:get("notes"),sourceLink:"/kj-bookings",
   contactConsent:data.has("consent"),companyWebsite:get("companyWebsite")
  };
  try{
   const res=await fetch("/api/submit-listing",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const body=await res.json() as {error?:string};
   if(!res.ok)throw new Error(body.error||"Could not submit interest.");
   setSent(true);trackEvent("kj_booking_optin_submit",{source:"kj_bookings"});
  }catch(err){setError(err instanceof Error?err.message:"Unable to send interest. Please retry.");}
  finally{setBusy(false);}
 }
 if(sent)return <div className="rounded-3xl border border-cyan-300/35 bg-cyan-300/10 p-8" role="status"><h2 className="text-3xl font-black">You're on our radar.</h2><p className="mt-3 leading-7 text-slate-200">Thanks for sharing your details. We'll review your interest and follow up if a suitable request comes in. This is not a booking or guarantee of work.</p><Link href="/hosts" className="mt-5 inline-block font-bold text-cyan-300 underline">Explore host profiles</Link></div>;
 const input="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 p-4 text-white focus:border-cyan-300 focus:outline-none";
 return <form onSubmit={submit} className="rounded-3xl border border-white/15 bg-slate-900/80 p-6 md:p-8">
  <h2 className="text-2xl font-black">Tell us what you bring to the show.</h2><p className="mt-2 text-slate-300">This is an opt-in interest form for possible group bookings, separate from your public KJ profile.</p>
  <div className="mt-5 grid gap-4 md:grid-cols-2">
   <label className="text-sm font-bold">Your name *<input required name="name" autoComplete="name" maxLength={100} className={input}/></label>
   <label className="text-sm font-bold">KJ / business name *<input required name="stageName" maxLength={120} className={input}/></label>
   <label className="text-sm font-bold">Email *<input required name="email" type="email" autoComplete="email" maxLength={200} className={input}/></label>
   <label className="text-sm font-bold">Phone (optional)<input name="phone" type="tel" maxLength={40} autoComplete="tel" className={input}/></label>
   <label className="text-sm font-bold">Service areas *<input required name="area" maxLength={160} placeholder="San Diego, North County, East County..." className={input}/></label>
   <label className="text-sm font-bold">Typical event rate or range *<input required name="rate" maxLength={100} placeholder="e.g., $300 for 3 hrs, varies by venue" className={input}/></label>
   <label className="text-sm font-bold md:col-span-2">What equipment can you provide? *<select name="equipment" required className={input}><option value="">Select your setup</option><option>Full karaoke, microphones, speakers and screen</option><option>Karaoke system and microphones, venue provides sound</option><option>Host only, venue provides equipment</option><option>Custom / depends on event</option></select></label>
   <label className="text-sm font-bold md:col-span-2">Booking page or website (optional)<input type="url" name="bookingUrl" maxLength={300} placeholder="https://" className={input}/></label>
   <label className="text-sm font-bold md:col-span-2">Anything else? (optional)<textarea name="notes" rows={3} maxLength={1200} placeholder="Insurance, travel fees, event specialties, minimum notice..." className={input}/></label>
  </div>
  <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden"><label>Company Website<input name="companyWebsite" tabIndex={-1} autoComplete="off"/></label></div>
  <label className="mt-6 flex items-start gap-3 text-sm leading-6 text-slate-300"><input type="checkbox" name="consent" required className="mt-1 accent-cyan-300"/><span>I agree that SingHUB can contact me about potential karaoke bookings. SingHUB will request permission before sending my contact details to a prospective organizer. <Link href="/privacy" className="text-cyan-300 underline">Privacy</Link>.</span></label>
  {error&&<p role="alert" className="mt-4 rounded-xl border border-red-300/40 bg-red-500/10 p-3 text-red-200">{error}</p>}
  <button disabled={busy} type="submit" className="mt-6 rounded-xl bg-cyan-300 px-7 py-4 font-black text-slate-950 disabled:opacity-60">{busy?"Sending...":"Join the booking interest list →"}</button>
 </form>;
}