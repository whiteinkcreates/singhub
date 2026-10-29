"use client";
import {useEffect,useState} from "react";
import {accountClient} from "@/lib/v2/singerAccount";

export type OfferUnlock = {
 title:string;detail?:string;terms?:string;code?:string;
 presentationMode?:"staff_code"|"one_time";
 presentationStartedAt?:string;presentedAt?:string;redeemedAt?:string;
};
type Props = {
 offer:OfferUnlock;venueSlug:string;venueName:string;
 onChange:(offer:OfferUnlock)=>void;
};
function ended(offer:OfferUnlock){
 if(offer.presentedAt||offer.redeemedAt)return true;
 if(!offer.presentationStartedAt)return false;
 const age=Date.now()-new Date(offer.presentationStartedAt).getTime();
 return age<0||age>60000;
}
export function VenueOfferPresentation({offer,venueSlug,venueName,onChange}:Props){
 const [phase,setPhase]=useState<"summary"|"warning"|"live">("summary");
 const [pending,setPending]=useState(false);
 const [message,setMessage]=useState("");
 const [now,setNow]=useState(()=>Date.now());
 useEffect(()=>{
  if(phase!=="live")return;
  const tick=window.setInterval(()=>setNow(Date.now()),1000);
  return ()=>window.clearInterval(tick);
 },[phase]);
 async function change(action:"open"|"close"){
  setPending(true);setMessage("");
  try{
   const {data,error}=await accountClient().auth.getSession();
   if(error)throw error;
   if(!data.session)throw new Error("Sign in again to present your offer.");
   const response=await fetch("/api/venue-offers/presentation",{
    method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+data.session.access_token},
    body:JSON.stringify({venueSlug,action})
   });
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||"Could not update your offer.");
   onChange(result.offer);
   if(action==="open"){setNow(Date.now());setPhase("live");}
   else {setPhase("summary");setMessage("Offer marked Presented. It can no longer be opened.");}
  }catch(error){setMessage(error instanceof Error?error.message:"Could not update your offer.");}
  finally{setPending(false);}
 }
 if(offer.presentationMode!=="one_time")return (
  <section className={"tour-offer-unlocked"+(offer.redeemedAt?" redeemed":"")} aria-label="Unlocked SingHUB Offer">
   <p className="gig-eyebrow">{offer.redeemedAt?"Offer redeemed":"SingHUB Offer unlocked"}</p>
   <h3>{offer.title}</h3>
   {offer.detail&&<p>{offer.detail}</p>}
   {offer.code&&<div className="tour-offer-code"><span>REGISTER CODE</span><strong>{offer.code}</strong></div>}
   <p className="gig-fine">{offer.redeemedAt?"This offer has already been redeemed.":"Show this code at the register. Venue staff marks it redeemed."}</p>
   {offer.terms&&<small>{offer.terms}</small>}
  </section>
 );
 const unavailable=ended(offer);
 return <section className="tour-offer-unlocked tour-offer-one-time" aria-label="SingHUB live venue offer">
  {phase==="live"?<div className="tour-offer-live" role="group" aria-label="Live one-time offer">
   <div className="tour-offer-live-card">
    <div className="tour-offer-live-content">
     <p className="gig-eyebrow"><span className="tour-offer-live-dot" aria-hidden="true"/> LIVE SINGHUB OFFER</p>
     <h2>{venueName}</h2>
     <strong className="tour-offer-headline">{offer.title}</strong>
     {offer.detail&&<p>{offer.detail}</p>}
     <p className="tour-offer-clock" aria-label="Current San Diego time">{new Date(now).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",second:"2-digit",timeZone:"America/Los_Angeles"})}</p>
     <p className="gig-fine">San Diego time · Show this moving screen to the bartender</p>
     {offer.terms&&<small>{offer.terms}</small>}
     <button type="button" className="tour-offer-end" disabled={pending} onClick={()=>void change("close")}>{pending?"Closing…":"Close offer · Mark Presented"}</button>
     {message&&<p role="alert">{message}</p>}
    </div>
   </div>
  </div>:<>
   <p className="gig-eyebrow">{offer.presentedAt?"Presented":unavailable?"Presentation ended":"SingHUB Offer unlocked"}</p>
   <h3>{offer.title}</h3>
   {offer.detail&&<p>{offer.detail}</p>}
   {unavailable?<p className="gig-fine">{offer.presentedAt?"This offer has been presented and cannot be opened again.":"This one-time offer was opened already and is no longer available."}</p>:
   phase==="warning"?<div className="tour-offer-warning">
    <strong>Have your bartender ready.</strong>
    <p>This offer opens one time. Once you close it, it becomes Presented and cannot be reopened. An accidental browser reload has a short recovery window.</p>
    <button type="button" disabled={pending} onClick={()=>void change("open")}>{pending?"Opening…":"Open live offer"}</button>
    <button type="button" className="tour-offer-secondary" disabled={pending} onClick={()=>setPhase("summary")}>Not yet</button>
   </div>:<><p className="gig-fine">No code needed. Show the live, animated screen to your bartender when you are ready.</p><button type="button" onClick={()=>setPhase("warning")}>{offer.presentationStartedAt?"Recover live offer":"Open for bartender"}</button></>}
   {offer.terms&&<small>{offer.terms}</small>}
   {message&&<p role="alert">{message}</p>}
  </>}
 </section>;
}
