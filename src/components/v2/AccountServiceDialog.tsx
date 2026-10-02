"use client";
import {useEffect,useRef,useState,type FormEvent} from 'react';
import type {VenueListing} from '@/types';
import {accountClient,sendAccountLink} from '@/lib/v2/singerAccount';
import type {useSingerAccount} from './useSingerAccount';
export function AccountServiceDialog({state,venues,request,onClose,onMessage}:{state:ReturnType<typeof useSingerAccount>;venues:VenueListing[];request:'alias'|'signin'|'performance'|null;onClose:()=>void;onMessage:(message:string)=>void}){
 const dialog=useRef<HTMLDialogElement>(null);const [pending,setPending]=useState(false);const handled=useRef('');const [message,setMessage]=useState('');const [sent,setSent]=useState(false);
 useEffect(()=>{if(!request)return;queueMicrotask(()=>{setSent(false);setMessage(new URLSearchParams(location.search).has('authError')?'Your sign-in link expired or could not be completed. Request a new link and open it in the browser where you started.':'');});},[request]);
 useEffect(()=>{if(request)dialog.current?.showModal();else dialog.current?.close();},[request]);
 useEffect(()=>{const params=new URLSearchParams(location.search);const slug=params.get('save');if(!slug||!state.user||!state.account||handled.current===slug)return;const venue=venues.find(venue=>venue.slug===slug);if(!venue)return;handled.current=slug;
  void accountClient().from('singer_saved_venues').upsert({user_id:state.user.id,venue_slug:venue.slug,venue_name:venue.venueName,neighborhood:venue.neighborhood}).then(async({error})=>{if(error){handled.current='';onMessage(error.message);return;}history.replaceState({},'',location.pathname);onMessage(venue.venueName+' saved.');onClose();await state.refresh();});
 },[state,venues,onMessage,onClose]);
 const signedIn=Boolean(state.user);
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const form=new FormData(event.currentTarget);setPending(true);setMessage('');try{
  if(!state.user){await sendAccountLink(String(form.get('email')||''),location.pathname+location.search);setSent(true);setMessage('Check your email for your sign-in link. Open it in this browser to finish. Check spam if it does not arrive.');return;}
  const client=accountClient();if(request==='alias'){const {error}=await client.from('singer_profiles').upsert({user_id:state.user.id,karaoke_alias:String(form.get('alias')||'').trim()||null,updated_at:new Date().toISOString()});if(error)throw error;onMessage('Karaoke alias saved.');}
  if(request==='performance'){
   const slug=new URLSearchParams(location.search).get('perform');const venue=venues.find(venue=>venue.slug===slug);if(!venue)throw new Error('Choose SingHERE from a venue to record this performance.');
   const {error}=await client.from('singer_performances').insert({user_id:state.user.id,song_title:String(form.get('song')||'').trim(),artist:String(form.get('artist')||'').trim()||null,venue_slug:venue.slug,venue_name:venue.venueName,performed_on:String(form.get('date')||'')});if(error)throw error;history.replaceState({},'',location.pathname);onMessage('Performance recorded.');
  }
  await state.refresh();onClose();
 }catch(error){const message=error instanceof Error?error.message:'Your account could not be updated.';setMessage(message);onMessage(message);}finally{setPending(false);}}
 return <dialog className="account-service-dialog" ref={dialog} aria-labelledby="account-action-title" onCancel={onClose}><div className="modal-shell"><header className="modal-head"><strong id="account-action-title">{signedIn?(request==='performance'?'Record your performance':'Karaoke alias'):'Sign in to My SingHUB'}</strong><button className="icon-button" aria-label="Close account action" onClick={onClose}>×</button></header><form className="panel account-service-form" onSubmit={submit}>
 {!signedIn?<label>Email address<input className="account-service-input" name="email" type="email" autoComplete="email" required /></label>:request==='performance'?<><label>Song title<input className="account-service-input" name="song" maxLength={180} required /></label><label>Artist<input className="account-service-input" name="artist" maxLength={180} /></label><label>Performed on<input className="account-service-input" name="date" type="date" required /></label></>:<label>Karaoke alias<input className="account-service-input" name="alias" defaultValue={state.account?.alias||''} maxLength={40} /></label>}
 <button className="button primary" disabled={pending||(!signedIn&&sent)}>{pending?'Working…':signedIn?'Save':sent?'Link sent · Check your email':'Email my sign-in link'}</button>{!signedIn&&sent&&<button className="text-button" type="button" onClick={()=>{setSent(false);setMessage('Update your email address below, then request a new link.');}}>Use a different email</button>}<p className="free-rule" role="status">{message||(signedIn?'Saved privately to your SingHUB account.':'Confirm the email link before anything is saved.')}</p>
 </form></div></dialog>;
}
