import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import {SITE_WORDMARK_SRC} from "@/lib/siteWordmark";

export const dynamic="force-dynamic";
export const metadata:Metadata={
 title:"Share Your MonthlyMic Photos | Printable QR | SingHUB",
 description:"Printable QR poster for submitting photos from SingHUB MonthlyMic.",
 robots:{index:false,follow:false}
};

export default async function MonthlyMicPhotoQrPoster(){
 const destination="https://singhub.app/monthlymic/photos";
 const qr=await QRCode.toDataURL(destination,{
  errorCorrectionLevel:"H",
  margin:5,
  width:960,
  color:{dark:"#10121A",light:"#FFFFFF"}
 });
 return <main className="min-h-screen bg-[#0a0c18] px-3 py-8 print:min-h-0 print:bg-white print:p-0">
  <style>{`@page { size: letter; margin: 0; } @media print { html,body { margin:0 !important; padding:0 !important; } * { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; } }`}</style>
  <div className="mx-auto mb-5 max-w-[780px] text-center text-sm text-slate-200 print:hidden">
   <p>Print this on US Letter paper, then place it on the MonthlyMic table. This QR opens the real photo-upload form.</p>
   <p className="mt-2"><Link href="/monthlymic/photos" className="font-semibold text-cyan-300 underline">Test the upload page first</Link>. For printing, use your browser&apos;s Print option.</p>
  </div>
  <article className="mx-auto flex aspect-[8.5/11] w-full max-w-[760px] flex-col overflow-hidden bg-white text-[#10121a] shadow-2xl print:h-[11in] print:w-[8.5in] print:max-w-none print:shadow-none">
   <header className="bg-[#09101d] px-8 pb-7 pt-8 text-center text-white">
    <Image src={SITE_WORDMARK_SRC} alt="SingHUB" unoptimized width={330} height={112} className="mx-auto h-auto w-[235px] object-contain sm:w-[300px]"/>
    <p className="mt-1 text-xs font-bold tracking-[0.18em] text-cyan-300 sm:text-sm">MONTHLYMIC #001 | THE MESA</p>
    <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">GOT PHOTOS?</h1>
    <p className="mt-1 text-3xl font-black text-fuchsia-400 sm:text-4xl">SHARE THE NIGHT.</p>
   </header>
   <section className="flex flex-1 flex-col items-center justify-center px-8 py-5 text-center">
    <h2 className="text-2xl font-black tracking-tight sm:text-3xl">SCAN TO UPLOAD</h2>
    <p className="mt-2 max-w-md text-sm text-slate-600 sm:text-base">Share your favorite moments from tonight&apos;s karaoke meetup.</p>
    <div className="my-5 w-[65%] max-w-[440px] bg-white p-2">
     <img src={qr} width={440} height={440} alt="QR code to upload MonthlyMic photos at singhub.app/monthlymic/photos" className="aspect-square h-auto w-full" />
    </div>
    <p className="break-all text-lg font-black text-[#10121a] sm:text-2xl">singhub.app/monthlymic/photos</p>
    <p className="mt-4 text-xs font-semibold leading-5 text-slate-600 sm:text-sm">No account needed. One photo at a time.<br/>Photos are reviewed before anything is shared publicly.</p>
   </section>
   <footer className="bg-[#09101d] px-7 py-4 text-center text-sm font-semibold text-slate-100">
    Have permission to share the photo? We&apos;d love to see it. <span className="text-cyan-300">#MonthlyMic001</span>
   </footer>
  </article>
 </main>;
}
