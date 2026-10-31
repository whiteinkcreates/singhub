"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { uniqueIdentityMatch, type FlyerFields } from "@/lib/singboard/flyerExtraction";
import type { PersistedSingBoardPost, SingBoardRegion, SingBoardPostType } from "@/lib/singboard/repository";

export type VenueChoice = { slug:string; name:string; neighborhood:string; region:SingBoardRegion };
export type HostChoice = { id:string; slug:string; name:string; otherName:string };
type Listing = PersistedSingBoardPost & { hostSlug?:string };

const REGIONS: {value:"all"|SingBoardRegion;label:string}[] = [
  {value:"all",label:"All San Diego"}, {value:"central",label:"Central"},
  {value:"downtown",label:"Downtown"}, {value:"beach",label:"Beach Areas"},
  {value:"east-county",label:"East County"}, {value:"north-county",label:"North County"},
  {value:"south-bay",label:"South Bay"},
];
const CATEGORIES = [
  {value:"special_event",label:"Special event"}, {value:"theme_karaoke",label:"Theme karaoke"},
  {value:"hiring",label:"Hiring / wanted"}, {value:"community",label:"Community"},
  {value:"notice",label:"Announcement"},
];
const dayString = (date:string) => {
  if (!date) return "Date TBA";
  return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"}).format(new Date(date+"T12:00:00Z"));
};
const localToday = () => { const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Los_Angeles",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));return `${values.year}-${values.month}-${values.day}`; };

function EventCard({post,featured=false}:{post:Listing;featured?:boolean}) {
  const isNote = post.postType !== "image" || !post.imageUrl;
  const archived = post.eventDate < localToday();
  return <article className={`overflow-hidden rounded-2xl border border-white/15 bg-[#101522] shadow-[0_12px_35px_rgba(0,0,0,.25)] ${featured?"md:grid md:grid-cols-[.9fr_1.1fr]":""}`}>
    <Link href={`/events/${post.id}`} className={`group relative flex min-h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-[#142335] via-[#190e25] to-[#080e18] ${featured?"min-h-60":""}`}>
      {!isNote?<img src={post.imageUrl} alt={post.title+" event flyer"} loading="lazy" className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.025]" />:
        <div className="mx-5 my-6 -rotate-1 border border-white/15 bg-black/30 px-6 py-10 text-center shadow-xl">
          <span className="text-xs font-black uppercase tracking-[.3em] text-fuchsia-300">SINGBOARD</span>
          <p className="mt-3 text-3xl font-black uppercase leading-tight tracking-tight text-white">{post.title}</p>
        </div>}
      {featured&&<span className="absolute left-3 top-3 rotate-[-3deg] bg-fuchsia-500 px-3 py-1 text-xs font-black uppercase text-white">Featured on the Board</span>}
    </Link>
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[.13em] text-cyan-300">{post.category?.replaceAll("_"," ")||"Karaoke event"}</p>
        <time dateTime={post.eventDate} className="shrink-0 rounded-md border border-white/15 bg-black/40 px-2 py-1 text-xs font-bold text-slate-200">{dayString(post.eventDate)}</time>
      </div>
      <Link href={`/events/${post.id}`} className="text-xl font-black leading-tight text-white hover:text-cyan-200">{post.title}</Link>
      <div className="space-y-1 text-sm text-slate-300">
        {post.venueSlug?<Link className="block font-semibold text-cyan-200 underline-offset-4 hover:underline" href={`/venues/${post.venueSlug}`}>📍 {post.venue}</Link>:<p>📍 {post.venue}</p>}
        {post.neighborhood&&<p className="text-xs text-slate-400">{post.neighborhood}</p>}
        {post.startTime&&<p>◷ {post.startTime}</p>}
        {post.hostName&&<p>🎤 {post.hostSlug?<Link href={`/hosts/${post.hostSlug}`} className="text-cyan-200 underline-offset-4 hover:underline">{post.hostName}</Link>:post.hostName}</p>}
      </div>
      {post.detail&&<p className={`text-sm leading-relaxed text-slate-300 ${featured?"line-clamp-4":"line-clamp-2"}`}>{post.detail}</p>}
      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <span className="text-[11px] font-medium text-slate-400">{archived?"Past event":post.reviewStatus==="verified"?"Reviewed by SingHUB":"Community submission"}</span>
        <Link className="rounded-full border border-cyan-400/50 px-4 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-400/10" href={`/events/${post.id}`}>Details →</Link>
      </div>
    </div>
  </article>;
}

