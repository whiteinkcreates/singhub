import type {Metadata} from "next";
import Link from "next/link";
import {VenueGroupInterestForm} from "@/components/groups/VenueGroupInterestForm";
import {SITE_WORDMARK_SRC} from "@/lib/siteWordmark";

export const metadata:Metadata={
  title:"Group Karaoke Bookings for San Diego Venues | SingHUB",
  description:"Own a karaoke bar, private-room studio or event space? Register interest in possible group karaoke inquiries through SingHUB. No commitment or subscription required.",
  alternates:{canonical:"/group-venues"},
  openGraph:{title:"Bring the party to your venue | SingHUB",description:"Let SingHUB know your venue is interested in possible group karaoke inquiries.",url:"/group-venues",siteName:"SingHUB",type:"website"},
};

export default function GroupVenuesPage(){
  return <main className="min-h-screen bg-[#070a12] px-5 py-16 text-white">
    <div className="mx-auto max-w-4xl">
      <img src={SITE_WORDMARK_SRC} alt="SingHUB" className="mb-10 h-12 w-auto object-contain"/>
      <p className="text-xs font-black uppercase tracking-[.24em] text-cyan-300">SingHUB · Group event partners</p>
      <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">You&apos;ve got the room. <span className="text-fuchsia-300">Let&apos;s find the group.</span></h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">Birthdays, company outings, celebrations, and parties. We&apos;re collecting interest from San Diego venues willing to consider group karaoke inquiries. Tell us about your space so we know when it could be a fit.</p>
      <div className="mt-10"><VenueGroupInterestForm/></div>
      <p className="mt-9 text-sm text-slate-400">Looking for broader venue marketing? <Link href="/venues/premium" className="text-cyan-300 underline">Explore SingHUB for venues</Link>. Organizing an event instead? <Link href="/plan-karaoke" className="text-cyan-300 underline">Plan your karaoke party</Link>. Karaoke host? <Link href="/kj-bookings" className="text-cyan-300 underline">Join KJ booking interest</Link>.</p>
    </div>
  </main>;
}
