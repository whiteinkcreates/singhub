'use client';
import {useCallback,useEffect,useRef,useState,type FormEvent} from 'react';
import Link from 'next/link';
import {accountClient,sendAccountLink} from '@/lib/v2/singerAccount';
import {trackEvent} from '@/lib/analytics';
import type {SingHubOffer} from '@/lib/venueEnhancements';

type VisitStatus='none'|'pending'|'confirmed';
type OfferUnlock={title:string;detail?:string;terms?:string;code:string;redeemedAt?:string};
type Eligibility={phase:'early'|'open'|'closed';open:boolean;reason:string;startTime:string|null};
type CheckinMethod='location_matched'|'self_reported';
type Action='venue'|'tour';

async function readResponse(response:Response){
 const result=await response.json();
 if(!response.ok)throw new Error(result.error||'Could not complete check-in.');
 return result;
}
async function currentLocation(){
 if(!navigator.geolocation)throw new Error('This browser does not support location check-in. Try a self-reported visit.');
 return new Promise<{latitude:number;longitude:number;accuracy:number}>((resolve,reject)=>{
  navigator.geolocation.getCurrentPosition(
   result=>resolve({latitude:result.coords.latitude,longitude:result.coords.longitude,accuracy:result.coords.accuracy}),
   error=>{
    const message=error.code===1?'Your browser denied location access for this site. Check the site permission and retry.':error.code===2?'Your phone could not determine your location. Move somewhere with a clearer GPS signal.':error.code===3?'GPS timed out. Try again with a stronger signal.':'Your location could not be determined.';
    reject(new Error(message+' You can also self-report your visit.'));
   },{enableHighAccuracy:true,timeout:15000,maximumAge:0});
 });
}

