"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {VenueMediaLibrary} from "@/components/admin/VenueMediaLibrary";
import {SITE_DISCOVERY_HERO_KEY,SITE_VENUES_HERO_KEY,SITE_ACCOUNT_HERO_KEY,SITE_SINGBOARD_HERO_KEY,SITE_BACKYARD_HERO_KEY,type HostMediaSettings} from "@/lib/hostMedia";
const targets=[
 {key:SITE_DISCOVERY_HERO_KEY,label:"Discover",path:"/",fallback:"/images/singhub-v2/singhub-city-discovery.webp"},
 {key:SITE_VENUES_HERO_KEY,label:"Venues",path:"/find-karaoke",fallback:"/images/singhub-v2/singhub-venues-alley.webp"},
 {key:SITE_ACCOUNT_HERO_KEY,label:"My SingHUB",path:"/account",fallback:"/images/singhub-v2/my-singhub-backstage-crowd-v2.png"},
 {key:SITE_SINGBOARD_HERO_KEY,label:"SingBOARD",path:"/singboard",fallback:"/images/singboard/singboard-sticker-wall.webp"},
 {key:SITE_BACKYARD_HERO_KEY,label:"The Backyard",path:"/backyard",fallback:"/images/singhub-v2/singhub-venues-alley.webp"}];
const input="block w-full rounded-lg border border-white/20 bg-slate-950 p-3 text-white";
export function MainHeroEditor(){
 const [key,setKey]=useState<string>(SITE_DISCOVERY_HERO_KEY);
 const [profile,setProfile]=useState<HostMediaSettings>({});
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[dirty,setDirty]=useState(false),[message,setMessage]=useState("");
 const page=targets.find(t=>t.key===key)||targets[0];
 useEffect(()=>{const controller=new AbortController();fetch("/api/admin/host-profiles?slug="+encodeURIComponent(key),{cache:"no-store",signal:controller.signal}).then(async response=>{const json=await response.json();if(!response.ok)throw Error(json.error||"Load failed");if(!controller.signal.aborted){setProfile(json.profile||{});setDirty(false);setMessage("");}}).catch(e=>{if(!controller.signal.aborted)setMessage(String(e));}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();},[key]);
 const edit=(patch:Partial<HostMediaSettings>)=>{setProfile(current=>({...current,...patch}));setDirty(true);};
 async function save(){setSaving(true);try{const response=await fetch("/api/admin/host-profiles",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug:key,profile:{...profile,heroAlt:profile.heroUrl?(profile.heroAlt||page.label+" hero"):""}})});const json=await response.json();if(!response.ok)throw Error(json.error||"Save failed");setProfile(json.profile);setDirty(false);setMessage("Saved. Review the public page.");}catch(error){setMessage(error instanceof Error?error.message:"Save failed");}finally{setSaving(false);}}
 return <main className="mx-auto max-w-6xl px-4 py-10 text-white"><Link href="/admin" className="text-cyan-300">← Admin</Link><h1 className="mt-5 text-4xl font-black">Main page heroes</h1><p className="mt-3 text-slate-300">Edit the main page images. Host and venue profiles are separate.</p>
 <label className="mt-5 block">Page<select className={input} value={key} onChange={e=>{if(dirty&&!confirm("Discard unsaved image?"))return;setLoading(true);setKey(e.target.value);}}>{targets.map(t=><option key={t.key} value={t.key}>{t.label}</option>)}</select></label>
 <fieldset disabled={loading||saving} className="mt-5 space-y-5 disabled:opacity-50">
 <VenueMediaLibrary key={key} kind="site" slug={key} allowPortrait={false} heroUrl={profile.heroUrl||page.fallback} heroAlt={profile.heroAlt||page.label+" hero"} heroPosition={profile.heroPosition||"center"} heroPlacement={profile.heroPlacement} logoUrl="" logoAlt="" gallery={[]} onHeroChange={heroUrl=>edit({heroUrl,heroAlt:profile.heroAlt||page.label+" hero"})} onHeroPositionChange={heroPosition=>edit({heroPosition})} onHeroPlacementChange={heroPlacement=>edit({heroPlacement})} onLogoPlacementChange={()=>{}} onLogoChange={()=>{}} onGalleryChange={()=>{}} />
 <label className="block">Image description<input className={input} maxLength={300} value={profile.heroAlt||""} onChange={e=>edit({heroAlt:e.target.value})}/></label>
 <label className="block">Image source<input className={input} value={profile.imageSource||""} onChange={e=>edit({imageSource:e.target.value})}/></label>
 <label className="block">Usage rights notes<textarea className={input} value={profile.usageRights||""} onChange={e=>edit({usageRights:e.target.value})}/></label>
 <details><summary>Paste external image URL</summary><input className={input} value={profile.heroUrl||""} onChange={e=>edit({heroUrl:e.target.value})}/></details>
 <div className="flex gap-4 flex-wrap"><button type="button" onClick={()=>edit({heroUrl:"",heroAlt:"",heroPosition:"center",heroPlacement:undefined})}>Restore default</button><button type="button" disabled={!dirty||saving} onClick={()=>void save()} className="rounded-lg bg-cyan-300 px-5 py-3 font-bold text-black">Save hero</button><Link href={page.path} target="_blank" className="text-cyan-300">Preview page ↗</Link></div>
 </fieldset><p role="status" className="mt-4 text-cyan-100">{loading?"Loading…":message}</p></main>;
}
