"use client";
import { useCallback,useEffect,useRef,useState,type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { VenueMap } from '@/components/map/VenueMap';
import { createClient } from '@/lib/supabase/client';
import type { KaraokeEventListing,VenueListing } from '@/types';
import { toCanvas } from 'html-to-image';
import type {SingHereConfig} from '@/lib/venueEnhancements';
import { SingHereDialog } from './SingHereDialog';
import { accountClient } from '@/lib/v2/singerAccount';

function useViewer(){
 const [viewer,setViewer]=useState<{name:string;initials:string}>({name:'Your account',initials:'SH'});
 useEffect(()=>{
  if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)return;
  const client=createClient();let active=true;
  const update=(user:{user_metadata?:Record<string,unknown>}|null)=>{if(!active)return;const name=typeof user?.user_metadata?.full_name==='string'?user.user_metadata.full_name:typeof user?.user_metadata?.name==='string'?user.user_metadata.name:'Your account';setViewer({name,initials:name==='Your account'?'SH':name.split(/\s+/).map(part=>part[0]).slice(0,2).join('').toUpperCase()});};
  client.auth.getUser().then(({data})=>update(data.user)).catch(()=>{});
  const {data}=client.auth.onAuthStateChange((_event,session)=>update(session?.user||null));
  return()=>{active=false;data.subscription.unsubscribe();};
 },[]);return viewer;
}
export function useViewerName(){return useViewer().name;}
export function useViewerInitials(){return useViewer().initials;}

