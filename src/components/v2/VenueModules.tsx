"use client";
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { VibeCheck } from '@/components/venue/VibeCheck';
import { getTonightSpecials,type VenueEnhancement } from '@/lib/venueEnhancements';
import type { VenueListing,KaraokeEventListing } from '@/types';
import type { SingersSaySummary } from '@/lib/singersSay.server';
import type { PersistedSingBoardPost } from '@/lib/singboard/repository';
import type { VenueRowData } from '@/lib/v2/presentation';
export type VenueTemplateProps={venue:VenueListing;events:KaraokeEventListing[];enhancement?:VenueEnhancement;singersSay?:SingersSaySummary;posts?:PersistedSingBoardPost[];weekday:string};
export function VenueFeatures({venue,row,enhancement}:{venue:VenueListing;row:VenueRowData;enhancement?:VenueEnhancement}){
 const features=[{icon:'♪',title:row.nightCount===7?'Karaoke-first room':row.kind,copy:row.rhythm+' on the current schedule.'},{icon:'✓',title:row.trust.replace('✓ ',''),copy:row.verification},...(enhancement?.amenities||venue.vibeTags).slice(0,1).map(title=>({icon:'◎',title,copy:venue.neighborhood}))];
 return <section className="signal-strip" aria-label={venue.venueName+' room features'}>{features.map(feature=><article className="signal" key={feature.title}><span className="signal-icon">{feature.icon}</span><div><strong>{feature.title}</strong><p>{feature.copy}</p></div></article>)}</section>;
}
export function VenueSpecials({enhancement,weekday}:{enhancement?:VenueEnhancement;weekday:string}){
 const specials=[...getTonightSpecials(enhancement,weekday),...(enhancement?.dailyDeals||[])];
 return specials.length?<div className="placeholder">{specials.map((special,index)=><p key={index}><strong>{special.title}{special.price?' · '+special.price:''}</strong>{special.detail?<><br />{special.detail}</>:null}</p>)}</div>:<div className="placeholder">Current specials will appear here when published by the venue, with dates and terms attached.</div>;
}
export function VenueBoard({posts}:{posts:PersistedSingBoardPost[]}){
 return posts.length?<>{posts.map(post=><a className="board-item" key={post.id} href={'/events/'+post.id}><span>VENUE POST</span><strong>{post.title}</strong><p>{post.detail}</p></a>)}</>:<div className="board-item"><span>VENUE POST</span><strong>FROM THE VENUE</strong><p>Flyers, one-off events, and room updates pin here when published.</p></div>;
}
export function VenueFeedback({summary,venue,events}:{summary?:SingersSaySummary;venue:VenueListing;events:KaraokeEventListing[]}){
 const [open,setOpen]=useState(false);
 return <><div className="placeholder">{summary?.totalResponses?<>{summary.totalResponses} singer responses.<br />{summary.tags.filter(tag=>tag.count).map(tag=><span key={tag.slug}>{tag.label} · {tag.percentage}%<br /></span>)}</>:'Singer feedback appears here after confirmed Vibe Checks.'}{events.length?<><br /><button className="text-link" onClick={()=>setOpen(true)}>Review</button></>:null}</div>{open&&typeof document!=='undefined'?createPortal(<div role="dialog" aria-modal="true" aria-label={'Review '+venue.venueName} className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/95 p-4"><button className="mb-4 rounded border px-5 py-3" onClick={()=>setOpen(false)}>Close review</button><VibeCheck venue={{id:venue.id,slug:venue.slug,name:venue.venueName}} events={events} /></div>,document.body):null}</>;
}
