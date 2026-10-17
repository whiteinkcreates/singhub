'use client';
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {accountClient} from '@/lib/v2/singerAccount';
type Gig={venueSlug:string;venueName:string;date:string;intent:'going'|'maybe';venueUrl:string;events:{eventId:string;startTime:string;hostName:string|null;calendarUrl:string|null}[]};
export function MyUpcomingGigs({userId}:{userId:string|null}){
 const [gigs,setGigs]=useState<Gig[]>([]);
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState('');
 const [message,setMessage]=useState('');
 const refresh=useCallback(async()=>{
  setLoading(true);setMessage('');
  if(!userId){setGigs([]);setLoading(false);return;}
  try{
   const {data}=await accountClient().auth.getSession();
   if(!data.session)throw Error('Sign in to view your planned nights.');
   const res=await fetch('/api/my-planned-appearances',{cache:'no-store',headers:{Authorization:'Bearer '+data.session.access_token}});
   const json=await res.json();if(!res.ok)throw Error(json.error||'Plans unavailable.');
   setGigs(json.plans||[]);
  }catch(error){setMessage(error instanceof Error?error.message:'Could not load plans.');}
  finally{setLoading(false);}
 },[userId]);
 useEffect(()=>{queueMicrotask(()=>void refresh());},[refresh]);
 async function change(gig:Gig,intent:'going'|'maybe'|'none'){
  setSaving(gig.venueSlug+gig.date);setMessage('');
  try{
   const {data}=await accountClient().auth.getSession();if(!data.session)throw Error('Sign in again to change a plan.');
   const res=await fetch('/api/venue-plans',{method:'PUT',headers:{Authorization:'Bearer '+data.session.access_token,'Content-Type':'application/json'},body:JSON.stringify({venueSlug:gig.venueSlug,date:gig.date,intent})});
   const body=await res.json();if(!res.ok)throw Error(body.error||'Could not update the plan.');
   await refresh();
  }catch(error){setMessage(error instanceof Error?error.message:'Plan update failed.');}
  finally{setSaving('');}
 }
 return <section className="panel upcoming-gigs" id="upcoming-gigs" aria-labelledby="upcoming-gigs-title">
  <header className="panel-head"><div><p className="eyebrow">TIP A CHAIR</p><h2 id="upcoming-gigs-title">My Upcoming Gigs</h2><p>Where you might sing next. Your plans stay private by default.</p></div></header>
  {loading?<p role="status">Loading planned nights…</p>:!userId?<p>Sign in to see the nights you have planned.</p>:gigs.length===0?<p>No chairs tipped yet. Find a karaoke night and let them know you might be there.</p>:<div className="upcoming-gigs-list">{gigs.map(gig=><article className="upcoming-gig" key={gig.venueSlug+gig.date}><div><time dateTime={gig.date}>{new Date(gig.date+'T12:00:00Z').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',timeZone:'UTC'})}</time><h3><Link href={gig.venueUrl}>{gig.venueName}</Link></h3><span>{gig.intent==='going'?'Chair tipped · Going':'Maybe going'}</span>{gig.events[0]?.hostName?<p>With {gig.events[0].hostName}</p>:null}</div><div className="upcoming-gig-actions"><button disabled={!!saving} type="button" onClick={()=>void change(gig,gig.intent==='going'?'maybe':'going')}>{gig.intent==='going'?'Change to Maybe':"I'm going"}</button><button disabled={!!saving} type="button" onClick={()=>void change(gig,'none')}>Cancel</button>{gig.events[0]?.calendarUrl?<a target="_blank" rel="noopener noreferrer" href={gig.events[0].calendarUrl}>Add to Calendar ↗</a>:<span title="This venue has not published both exact start and end times.">Calendar time not confirmed</span>}</div></article>)}</div>}
  {message?<p role="alert">{message}</p>:null}
  <p className="upcoming-disclaimer">Tipping a chair isn&apos;t a reservation, verified check-in, or Crew qualification.</p>
 </section>;
}