type FormFields = {
  title:string; venueName:string; neighborhood:string; region:SingBoardRegion;
  eventDate:string; startTime:string; hostName:string; linkUrl:string; detail:string;
  venueSlug:string; hostId:string; category:string; noteText:string;
};
const blank:FormFields = {title:"",venueName:"",neighborhood:"",region:"central",eventDate:"",startTime:"",hostName:"",linkUrl:"",detail:"",venueSlug:"",hostId:"",category:"special_event",noteText:""};

export function LivingSingBoard({initialFlyers,venues,hosts}:{initialFlyers:Listing[];venues:VenueChoice[];hosts:HostChoice[]}) {
  const [posts,setPosts] = useState(initialFlyers);
  const [filter,setFilter] = useState("all");
  const [region,setRegion] = useState<"all"|SingBoardRegion>("all");
  const [query,setQuery] = useState("");
  const [period,setPeriod] = useState("all");
  const [posting,setPosting] = useState(false);
  const [working,setWorking] = useState(false);
  const [reading,setReading] = useState(false);
  const [message,setMessage] = useState("");
  const [code,setCode] = useState("");
  const [type,setType] = useState<SingBoardPostType>("image");
  const [fields,setFields] = useState<FormFields>(blank);
  const [file,setFile] = useState<File|null>(null);
  const [preview,setPreview] = useState("");
  const [foundDates,setFoundDates] = useState<string[]>([]);
  const [suggestedVenue,setSuggestedVenue] = useState<VenueChoice|undefined>();
  const [suggestedHost,setSuggestedHost] = useState<HostChoice|undefined>();
  const [published,setPublished] = useState<string|null>(null);
  const set = <K extends keyof FormFields>(key:K,value:FormFields[K]) => setFields(current=>({...current,[key]:value}));

  useEffect(()=>()=>{ if(preview)URL.revokeObjectURL(preview); },[preview]);

  const filtered = useMemo(()=>{
    const today=localToday();
    const end=new Date(today+"T12:00:00Z");
    if(period==="week")end.setUTCDate(end.getUTCDate()+7);
    if(period==="month")end.setUTCDate(end.getUTCDate()+30);
    const until=end.toISOString().slice(0,10);
    return posts.filter(post=>{
      if(region!=="all"&&post.region!==region)return false;
      if(period!=="all"&&(post.eventDate<today||post.eventDate>until))return false;
      if(filter==="events"&&(!["special_event","theme_karaoke"].includes(post.category||"special_event")||post.postType==="wanted"))return false;
      if(filter==="meetups"&&!/monthly mic|meetup/i.test(post.title))return false;
      if(filter==="kjs"&&!(post.hostId||post.category==="hiring"))return false;
      if(filter==="community"&&!["community","notice","hiring"].includes(post.category||""))return false;
      const haystack=[post.title,post.venue,post.neighborhood,post.hostName,post.detail].join(" ").toLowerCase();
      return haystack.includes(query.toLowerCase().trim());
    }).sort((a,b)=>a.eventDate.localeCompare(b.eventDate)||a.title.localeCompare(b.title));
  },[posts,region,period,filter,query]);
  const spotlight=filtered.find(post=>/monthly mic #001/i.test(post.title))||filtered[0];
  const rest=filtered.filter(post=>post.id!==spotlight?.id);
  const notes=rest.filter(post=>post.postType!=="image");
  const flyers=rest.filter(post=>post.postType==="image");

  function pickFile(nextFile:File|null) {
    setFile(nextFile);setPreview(nextFile?URL.createObjectURL(nextFile):"");
    setFoundDates([]);setSuggestedHost(undefined);setSuggestedVenue(undefined);setMessage("");
  }
  async function readFlyer() {
    if(!file||!code.trim()){setMessage("Choose a flyer and enter your SingBOARD posting code first.");return;}
    setReading(true);setMessage("");
    try {
      const form=new FormData();form.append("file",file);form.append("accessCode",code);
      const response=await fetch("/api/singboard/extract",{method:"POST",body:form});
      const result=await response.json() as {fields?:FlyerFields;error?:string};
      if(!response.ok||!result.fields)throw new Error(result.error||"Could not read flyer.");
      const extracted=result.fields;
      setFields(current=>({...current,title:extracted.title||current.title,venueName:extracted.venueName||current.venueName,neighborhood:extracted.neighborhood||current.neighborhood,
        eventDate:extracted.eventDates[0]||current.eventDate,startTime:extracted.startTime||current.startTime,hostName:extracted.hostName||current.hostName,
        detail:extracted.detail||current.detail,linkUrl:extracted.linkUrl||current.linkUrl,venueSlug:"",hostId:""}));
      setFoundDates(extracted.eventDates);
      setSuggestedVenue(uniqueIdentityMatch(extracted.venueName,venues,v=>[v.name]));
      setSuggestedHost(uniqueIdentityMatch(extracted.hostName,hosts,h=>[h.name,h.otherName]));
      setMessage("Flyer read. Check every detail and confirm any profile matches before publishing.");
    } catch(error) { setMessage(error instanceof Error?error.message:"Could not read the flyer."); }
    finally {setReading(false);}
  }

  function linkVenue(slug:string) {
    const found=venues.find(venue=>venue.slug===slug);
    if(found){setFields(current=>({...current,venueSlug:found.slug,venueName:found.name,neighborhood:found.neighborhood,region:found.region}));setSuggestedVenue(undefined);}
    else set("venueSlug","");
  }
  function linkHost(id:string) {
    const found=hosts.find(host=>host.id===id);
    if(found){setFields(current=>({...current,hostId:found.id,hostName:found.name}));setSuggestedHost(undefined);}
    else set("hostId","");
  }
  async function publish(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();setWorking(true);setMessage("");
    try {
      if(type==="image"&&!file)throw new Error("Choose a flyer image.");
      const form=new FormData();
      form.append("accessCode",code);
      form.append("postType",type);
      for(const [key,value] of Object.entries(fields))form.append(key,value);
      if(type==="image"&&file)form.append("file",file);
      if(type==="note")form.append("noteColor","yellow");
      const response=await fetch("/api/singboard/publish",{method:"POST",body:form});
      const result=await response.json() as {id?:string;imageUrl?:string;venueSlug?:string;hostId?:string;error?:string};
      if(!response.ok||!result.id)throw new Error(result.error||"Publish failed.");
      const entry:Listing={
        id:result.id,postType:type,title:fields.title,venue:fields.venueName,neighborhood:fields.neighborhood,region:fields.region,
        detail:fields.detail,x:0,y:0,rotation:0,eventDate:fields.eventDate,startTime:fields.startTime,hostName:fields.hostName,
        linkUrl:fields.linkUrl,imageUrl:result.imageUrl,noteText:fields.noteText,noteColor:"yellow",pinned:true,
        venueSlug:result.venueSlug,hostId:result.hostId,hostSlug:hosts.find(host=>host.id===result.hostId)?.slug,
        category:fields.category,reviewStatus:"pending",
      };
      setPosts(current=>[entry,...current]);setPublished(`/events/${result.id}`);
      setMessage("Published to SingBOARD. Copy the event link below.");
      setFile(null);setFoundDates([]);setSuggestedVenue(undefined);setSuggestedHost(undefined);setFields(blank);
    } catch(error) {setMessage(error instanceof Error?error.message:"Publish failed.");}
    finally {setWorking(false);}
  }

  const inputClass="w-full rounded-xl border border-white/20 bg-[#0a1120] px-3 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none";
  const labelClass="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-300";

  return <div className="space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">On the Board</h2><p className="mt-1 text-sm text-slate-400">Real events. Real karaoke people. Find your next night.</p></div>
      <button type="button" onClick={()=>setPosting(value=>!value)} className="rounded-full bg-fuchsia-500 px-5 py-3 text-sm font-black text-white shadow-[0_0_25px_rgba(236,72,153,.25)] hover:bg-fuchsia-400">{posting?"Close posting tools":"+ Post a flyer or note"}</button>
    </div>
    {posting&&<form onSubmit={publish} className="space-y-4 rounded-3xl border border-fuchsia-400/35 bg-[#101020] p-4 shadow-xl sm:p-6" aria-label="Post to SingBOARD">
      <div><h3 className="text-xl font-black text-white">Post to SingBOARD</h3><p className="text-sm text-slate-400">Upload, auto-fill, review, publish. Your original artwork stays intact.</p></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label><span className={labelClass}>Posting code</span><input className={inputClass} type="password" autoComplete="off" required value={code} onChange={event=>setCode(event.target.value)} placeholder="Your contributor code"/></label>
        <label><span className={labelClass}>Post type</span><select className={inputClass} value={type} onChange={event=>{const next=event.target.value as SingBoardPostType;setType(next);set("category",next==="wanted"?"hiring":next==="note"?"community":"special_event");}}><option value="image">Event flyer</option><option value="note">Community note</option><option value="wanted">Hiring / wanted</option></select></label>
      </div>
      {type==="image"&&<div className="rounded-2xl border border-dashed border-cyan-400/35 bg-black/20 p-4">
        <label className={labelClass} htmlFor="singboard-new-flyer">Flyer image (JPG, PNG or WebP, max 10 MB)</label>
        <input id="singboard-new-flyer" type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>pickFile(event.target.files?.[0]||null)} className="block w-full text-sm text-slate-200 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-300 file:px-3 file:py-2 file:font-bold file:text-slate-950"/>
        {preview&&<img src={preview} className="mt-3 max-h-64 rounded-lg object-contain" alt="Preview of selected flyer"/>}
        <button type="button" disabled={!file||reading} onClick={readFlyer} className="mt-3 rounded-lg border border-cyan-300/60 px-4 py-2 text-sm font-bold text-cyan-200 disabled:opacity-50">{reading?"Reading flyer…":"✦ Read flyer and auto-fill"}</button>
        <p className="mt-2 text-xs text-slate-400">AI suggestions are never published without your review. If unavailable, use the manual fields below.</p>
      </div>}
      {foundDates.length>1&&<div className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">This flyer mentions {foundDates.length} dates: {foundDates.map(dayString).join(", ")}. Choose the date for this post. Each date currently needs its own event listing.</div>}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2"><span className={labelClass}>Title</span><input className={inputClass} value={fields.title} onChange={event=>set("title",event.target.value)} required maxLength={160} placeholder="Event title"/></label>
        <label><span className={labelClass}>Date / visible until</span><input className={inputClass} type="date" value={fields.eventDate} onChange={event=>set("eventDate",event.target.value)} required/></label>
        <label><span className={labelClass}>Start / meetup time</span><input className={inputClass} value={fields.startTime} onChange={event=>set("startTime",event.target.value)} placeholder="e.g. 7:30 PM"/></label>
        <label><span className={labelClass}>Venue / location</span><input className={inputClass} value={fields.venueName} onChange={event=>{set("venueName",event.target.value);set("venueSlug","");}} required placeholder="Venue name"/></label>
        <label><span className={labelClass}>Neighborhood</span><input className={inputClass} value={fields.neighborhood} onChange={event=>set("neighborhood",event.target.value)} required placeholder="Neighborhood"/></label>
        <label><span className={labelClass}>Link to Venue Index profile (optional)</span><select className={inputClass} value={fields.venueSlug} onChange={event=>linkVenue(event.target.value)}><option value="">Not linked</option>{venues.map(venue=><option key={venue.slug} value={venue.slug}>{venue.name} · {venue.neighborhood}</option>)}</select></label>
        <label><span className={labelClass}>Host / KJ (optional)</span><input className={inputClass} value={fields.hostName} onChange={event=>{set("hostName",event.target.value);set("hostId","");}} placeholder="Host from flyer"/></label>
        <label><span className={labelClass}>Link to KJ profile (optional)</span><select className={inputClass} value={fields.hostId} onChange={event=>linkHost(event.target.value)}><option value="">Not linked</option>{hosts.map(host=><option key={host.id} value={host.id}>{host.name}</option>)}</select></label>
        <label><span className={labelClass}>Area filter</span><select className={inputClass} value={fields.region} onChange={event=>set("region",event.target.value as SingBoardRegion)}>{REGIONS.filter(region=>region.value!=="all").map(region=><option key={region.value} value={region.value}>{region.label}</option>)}</select></label>
        <label><span className={labelClass}>Post category</span><select className={inputClass} value={fields.category} onChange={event=>set("category",event.target.value)}>{CATEGORIES.map(category=><option key={category.value} value={category.value}>{category.label}</option>)}</select></label>
        <label className="sm:col-span-2"><span className={labelClass}>Event website / ticket link (optional)</span><input className={inputClass} value={fields.linkUrl} onChange={event=>set("linkUrl",event.target.value)} placeholder="https://..."/></label>
        <label className="sm:col-span-2"><span className={labelClass}>Description</span><textarea className={inputClass} value={fields.detail} onChange={event=>set("detail",event.target.value)} rows={3} placeholder="What should people know?"/></label>
        {type!=="image"&&<label className="sm:col-span-2"><span className={labelClass}>Note text</span><textarea className={inputClass} value={fields.noteText} onChange={event=>set("noteText",event.target.value)} required maxLength={type==="wanted"?220:280} rows={3}/></label>}
      </div>
      {suggestedVenue&&!fields.venueSlug&&<div className="flex flex-wrap items-center gap-2 text-sm text-slate-200">Possible venue profile: <strong>{suggestedVenue.name}</strong><button type="button" onClick={()=>linkVenue(suggestedVenue.slug)} className="rounded-full border border-cyan-300/60 px-3 py-1 font-bold text-cyan-200">Confirm match</button></div>}
      {suggestedHost&&!fields.hostId&&<div className="flex flex-wrap items-center gap-2 text-sm text-slate-200">Possible KJ profile: <strong>{suggestedHost.name}</strong><button type="button" onClick={()=>linkHost(suggestedHost.id)} className="rounded-full border border-cyan-300/60 px-3 py-1 font-bold text-cyan-200">Confirm match</button></div>}
      {message&&<p role="status" className="rounded-xl bg-white/10 p-3 text-sm text-white">{message}</p>}
      {published&&<Link className="block text-sm font-bold text-cyan-200 underline" href={published}>View published SingBOARD event →</Link>}
      <button type="submit" disabled={working} className="w-full rounded-xl bg-cyan-300 px-5 py-3 font-black text-slate-950 disabled:opacity-50">{working?"Publishing…":"Review complete. Publish to SingBOARD"}</button>
    </form>}
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Post category">{[["all","All"],["events","Events"],["meetups","Meetups"],["kjs","KJs"],["community","Community"]].map(([value,label])=><button type="button" key={value} onClick={()=>setFilter(value)} aria-pressed={filter===value} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${filter===value?"border-fuchsia-400 bg-fuchsia-500 text-white":"border-white/20 bg-white/5 text-slate-200 hover:border-cyan-300/60"}`}>{label}</button>)}</div>
      <div className="grid gap-2 sm:grid-cols-3">
        <label><span className="sr-only">Neighborhood area</span><select className={inputClass} value={region} onChange={event=>setRegion(event.target.value as "all"|SingBoardRegion)}>{REGIONS.map(region=><option key={region.value} value={region.value}>{region.label}</option>)}</select></label>
        <label><span className="sr-only">Date range</span><select className={inputClass} value={period} onChange={event=>setPeriod(event.target.value)}><option value="all">All upcoming</option><option value="week">Next 7 days</option><option value="month">Next 30 days</option></select></label>
        <label><span className="sr-only">Search events and venues</span><input className={inputClass} value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search events, venues, KJs…"/></label>
      </div>
    </div>
    {!spotlight&&<div className="rounded-2xl border border-white/15 bg-white/5 px-5 py-10 text-center"><h3 className="text-lg font-bold">Nothing on the Board for these filters yet.</h3><p className="mt-1 text-sm text-slate-400">Try another neighborhood or date range.</p></div>}
    {spotlight&&<section className="space-y-3"><h3 className="text-lg font-black text-white">Featured event</h3><EventCard post={spotlight} featured/></section>}
    {flyers.length>0&&<section className="space-y-3"><h3 className="text-lg font-black text-white">More on the Board</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{flyers.map(post=><EventCard key={post.id} post={post}/>)}</div></section>}
    {notes.length>0&&<section className="space-y-3"><h3 className="text-lg font-black text-white">Community notes & announcements</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{notes.map(post=><EventCard key={post.id} post={post}/>)}</div></section>}
  </div>;
}
