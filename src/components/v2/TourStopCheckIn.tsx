'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import Link from 'next/link';
import {accountClient,sendAccountLink} from '@/lib/v2/singerAccount';
import {trackEvent} from '@/lib/analytics';

type VisitStatus='none'|'pending'|'confirmed';

export function TourStopCheckIn({venueSlug,venueName}:{venueSlug:string;venueName:string}){
 const dialog=useRef<HTMLDialogElement>(null);
 const [pending,setPending]=useState(false);
 const [needsSignIn,setNeedsSignIn]=useState(false);
 const [sent,setSent]=useState(false);
 const [saved,setSaved]=useState(false);
 const [visitStatus,setVisitStatus]=useState<VisitStatus>('none');
 const [message,setMessage]=useState('');

 async function refreshVisitStatus(){
  try{
   const {data,error}=await accountClient().auth.getSession();if(error)throw error;
   if(!data.session)return;
   const response=await fetch('/api/tour-stops?venueSlug='+encodeURIComponent(venueSlug),{headers:{Authorization:'Bearer '+data.session.access_token},cache:'no-store'});
   if(!response.ok)return;
   const result=await response.json();
   const status=(result.visit?.status||'none') as VisitStatus;
   setVisitStatus(status);setSaved(status==='confirmed');
   if(status==='pending')setMessage('Early check-in saved. Once karaoke starts, confirm you’re still here to turn it into a TourStop.');
   if(status==='confirmed')setMessage('You already have tonight’s TourStop.');
  }catch{}
 }

 useEffect(()=>{if(new URLSearchParams(location.search).get('checkin')==='1'){dialog.current?.showModal();void refreshVisitStatus();}},[]);

 async function checkIn(method:'self_reported'|'location_matched'){
  setPending(true);setMessage('');
  try{
   const {data,error}=await accountClient().auth.getSession();if(error)throw error;if(!data.session){setNeedsSignIn(true);return;}
   const locationData=method==='location_matched'?await new Promise<GeolocationCoordinates>((resolve,reject)=>{if(!navigator.geolocation){reject(new Error('Location is unavailable. You can record a self-reported visit.'));return;}navigator.geolocation.getCurrentPosition(p=>resolve(p.coords),()=>reject(new Error('Location was unavailable. You can record a self-reported visit.')),{enableHighAccuracy:true,timeout:10000,maximumAge:30000});}):undefined;
   const response=await fetch('/api/tour-stops',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+data.session.access_token},body:JSON.stringify({venueSlug,method,...(locationData?{location:{latitude:locationData.latitude,longitude:locationData.longitude,accuracy:locationData.accuracy}}:{})})});
   const result=await response.json();if(response.status===401){setNeedsSignIn(true);return;}if(!response.ok)throw new Error(result.error);

   if(result.pending){
    setVisitStatus('pending');setSaved(false);
    setMessage(result.eligibility?.startTime?`Early check-in saved. Karaoke starts at ${result.eligibility.startTime}. Come back once it starts and confirm you’re still here to earn the TourStop.`:'Early check-in saved. Come back once karaoke starts and confirm you’re still here to earn the TourStop.');
    trackEvent('venue_check_in_pending',{venue_slug:venueSlug,check_in_method:method});
    return;
   }

   setVisitStatus('confirmed');setSaved(true);
   setMessage(result.alreadyCheckedIn?'You already checked in here this karaoke night.':result.confirmedFromPending?'Still here. TourStop added to My Tour.':result.collected?'TourStop added. This room is now on My Tour.':'Welcome back. This karaoke night is saved in My Tour.');
   trackEvent('venue_check_in',{venue_slug:venueSlug,check_in_method:method,new_tour_stop:Boolean(result.collected),duplicate:Boolean(result.alreadyCheckedIn),confirmed_from_pending:Boolean(result.confirmedFromPending)});
  }catch(error){setMessage(error instanceof Error?error.message:'Your visit was not saved.');}finally{setPending(false);}
 }

 async function signIn(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setPending(true);
  try{await sendAccountLink(String(new FormData(event.currentTarget).get('email')),location.pathname+'?checkin=1');setSent(true);setMessage('Check your email. Open the link in this browser, then confirm your visit.');}
  catch(error){setMessage(error instanceof Error?error.message:'Sign-in link was not sent.');}
  finally{setPending(false);}
 }

 const open=()=>{setMessage('');setSaved(false);setNeedsSignIn(false);setSent(false);dialog.current?.showModal();void refreshVisitStatus();trackEvent('venue_check_in_open',{venue_slug:venueSlug});};
 const primaryLabel=visitStatus==='pending'?'I’m still here · Confirm with location':'Check my location & check in';
 const selfLabel=visitStatus==='pending'?'I’m still here · Self-report':'Record a self-reported visit';

 return <div className="gig-check-in">
  <button type="button" className="gig-check-in-button" onClick={open}>{visitStatus==='pending'?'Early check-in saved · Finish TourStop':'I’m here · Add TourStop'}</button>
  <dialog className="gig-dialog" ref={dialog} aria-labelledby={'tour-stop-title-'+venueSlug} onClick={e=>{if(e.target===e.currentTarget)e.currentTarget.close();}}>
   <button className="gig-close" aria-label="Close check-in" onClick={()=>dialog.current?.close()}>×</button>
   <p className="gig-eyebrow">Check in · TourStop</p><h2 id={'tour-stop-title-'+venueSlug}>{venueName}</h2>
   <p>{visitStatus==='pending'?'You checked in before karaoke. Confirm you’re still here once karaoke starts and this becomes a TourStop.':'Check in to put this room on My Tour. You do not have to sing to collect a TourStop.'}</p>
   <p className="gig-fine">TourStops record karaoke-night attendance, not performances. Location is optional; self-reported visits are labeled. Your collection is private. We don’t save your precise location.</p>
   {needsSignIn?<form onSubmit={signIn}><label>Email<input name="email" type="email" autoComplete="email" required /></label><button type="submit" disabled={pending||sent}>{sent?'Link sent':'Email me a sign-in link'}</button></form>:!saved&&<div className="gig-actions"><button disabled={pending} onClick={()=>void checkIn('location_matched')}>{pending?'Working…':primaryLabel}</button><button disabled={pending} onClick={()=>void checkIn('self_reported')}>{selfLabel}</button></div>}
   <p role="status">{message}</p>{saved&&<Link href="/account#tour-stops">See My Tour →</Link>}
  </dialog>
 </div>;
}
