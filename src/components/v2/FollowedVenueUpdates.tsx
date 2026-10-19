'use client';
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {accountClient} from '@/lib/v2/singerAccount';
import './styles/karaokeRadar.css';
type Update={venueSlug:string;venueName:string;date:string;chairsTipped:number;href:string};
export function FollowedVenueUpdates({userId}:{userId:string|null}){
 const [updates,setUpdates]=useState<Update[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const [showDetails,setShowDetails]=useState(false);
 const refresh=useCallback(async()=>{
  if(!userId){setUpdates([]);setLoading(false);return;}setLoading(true);
  try{
   const {data}=await accountClient().auth.getSession();if(!data.session)throw Error('Please sign in again.');
   const res=await fetch('/api/followed-venue-updates',{cache:'no-store',headers:{Authorization:'Bearer '+data.session.access_token}});
   const body=await res.json();if(!res.ok)throw Error(body.error||'Venue activity is unavailable right now.');
   setUpdates(body.updates||[]);setError('');
  }catch(e){setError(e instanceof Error?e.message:'Venue activity is unavailable right now.');}
  finally{setLoading(false);}
 },[userId]);
 useEffect(()=>{queueMicrotask(()=>void refresh());},[refresh]);
 return <section className="panel karaoke-radar" id="followed-venue-updates" aria-labelledby="followed-venue-updates-title">
  <header className="panel-head radar-heading"><div><p className="eyebrow">YOUR FAVORITE ROOMS</p><h2 id="followed-venue-updates-title">Karaoke Radar</h2><p>See who’s making plans at the places you follow.</p></div><button className="radar-settings-trigger" type="button" aria-expanded={showDetails} aria-controls="radar-alert-info" onClick={()=>setShowDetails(value=>!value)}>Alert options <span aria-hidden="true">⚙</span></button></header>
  {showDetails?<div className="radar-alert-info" id="radar-alert-info"><strong>Chair alerts are on the way</strong><p>You’ll be able to choose None, My Crew, a chair threshold, or Any Chair, with overrides for favorite venues. Those controls aren’t active yet.</p><p>For now, this radar only shows in-app activity. It won’t send a push or email.</p></div>:null}
  {loading?<p className="radar-message" role="status">Checking your radar…</p>:error?<p className="radar-message" role="alert">{error}</p>:!userId?<div className="radar-empty"><span className="radar-symbol" aria-hidden="true">◎</span><h3>Your radar starts here.</h3><p>Sign in and follow your favorite karaoke spots to see what’s coming up.</p><Link href="/account?signin=1">Sign in →</Link></div>:updates.length===0?<div className="radar-empty"><span className="radar-symbol" aria-hidden="true">◎</span><h3>Nothing on your radar yet.</h3><p>When singers start tipping chairs at places you follow, you’ll see the action here.</p><Link href="/find-karaoke">Explore karaoke spots →</Link></div>:<div className="radar-nights">{updates.map(update=><article className="radar-night" key={update.venueSlug+update.date}><div><time dateTime={update.date}>{new Date(update.date+'T12:00:00Z').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',timeZone:'UTC'})}</time><h3>{update.venueName}</h3><p><strong>{update.chairsTipped}</strong> SingHUB singers have tipped a chair</p></div><Link href={update.href}>See the night →</Link></article>)}</div>}
  <p className="radar-footnote">Chairs tipped are plans, not confirmed attendance. This is an in-app radar, not push notifications.</p>
 </section>;
}
