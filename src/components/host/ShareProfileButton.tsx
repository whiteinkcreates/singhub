/* eslint-disable @next/next/no-img-element */
"use client";
import {useRef,useState} from 'react';
import {toBlob} from 'html-to-image';
import type {HostProfile} from '@/types';
import {HOST_WEEKDAYS} from '@/lib/hostPresentation';
import {HostIcon} from './HostChrome';
import {HostAvatar} from './HostAvatar';
export type ShareableHost=Pick<HostProfile,'slug'|'publicDisplayName'|'primaryAreas'|'vibeTags'|'schedule'|'profileImageUrl'|'logoUrl'|'profileImagePosition'|'directoryHeroImageUrl'>;
export function ShareProfileButton({host}:{host:ShareableHost}){
 const dialog=useRef<HTMLDialogElement>(null);const card=useRef<HTMLDivElement>(null);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const [url,setUrl]=useState('');
 function open(){setUrl(`${location.origin}/hosts/${host.slug}`);setMessage('');dialog.current?.showModal();}
 async function exportCard(share:boolean){
  if(!card.current)return;setBusy(true);setMessage('');
  try{
   await document.fonts.ready;
   const images=Array.from(card.current.querySelectorAll('img'));
   await Promise.all(images.map(async image=>{if(!image.complete)await new Promise<void>((resolve,reject)=>{image.addEventListener('load',()=>resolve(),{once:true});image.addEventListener('error',()=>reject(new Error('Card image could not load.')),{once:true});});if(!image.naturalWidth)throw new Error('The profile QR code could not load. Please try again.');}));
   const blob=await toBlob(card.current,{pixelRatio:3,backgroundColor:'#071019',cacheBust:false});if(!blob)throw new Error('Card image could not be prepared.');
   const file=new File([blob],`singhub-${host.slug}-host-card.png`,{type:'image/png'});
   if(share&&navigator.canShare?.({files:[file]})&&navigator.share){await navigator.share({files:[file],title:`${host.publicDisplayName} on SingHUB`,text:`Find ${host.publicDisplayName} on the mic.`,url});setMessage('Card shared.');}
   else {const objectUrl=URL.createObjectURL(blob);const a=document.createElement('a');a.href=objectUrl;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);setMessage(share?'Card downloaded. Attach it to your post or message.':'Card downloaded.');}
  }catch(error){if(!(error instanceof Error&&error.name==='AbortError'))setMessage(error instanceof Error?error.message:'The card could not be shared.');}finally{setBusy(false);}
 }
 async function copy(){try{await navigator.clipboard.writeText(url);setMessage('Profile link copied.');}catch{setMessage(`Copy this link: ${url}`);}}
 return <><button className="host-button" type="button" onClick={open}><HostIcon name="ios_share" />Share profile</button><dialog className="host-share-dialog host-system" ref={dialog} onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}}><header><h2>SHARE YOUR KJ</h2><button type="button" aria-label="Close share profile" onClick={()=>dialog.current?.close()}><HostIcon name="close" /></button></header><div className="host-trading-card" ref={card}><div className="host-trading-card-inner"><img className="host-trading-backdrop" src={host.directoryHeroImageUrl||'/images/hosts/hosts-booth.webp'} alt="" aria-hidden="true" /><div className="host-trading-identity"><p className="host-eyebrow">KARAOKE HOST</p><h2>{host.publicDisplayName}</h2></div><div className="host-trading-portrait"><HostAvatar host={host} /></div><p className="host-location"><HostIcon name="location_on" />{host.primaryAreas.join(' / ')||'San Diego'}</p><div className="host-vibes">{host.vibeTags.slice(0,4).map(tag=><span key={tag}>{tag}</span>)}</div><h3>FIND ME ON THE MIC</h3>{HOST_WEEKDAYS.flatMap(day=>host.schedule[day].map((gig,index)=><div className="host-trading-row" key={`${day}-${index}`}><strong>{day.slice(0,3).toUpperCase()}</strong><div><b>{gig.venueName}</b><span>{gig.time||'Time to be confirmed'}</span></div></div>))}{!Object.values(host.schedule).some(gigs=>gigs.length)&&<p className="host-empty">Regular nights are being confirmed.</p>}<p className="host-card-note">Weekly schedule · Check the live profile for changes.</p><div className="host-trading-footer">{url&&<img src={`/api/hosts/${host.slug}/qr?origin=${encodeURIComponent(new URL(url).origin)}`} alt={`QR code for ${host.publicDisplayName}'s live profile`} />}<div><strong>Keep up with your KJ</strong><p>Current nights, socials, booking &amp; tip links</p><p className="host-card-url">{url.replace(/^https?:\/\//,'')}</p><img className="host-card-logo" src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" /></div></div></div></div><div className="host-share-actions"><button className="host-button pink" disabled={busy} onClick={()=>exportCard(true)}>{busy?'Preparing…':'Share card'}</button><button className="host-button" disabled={busy} onClick={()=>exportCard(false)}>Download image</button><button className="host-button" onClick={copy}>Copy profile link</button></div><p className="host-share-message" role="status">{message}</p></dialog></>;
}
