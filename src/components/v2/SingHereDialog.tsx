"use client";
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {SingHereConfig} from '@/lib/venueEnhancements';
import type {VenueListing} from '@/types';

export function performanceCaption(venueName:string){
 return 'I just rocked the mic at '+venueName+'! 🎤\n\nYour turn. Find your next karaoke night on SingHUB.';
}
export function SingHereDialog({venue,signupUrl,config,onClose}:{venue:VenueListing;signupUrl?:string;config?:SingHereConfig;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);const [sharing,setSharing]=useState(false);const [message,setMessage]=useState('');
 useEffect(()=>{dialog.current?.showModal();},[]);
 const privateRoom=venue.venueType==='private_room';
 const caption=performanceCaption(venue.venueName);
 const url=location.origin+'/venues/'+venue.slug;
 const candidate=config?.mode==='external'?config.url:config?.mode==='instructions'?undefined:privateRoom?venue.website:signupUrl;
 const safeSignup=candidate&&/^https?:\/\//i.test(candidate)?candidate:undefined;
 async function copy(){try{await navigator.clipboard.writeText(caption+'\n\n'+url);setMessage('Caption and venue link copied.');}catch{setMessage('Select the caption below to copy it.');}}
 async function share(){try{if(navigator.share)await navigator.share({title:'I rocked the mic at '+venue.venueName,text:caption,url});else await copy();}catch(error){if(!(error instanceof Error&&error.name==='AbortError'))setMessage('Sharing could not open. You can copy the caption instead.');}}
 return createPortal(<dialog className="singhere-dialog" ref={dialog} aria-labelledby="singhere-title" onCancel={onClose} onClose={onClose} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
  <button className="singhere-close" aria-label="Close SingHERE" onClick={onClose}>×</button>
  <div className="singhere-eyebrow" style={{display:'flex',alignItems:'center',gap:'10px',flexWrap:'wrap'}}><img src="/images/singhub-v2/singhere-neon-transparent.png" alt="SingHERE" style={{height:'36px',width:'auto',maxWidth:'150px',objectFit:'contain'}} /><span>· {venue.venueName}</span></div>
  <h2 id="singhere-title">{sharing?'You rocked the mic.':config?.title||(privateRoom?'Your own room. Your own mic.':'Ready to sing?')}</h2>
  {sharing?<><p>Review your caption, then choose where to share it.</p><div className="singhere-caption">{caption}</div><div className="singhere-buttons"><button className="singhere-primary" onClick={()=>void share()}>Share performance</button><button onClick={()=>void copy()}>Copy caption</button></div><a className="singhere-text" href={'/account?perform='+encodeURIComponent(venue.slug)}>Record in My SingHUB</a><button className="singhere-text" onClick={()=>setSharing(false)}>Back to signup</button></>:<><p>{config?.instructions||(privateRoom?'Contact the venue to reserve a private karaoke room.':'Sign up with the KJ to get on the singing list.')}</p><p>{privateRoom?'Check room availability, pricing and group size directly with the venue.':'The KJ runs the queue and will let you know when it’s your turn.'}</p>{safeSignup?<a className="singhere-primary" href={safeSignup} target="_blank" rel="noopener noreferrer">{config?.linkLabel||(privateRoom?'Open venue website':'Open online singer signup')} ↗</a>:null}<p className="singhere-note">{privateRoom?'Room bookings are handled by the venue.':'No SingHUB account needed to sign up with the KJ.'}</p><div className="singhere-buttons"><button className="singhere-primary" onClick={onClose}>Got it</button><button onClick={()=>setSharing(true)}>I just sang · Share</button></div></>}
  <p className="singhere-note" role="status">{message}</p>
 </dialog>,document.body);
}
