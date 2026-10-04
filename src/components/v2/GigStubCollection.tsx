'use client';
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {accountClient} from '@/lib/v2/singerAccount';
import type {GigStubVisit} from '@/lib/gigStubs';
export function GigStubCollection(){
 const [stubs,setStubs]=useState<(GigStubVisit&{visits:number})[]>([]);const [message,setMessage]=useState('Loading your collection…');
 const load=useCallback(async()=>{try{const {data,error}=await accountClient().auth.getSession();if(error)throw error;if(!data.session){setStubs([]);setMessage('Sign in above to keep your venue collection.');return;}const response=await fetch('/api/gig-stubs',{headers:{Authorization:'Bearer '+data.session.access_token}});const result=await response.json();if(!response.ok)throw new Error(result.error);setStubs(result.stubs);setMessage(result.stubs.length?'':'Your first room is waiting. Open a venue page and tap “I’m here” when you visit.');}catch(error){setMessage(error instanceof Error?error.message:'Gig Stubs could not load.');}},[]);
 useEffect(()=>{queueMicrotask(()=>void load());let subscription:{unsubscribe:()=>void}|undefined;try{subscription=accountClient().auth.onAuthStateChange(()=>{setTimeout(()=>void load(),0);}).data.subscription;}catch{}return()=>subscription?.unsubscribe();},[load]);
 return <section className="panel gig-collection" id="gig-stubs"><header className="panel-head"><div><p className="gig-eyebrow">Your karaoke circuit</p><h2>Gig Stubs</h2><p>One venue. One souvenir. Keep coming back for more nights.</p></div></header><div className="gig-stub-grid">{stubs.map(stub=><Link className="gig-stub" href={'/venues/'+stub.venue_slug} key={stub.venue_id}><span>SingHUB · Gig Stub</span><strong>{stub.venue_name}</strong><span>{stub.neighborhood}</span><span>First visit · {stub.nightlife_date}</span><b>{stub.visits} {stub.visits===1?'visit':'visits'}</b><small>{stub.method==='location_matched'?'First visit: location matched':'First visit: self-reported'}</small></Link>)}</div><p role="status">{message}</p><button type="button" className="gig-refresh" onClick={()=>void load()}>Refresh collection</button></section>;
}
