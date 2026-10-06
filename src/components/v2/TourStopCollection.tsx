'use client';
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {accountClient} from '@/lib/v2/singerAccount';
import type {GigStubVisit} from '@/lib/gigStubs';
import type {VenueListing} from '@/types';
import {TourMap} from './TourMap';

type TourStop=GigStubVisit&{visits:number};
function hasCoordinates(venue:VenueListing|undefined):venue is VenueListing&{latitude:number;longitude:number}{return Boolean(venue&&typeof venue.latitude==='number'&&Number.isFinite(venue.latitude)&&typeof venue.longitude==='number'&&Number.isFinite(venue.longitude));}

export function TourStopCollection({venues}:{venues:VenueListing[]}){
 const [stops,setStops]=useState<TourStop[]>([]);const [message,setMessage]=useState('Loading My Tour…');
 const load=useCallback(async()=>{try{const {data,error}=await accountClient().auth.getSession();if(error)throw error;if(!data.session){setStops([]);setMessage('Sign in above to start collecting TourStops.');return;}const response=await fetch('/api/tour-stops',{headers:{Authorization:'Bearer '+data.session.access_token}});const result=await response.json();if(!response.ok)throw new Error(result.error);const next=(result.stops||result.stubs||[]) as TourStop[];setStops(next);setMessage(next.length?'':'Your first TourStop is waiting. Check in from a venue page when you visit.');}catch(error){setMessage(error instanceof Error?error.message:'My Tour could not load.');}},[]);
 useEffect(()=>{queueMicrotask(()=>void load());let subscription:{unsubscribe:()=>void}|undefined;try{subscription=accountClient().auth.onAuthStateChange(()=>{setTimeout(()=>void load(),0);}).data.subscription;}catch{}return()=>subscription?.unsubscribe();},[load]);
 const mapped=stops.map(stop=>venues.find(venue=>venue.id===stop.venue_id||venue.slug===stop.venue_slug)).filter(hasCoordinates);
 return <section className="panel tour-collection" id="tour-stops"><header className="panel-head"><div><p className="gig-eyebrow">Your karaoke map</p><h2>My Tour</h2><p>Collect a TourStop when you show up for karaoke. Singing is optional. The room still counts.</p></div><div className="tour-count"><strong>{stops.length}</strong><span>{stops.length===1?'TourStop':'TourStops'}</span></div></header>{stops.length>0&&<TourMap venues={mapped}/>}<div className="tour-stop-grid">{stops.map(stop=><Link className="tour-stop" href={'/venues/'+stop.venue_slug} key={stop.venue_id}><img className="tour-stop-pin" src="/images/singhub-v2/sh-venue-pin-transparent.png" alt="" aria-hidden="true"/><span className="tour-stop-label">SingHUB · TourStop</span><strong>{stop.venue_name}</strong><span>{stop.neighborhood}</span><span>First stop · {stop.nightlife_date}</span><b>{stop.visits} {stop.visits===1?'karaoke night':'karaoke nights'}</b><small>{stop.method==='location_matched'?'First stop: location matched':'First stop: self-reported'}</small></Link>)}</div><p role="status">{message}</p><button type="button" className="gig-refresh" onClick={()=>void load()}>Refresh My Tour</button></section>;
}
