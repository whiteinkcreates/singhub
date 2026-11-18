"use client";

import {useState,type FormEvent} from "react";
import Image from "next/image";
import Link from "next/link";
import {SITE_WORDMARK_SRC} from "@/lib/siteWordmark";
import {prepareMonthlyMicPhoto,readMonthlyMicResponse} from "@/lib/monthlyMicUpload.client";

export default function MonthlyMicPhotoSubmissionPage(){
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [complete,setComplete]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(busy)return;
  const form=event.currentTarget;
  const data=new FormData(form);
  setBusy(true);setMessage("Preparing your photo...");
  try{
   const file=data.get("file");
   if(!(file instanceof File)||file.size===0)throw new Error("Choose a photo first.");
   data.set("file",await prepareMonthlyMicPhoto(file));
   setMessage("Uploading your photo...");
   const response=await fetch("/api/monthlymic/media",{method:"POST",body:data,cache:"no-store"});
   const result=await readMonthlyMicResponse(response);
   if(!response.ok)throw new Error(result.error||"Upload failed. Please try again.");
   setComplete(true);
   setMessage("Photo received! We'll review it before sharing anything publicly.");
   form.reset();
  }catch(error){
   setMessage(error instanceof Error?error.message:"Upload failed. Please try again.");
  }finally{setBusy(false);}
 }
 return <main className="min-h-screen bg-[#070c17] px-4 py-10 text-white sm:py-16">
  <div className="mx-auto max-w-xl">
   <header className="text-center">
    <Link href="/monthlymic" aria-label="Back to MonthlyMic" className="inline-flex justify-center">
     <Image src={SITE_WORDMARK_SRC} alt="SingHUB" width={280} height={95} unoptimized className="h-auto w-[220px] object-contain sm:w-[280px]"/>
    </Link>
    <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-fuchsia-300">MonthlyMic #001 · The Mesa · November 18</p>
    <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Got a photo from <span className="text-cyan-300">tonight?</span></h1>
    <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-200">Share your favorite MonthlyMic moments! One photo per submission. You can come back and send more.</p>
   </header>
   <section className="mt-8 rounded-3xl border border-cyan-300/30 bg-[#132034] p-5 shadow-xl sm:p-8">
    <h2 className="text-xl font-black">Share a photo</h2>
    <p className="mt-2 text-sm leading-6 text-slate-300">No account needed. Photos are submitted privately for review, not published automatically.</p>
    <form onSubmit={submit} className="mt-6 space-y-5">
     <input type="text" name="website" autoComplete="off" tabIndex={-1} aria-hidden="true" className="hidden"/>
     <label className="block text-sm font-semibold">Your name
      <input name="name" type="text" required maxLength={100} autoComplete="name" placeholder="What should we call you?" className="mt-2 block w-full rounded-xl border border-white/20 bg-white p-3 text-base text-slate-950"/>
     </label>
     <label className="block text-sm font-semibold">Your email
      <input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="Only for questions about your photo" className="mt-2 block w-full rounded-xl border border-white/20 bg-white p-3 text-base text-slate-950"/>
     </label>
     <label className="block text-sm font-semibold">Choose a photo
      <input name="file" type="file" required accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full rounded-xl border border-dashed border-cyan-300/40 bg-white/5 p-4 text-sm"/>
      <span className="mt-2 block text-xs font-normal text-slate-400">JPG, PNG, or WebP. Your photo is automatically resized before upload.</span>
     </label>
     <label className="flex items-start gap-3 text-sm leading-6">
      <input name="consent" value="yes" type="checkbox" required className="mt-1 h-5 w-5 shrink-0 accent-fuchsia-500"/>
      <span>I took this photo or have permission to submit it, and I allow SingHUB to share it on MonthlyMic and SingHUB channels after review. Please only share photos of people who are comfortable being featured.</span>
     </label>
     <button disabled={busy} type="submit" className="w-full rounded-xl bg-fuchsia-500 px-5 py-4 text-base font-black text-white disabled:opacity-60">{busy?"Uploading...":"Submit my photo"}</button>
     <p aria-live="polite" role="status" className={complete?"text-sm font-bold text-cyan-200":"text-sm text-amber-200"}>{message}</p>
    </form>
   </section>
   <p className="mt-7 text-center text-sm text-slate-300">Thanks for making MonthlyMic #001 memorable. 🎤</p>
   <p className="mt-4 text-center"><Link href="/monthlymic" className="text-sm text-cyan-300 underline">Back to MonthlyMic</Link></p>
  </div>
 </main>;
}
