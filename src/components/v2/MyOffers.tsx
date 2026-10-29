"use client";
import Link from "next/link";
import {useCallback,useEffect,useRef,useState} from "react";
import {accountClient} from "@/lib/v2/singerAccount";

type Offer = {
 venueSlug:string;title:string;presentationMode:"staff_code"|"one_time";
 presentationStartedAt:string|null;presentedAt:string|null;redeemedAt:string|null;
};
type Venue = {slug:string;venueName:string};
function offerStatus(offer:Offer,now:number){
 if(offer.redeemedAt)return "Redeemed";
 if(offer.presentedAt)return "Presented";
 if(offer.presentationMode==="one_time"&&offer.presentationStartedAt){
  const elapsed=now-new Date(offer.presentationStartedAt).getTime();
  return elapsed>=0&&elapsed<60000?"Recoverable":"Presentation ended";
 }
 return "Ready";
}
export function MyOffers({userId,venues}:{userId:string|null;venues:Venue[]}){
 const [offers,setOffers]=useState<Offer[]>([]);
 const [message,setMessage]=useState("Loading your offers…");
 const [pending,setPending]=useState(false);
 const [now,setNow]=useState(()=>Date.now());
 const generation=useRef(0);
 const load=useCallback(async()=>{
  const turn=++generation.current;
  if(!userId){setOffers([]);setMessage("Sign in above to see your offers.");return;}
  setPending(true);
  try{
   const {data,error}=await accountClient().auth.getSession();
   if(turn!==generation.current)return;
   if(error)throw error;
   if(!data.session||data.session.user.id!==userId){setOffers([]);setMessage("Sign in above to see your offers.");return;}
   const response=await fetch("/api/my-offers",{cache:"no-store",headers:{Authorization:"Bearer "+data.session.access_token}});
   const result=await response.json();
   if(turn!==generation.current)return;
   if(!response.ok)throw new Error(result.error||"Could not load your offers.");
   setOffers(Array.isArray(result.offers)?result.offers:[]);
   setMessage("");
  }catch(error){if(turn===generation.current){setOffers([]);setMessage(error instanceof Error?error.message:"Could not load your offers.");}}
  finally{if(turn===generation.current)setPending(false);}

 },[userId]);
 useEffect(()=>{
  // Load after mount, and whenever the signed-in account changes.
  queueMicrotask(()=>void load());
 },[load]);
 useEffect(()=>{
  if(!offers.some(offer=>offer.presentationStartedAt&&!offer.presentedAt))return;
  const interval=window.setInterval(()=>setNow(Date.now()),5000);
  return()=>window.clearInterval(interval);
 },[offers]);
 return <section className="panel my-offers-panel" id="offers" aria-labelledby="my-offers-title">
  <header className="panel-head"><div><h2 id="my-offers-title">My Offers</h2><p>Unlocked offers for the current San Diego nightlife date. Open only when your bartender is ready.</p></div>
   <button type="button" className="text-button" disabled={pending} onClick={()=>void load()}>{pending?"Loading…":"Refresh"}</button>
  </header>
  {offers.length?<div className="my-offers-list">{offers.map(offer=>{
   const status=offerStatus(offer,now);
   const venue=venues.find(v=>v.slug===offer.venueSlug);
   const ready=status==="Ready"||status==="Recoverable";
   return <article className="my-offers-row" key={offer.venueSlug}>
    <div className="my-offers-copy"><strong>{offer.title}</strong><span>{venue?.venueName||offer.venueSlug.replaceAll("-"," ")}</span>
     <small className={ready?"my-offers-status available":"my-offers-status"}>{status==="Ready"?"Available":status}</small>
    </div>
    <Link href={"/venues/"+encodeURIComponent(offer.venueSlug)+(ready?"?checkin=1":"")} className="my-offers-open">{ready?"View offer":"Venue page"}</Link>
   </article>;
  })}</div>:<p className="my-offers-empty" role="status">{message||(userId?"No offers unlocked tonight. Check in at a participating venue to see its offer.":"Sign in above to see your offers.")}</p>}
  {offers.length>0&&<p className="my-offers-note">Presented means you showed the offer. It does not confirm a purchase or discount. One-time presentations cannot be reopened once closed.</p>}
 </section>;
}
