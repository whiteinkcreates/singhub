/* eslint-disable @next/next/no-img-element */
'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {accountClient} from '@/lib/v2/singerAccount';
import type {TourStopVisit} from '@/lib/tourStops';
import type {VenueListing} from '@/types';
import {TourMap} from './TourMap';

type TourStop=TourStopVisit&{visits:number};
function hasCoordinates(venue:VenueListing|undefined):venue is VenueListing&{latitude:number;longitude:number}{return Boolean(venue&&typeof venue.latitude==='number'&&Number.isFinite(venue.latitude)&&typeof venue.longitude==='number'&&Number.isFinite(venue.longitude));}

export function TourStopCollection({venues,refreshKey=0}:{venues:VenueListing[];refreshKey?:number}){
 const [stops,setStops]=useState<TourStop[]>([]);const [message,setMessage]=useState('Loading My Tour…');
 const [counts,setCounts]=useState<{karaokeNights:number;nightsPerformed:number}|null>(null);
 const generation=useRef(0);
 const clear=useCallback(()=>{setStops([]);setCounts(null);},[]);
 const load=useCallback(async()=>{
  const current=++generation.current;
  try{
   const {data,error}=await accountClient().auth.getSession();if(current!==generation.current)return;if(error)throw error;
   if(!data.session){clear();setMessage('Sign in above to start collecting TourStops.');return;}
   const response=await fetch('/api/tour-stops',{headers:{Authorization:'Bearer '+data.session.access_token}});
   const result=await response.json();if(current!==generation.current)return;
   if(!response.ok)throw new Error(result.error||'My Tour could not load.');
   const next=(result.stops||result.stubs||[]) as TourStop[];
   setStops(next);
   setCounts(Number.isSafeInteger(result.karaokeNights)&&result.karaokeNights>=0&&Number.isSafeInteger(result.nightsPerformed)&&result.nightsPerformed>=0?{karaokeNights:result.karaokeNights,nightsPerformed:result.nightsPerformed}:null);
   setMessage(next.length?'':'Your first TourStop is waiting. Check in from a venue page when you visit.');
  }catch(error){if(current!==generation.current)return;clear();setMessage(error instanceof Error?error.message:'My Tour could not load.');}
 },[clear]);
 useEffect(()=>{
  let active=true;let timer:ReturnType<typeof setTimeout>|undefined;
  queueMicrotask(()=>{if(active)void load();});
  let subscription:{unsubscribe:()=>void}|undefined;
  try{subscription=accountClient().auth.onAuthStateChange(()=>{
   generation.current++;clear();setMessage('Loading My Tour…');
   clearTimeout(timer);timer=setTimeout(()=>{if(active)void load();},0);
  }).data.subscription;}catch{}
  return()=>{active=false;generation.current++;clearTimeout(timer);subscription?.unsubscribe();};
 },[load,clear,refreshKey]);
 const mapped=stops.map(stop=>venues.find(venue=>venue.id===stop.venue_id||venue.slug===stop.venue_slug)).filter(hasCoordinates);
 return <section className="panel tour-collection" id="tour-stops"><header className="panel-head"><div><p className="gig-eyebrow">Your karaoke map</p><h2>My Tour</h2><p>Collect a TourStop when you show up for karaoke. Singing is optional. The room still counts.</p></div><div className="tour-count" aria-label={stops.length+' Tour '+(stops.length===1?'Stop':'Stops')}><strong>{stops.length}</strong><span>Tour<br />{stops.length===1?'Stop':'Stops'}</span></div></header><div className="tour-counts" aria-label="Your karaoke nights" style={{display:'flex',gap:'1.5rem',flexWrap:'wrap',padding:'16px 20px'}}><p><strong>{counts?.karaokeNights??'—'}</strong> Karaoke nights</p><p><strong>{counts?.nightsPerformed??'—'}</strong> Nights performed</p></div><p className="free-rule">Each date counts once, even if you visit multiple venues or sing several songs. Karaoke nights come from confirmed check-ins; nights performed come from your song dates.</p>{stops.length>0&&<TourMap venues={mapped}/>}<div className="tour-stop-grid">{stops.map(stop=><Link className="tour-stop" href={'/venues/'+stop.venue_slug} key={stop.venue_id}><img className="tour-stop-pin" src="/images/singhub-v2/sh-venue-pin-transparent.png" alt="" aria-hidden="true"/><span className="tour-stop-label">SingHUB · TourStop</span><strong>{stop.venue_name}</strong><span>{stop.neighborhood}</span><span>First stop · {stop.nightlife_date}</span><b>{stop.visits} {stop.visits===1?'karaoke night':'karaoke nights'}</b><small>{stop.method==='location_matched'?'First stop: location matched':'First stop: self-reported'}</small></Link>)}</div><p role="status">{message}</p><button type="button" className="gig-refresh" onClick={()=>void load()}>Refresh My Tour</button></section>;
}
