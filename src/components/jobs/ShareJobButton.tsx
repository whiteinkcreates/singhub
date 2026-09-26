"use client";

import { useState } from "react";

export function ShareJobButton({title}:{title:string}) {
  const [message,setMessage]=useState("");

  async function share() {
    const url=window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({title,text:"BarLando is hiring in San Diego.",url});
        return;
      }
      await navigator.clipboard.writeText(url);
      setMessage("Link copied.");
    } catch (error) {
      if (error instanceof DOMException && error.name==="AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        setMessage("Link copied.");
      } catch {
        setMessage("Copy the page link from your browser.");
      }
    }
  }

  return <div className="flex flex-col items-start gap-2">
    <button type="button" onClick={share} className="rounded-xl border border-white/15 bg-white/[.06] px-5 py-3 font-black text-white transition hover:border-cyan-300/50 hover:bg-cyan-300/10">
      Share this opening
    </button>
    {message&&<p className="text-xs font-bold text-cyan-200" aria-live="polite">{message}</p>}
  </div>;
}
