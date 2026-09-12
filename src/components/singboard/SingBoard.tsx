"use client";

import { toJpeg } from "html-to-image";
import { useMemo, useRef, useState } from "react";
import { isSingBoardSlotOccupied, SINGBOARD_SLOTS } from "@/lib/singboard/layout";

type BoardRegion = "all" | "east-county" | "central" | "beach" | "downtown" | "south-bay" | "north-county";
type PersistedRegion = Exclude<BoardRegion, "all">;
type PostType = "image" | "note";
type NoteColor = "yellow" | "pink" | "blue" | "green" | "white";
type BoardPost = { id:string; postType:PostType; title:string; venue:string; neighborhood:string; region:PersistedRegion; detail:string; x:number; y:number; rotation:number; imageUrl?:string; noteText?:string; noteColor?:NoteColor; pinned:boolean; eventDate:string; startTime?:string; hostName?:string; linkUrl?:string };

const regions:{id:BoardRegion;label:string}[]=[
  {id:"all",label:"All San Diego"},
  {id:"east-county",label:"East County"},
  {id:"central",label:"Central"},
  {id:"beach",label:"Beach Areas"},
  {id:"downtown",label:"Downtown"},
  {id:"south-bay",label:"South Bay"},
  {id:"north-county",label:"North County"},
];

const noteColors:Record<NoteColor,string>={
  yellow:"bg-[#fff1a8]",
  pink:"bg-[#ffb7d5]",
  blue:"bg-[#b9e8ff]",
  green:"bg-[#c9f2bd]",
  white:"bg-[#fffdf4]",
};

const pinColors=[
  "bg-fuchsia-500 shadow-[0_0_18px_rgba(236,72,153,.85)]",
  "bg-violet-500 shadow-[0_0_18px_rgba(139,92,246,.85)]",
  "bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,.85)]",
];

function pinClass(id:string){
  const seed=[...id].reduce((sum,char)=>sum+char.charCodeAt(0),0);
  return pinColors[seed%pinColors.length];
}

