"use client";
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {SingHereConfig} from '@/lib/venueEnhancements';
import type {VenueListing} from '@/types';
import {SingHereMark} from '@/components/brand/SingHereMark';
import {resolveSingHere} from '@/lib/singHere';

export function performanceCaption(venueName:string){
 return 'I just rocked the mic at '+venueName+'! 🎤\n\nYour turn. Find your next karaoke night on SingHUB.';
}
export function SingHereDialog({venue,signupUrl,config,onClose}:{venue:VenueListing;signupUrl?:string;config?:SingHereConfig;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);const [sharing,setSharing]=useState(false);const [message,setMessage]=useState('');
 useEffect(()=>{dialog.current?.showModal();},[]);
 const privateRoom=venue.venueType==='private_room';
 const caption=performanceCaption(venue.venueName);
 const url=location.origin+'/venues/'+venue.slug;
 const flow=resolveSingHere(config,{privateRoom,externalSignupUrl:signupUrl,venueWebsite:venue.website});
 const safeSignup=flow.url;
 const kjTips=(config?.kjTips||[]).filter(link=>/^https:\/\//i.test(link.url));
 async function copy(){try{await navigator.clipboard.writeText(caption+'\n\n'+url);setMessage('Caption and venue link copied.');}catch{setMessage('Select the caption below to copy it.');}}
 async function share(){try{if(navigator.share)await navigator.share({title:'I rocked the mic at '+venue.venueName,text:caption,url});else await copy();}catch(error){if(!(error instanceof Error&&error.name==='AbortError'))setMessage('Sharing could not open. You can copy the caption instead.');}}
 return createPortal(<dialog className="singhere-dialog" ref={dialog} aria-labelledby="singhere-title" onCancel={onClose} onClose={onClose} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
  <button className="singhere-close" aria-label="Close SingHERE" onClick={onClose}>×</button>
  <div className="singhere-eyebrow" style={{display:'flex',alignItems:'center',gap:'10px',flexWrap:'wrap'}}><SingHereMark className="h-9 w-auto max-w-[150px] object-contain" /><span>· {venue.venueName}</span></div>
  <h2 id="singhere-title">{sharing?'You rocked the mic.':flow.title}</h2>
  {sharing?<><p>Log the song you sang to earn a Performance Star, or share your night.</p><a className="singhere-log-song" href={'/account?perform='+encodeURIComponent(venue.slug)}><span className="singhere-log-icon" aria-hidden="true">★</span><span className="singhere-log-copy"><strong>Log a song I sang</strong><small>Save song details · Earn a Performance Star</small></span><span className="singhere-log-arrow" aria-hidden="true">→</span></a><div className="singhere-caption">{caption}</div><div className="singhere-buttons"><button className="singhere-primary" onClick={()=>void share()}>Share performance</button><button onClick={()=>void copy()}>Copy caption</button></div><button className="singhere-text" onClick={()=>setSharing(false)}>Back to signup</button></>:<><p>{flow.instructions}</p><p>{privateRoom?'Check room availability, pricing and group size directly with the venue.':'The KJ runs the queue and will let you know when it’s your turn.'}</p>{safeSignup?<a className="singhere-primary" href={safeSignup} target="_blank" rel="noopener noreferrer">{flow.linkLabel} ↗</a>:null}{!privateRoom&&kjTips.length>0?<div className="singhere-kj-tips"><strong>Show {config?.kjName||'your KJ'} some love</strong><div className="singhere-buttons">{kjTips.map(link=><a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="singhere-primary">{link.label} ↗</a>)}</div><small>Tips go directly to the KJ’s own page. Optional and never required for rotation.</small></div>:null}<p className="singhere-note">{privateRoom?'Room bookings are handled by the venue.':'No SingHUB account needed to sign up with the KJ.'}</p><div className="singhere-buttons"><button className="singhere-primary" onClick={onClose}>Got it</button><a className="singhere-primary" href={"/account?perform="+encodeURIComponent(venue.slug)}>I just sang</a><button onClick={()=>setSharing(true)}>Share performance</button></div></>}
  <p className="singhere-note" role="status">{message}</p>
 </dialog>,document.body);
}
