"use client";

import {useCallback, useEffect, useRef, useState, type FormEvent} from "react";
import {accountClient, saveHotelPlan, sendAccountLink} from "@/lib/v2/singerAccount";
import {hotelPlanReturnPath} from "@/lib/hotelPlanReturn";
import {createPortal} from "react-dom";
import {trackEvent} from "@/lib/analytics";

function errorMessage(cause: unknown, fallback: string) {
  return cause && typeof cause === "object" && "message" in cause && typeof cause.message === "string" ? cause.message : fallback;
}

type Venue = {slug: string; name: string};
type Options = {hotelSlug: string; hotelName: string; hotelShortName: string; returnPath: string; tonightVenues: Venue[]; weekVenues: Venue[]};

export function useHotelGuestPlan({hotelSlug,hotelName,hotelShortName,returnPath,tonightVenues,weekVenues}: Options) {
  const [mounted,setMounted]=useState(false);
  useEffect(()=>{queueMicrotask(()=>setMounted(true));},[]);
  const [planVenue,setPlanVenue]=useState<Venue|null>(null);
  const [savedPlans,setSavedPlans]=useState<string[]>([]);
  const [email,setEmail]=useState("");
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const resumed=useRef<string|null>(null);
  const report=useCallback((event: string,venue?: Venue)=>trackEvent(event,{hotel_slug:hotelSlug,hotel_route:returnPath,venue_slug:venue?.slug}),[hotelSlug,returnPath]);
  const markSaved=useCallback((slug:string)=>setSavedPlans(current=>current.includes(slug)?current:[...current,slug]),[]);
  const openPlan=(venue:Venue)=>{setPlanVenue(venue);setMessage("");setError(false);report("hotel_plan_open",venue);};

  useEffect(()=>{
    let active=true;
    async function restore() {
      const params=new URLSearchParams(location.search);
      const slug=params.get("plan");
      const venue=[...tonightVenues,...weekVenues].find(item=>item.slug===slug);
      if(params.has("authError")) {
        if(active){setPlanVenue(venue||null);setError(true);setMessage("Your sign-in link expired or could not be completed. Request a new link to finish saving.");}
        report("hotel_plan_auth_error",venue);
        return;
      }
      try {
        const client=accountClient();
        const {data,error:authError}=await client.auth.getUser();
        if(!active)return;
        if(authError||!data.user){
          if(slug){setPlanVenue(venue||null);setError(true);setMessage("Sign in to finish saving your karaoke pick.");}
          return;
        }
        setEmail(data.user.email||"");
        const result=await client.from("hotel_guest_plans").select("venue_slug").eq("user_id",data.user.id).eq("hotel_slug",hotelSlug);
        if(result.error)throw result.error;
        if(!active)return;
        setSavedPlans((result.data||[]).map(row=>row.venue_slug));
        if(!slug||resumed.current===slug)return;
        if(!venue)throw new Error("This karaoke pick is no longer available in the hotel guide. Choose another venue.");
        resumed.current=slug;
        setSaving(true);
        try {
          const saved=await saveHotelPlan({slug:hotelSlug,name:hotelName},venue,params.get("saveHotel")!=="0");
          if(!saved)throw new Error("Please sign in again to finish saving your plan.");
          if(!active)return;
          markSaved(venue.slug);setError(false);setMessage("Added to your plan. Find it in My SingHUB.");report("hotel_plan_saved",venue);
          const url=new URL(location.href);for(const key of ["plan","saveHotel","authError"])url.searchParams.delete(key);
          history.replaceState(history.state,"",url.pathname+url.search+url.hash);
        } catch(cause) {
          resumed.current=null;
          if(active)setPlanVenue(venue);
          throw cause;
        } finally {if(active)setSaving(false);}
      } catch(cause) {
        if(active){setError(true);setMessage(errorMessage(cause,"Your saved plan could not be loaded. Please try again."));report("hotel_plan_error",venue);}
      }
    }
    void restore();return()=>{active=false;};
  },[hotelSlug,hotelName,tonightVenues,weekVenues,markSaved,report]);

  useEffect(()=>{if(planVenue&&!dialog.current?.open)dialog.current?.showModal();else if(!planVenue)dialog.current?.close();},[planVenue,mounted]);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();if(!planVenue||saving)return;
    const saveHotel=new FormData(event.currentTarget).get("saveHotel")==="on";
    setSaving(true);setError(false);setMessage("");
    try {
      const saved=await saveHotelPlan({slug:hotelSlug,name:hotelName},planVenue,saveHotel);
      if(saved){markSaved(planVenue.slug);report("hotel_plan_saved",planVenue);setPlanVenue(null);setMessage("Added to your plan. Find it in My SingHUB.");}
      else {
        await sendAccountLink(email,hotelPlanReturnPath(returnPath,planVenue.slug,saveHotel));
        report("hotel_plan_email_requested",planVenue);
        setMessage("Check your email for a sign-in link. Open it to finish saving your plan.");
      }
    } catch(cause){setError(true);setMessage(errorMessage(cause,"Your plan was not saved. Please try again."));report("hotel_plan_error",planVenue);}
    finally{setSaving(false);}
  }

  const feedback=message?<p role={error?"alert":"status"} aria-live="polite" className="mt-3 text-sm leading-6">{message}</p>:null;
  const overlay=mounted?createPortal(<>
    {!planVenue&&feedback?<div className="mx-auto max-w-xl rounded-xl bg-white p-4 text-slate-900">{feedback}</div>:null}
    <dialog ref={dialog} aria-labelledby="hotel-plan-title" className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl border-0 bg-white p-6 text-slate-900 shadow-xl backdrop:bg-black/60" onCancel={()=>setPlanVenue(null)} onClick={event=>{if(event.target===event.currentTarget)setPlanVenue(null);}}>
      <button type="button" aria-label="Close plan" onClick={()=>setPlanVenue(null)} className="float-right rounded-lg px-3 py-2 text-xl">×</button>
      <h2 id="hotel-plan-title" className="pr-10 text-2xl font-bold">Add {planVenue?.name||"this venue"} to your plan</h2>
      <p className="mt-3 text-sm leading-6">Keep your karaoke picks together in My SingHUB.</p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <label className="block text-sm font-bold" htmlFor="hotel-plan-email">Email address</label>
        <input id="hotel-plan-email" type="email" value={email} onChange={event=>setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" className="w-full rounded-lg border border-slate-400 p-3" />
        <label className="flex items-start gap-3 text-sm leading-6"><input name="saveHotel" type="checkbox" defaultChecked className="mt-1 h-5 w-5 shrink-0" /><span>Save {hotelShortName} with this trip so your hotel guide is waiting in My SingHUB.</span></label>
        <button type="submit" style={{color:"white"}} disabled={saving} className="w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-60">{saving?"Saving…":"Save my plan"}</button>
        <p className="text-xs leading-5">First visit? We’ll email a sign-in link to finish saving. Already signed in? Your picks save instantly.</p>
        {feedback}
      </form>
    </dialog>
  </>,document.body):null;
  return {openPlan,savedPlans,overlay};
}
