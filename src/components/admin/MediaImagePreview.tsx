"use client";
/* eslint-disable @next/next/no-img-element */
import { useRef, type CSSProperties } from "react";

export function MediaImagePreview({src,alt,className,style}:{src:string;alt:string;className?:string;style?:CSSProperties}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <>
    <button type="button" aria-label={`Enlarge ${alt}`} title="Click to enlarge" className="block h-full w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-cyan-300" onClick={() => dialog.current?.showModal()}>
      <img src={src} alt={alt} className={className} style={style} loading="lazy" />
    </button>
    <dialog ref={dialog} aria-label="Enlarged image preview" className="fixed inset-0 m-auto max-h-[95dvh] w-[94vw] max-w-6xl overflow-auto rounded-2xl border border-cyan-300/30 bg-[#07131a] p-3 text-white shadow-2xl backdrop:bg-black/85" onClick={event=>{if(event.target===event.currentTarget){const rect=event.currentTarget.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.current?.close();}}}>
      <header className="mb-3 flex items-center justify-between gap-4"><p className="text-sm">{alt}</p><button type="button" autoFocus aria-label="Close image preview" onClick={()=>dialog.current?.close()} className="rounded-lg border border-white/20 px-4 py-2 font-bold">Close ×</button></header>
      <img src={src} alt={alt} className="mx-auto max-h-[78dvh] w-full object-contain" />
    </dialog>
  </>;
}