export function SingBoard({initialFlyers}:{initialFlyers:BoardPost[]}){
  const boardRef=useRef<HTMLDivElement>(null);
  const fileRef=useRef<File|null>(null);
  const [posts,setPosts]=useState<BoardPost[]>(initialFlyers);
  const [draft,setDraft]=useState<BoardPost|null>(null);
  const [type,setType]=useState<PostType>("image");
  const [region,setRegion]=useState<BoardRegion>("all");
  const [accessCode,setAccessCode]=useState("");
  const [venue,setVenue]=useState("");
  const [neighborhood,setNeighborhood]=useState("");
  const [date,setDate]=useState("");
  const [time,setTime]=useState("");
  const [host,setHost]=useState("");
  const [link,setLink]=useState("");
  const [title,setTitle]=useState("");
  const [detail,setDetail]=useState("");
  const [noteText,setNoteText]=useState("");
  const [noteColor,setNoteColor]=useState<NoteColor>("yellow");
  const [posting,setPosting]=useState(false);
  const [selectedSlotId,setSelectedSlotId]=useState<string|null>(null);
  const [exportingBoard,setExportingBoard]=useState(false);
  const [boardExportMessage,setBoardExportMessage]=useState<string|null>(null);
  const [lastPublished,setLastPublished]=useState<{id:string;title:string}|null>(null);
  const [status,setStatus]=useState("Choose an image post or write a note.");

  const visible=useMemo(
    ()=>[...posts,...(draft&&selectedSlotId?[draft]:[])].filter(p=>region==="all"||p.region===region),
    [posts,draft,region,selectedSlotId],
  );
  const availableSlots=useMemo(
    ()=>SINGBOARD_SLOTS.filter(slot=>!isSingBoardSlotOccupied(slot,posts)),
    [posts],
  );

  function regionValue():PersistedRegion{return region==="all"?"central":region;}
  function createDraft(nextType:PostType,imageUrl?:string){setSelectedSlotId(null);setDraft({id:`draft-${Date.now()}`,postType:nextType,title:title||"Karaoke event",venue:venue||"Your venue",neighborhood:neighborhood||"Your neighborhood",region:regionValue(),detail,x:0,y:0,rotation:0,imageUrl,noteText:nextType==="note"?noteText:undefined,noteColor:nextType==="note"?noteColor:undefined,pinned:false,eventDate:date,startTime:time||undefined,hostName:host||undefined,linkUrl:link||undefined});}
  function updateDraft(patch:Partial<BoardPost>){setDraft(d=>d?{...d,...patch}:d);}
  function handleFile(file?:File){if(!file||!file.type.startsWith("image/"))return setStatus("Choose an image file.");if(file.size>10*1024*1024)return setStatus("Image must be under 10 MB.");if(draft?.imageUrl?.startsWith("blob:"))URL.revokeObjectURL(draft.imageUrl);fileRef.current=file;setType("image");createDraft("image",URL.createObjectURL(file));setStatus("Image loaded. Choose one of the dotted spaces on the board.");}
  function chooseSlot(slotId:string){const slot=SINGBOARD_SLOTS.find(candidate=>candidate.id===slotId);if(!draft||!slot||isSingBoardSlotOccupied(slot,posts))return;setSelectedSlotId(slot.id);updateDraft({x:slot.x,y:slot.y,rotation:slot.rotation});setStatus(`Space ${slot.id} selected. Add the event details, then publish.`);}

  function boardFilename(){const dateKey=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Los_Angeles",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());return `SingHUB-SingBOARD-${dateKey}.jpg`;}
  async function buildBoardFile(){const board=boardRef.current;if(!board)throw new Error("The board is not ready yet.");await document.fonts.ready;const dataUrl=await toJpeg(board,{cacheBust:true,backgroundColor:"#080910",pixelRatio:2,quality:.94,filter:node=>!(node instanceof HTMLElement&&node.dataset.exportExclude==="true")});const response=await fetch(dataUrl);const blob=await response.blob();return new File([blob],boardFilename(),{type:"image/jpeg"});}
  async function downloadBoard(){setExportingBoard(true);setBoardExportMessage(null);try{const file=await buildBoardFile();const objectUrl=URL.createObjectURL(file);const anchor=document.createElement("a");anchor.href=objectUrl;anchor.download=file.name;document.body.appendChild(anchor);anchor.click();anchor.remove();window.setTimeout(()=>URL.revokeObjectURL(objectUrl),60_000);setBoardExportMessage(`Saved ${file.name} to Downloads.`);}catch(error){console.error("SingBOARD JPG export failed",error);setBoardExportMessage("Could not export the current board JPG.");}finally{setExportingBoard(false);}}
  async function shareBoard(){setExportingBoard(true);setBoardExportMessage(null);try{const file=await buildBoardFile();const shareData={files:[file],title:"SingBOARD | SingHUB"};if(!navigator.share||!navigator.canShare?.(shareData)){setBoardExportMessage("This browser cannot share image files. Use Download board JPG.");return;}await navigator.share(shareData);}catch(error){if(error instanceof DOMException&&error.name==="AbortError")return;console.error("SingBOARD JPG sharing failed",error);setBoardExportMessage("Could not share the current board JPG.");}finally{setExportingBoard(false);}}
  async function copyLastFlyerLink(){if(!lastPublished)return;await navigator.clipboard.writeText(`${window.location.origin}/events/${lastPublished.id}`);setBoardExportMessage(`Copied the direct link for ${lastPublished.title}.`);}

  async function publish(){
    if(!draft)return setStatus(type==="image"?"Upload an image first.":"Create your note first.");
    if(!selectedSlotId)return setStatus("Choose one of the dotted spaces on the board.");
    if(!accessCode.trim()||!venue.trim()||!neighborhood.trim()||!date)return setStatus("Access code, venue, neighborhood and event date are required.");
    if(type==="image"&&!fileRef.current)return setStatus("Upload an image first.");
    if(type==="note"&&!noteText.trim())return setStatus("Write something on the note.");
    setPosting(true);
    setStatus("Publishing…");
    try{
      const form=new FormData();
      form.append("accessCode",accessCode);
      form.append("postType",type);
      form.append("title",title.trim()||"Karaoke event");
      form.append("venueName",venue.trim());
      form.append("neighborhood",neighborhood.trim());
      form.append("region",draft.region);
      form.append("eventDate",date);
      form.append("startTime",time);
      form.append("hostName",host);
      form.append("linkUrl",link);
      form.append("x",String(draft.x));
      form.append("y",String(draft.y));
      form.append("rotation",String(draft.rotation));
      form.append("detail",detail.trim());
      if(type==="image"&&fileRef.current)form.append("file",fileRef.current);
      else{form.append("noteText",noteText.trim());form.append("noteColor",noteColor);}
      const response=await fetch("/api/singboard/publish",{method:"POST",body:form});
      const result=await response.json() as {id?:string;imageUrl?:string;error?:string};
      if(!response.ok||!result.id)throw new Error(result.error||"Publish failed.");
      setPosts(p=>[...p,{...draft,id:result.id!,title:title.trim()||"Karaoke event",venue:venue.trim(),neighborhood:neighborhood.trim(),detail:detail.trim(),eventDate:date,startTime:time||undefined,hostName:host||undefined,linkUrl:link||undefined,imageUrl:result.imageUrl||draft.imageUrl,noteText:type==="note"?noteText.trim():undefined,noteColor:type==="note"?noteColor:undefined,pinned:true}]);
      setLastPublished({id:result.id,title:title.trim()||"Karaoke event"});
      if(draft.imageUrl?.startsWith("blob:"))URL.revokeObjectURL(draft.imageUrl);
      fileRef.current=null;
      setDraft(null);
      setSelectedSlotId(null);
      setStatus("Pinned and saved. Download the current board or copy the direct event link below.");
    }catch(error){
      setStatus(error instanceof Error?error.message:"Publish failed.");
    }finally{
      setPosting(false);
    }
  }

  return <div className="space-y-5">
    <div className="overflow-hidden rounded-2xl border border-fuchsia-400/20 bg-[linear-gradient(100deg,rgba(236,72,153,.12),rgba(139,92,246,.08),rgba(34,211,238,.08))] p-4 shadow-[0_0_35px_rgba(217,70,239,.08)]">
      <p className="text-sm font-black uppercase tracking-[.2em] text-fuchsia-300">Got something worth pinning?</p>
      <p className="mt-1 text-sm text-slate-300">Verified venues and KJs can upload event art or create a quick note right here.</p>
    </div>

    <div className="flex gap-2 overflow-x-auto pb-1">
      {regions.map(r=><button key={r.id} onClick={()=>setRegion(r.id)} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-black transition ${region===r.id?"border-cyan-300 bg-cyan-300 text-slate-950 shadow-[0_0_18px_rgba(34,211,238,.28)]":"border-white/15 bg-white/[.04] text-slate-200 hover:border-fuchsia-300/60 hover:bg-fuchsia-300/10"}`}>{r.label}</button>)}
    </div>

    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[.035] p-3">
      <button type="button" onClick={downloadBoard} disabled={exportingBoard} className="rounded-xl bg-fuchsia-300 px-4 py-2.5 text-sm font-black text-slate-950 disabled:opacity-50">{exportingBoard?"Creating JPG…":"Download board JPG"}</button>
      <button type="button" onClick={shareBoard} disabled={exportingBoard} className="rounded-xl border border-cyan-300/35 px-4 py-2.5 text-sm font-black text-cyan-100 disabled:opacity-50">Share current board</button>
      {lastPublished&&<button type="button" onClick={copyLastFlyerLink} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-black text-white">Copy new flyer link</button>}
      {boardExportMessage&&<p className="basis-full text-xs font-semibold text-cyan-200" aria-live="polite">{boardExportMessage}</p>}
    </div>

    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="rounded-[2rem] border border-[#6f422d] bg-[repeating-linear-gradient(90deg,#2b160f_0_10px,#3b2118_10px_20px,#24110c_20px_28px)] p-2 shadow-[0_24px_70px_rgba(0,0,0,.55),0_0_36px_rgba(236,72,153,.12)] sm:p-4">
        <div
          ref={boardRef}
          className="relative min-h-[900px] overflow-hidden rounded-[1.15rem] border border-white/10 bg-[#080910] shadow-[inset_0_0_90px_rgba(0,0,0,.75),inset_0_0_35px_rgba(139,92,246,.08)]"
          style={{backgroundImage:"radial-gradient(circle at 14% 7%, rgba(236,72,153,.18), transparent 28%), radial-gradient(circle at 88% 10%, rgba(34,211,238,.14), transparent 30%), radial-gradient(circle at 54% 74%, rgba(139,92,246,.12), transparent 35%), repeating-linear-gradient(135deg, rgba(255,255,255,.018) 0 1px, transparent 1px 8px), linear-gradient(180deg,#10121a 0%,#090a10 58%,#06070b 100%)"}}
        >
          <div className="pointer-events-none absolute -left-20 top-8 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl"/>
          <div className="pointer-events-none absolute -right-16 top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl"/>
          <div className="pointer-events-none absolute bottom-8 left-1/3 h-52 w-72 rounded-full bg-violet-500/10 blur-3xl"/>

          {draft&&availableSlots.map(slot=><button
            key={slot.id}
            type="button"
            data-export-exclude="true"
            onClick={()=>chooseSlot(slot.id)}
            aria-label={`Place flyer in space ${slot.id}`}
            className={`absolute z-30 flex items-center justify-center rounded-lg border-2 border-dashed text-[9px] font-black uppercase tracking-[.12em] transition sm:text-xs ${selectedSlotId===slot.id?"border-cyan-200 bg-cyan-300/20 text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,.28)]":"border-white/35 bg-black/20 text-white/55 hover:border-fuchsia-300 hover:bg-fuchsia-300/10 hover:text-white"}`}
            style={{left:`${slot.x}%`,top:`${slot.y}%`,width:`${slot.width}%`,height:`${slot.height}%`,transform:`rotate(${slot.rotation}deg)`}}
          >
            {selectedSlotId===slot.id?"Selected":`Place here · ${slot.id}`}
          </button>)}

          <div className="pointer-events-none absolute left-1/2 top-4 z-30 flex w-[52%] max-w-[680px] -translate-x-1/2 items-center gap-2 rounded-lg border-2 border-fuchsia-400/80 bg-black/45 px-3 py-2 shadow-[0_0_18px_rgba(236,72,153,.45),inset_0_0_18px_rgba(34,211,238,.12)]">
            <img src="/images/header-singhub-logo.png" alt="SingHUB" className="h-auto w-[54%] object-contain" />
            <span className="text-[clamp(1.25rem,4vw,3.4rem)] font-black tracking-[-.08em] text-white [text-shadow:0_0_8px_#38cfff,0_0_18px_#38cfff]">BOARD</span>
          </div>
          <p className="pointer-events-none absolute left-1/2 top-[13%] z-30 w-[58%] -translate-x-1/2 text-center text-[10px] font-black uppercase tracking-[.28em] text-slate-200/85 sm:text-xs">
            The bulletin board for karaoke events
          </p>

          <div className="pointer-events-none absolute left-[4%] top-[19%] z-20 w-[21%] rotate-[-4deg] border border-black/10 bg-[#f3e8dc] px-4 py-5 text-slate-950 shadow-[0_12px_24px_rgba(0,0,0,.4)]">
            <span className="absolute left-1/2 top-2 h-4 w-4 -translate-x-1/2 rounded-full bg-fuchsia-500 shadow-[0_0_15px_rgba(236,72,153,.8)]"/>
            <p className="pt-3 text-sm font-black uppercase leading-5 sm:text-base">Special events.<br/>One place.</p>
            <p className="mt-2 text-sm font-black uppercase text-fuchsia-600">Don&apos;t miss out.</p>
          </div>

          <div className="pointer-events-none absolute right-[3%] top-[18%] z-20 w-[19%] rotate-[4deg] border border-white/10 bg-[#11131a] px-4 py-5 text-white shadow-[0_12px_24px_rgba(0,0,0,.5)]">
            <span className="absolute left-1/2 top-2 h-4 w-4 -translate-x-1/2 rounded-full bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,.85)]"/>
            <p className="pt-3 text-xs font-black uppercase text-fuchsia-300 sm:text-sm">Hosting an event?</p>
            <p className="mt-2 text-xs font-bold uppercase leading-5 text-slate-200 sm:text-sm">Send us your flyer &amp; we&apos;ll pin it.</p>
          </div>

          {visible.map(post=><button
            key={post.id}
            type="button"
            onClick={post.pinned?()=>window.location.assign(`/events/${post.id}`):undefined}
            title={post.pinned?`View ${post.title}`:"Flyer placement preview"}
            className={`absolute w-[22%] select-none text-left shadow-[0_18px_28px_rgba(0,0,0,.5)] ${!post.pinned?"pointer-events-none":"cursor-pointer transition duration-200 hover:scale-[1.025] hover:shadow-[0_20px_34px_rgba(0,0,0,.65)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-cyan-300"}`}
            style={{left:`${post.x}%`,top:`${post.y}%`,transform:`rotate(${post.rotation}deg)`,zIndex:post.pinned?10:35}}
          >
            {post.pinned&&<span className={`absolute left-1/2 top-2 z-20 h-5 w-5 -translate-x-1/2 rounded-full ${pinClass(post.id)}`}/>} 
            {post.postType==="image"&&post.imageUrl
              ?<img src={post.imageUrl} alt={post.title} className="block max-h-[390px] w-full border border-white/5 object-contain" draggable={false}/>
              :<span className={`block min-h-44 p-5 pt-9 text-slate-950 shadow-inner ${noteColors[post.noteColor||"yellow"]}`}>
                <strong className="block text-lg leading-tight">{post.title}</strong>
                <span className="mt-3 block whitespace-pre-wrap text-base font-semibold leading-6">{post.noteText}</span>
                <span className="mt-4 block border-t border-black/15 pt-2 text-xs font-bold">{post.venue}{post.startTime?` · ${post.startTime}`:""}</span>
              </span>}
          </button>)}

          <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 w-[58%] -translate-x-1/2 rounded-full border border-white/10 bg-black/55 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[.14em] text-slate-300 backdrop-blur-sm sm:text-xs">
            <span className="text-fuchsia-300">📌 Events from local hosts &amp; venues</span>
            <span className="mx-2 text-slate-600">•</span>
            <span className="text-cyan-300">New events added regularly</span>
          </div>
        </div>
      </div>

      <aside className="space-y-3 rounded-2xl border border-fuchsia-400/15 bg-[linear-gradient(180deg,rgba(15,17,28,.98),rgba(5,7,12,.98))] p-4 text-white shadow-[0_20px_50px_rgba(0,0,0,.35)]">
        <div>
          <p className="text-xs font-black uppercase tracking-[.22em] text-fuchsia-300">Pin an event</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">For verified SingBOARD posters.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={()=>{setType("image");setDraft(null);setSelectedSlotId(null);}} className={`rounded-xl border p-3 font-black transition ${type==="image"?"border-fuchsia-300 bg-fuchsia-300/15 shadow-[0_0_16px_rgba(236,72,153,.12)]":"border-white/10 hover:border-white/20"}`}>Upload Image</button>
          <button onClick={()=>{setType("note");fileRef.current=null;createDraft("note");}} className={`rounded-xl border p-3 font-black transition ${type==="note"?"border-violet-300 bg-violet-300/15 shadow-[0_0_16px_rgba(139,92,246,.12)]":"border-white/10 hover:border-white/20"}`}>Write Note</button>
        </div>
        {type==="image"
          ?<label className="block cursor-pointer rounded-xl bg-fuchsia-500 p-3 text-center font-black shadow-[0_0_22px_rgba(236,72,153,.18)] transition hover:bg-fuchsia-400">Choose image<input type="file" accept="image/*" className="sr-only" onChange={e=>handleFile(e.target.files?.[0])}/></label>
          :<>
            <div className="flex gap-2">{(Object.keys(noteColors) as NoteColor[]).map(c=><button key={c} aria-label={`${c} paper`} onClick={()=>{setNoteColor(c);updateDraft({noteColor:c});}} className={`h-9 w-9 rounded border-2 ${noteColors[c]} ${noteColor===c?"border-white":"border-transparent"}`}/>)}</div>
            <textarea value={noteText} maxLength={280} onChange={e=>{setNoteText(e.target.value);updateDraft({noteText:e.target.value});}} placeholder="Write your note…" className="min-h-28 w-full rounded-xl border border-white/15 bg-white/[.06] p-3 outline-none focus:border-violet-300"/>
          </>}
        <input value={title} onChange={e=>{setTitle(e.target.value);updateDraft({title:e.target.value});}} placeholder="Headline / event name" className="w-full rounded-xl border border-white/15 bg-white/[.06] p-3 outline-none focus:border-fuchsia-300"/>
        <input value={venue} onChange={e=>{setVenue(e.target.value);updateDraft({venue:e.target.value});}} placeholder="Venue" className="w-full rounded-xl border border-white/15 bg-white/[.06] p-3 outline-none focus:border-fuchsia-300"/>
        <input value={neighborhood} onChange={e=>{setNeighborhood(e.target.value);updateDraft({neighborhood:e.target.value});}} placeholder="Neighborhood" className="w-full rounded-xl border border-white/15 bg-white/[.06] p-3 outline-none focus:border-fuchsia-300"/>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={date} onChange={e=>{setDate(e.target.value);updateDraft({eventDate:e.target.value});}} className="rounded-xl border border-white/15 bg-white/[.06] p-3 [color-scheme:dark] outline-none focus:border-cyan-300"/>
          <input value={time} onChange={e=>{setTime(e.target.value);updateDraft({startTime:e.target.value});}} placeholder="Start time" className="rounded-xl border border-white/15 bg-white/[.06] p-3 outline-none focus:border-cyan-300"/>
        </div>
        <input value={host} onChange={e=>{setHost(e.target.value);updateDraft({hostName:e.target.value});}} placeholder="Host / KJ (optional)" className="w-full rounded-xl border border-white/15 bg-white/[.06] p-3 outline-none focus:border-violet-300"/>
        <textarea value={detail} maxLength={900} onChange={e=>{setDetail(e.target.value);updateDraft({detail:e.target.value});}} placeholder="Event details for the SingHUB page (optional)" className="min-h-24 w-full rounded-xl border border-white/15 bg-white/[.06] p-3 outline-none focus:border-violet-300"/>
        <input value={link} onChange={e=>{setLink(e.target.value);updateDraft({linkUrl:e.target.value});}} placeholder="Official event / ticket link (optional)" className="w-full rounded-xl border border-white/15 bg-white/[.06] p-3 outline-none focus:border-cyan-300"/>
        <input type="password" value={accessCode} onChange={e=>setAccessCode(e.target.value)} placeholder="SingBOARD access code" className="w-full rounded-xl border border-white/15 bg-white/[.06] p-3 outline-none focus:border-fuchsia-300"/>
        <button disabled={posting||!draft||!selectedSlotId} onClick={publish} className="w-full rounded-xl bg-cyan-300 px-4 py-3 font-black text-slate-950 shadow-[0_0_20px_rgba(34,211,238,.18)] disabled:opacity-40">{posting?"Publishing…":"Publish in selected space"}</button>
        <p className="text-xs leading-5 text-slate-300" aria-live="polite">{status}</p>
        <p className="text-[11px] text-slate-500">Live posts open their event page. Expired events archive automatically.</p>
      </aside>
    </div>
  </div>;
}
