"use client";
import {useState} from "react";
import type {SingHubOffer} from "@/lib/venueEnhancements";

const DAYS=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export function VenueOfferEditor({slug,partnerEnabled,offer,onChange}:{slug:string;partnerEnabled:boolean;offer:SingHubOffer;onChange:(offer:SingHubOffer)=>void}){
 const [generating,setGenerating]=useState(false);
 const [registerKey,setRegisterKey]=useState("");
 const [message,setMessage]=useState("");

 function patch(next:Partial<SingHubOffer>){onChange({...offer,...next});}
 function toggleDay(day:string){const days=offer.days||[];patch({days:days.includes(day)?days.filter(item=>item!==day):[...days,day]});}

 async function generateKey(){
  setGenerating(true);setMessage("");setRegisterKey("");
  try{
   const response=await fetch("/api/admin/venue-offers/register-key",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({venueSlug:slug})});
   const result=await response.json();if(!response.ok)throw new Error(result.error||"Register key could not be generated.");
   setRegisterKey(result.registerKey);setMessage("New register key generated. Save it now. Generating another key will replace it.");
  }catch(error){setMessage(error instanceof Error?error.message:"Register key could not be generated.");}
  finally{setGenerating(false);}
 }

 const input="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-400/20";
 const label="text-xs font-black uppercase tracking-[0.16em] text-slate-400";

 return <section className="md:col-span-2 rounded-2xl border border-fuchsia-300/25 bg-[linear-gradient(135deg,rgba(255,25,168,.07),rgba(0,200,255,.04))] p-4">
  <div className="flex flex-wrap items-center justify-between gap-4">
   <div><p className={label}>SingHUB Offer</p><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">A Partner-only deal unlocked when someone confirms a TourStop during karaoke. Example: $1 off drinks, happy hour pricing, or 10% off the tab.</p></div>
   <button type="button" onClick={()=>patch({enabled:!offer.enabled})} aria-pressed={offer.enabled} className={`relative h-8 w-14 shrink-0 rounded-full transition ${offer.enabled?"bg-fuchsia-400":"bg-slate-700"}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${offer.enabled?"left-7":"left-1"}`}/></button>
  </div>
  {!partnerEnabled&&offer.enabled?<p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-xs font-bold text-amber-100">Offer is configured, but it will not unlock publicly until Partner is on.</p>:null}
  <div className="mt-4 grid gap-4 md:grid-cols-2">
   <label className={label}>Offer headline<input className={input} value={offer.title} onChange={event=>patch({title:event.target.value})} placeholder="$1 off drinks during karaoke"/></label>
   <label className={label}>Guest detail<input className={input} value={offer.detail||""} onChange={event=>patch({detail:event.target.value})} placeholder="Show your unlocked SingHUB Offer at the register."/></label>
   <label className={`${label} md:col-span-2`}>Fine print<input className={input} value={offer.terms||""} onChange={event=>patch({terms:event.target.value})} placeholder="One per guest per karaoke night. Cannot be combined with other offers."/></label>
  </div>
  <div className="mt-4"><p className={label}>Valid nights <span className="normal-case tracking-normal text-slate-600">leave all blank for every karaoke night</span></p><div className="mt-3 flex flex-wrap gap-2">{DAYS.map(day=>{const active=offer.days?.includes(day);return <button key={day} type="button" onClick={()=>toggleDay(day)} className={`rounded-full border px-3 py-2 text-xs font-bold ${active?"border-cyan-300/55 bg-cyan-300/15 text-cyan-100":"border-white/10 text-slate-400"}`}>{active?"✓ ":""}{day.slice(0,3)}</button>;})}</div></div>
  <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
   <div className="flex flex-wrap items-center justify-between gap-3"><div><p className={label}>Venue register</p><p className="mt-1 text-xs leading-5 text-slate-500">Open <b className="text-slate-300">/register/{slug}</b> on a venue-managed phone, tablet or browser. The private key connects that device once.</p></div><button type="button" disabled={generating||!slug} onClick={()=>void generateKey()} className="rounded-full border border-cyan-300/30 px-4 py-2 text-xs font-black text-cyan-100 disabled:opacity-40">{generating?"Generating…":"Generate / rotate key"}</button></div>
   {registerKey?<div className="mt-4 grid gap-2"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-fuchsia-300">Copy this key now</span><code className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950 p-3 text-xs text-cyan-100">{registerKey}</code></div>:null}
   {message?<p className="mt-3 text-xs text-slate-300">{message}</p>:null}
  </div>
 </section>;
}
