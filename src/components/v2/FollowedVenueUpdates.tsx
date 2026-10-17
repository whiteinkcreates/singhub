'use client';
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {accountClient} from '@/lib/v2/singerAccount';
type Update={venueSlug:string;venueName:string;date:string;chairsTipped:number;href:string};
export function FollowedVenueUpdates({userId}:{userId:string|null}){
 const [updates,setUpdates]=useState<Update[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const refresh=useCallback(async()=>{
  if(!userId){setUpdates([]);setLoading(false);return;}setLoading(true);
  try{
   const {data}=await accountClient().auth.getSession();if(!data.session)throw Error('Please sign in again.');
   const res=await fetch('/api/followed-venue-updates',{cache:'no-store',headers:{Authorization:'Bearer '+data.session.access_token}});
   const body=await res.json();if(!res.ok)throw Error(body.error||'Venue updates unavailable.');
   setUpdates(body.updates||[]);setError('');
  }catch(e){setError(e instanceof Error?e.message:'Venue updates unavailable.');}
  finally{setLoading(false);}
 },[userId]);
 useEffect(()=>{queueMicrotask(()=>void refresh());},[refresh]);
 return <section className="panel" id="followed-venue-updates" aria-labelledby="followed-venue-updates-title">
  <header className="panel-head"><div><h2 id="followed-venue-updates-title">Your Karaoke Radar</h2><p>Updates from venues you follow and choose to hear from.</p></div></header>
  {loading?<p role="status">Checking followed venues…</p>:error?<p role="alert">{error}</p>:!userId?<p>Sign in to see updates from your favorite karaoke venues.</p>:updates.length===0?<p>No notable chair activity yet. Follow a venue, enable its updates, and check here for upcoming karaoke nights.</p>:<div className="venue-list">{updates.map(update=><div className="venue-row" key={update.venueSlug+update.date}><div><strong>{update.venueName}</strong><span>{new Date(update.date+'T12:00:00Z').toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric',timeZone:'UTC'})} · {update.chairsTipped} chairs tipped</span></div><Link href={update.href}>Join them →</Link></div>)}</div>}
  <p className="upcoming-disclaimer">Only in-app updates are active. No email or push notifications are sent.</p>
 </section>;
}
