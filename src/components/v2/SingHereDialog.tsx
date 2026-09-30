"use client";
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {VenueListing} from '@/types';

export function performanceCaption(venueName:string){
 return 'I just rocked the mic at '+venueName+'! 🎤\n\nYour turn. Find your next karaoke night on SingHUB.';
}
export function SingHereDialog({venue,signupUrl,onClose}:{venue:VenueListing;signupUrl?:string;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);const [sharing,setSharing]=useState(false);const [message,setMessage]=useState('');
 useEffect(()=>{dialog.current?.showModal();},[]);
 const caption=performanceCaption(venue.venueName);
 const url=location.origin+'/venues/'+venue.slug;
 const safeSignup=signupUrl&&/^https?:\/\//i.test(signupUrl)?signupUrl:undefined;
 async function copy(){try{await navigator.clipboard.writeText(caption+'\n\n'+url);setMessage('Caption and venue link copied.');}catch{setMessage('Select the caption below to copy it.');}}
 async function share(){try{if(navigator.share)await navigator.share({title:'I rocked the mic at '+venue.venueName,text:caption,url});else await copy();}catch(error){if(!(error instanceof Error&&error.name==='AbortError'))setMessage('Sharing could not open. You can copy the caption instead.');}}
 return createPortal(<dialog className="singhere-dialog" ref={dialog} aria-labelledby="singhere-title" onCancel={onClose} onClose={onClose} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
  <button className="singhere-close" aria-label="Close SingHERE" onClick={onClose}>×</button>
  <p className="singhere-eyebrow">SingHERE · {venue.venueName}</p>
  <h2 id="singhere-title">{sharing?'You rocked the mic.':'Ready to sing?'}</h2>
  {sharing?<><p>Review your caption, then choose where to share it.</p><div className="singhere-caption">{caption}</div><div className="singhere-buttons"><button className="singhere-primary" onClick={()=>void share()}>Share performance</button><button onClick={()=>void copy()}>Copy caption</button></div><button className="singhere-text" onClick={()=>setSharing(false)}>Back to signup</button></>:<><p>Sign up with the KJ to get on the singing list.</p><p>The KJ runs the queue and will let you know when it’s your turn.</p>{safeSignup?<a className="singhere-primary" href={safeSignup} target="_blank" rel="noopener noreferrer">Open online singer signup ↗</a>:null}<p className="singhere-note">No SingHUB account needed to sign up with the KJ.</p><div className="singhere-buttons"><button className="singhere-primary" onClick={onClose}>Got it</button><button onClick={()=>setSharing(true)}>I just sang · Share</button></div></>}
  <p className="singhere-note" role="status">{message}</p>
 </dialog>,document.body);
}
