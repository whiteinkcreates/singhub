import type { Metadata } from "next";
import Link from "next/link";
import { EventRider } from "@/components/groups/EventRider";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_WORDMARK_SRC } from "@/lib/siteWordmark";

export const metadata: Metadata = {
  title:"Plan a Karaoke Party in San Diego | Venues & KJs | SingHUB",
  description:"Planning a holiday party, company outing or birthday karaoke event in San Diego? Tell SingHUB what you need. We'll help connect you with possible karaoke venues and KJs.",
  alternates:{canonical:"/plan-karaoke"},
  openGraph:{title:"Plan Your Karaoke Event | SingHUB",description:"The guest list is yours. We'll help you find the mic, the room, or both.",url:"/plan-karaoke",siteName:"SingHUB",type:"website"},
};
const faqs=[
  {question:"Can SingHUB help with a corporate karaoke event?",answer:"Yes. Tell us your approximate group size, desired neighborhood, budget and date. We can help identify suitable venues and/or karaoke hosts, subject to their availability."},
  {question:"Do I need to book a venue to hire a KJ?",answer:"No. If you already have a location, select karaoke host only. We can make introductions to interested KJs who may offer different equipment and services."},
  {question:"Is this a booking or a quote?",answer:"It is an inquiry. SingHUB reviews the request and facilitates introductions. The provider confirms availability, terms and any payment directly. There is no booking or payment on this page."},
  {question:"Can we get custom event shirts?",answer:"You can request custom event shirts as an optional add-on. Design, quantities, pricing and fulfillment would be confirmed separately before ordering."},
];
export default function PlanKaraokePage(){
  return <main className="min-h-screen bg-[#070a12] text-white">
    <section className="relative isolate overflow-hidden px-5 pb-16 pt-14 md:pb-24 md:pt-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_15%,rgba(70,197,216,.18),transparent_47%),radial-gradient(ellipse_at_10%_70%,rgba(222,73,170,.14),transparent_43%)]"/>
      <div className="relative mx-auto max-w-6xl">
        <div className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[.2em] text-cyan-300"><img src={SITE_WORDMARK_SRC} alt="SingHUB" className="h-11 w-auto object-contain" /> <span className="border-l border-white/20 pl-3">Event planning</span></div>
        <div className="mt-12 grid gap-9 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div><p className="mb-5 text-xs font-extrabold uppercase tracking-[.3em] text-fuchsia-300">The guest list is yours. We&apos;ll find the mic.</p>
            <h1 className="max-w-4xl text-5xl font-black leading-[.98] tracking-tight sm:text-7xl">Your people. <span className="text-cyan-300">Your playlist.</span> Your night.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">From holiday parties and company outings to birthdays and reunions, tell us what you&apos;re planning. SingHUB helps connect you with the karaoke venue, host, or both that fit the occasion.</p>
            <a href="#start-your-rider" className="mt-7 inline-flex rounded-xl bg-cyan-300 px-6 py-4 text-sm font-black text-slate-950 hover:bg-cyan-200">Build your event rider ↓</a></div>
          <aside className="rounded-3xl border border-white/15 bg-slate-900/65 p-6 md:p-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-200">Your backstage pass</p>
            <div className="mt-6 grid gap-6">{[{n:"01",title:"Tell us about the show",text:"A few quick details about your people, priorities and plans."},{n:"02",title:"We look for the fit",text:"We review possible venues and karaoke hosts, without pretending availability is confirmed."},{n:"03",title:"Connect and confirm",text:"Interested providers confirm their own quotes, booking terms and payment."}].map(s=><div className="flex gap-4" key={s.n}><span className="text-2xl font-black text-fuchsia-300">{s.n}</span><div><h2 className="font-extrabold">{s.title}</h2><p className="mt-1 text-sm leading-6 text-slate-400">{s.text}</p></div></div>)}</div>
          </aside>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-4 pb-20"><EventRider/></section>
    <section className="border-t border-white/10 bg-slate-950/65 px-5 py-20"><div className="mx-auto max-w-6xl">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Holiday parties · corporate karaoke · birthdays</p>
      <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">A holiday party people actually want to attend.</h2>
      <p className="mt-5 max-w-3xl text-slate-300 leading-8">Planning a team celebration in San Diego? Start with the date, guest count and experience you&apos;re after. A public karaoke bar may suit a social mixer; a private event space or dedicated KJ may better serve a group where everyone wants a song. We&apos;ll help you explore the possibilities.</p>
      <div className="mt-8 flex flex-wrap gap-3"><a href="#start-your-rider" className="rounded-xl bg-fuchsia-300 px-5 py-3 font-extrabold text-slate-950">Plan a holiday event</a><Link href="/hire-a-kj" className="rounded-xl border border-cyan-300/40 px-5 py-3 font-extrabold text-cyan-200">Already have a venue? Hire a KJ</Link></div>
    </div></section>
    <section className="mx-auto max-w-6xl px-5 py-20"><h2 className="text-3xl font-black sm:text-4xl">Good questions before the encore</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2">{faqs.map(f=><article key={f.question} className="rounded-2xl border border-white/10 bg-white/[.04] p-6"><h3 className="text-lg font-extrabold">{f.question}</h3><p className="mt-3 text-sm leading-7 text-slate-300">{f.answer}</p></article>)}</div>
      <p className="mt-10 text-sm text-slate-400">Own a venue interested in hosting groups? <Link href="/group-venues" className="font-bold text-cyan-300 underline">Join venue group-booking interest</Link>. Karaoke host looking for bookings? <Link href="/kj-bookings" className="font-bold text-cyan-300 underline">Join the booking interest list</Link>.</p>
    </section>
    <JsonLd data={{"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map(f=>({"@type":"Question",name:f.question,acceptedAnswer:{"@type":"Answer",text:f.answer}}))}}/>
  </main>;
}