export function TourStopCheckIn({venueSlug,venueName,offer}:{venueSlug:string;venueName:string;offer?:SingHubOffer}){
 const dialog=useRef<HTMLDialogElement>(null);
 const [pending,setPending]=useState(false);
 const [needsSignIn,setNeedsSignIn]=useState(false);
 const [sent,setSent]=useState(false);
 const [venueCheckedIn,setVenueCheckedIn]=useState(false);
 const [visitStatus,setVisitStatus]=useState<VisitStatus>('none');
 const [eligibility,setEligibility]=useState<Eligibility|undefined>();
 const [offerUnlock,setOfferUnlock]=useState<OfferUnlock|undefined>();
 const [message,setMessage]=useState('');
 const [errorMessage,setErrorMessage]=useState('');
 const [gpsRecoveryAction,setGpsRecoveryAction]=useState<Action|null>(null);

 const refresh=useCallback(async()=>{
  try{
   const {data,error}=await accountClient().auth.getSession();
   if(error)throw error;
   if(!data.session)return;
   const headers={Authorization:'Bearer '+data.session.access_token};
   const query='?venueSlug='+encodeURIComponent(venueSlug);
   const [venue,tour]=await Promise.all([
    fetch('/api/venue-checkins'+query,{headers,cache:'no-store'}).then(readResponse),
    fetch('/api/tour-stops'+query,{headers,cache:'no-store'}).then(readResponse)
   ]);
   setVenueCheckedIn(Boolean(venue.checkin));
   setVisitStatus((tour.visit?.status||'none') as VisitStatus);
   setEligibility(tour.eligibility);
   setOfferUnlock(venue.offerUnlock||tour.offerUnlock||undefined);
  }catch(error){setErrorMessage(error instanceof Error?error.message:'Check-in status could not load.');}
 },[venueSlug]);
 useEffect(()=>{
  if(new URLSearchParams(location.search).get('checkin')!=='1')return;
  dialog.current?.showModal();
  const timer=window.setTimeout(()=>void refresh(),0);
  return ()=>window.clearTimeout(timer);
 },[refresh]);

 async function checkIn(action:Action,method:CheckinMethod){
  setPending(true);setErrorMessage('');setMessage('');setGpsRecoveryAction(null);
  try{
   const {data,error}=await accountClient().auth.getSession();
   if(error)throw error;
   if(!data.session){setNeedsSignIn(true);return;}
   if(action==='tour'&&!eligibility?.open){
    setMessage(eligibility?.reason||'Tour Stops open after karaoke starts.');
    return;
   }
   const position=method==='location_matched'?await currentLocation().catch(error=>{
    setGpsRecoveryAction(action);
    throw error;
   }):undefined;
   const response=await fetch(action==='venue'?'/api/venue-checkins':'/api/tour-stops',{
    method:'POST',
    headers:{'Content-Type':'application/json',Authorization:'Bearer '+data.session.access_token},
    body:JSON.stringify({venueSlug,method,...(position?{location:position}:{})})
   });
   if(response.status===401){setNeedsSignIn(true);return;}
   const result=await response.json();
   if(!response.ok){
    if(method==='location_matched'&&response.status===422&&
       ['too_far','low_accuracy','invalid_location','missing_venue_coordinates'].includes(result.code)){
      setGpsRecoveryAction(action);
    }
    throw new Error(result.error||'Could not complete check-in.');
   }
   if(action==='venue'){
    setVenueCheckedIn(true);
    setOfferUnlock(result.offerUnlock||offerUnlock);
    setMessage(result.offerError|| (result.offerUnlock?'Checked in! Your SingHUB Offer is unlocked below.':result.alreadyCheckedIn?'You have already checked in here for this venue day.':'Venue check-in recorded. A Tour Stop is earned separately during karaoke.'));
    trackEvent('venue_check_in',{venue_slug:venueSlug,check_in_method:method,offer_unlocked:Boolean(result.offerUnlock)});
   }else{
    if(result.pending){
     setVisitStatus('pending');
     setMessage('Visit pending. Return after karaoke starts to confirm your Tour Stop.');
    }else{
     setVisitStatus('confirmed');
     setMessage(result.alreadyCheckedIn?'You already collected this karaoke night.':'Tour Stop added to My Tour!');
    }
    trackEvent('tour_stop_check_in',{venue_slug:venueSlug,check_in_method:method,new_tour_stop:Boolean(result.collected)});
   }
   await refresh();
  }catch(error){setErrorMessage(error instanceof Error?error.message:'Your check-in was not saved.');}
  finally{setPending(false);}
 }

 async function signIn(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setPending(true);setErrorMessage('');
  try{
   await sendAccountLink(String(new FormData(event.currentTarget).get('email')),location.pathname+'?checkin=1');
   setSent(true);setMessage('Check your email. Open the link in this browser to finish checking in.');
  }catch(error){setErrorMessage(error instanceof Error?error.message:'The sign-in link could not be sent.');}
  finally{setPending(false);}
 }
 const open=()=>{
  setMessage('');setErrorMessage('');setGpsRecoveryAction(null);setNeedsSignIn(false);setSent(false);
  dialog.current?.showModal();void refresh();
  trackEvent('venue_check_in_open',{venue_slug:venueSlug});
 };
 const hasOffer=Boolean(offer?.enabled&&offer.title?.trim());
 const tourOpen=eligibility?.open===true;
 return <div className="gig-check-in">
  <button type="button" className="gig-check-in-button" onClick={open}>
   {visitStatus==='confirmed'?'Tour Stop collected · View check-in':hasOffer?'Check in · SingHUB Offer & Tour Stop':'Check in · Collect Tour Stop'}
  </button>
  <dialog className="gig-dialog" ref={dialog} aria-labelledby={'tour-stop-title-'+venueSlug} onClick={e=>{if(e.target===e.currentTarget)e.currentTarget.close();}}>
   <button className="gig-close" aria-label="Close check-in" onClick={()=>dialog.current?.close()}>×</button>
   <p className="gig-eyebrow">Check in · Collect · Keep singing</p>
   <h2 id={'tour-stop-title-'+venueSlug}>{venueName}</h2>
   <p>Check in to record your visit and access eligible venue offers. Tour Stops are separate and open only after karaoke starts.</p>
   {hasOffer&&!offerUnlock&&<div className="tour-offer-teaser"><strong>SingHUB Offer</strong><span>{offer!.title}</span><small>Check in to see if today’s offer is available. Venue offer terms apply, even when karaoke isn’t running.</small></div>}
   <p className="gig-fine">Location matching is optional. Self-reported check-ins are labeled. We don’t save your precise GPS location.</p>
   {gpsRecoveryAction&&!needsSignIn&&<section className="gig-gps-recovery" aria-label="GPS check-in alternative">
    <strong>Inside the venue? GPS can drift indoors.</strong>
    <p>We couldn’t verify your phone’s reading. You can still save your visit as self-reported. It won’t be marked GPS-verified.</p>
    <button type="button" disabled={pending} onClick={()=>void checkIn(gpsRecoveryAction,'self_reported')}>
     {pending?'Saving…':gpsRecoveryAction==='tour'?'Collect Tour Stop · Self-reported':'Check in here · Self-reported'}
    </button>
   </section>}
   {needsSignIn?<form onSubmit={signIn}><label>Email<input name="email" type="email" autoComplete="email" required /></label><button type="submit" disabled={pending||sent}>{sent?'Link sent':'Email me a sign-in link'}</button></form>:
   <>
    <div className="gig-actions">
     <strong>{venueCheckedIn?'✓ Venue check-in saved':'Venue check-in · Anytime'}</strong>
     {!venueCheckedIn&&<>
      <button type="button" disabled={pending} onClick={()=>void checkIn('venue','location_matched')}>{pending?'Working…':'Check in with my location'}</button>
      <button type="button" disabled={pending} onClick={()=>void checkIn('venue','self_reported')}>Self-report venue visit</button>
     </>}
    </div>
    <div className="gig-actions">
     <strong>{visitStatus==='confirmed'?'★ Tour Stop collected':'Tour Stop · Karaoke nights only'}</strong>
     {visitStatus==='confirmed'?<Link href="/account#tour-stops">View My Tour →</Link>:tourOpen?
      <>
       <button type="button" disabled={pending} onClick={()=>void checkIn('tour','location_matched')}>{pending?'Working…':'Collect Tour Stop with GPS'}</button>
       <button type="button" disabled={pending} onClick={()=>void checkIn('tour','self_reported')}>Self-report karaoke attendance</button>
      </>:<p className="gig-fine">{eligibility?.reason||'Tour Stop availability is loading. Karaoke must have started before collecting.'}</p>
     }
    </div>
   </>}
   <p role="status">{message}</p>
   {errorMessage&&<p role="alert">{errorMessage}</p>}
   {offerUnlock&&<section className={'tour-offer-unlocked'+(offerUnlock.redeemedAt?' redeemed':'')} aria-label="Unlocked SingHUB Offer"><p className="gig-eyebrow">{offerUnlock.redeemedAt?'Offer redeemed':'SingHUB Offer unlocked'}</p><h3>{offerUnlock.title}</h3>{offerUnlock.detail&&<p>{offerUnlock.detail}</p>}<div className="tour-offer-code"><span>REGISTER CODE</span><strong>{offerUnlock.code}</strong></div><p className="gig-fine">{offerUnlock.redeemedAt?'This offer has already been redeemed.':'Show this code at the register. Venue staff marks it redeemed.'}</p>{offerUnlock.terms&&<small>{offerUnlock.terms}</small>}</section>}
  </dialog>
 </div>;
}
