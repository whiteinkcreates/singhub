"use client";

import { useEffect, useState } from "react";
import type { SingHereConfig } from "@/lib/venueEnhancements";

export function SingHereAction({ venueName, config }: { venueName: string; config?: SingHereConfig }) {
  const [open,setOpen]=useState(false);
  const mode=config?.mode || "instructions";
  const title=config?.title?.trim() || "Ready to sing?";
  const instructions=config?.instructions?.trim() || "Head up to the KJ and ask to join the karaoke list.";
  const url=config?.url?.trim();
  const linkLabel=config?.linkLabel?.trim() || "Join the list";
  useEffect(()=>{if(!open)return;const close=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close);},[open]);
  return <>
    <button type="button" onClick={()=>setOpen(true)} className="inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#22d3ee] via-[#9b5de5] to-[#ff2aa3] p-[1px] shadow-lg shadow-fuchsia-950/30" aria-haspopup="dialog"><span className="rounded-full bg-[#071019] px-6 py-3 text-sm font-black tracking-[0.03em] text-white"><span className="text-cyan-300">Sing</span><span className="text-fuchsia-300">HERE</span></span></button>
    {open?<div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center" role="presentation" onMouseDown={(e)=>{if(e.currentTarget===e.target)setOpen(false)}}>
      <section role="dialog" aria-modal="true" aria-label={`SingHERE at ${venueName}`} className="w-full max-w-md rounded-[2rem] border border-cyan-300/20 bg-[#071019] p-6 shadow-2xl shadow-black">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em]"><span className="text-cyan-300">Sing</span><span className="text-fuchsia-300">HERE</span><span className="text-slate-500"> · {venueName}</span></p><h2 className="mt-2 text-2xl font-black text-white">{title}</h2></div><button type="button" onClick={()=>setOpen(false)} className="rounded-full border border-white/10 px-3 py-1.5 text-sm font-black text-slate-300" aria-label="Close">×</button></div>
        <p className="mt-4 text-sm leading-6 text-slate-300">{instructions}</p>
        {mode==="external"&&url?<a href={url} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#ff2aa3] px-5 py-3 text-sm font-black text-white">{linkLabel} ↗</a>:null}
      </section>
    </div>:null}
  </>;
}
