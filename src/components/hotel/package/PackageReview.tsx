'use client';
import {useState,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import type {HotelPackage} from '@/lib/hotelPackage.server';
export function PackageReview({model}:{model:HotelPackage}){
 const router=useRouter();const previous=model.profile?.packageReview;
 const [heroApproved,setHeroApproved]=useState(Boolean(previous?.heroApproved&&previous.heroImageUrl===model.hotel.heroImageUrl));
 const [brandApproved,setBrandApproved]=useState(Boolean(previous?.brandApproved&&previous.brandLogoUrl===(model.config.brandLogoUrl||'')));
 const [rightsNote,setRightsNote]=useState(previous?.rightsNote||model.profile?.usageRights||'');const [brandNote,setBrandNote]=useState(previous?.brandNote||'');
 const [pending,setPending]=useState(false);const [message,setMessage]=useState('');
 async function save(event:FormEvent){event.preventDefault();setPending(true);setMessage('');try{
  const profile={...(model.profile||{}),heroImageUrl:model.hotel.heroImageUrl||'',heroAlt:model.hotel.heroAlt||model.hotel.name+' property photograph',imageSource:model.profile?.imageSource||model.hotel.heroCredit?.sourceUrl||model.config.hotelSiteUrl||'',usageRights:rightsNote,heroPlacement:model.hotel.heroPlacement,heroPosition:model.hotel.heroPosition,
   packageReview:{heroImageUrl:model.hotel.heroImageUrl||'',heroApproved,brandLogoUrl:model.config.brandLogoUrl||'',brandApproved,rightsNote,brandNote,reviewedAt:new Date().toISOString()}};
  const response=await fetch('/api/admin/hotel-profiles',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug:model.hotel.slug,profile})});const payload=await response.json();if(!response.ok)throw new Error(payload.error||'Review was not saved.');setMessage('Review saved. Export availability refreshed.');router.refresh();
 }catch(error){setMessage(error instanceof Error?error.message:'Review was not saved.');}finally{setPending(false);}}
 return <form onSubmit={save} className="package-review"><h2>Asset review</h2><p>Source availability is not permission. Record approval before exporting production collateral. Changing the selected image or logo invalidates its matching approval.</p><fieldset disabled={pending||model.readFailed||!model.hotel.heroImageUrl}><label><input type="checkbox" checked={heroApproved} onChange={event=>setHeroApproved(event.target.checked)}/> Property photo cleared for public display and printed collateral</label><label>Photo permission or license evidence<textarea value={rightsNote} required={heroApproved} maxLength={2000} onChange={event=>setRightsNote(event.target.value)} placeholder="Who approved it, when, and any conditions"/></label><label><input type="checkbox" checked={brandApproved} onChange={event=>setBrandApproved(event.target.checked)}/> Hotel logo and custom theme reviewed for Concierge collateral</label><label>Branding approval or source notes<textarea value={brandNote} required={brandApproved} maxLength={2000} onChange={event=>setBrandNote(event.target.value)} placeholder="Record logo permission and palette approval. Do not claim official brand standards without evidence."/></label><button type="submit">{pending?'Saving…':'Save asset review'}</button></fieldset><p role="status">{model.readFailed?'Saved media could not be read. Reload before saving any review.':message}</p></form>;
}
