import MonthlyMicGallery from "./MonthlyMicGallery";
import type {Metadata} from "next";
import QRCode from "qrcode";
import Image from "next/image";
import Link from "next/link";
import RsvpForm from "./RsvpForm";
import {SITE_WORDMARK_SRC} from "@/lib/siteWordmark";
import {monthlyMic as m} from "@/lib/monthlymic";
export const metadata:Metadata={
 title:"MonthlyMic | SingHUB",
 description:"The SingHUB MonthlyMic. Meet people, explore a new San Diego karaoke venue each month, and join JustDuet.",
 alternates:{canonical:"/monthlymic"},
 openGraph:{title:"SingHUB MonthlyMic",description:"A monthly karaoke community meetup around San Diego.",images:[m.heroUrl]}
};
export default async function MonthlyMicPage(){
 const inviteUrl="https://singhub.app/monthlymic?src=irl-qr";
 const qr=await QRCode.toDataURL(inviteUrl,{errorCorrectionLevel:"H",margin:3,width:640,color:{dark:"#10121A",light:"#FFFFFF"}});
 return <main className="min-h-screen bg-[#06070d] text-white">
  <section className="relative isolate overflow-hidden border-b border-white/10 bg-[radial-gradient(ellipse_at_70%_25%,rgba(236,72,153,.24),transparent_40%),radial-gradient(ellipse_at_10%_80%,rgba(34,211,238,.19),transparent_45%),#070913]">
   <div aria-hidden="true" className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(90deg,transparent_0,transparent_54px,rgba(255,255,255,.08)_55px,transparent_56px)]" />
   <div className="relative mx-auto max-w-5xl px-5 py-24 sm:py-32">
    <div className="mb-8 flex items-center gap-4"><Image src={SITE_WORDMARK_SRC} alt="SingHUB" width={170} height={70} unoptimized className="h-auto w-[150px] object-contain"/><span className="text-sm font-black uppercase tracking-[.25em] text-cyan-300">Presents</span></div>
    <h1 className="text-5xl font-black tracking-tight sm:text-8xl">Monthly<span className="text-fuchsia-400">Mic</span></h1>
    <p className="mt-5 max-w-2xl text-xl text-slate-200">New venue. New voices. New friends. Every month.</p>
    <p className="mt-6 text-sm font-semibold text-cyan-200">Stop #001 · The Mesa · Wednesday, November 18 · Arrive 6:30–7 PM · {m.neighborhood}</p>
    <a href="#rsvp" className="mt-8 inline-block rounded-xl bg-cyan-300 px-6 py-3 font-black text-slate-950">RSVP for November 18</a>
   </div>
  </section>
  <div className="mx-auto grid max-w-5xl gap-12 px-5 py-14 lg:grid-cols-[1fr_390px]">
   <div>
    <h2 className="text-3xl font-black">Come for the people. Stay for karaoke.</h2>
    <p className="mt-4 leading-7 text-slate-300">Once a month, SingHUB brings people together at a different San Diego karaoke spot. Show up solo or with friends, meet the group, and settle into the venue&apos;s normal karaoke night. Singing is always optional.</p>
    <div className="mt-8 rounded-2xl border border-fuchsia-400/30 bg-fuchsia-400/10 p-6"><h3 className="text-2xl font-black">JustDuet 🎤</h3><p className="mt-2 text-slate-200">Feeling adventurous? Put your name in the bowl, get paired with another willing singer, and pick a duet. We&apos;ll work with the KJ&apos;s normal rotation.</p></div>
    <div className="mt-6 rounded-2xl border border-white/10 p-6"><h3 className="text-xl font-bold">SingHUB Original Tee · MonthlyMic pickup · $25</h3><p className="mt-2 text-slate-300">Get the special $25 event price (regularly $31). Choose your size and pay through WhiteInk Creates, then collect your shirt from the SingHUB table at The Mesa on November 18. Event pickup only, no shipping. A shirt purchase is optional; MonthlyMic is free to attend.</p><a href="https://whiteinkcreates.com/products/singhub-original-tee-monthlymic-001-event-pickup" target="_blank" rel="noopener noreferrer" className="mt-5 inline-block rounded-xl bg-fuchsia-400 px-5 py-3 font-black text-slate-950">Buy your $25 shirt for event pickup</a><p className="mt-3 text-xs text-slate-400">T-shirt purchases are handled separately through Shopify. Be sure the product checkout shows event pickup, not shipping.</p></div>
    <MonthlyMicGallery/>
    <p className="mt-10 text-sm text-slate-400">Have a venue we should visit next? Bring your nomination. We&apos;ll collect suggestions at the meetup.</p>
    <Link href="/singboard" className="mt-4 inline-block text-cyan-300 underline">More local events on SingBOARD</Link>
   </div>
   <div className="space-y-6"><div id="rsvp"><RsvpForm/></div><aside className="rounded-3xl border border-white/15 bg-slate-900 p-5 text-center sm:p-7"><h2 className="text-2xl font-black">Invite someone IRL</h2><p className="mt-2 text-sm text-slate-300">Have them scan to learn about MonthlyMic and register interest.</p><img src={qr} alt="QR code linking to the SingHUB MonthlyMic page" width={320} height={320} className="mx-auto mt-5 w-full max-w-[300px] rounded-xl bg-white p-2"/><p className="mt-4 break-all text-sm text-cyan-200">singhub.app/monthlymic</p><a href="/monthlymic/qr.png" download="SingHUB-MonthlyMic-Invite-QR.png" className="mt-5 inline-block rounded-xl bg-cyan-300 px-5 py-3 font-black text-slate-950">Download printable QR (PNG)</a><p className="mt-3 text-xs text-slate-400">The same link stays useful when the venue and date change each month.</p></aside></div>
  </div>
 </main>;
}
