"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { uniqueIdentityMatch, type FlyerFields } from "@/lib/singboard/flyerExtraction";
import type { PersistedSingBoardPost, SingBoardRegion, SingBoardPostType } from "@/lib/singboard/repository";

export type VenueChoice = { slug:string; name:string; neighborhood:string; region:SingBoardRegion; imageUrl?:string };
export type HostChoice = { id:string; slug:string; name:string; otherName:string };
type Listing = PersistedSingBoardPost & { hostSlug?:string; venuePhoto?:string };

// Only the explicit SingHUB onboarding example is undated in the UI.
// The database event_date remains a publishing expiration, not an event date.
const isSingBoardExample = (post: Pick<PersistedSingBoardPost, "postType" | "category" | "title">) =>
  post.postType === "note" && post.category === "notice" &&
  /^welcome to singboard.*example post/i.test(post.title);

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
  const eventHref="/events/"+post.id;
  const isGuide = isSingBoardExample(post);
  const dated = new Date(post.eventDate+"T12:00:00Z");
  const fullDate=new Intl.DateTimeFormat("en-US",{weekday:"long",month:"long",day:"numeric",timeZone:"UTC"}).format(dated);
  const month=new Intl.DateTimeFormat("en-US",{month:"short",timeZone:"UTC"}).format(dated);
  const weekday=new Intl.DateTimeFormat("en-US",{weekday:"short",timeZone:"UTC"}).format(dated);
  const day=new Intl.DateTimeFormat("en-US",{day:"numeric",timeZone:"UTC"}).format(dated);
  const verified=post.reviewStatus==="verified";
  const venueLink=post.venueSlug&&verified ? "/venues/"+post.venueSlug : undefined;
  const hostLink=post.hostSlug&&verified ? "/hosts/"+post.hostSlug : undefined;
  const posterIsImage=post.postType==="image"&&Boolean(post.imageUrl);
  const photo=post.imageUrl||post.venuePhoto;
  const monthly=post.title.match(/monthly\s+mic\s*#(\d+)/i);

  if(featured) {
    return <article className="sb-feature">
      <span className="sb-feature__sticker">FEATURED</span>
      <span className="sb-feature__tape" aria-hidden="true"/>
      <div className="sb-feature__content">
        <Link className="sb-feature__visual" href={eventHref} aria-label={"Open "+post.title}>
          {photo?<img src={photo} alt={posterIsImage?post.title+" original flyer":post.venue+" venue photo"} style={posterIsImage?{objectFit:"contain"}:undefined}/>:
            <span>{post.venue}</span>}
        </Link>
        <div className="sb-feature__copy">
          <Link href={eventHref} className="sb-feature__title">
            {monthly?<>Monthly<br/><strong>Mic #{monthly[1]}</strong></>:post.title}
          </Link>
          <div className="sb-feature__venue">at {post.venue}</div>
          <div className="sb-feature__meta">
            <div><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v5M17 3v5M3 10h18"/></svg>
              <span>{fullDate}</span></div>
            {post.startTime&&<div><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></svg><span>{post.startTime}</span></div>}
            <div><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-8.2 8-14A8 8 0 0 0 4 8c0 5.8 8 14 8 14Z"/><circle cx="12" cy="8" r="2"/></svg>
              <span>{venueLink?<Link href={venueLink}>{post.venue}</Link>:post.venue}{post.neighborhood?" · "+post.neighborhood:""}</span></div>
            {post.hostName&&<div><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/></svg>
              <span>With {hostLink?<Link href={hostLink}>{post.hostName}</Link>:post.hostName}</span></div>}
          </div>
          {post.detail&&<p className="sb-feature__description">{post.detail}</p>}
          <Link href={eventHref} className="sb-feature__cta">See event details ↗</Link>
        </div>
      </div>
    </article>;
  }

  return <article className="sb-poster">
    <span className="sb-poster__tape" aria-hidden="true"/>
    {isGuide?
      <span className="sb-date-tab sb-date-tab--example" aria-label="Example post, not an event">EXAMPLE</span>:
      <time className="sb-date-tab" dateTime={post.eventDate}>
        <span className="sb-date-tab__month">{month}</span>
        <span className="sb-date-tab__day">{day}</span>
        <span className="sb-date-tab__weekday">{weekday}</span>
      </time>}
    <Link href={eventHref} className={"sb-poster__media"+(posterIsImage?"":" sb-poster__media--note")} aria-label={"View "+post.title}>
      {posterIsImage?<img src={post.imageUrl} alt={post.title+" original event flyer"} loading="lazy"/>:
        <span>{post.noteText || (post.postType==="wanted"?"Looking for singers or crew":post.title)}</span>}
    </Link>
    <div className="sb-poster__body">
      <h3 className="sb-poster__title"><Link href={eventHref}>{post.title}</Link></h3>
      {isGuide?<p className="sb-poster__venue">From SingHUB · How the Board works</p>:
        <p className="sb-poster__venue">⌖ {venueLink?<Link href={venueLink}>{post.venue}</Link>:post.venue}
          {post.neighborhood&&<span> · {post.neighborhood}</span>}</p>}
      {!isGuide&&post.startTime&&<p className="sb-poster__venue">{dayString(post.eventDate)} · {post.startTime}</p>}
      {post.hostName&&<p className="sb-poster__venue">On the mic: {hostLink?<Link href={hostLink}>{post.hostName}</Link>:post.hostName}</p>}
      {post.detail&&<p className="sb-poster__desc">{post.detail}</p>}
      <div className="sb-poster__footer">
        <span>{isGuide?"How it works":verified?"Reviewed by SingHUB":"Community post"}</span>
        <Link href={eventHref}>{isGuide?"Read guide":"Details"} <span aria-hidden="true">›</span></Link>
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
  const [neighborhood,setNeighborhood] = useState("all");
  const [searchVisible,setSearchVisible] = useState(false);
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
      if(neighborhood!=="all"&&post.neighborhood.trim().toLowerCase()!==neighborhood.toLowerCase())return false;
      if(period!=="all"&&(post.eventDate<today||post.eventDate>until))return false;
      if(filter==="events"&&(!["special_event","theme_karaoke"].includes(post.category||"special_event")||post.postType==="wanted"))return false;
      if(filter==="meetups"&&!/monthly mic|meetup/i.test(post.title))return false;
      if(filter==="kjs"&&!(post.hostId||post.category==="hiring"))return false;
      if(filter==="community"&&!["community","notice","hiring"].includes(post.category||""))return false;
      const haystack=[post.title,post.venue,post.neighborhood,post.hostName,post.detail].join(" ").toLowerCase();
      return haystack.includes(query.toLowerCase().trim());
    }).sort((a,b)=>a.eventDate.localeCompare(b.eventDate)||a.title.localeCompare(b.title));
  },[posts,neighborhood,period,filter,query]);
  const neighborhoods=useMemo(()=>[...new Set(posts.map(post=>post.neighborhood.trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b)),[posts]);
  const spotlight=filtered.find(post=>/monthly mic #001/i.test(post.title))||
    filtered.find(post=>post.postType==="image"&&["special_event","theme_karaoke"].includes(post.category||"special_event"));
  const isFeatured=Boolean(spotlight&&/monthly mic #001/i.test(spotlight.title));
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

  return <div className="sb-board-root">
    <div className="sb-toolbar">
      <div className="sb-toolbar__top">
        <nav className="sb-filter-list" aria-label="SingBOARD post categories">
          {[
            ["all","All"],["events","Events"],["meetups","Meetups"],["kjs","KJs"],["community","Community"],
          ].map(([value,label])=><button key={value} type="button" aria-pressed={filter===value} onClick={()=>setFilter(value)} className="sb-filter-pill">{label}</button>)}
        </nav>
        <button type="button" className="sb-search-toggle" aria-label={searchVisible?"Hide event search":"Search SingBOARD"} aria-expanded={searchVisible} onClick={()=>{setSearchVisible(value=>!value);if(searchVisible)setQuery("");}}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.8"/><path d="m16 16 5 5"/></svg>
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="sb-filter-row flex-1">
          <label>
            <span className="sr-only">Neighborhood</span>
            <select value={neighborhood} onChange={event=>setNeighborhood(event.target.value)}>
              <option value="all">⌖ All San Diego</option>
              {neighborhoods.map(name=><option value={name} key={name}>{name}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Date range</span>
            <select value={period} onChange={event=>setPeriod(event.target.value)}>
              <option value="all">All dates</option><option value="week">Next 7 days</option><option value="month">Next 30 days</option>
            </select>
          </label>
        </div>
        <button type="button" onClick={()=>setPosting(value=>!value)} aria-expanded={posting} className="sb-post-action">{posting?"Close editor":"+ Post"}</button>
      </div>
      {searchVisible&&<label><span className="sr-only">Search events, venues or KJs</span><input autoFocus type="search" value={query} onChange={event=>setQuery(event.target.value)} className="sb-toolbar__search" placeholder="Search events, venues, KJs…"/></label>}
    </div>
    {posting&&<form onSubmit={publish} className="sb-form space-y-4" aria-label="Post to SingBOARD">
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
    {filtered.length===0&&<div className="sb-empty"><h2 className="text-xl font-bold">Nothing pinned for those filters.</h2><p className="mt-2 text-sm">Try another neighborhood or date range, or contribute an event.</p></div>}
    {spotlight&&<section aria-label={isFeatured?"Featured SingHUB event":"Next event"}>{isFeatured&&<h2 className="sr-only">Featured event</h2>}<EventCard post={spotlight} featured={isFeatured}/></section>}
    <div className="sb-heading">
      <h2>On the Board</h2>
      <span className="sb-heading__caption">REAL EVENTS. REAL PEOPLE.</span>
    </div>
    {flyers.length>0&&<section className="sb-board-grid" aria-label="Additional event flyers">{flyers.map(post=><EventCard key={post.id} post={post}/>)}</section>}
    {notes.length>0&&<section aria-label="Community notes and announcements">
      <h3 className="sb-section-label">Community notes</h3>
      <div className="sb-notes-grid">{notes.map(post=><EventCard key={post.id} post={post}/>)}</div>
    </section>}
    {(flyers.length>0||notes.length>0)&&<div className="sb-neon-divider" aria-hidden="true"/>}
  </div>;
}
