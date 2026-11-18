import type {Metadata} from "next";
import Link from "next/link";
import {EventRider} from "@/components/groups/EventRider";
import {SITE_WORDMARK_SRC} from "@/lib/siteWordmark";
export const metadata:Metadata={
 title:"Hire a Karaoke DJ or KJ in San Diego | SingHUB",
 description:"Need a karaoke host for your San Diego party or corporate event? Tell SingHUB your date, location, group size and equipment needs. We'll help connect you with interested local KJs.",
 alternates:{canonical:"/hire-a-kj"},
 openGraph:{title:"Hire a Karaoke KJ in San Diego | SingHUB",description:"Already have the party location? Let's find the person behind the mic.",url:"/hire-a-kj",siteName:"SingHUB",type:"website"}
};
export default function HireKjPage(){return <main className="min-h-screen bg-[#070a12] text-white">
 <section className="relative overflow-hidden border-b border-white/10 px-5 py-16 md:py-24"><div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_10%,rgba(205,67,170,.16),transparent_46%),radial-gradient(ellipse_at_5%_75%,rgba(64,205,221,.15),transparent_45%)]"/>
 <div className="relative mx-auto max-w-6xl">
  <img src={SITE_WORDMARK_SRC} alt="SingHUB" className="mb-10 h-12 w-auto object-contain"/>
  <p className="text-xs font-black uppercase tracking-[.25em] text-cyan-300">SingHUB · Behind the mic</p>
  <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight tracking-tight sm:text-7xl">You&apos;ve got the party. <span className="text-fuchsia-300">Let&apos;s find the KJ.</span></h1>
  <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">If your event already has a location, SingHUB can help connect you with local karaoke hosts. Tell us about your date, guests, setup and equipment needs. The right KJ can then discuss their service and quote directly.</p>
  <a href="#start-your-rider" className="mt-7 inline-block rounded-xl bg-cyan-300 px-6 py-4 font-black text-slate-950">Start your event rider ↓</a>
 </div></section>
 <section className="mx-auto max-w-6xl px-4 py-16"><EventRider defaultService="kj"/></section>
 <section className="mx-auto max-w-6xl px-5 pb-20"><div className="grid gap-5 md:grid-cols-3">
  {[
   ["Hosts are different","Some KJs provide the full audio and karaoke setup, while others work with existing sound systems. Confirm equipment and technical requirements directly."],
   ["A request is not a booking","SingHUB introduces potential matches. Availability, pricing, contracts, licensing and payment are determined with the KJ."],
   ["Need the room too?","You can use the same SingHUB event planner to look for both a karaoke venue and host."]
  ].map(([title,copy])=><article className="rounded-2xl border border-white/10 bg-white/[.04] p-6" key={title}><h2 className="font-extrabold text-xl">{title}</h2><p className="mt-3 leading-7 text-slate-300">{copy}</p></article>)}
 </div><div className="mt-10 flex flex-wrap gap-5 text-sm font-bold"><Link href="/plan-karaoke" className="text-cyan-300 underline">Plan the whole karaoke event</Link><Link href="/hosts" className="text-cyan-300 underline">Meet San Diego karaoke hosts</Link><Link href="/kj-bookings" className="text-cyan-300 underline">I&apos;m a KJ interested in bookings</Link></div></section>
 </main>}