export function useV2Actions(root:RefObject<HTMLDivElement|null>,options:{venue?:VenueListing;events?:KaraokeEventListing[];venues?:VenueListing[];singerSignupUrl?:string;singHere?:SingHereConfig;mapTitle?:string;userLocation?:{latitude:number;longitude:number}|null}={}){
 const mapDialog=useRef<HTMLDialogElement>(null);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);const [mapOpen,setMapOpen]=useState(false);const [singHereOpen,setSingHereOpen]=useState(false);
 // This callback reads the ref at click time, preserving the source toast behavior.
 // eslint-disable-next-line react-hooks/preserve-manual-memoization
 const toast=useCallback((message:string)=>{const el=root.current?.querySelector<HTMLElement>('.toast');if(!el)return;el.textContent=message;el.classList.add('show');if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>el.classList.remove('show'),2200);},[root]);
 useEffect(()=>{
  const node=root.current;if(!node)return;
  const listener=async(event:MouseEvent)=>{
   const target=(event.target as Element).closest<HTMLElement>('button,a');if(!target||!node.contains(target))return;
   const message=target.dataset.toast||'';const label=target.textContent?.trim()||'';
   if(target.tagName==='A'&&target.getAttribute('href')==='#')event.preventDefault();
   if(/install/i.test(label)||target.id==='install-button'){window.dispatchEvent(new Event('singhub:request-install'));return;}
   if(/map view/i.test(label+' '+message)){setMapOpen(true);return;}
   if(/directions/i.test(message+' '+label)&&options.venue){window.open('https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(options.venue.address||options.venue.venueName),'_blank','noopener,noreferrer');return;}
   if(/calendar/i.test(message+' '+label)&&options.venue){const response=await fetch('/api/v2/calendar?venue='+encodeURIComponent(options.venue.slug));if(!response.ok){toast('No confirmed calendar event is available.');return;}download(await response.blob(),options.venue.slug+'.ics');return;}
   if(/Open board/i.test(label)){window.location.assign('/singboard');return;}
   if(target.id==='copy-button'){try{const caption=node.querySelector<HTMLElement>('.caption');await navigator.clipboard.writeText((caption?.textContent||'Find your karaoke night on SingHUB.')+(caption?.dataset.shareUrl?'\n\n'+location.origin+caption.dataset.shareUrl:''));toast('Caption copied');}catch{toast('Select the caption to copy it');}return;}
   if(/share/i.test(message)||target.id==='share-button'){
    const text=node.querySelector('.caption')?.textContent||'Find '+(options.venue?.venueName||'your karaoke night')+' on SingHUB.';const sharePath=node.querySelector<HTMLElement>('.caption')?.dataset.shareUrl;const url=options.venue?location.origin+'/venues/'+options.venue.slug:sharePath?location.origin+sharePath:location.origin;
    try{if(navigator.share)await navigator.share({title:options.venue?.venueName||'SingHUB',text,url});else{await navigator.clipboard.writeText(text+' '+url);toast('Caption and link copied');}}catch(error){if(!(error instanceof Error&&error.name==='AbortError'))toast('Sharing could not open.');}return;
   }
   if(/export/i.test(message+' '+label)&&node.querySelector('.jacket-layer')){
    try{const jacket=node.querySelector<HTMLElement>('#jacket-zoom .jacket-layer')||node.querySelector<HTMLElement>('.jacket-layer')!;const rendered=await toCanvas(jacket,{pixelRatio:3,backgroundColor:'transparent'});const canvas=document.createElement('canvas');canvas.width=canvas.height=1080;const context=canvas.getContext('2d');if(!context)throw new Error('Export unavailable');const scale=Math.min(canvas.width/rendered.width,canvas.height/rendered.height);const width=rendered.width*scale,height=rendered.height*scale;context.drawImage(rendered,(canvas.width-width)/2,(canvas.height-height)/2,width,height);const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='my-singhub-jacket.png';a.click();toast('Jacket image downloaded');}catch{toast('The jacket image could not be exported.');}return;
   }
   if(/SingHERE/i.test(message+' '+target.getAttribute('aria-label')+' '+label)&&options.venue){setSingHereOpen(true);return;}
   if((/Venue saved|Save venue/i.test(message)||label==='Save')&&options.venue){
    try{const client=accountClient();const {data,error}=await client.auth.getUser();if(error&&error.name!=='AuthSessionMissingError')throw error;if(!data.user){window.location.assign('/account?save='+encodeURIComponent(options.venue.slug));return;}const result=await client.from('singer_saved_venues').upsert({user_id:data.user.id,venue_slug:options.venue.slug,venue_name:options.venue.venueName,neighborhood:options.venue.neighborhood});if(result.error)throw result.error;toast('Venue saved');}catch(error){toast(error instanceof Error?error.message:'This venue was not saved.');}return;
   }
   if(target.dataset.accountAction)return;
   if(/Singer Tools|All 10/i.test(message)){toast('Songbook and setlist services are not connected yet.');return;}
   if(message)toast(/opened|prepared|saved/i.test(message)?'This feature is not connected yet.':message);
  };
  node.addEventListener('click',listener);return()=>{node.removeEventListener('click',listener);if(timer.current)clearTimeout(timer.current);};
 },[root,toast,options.venue,options.events,options.venues]);
 const overlay=mapOpen&&typeof document!=='undefined'?createPortal(<dialog ref={mapDialog} className="fixed inset-0 z-[100] m-0 h-[100dvh] max-h-none w-full max-w-none overflow-y-auto bg-slate-950/95 p-4 text-white" aria-label="Karaoke map" onCancel={()=>setMapOpen(false)}><button className="mb-4 rounded border border-white/30 px-5 py-3" autoFocus onClick={()=>setMapOpen(false)}>Close map</button><VenueMap venues={options.venues|| (options.venue?[options.venue]:[])} title={options.mapTitle||(options.venue?options.venue.venueName+' on the map':undefined)} userLocation={options.userLocation} /></dialog>,document.body):null;
 useEffect(()=>{if(!mapOpen)return;mapDialog.current?.showModal();const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setMapOpen(false);};document.addEventListener('keydown',escape);return()=>document.removeEventListener('keydown',escape);},[mapOpen]);
 return {toast,overlay:<>{overlay}{singHereOpen&&options.venue?<SingHereDialog venue={options.venue} signupUrl={options.singerSignupUrl} config={options.singHere} onClose={()=>setSingHereOpen(false)} />:null}</>};
}
function download(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
