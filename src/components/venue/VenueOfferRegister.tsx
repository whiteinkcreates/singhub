'use client';
import {useEffect,useState,type FormEvent} from 'react';

export function VenueOfferRegister({venueSlug,venueName}:{venueSlug:string;venueName:string}){
 const storageKey='singhub-register-key:'+venueSlug;
 const [registerKey,setRegisterKey]=useState('');
 const [code,setCode]=useState('');
 const [message,setMessage]=useState('');
 const [pending,setPending]=useState(false);
 const [ready,setReady]=useState(false);

 useEffect(()=>{const timer=window.setTimeout(()=>{setRegisterKey(localStorage.getItem(storageKey)||'');setReady(true);},0);return()=>window.clearTimeout(timer);},[storageKey]);

 function saveKey(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const value=String(new FormData(event.currentTarget).get('registerKey')||'').trim();
  if(value.length<20){setMessage('That register key is not valid.');return;}
  localStorage.setItem(storageKey,value);setRegisterKey(value);setMessage('Register key saved on this device.');
 }

 async function redeem(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setPending(true);setMessage('');
  try{
   const response=await fetch('/api/venue-offers/redeem',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({venueSlug,registerKey,code})});
   const result=await response.json();if(!response.ok)throw new Error(result.error);
   setMessage(result.alreadyRedeemed?result.offer.title+' was already redeemed.':'Redeemed: '+result.offer.title);
   setCode('');
  }catch(error){setMessage(error instanceof Error?error.message:'Offer could not be redeemed.');}
  finally{setPending(false);}
 }

 if(!ready)return <p className="text-slate-400">Opening register…</p>;
 if(!registerKey)return <form onSubmit={saveKey} className="mx-auto max-w-md space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">One-time setup</p><h2 className="text-2xl font-black">Connect this register</h2><p className="text-sm leading-6 text-slate-400">Paste the private register key SingHUB provided to {venueName}. It stays on this device.</p><input name="registerKey" type="password" autoComplete="off" required className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white" placeholder="Private register key"/><button className="w-full rounded-full bg-cyan-300 px-5 py-3 font-black text-slate-950">Save register key</button><p role="status" className="text-sm text-slate-300">{message}</p></form>;

 return <div className="mx-auto max-w-md space-y-5"><form onSubmit={redeem} className="space-y-5 rounded-3xl border border-cyan-300/25 bg-[#07131a] p-6 shadow-2xl shadow-cyan-950/30"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">SingHUB Partner · Register</p><h2 className="mt-2 text-3xl font-black text-white">{venueName}</h2><p className="mt-2 text-sm text-slate-400">Enter the six-digit code shown on the guest’s unlocked SingHUB Offer.</p></div><input aria-label="Six-digit offer code" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,'').slice(0,6))} className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-5 text-center text-4xl font-black tracking-[0.24em] text-cyan-200" placeholder="000000"/><button disabled={pending||code.length!==6} className="w-full rounded-full bg-[#ff2aa3] px-5 py-4 text-lg font-black text-white disabled:opacity-40">{pending?'Redeeming…':'Redeem SingHUB Offer'}</button><p role="status" className="min-h-6 text-center text-sm font-bold text-slate-200">{message}</p></form><button type="button" onClick={()=>{localStorage.removeItem(storageKey);setRegisterKey('');setMessage('');}} className="w-full text-xs font-bold text-slate-500">Disconnect this register</button></div>;
}
