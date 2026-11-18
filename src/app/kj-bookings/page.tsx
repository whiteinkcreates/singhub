import type {Metadata} from "next";
import Link from "next/link";
import {KjInterestForm} from "@/components/groups/KjInterestForm";
export const metadata:Metadata={
 title:"Karaoke Host Booking Opportunities in San Diego | SingHUB",
 description:"San Diego KJs can opt in to hear about potential corporate, holiday and private karaoke event booking requests through SingHUB. No guaranteed referrals or automatic enrollment.",
 alternates:{canonical:"/kj-bookings"}
};
export default function KjBookingsPage(){return <main className="min-h-screen bg-[#070a12] px-5 py-16 text-white"><div className="mx-auto max-w-4xl">
 <p className="text-xs font-black uppercase tracking-[.24em] text-cyan-300">SingHUB · For karaoke hosts</p>
 <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">Your next gig could be <span className="text-fuchsia-300">someone&apos;s best night.</span></h1>
 <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">We&apos;re developing ways to connect local event organizers with KJs. Tell us where you work, what equipment you bring and how you price events. If we find a possible match, we&apos;ll reach out first. No commitment, subscription or booking guarantee.</p>
 <div className="mt-10"><KjInterestForm/></div>
 <p className="mt-9 text-sm text-slate-400">Already have a public SingHUB host profile? This opt-in doesn&apos;t replace it. <Link href="/hosts" className="text-cyan-300 underline">Explore host profiles</Link> · <Link href="/plan-karaoke" className="text-cyan-300 underline">For event organizers</Link></p>
 </div></main>}