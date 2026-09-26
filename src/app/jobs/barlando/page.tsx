import type { Metadata } from "next";
import Link from "next/link";
import { ShareJobButton } from "@/components/jobs/ShareJobButton";

export const metadata: Metadata = {
  title: "BarLando Jobs in San Diego | Bartenders, Servers & Kitchen Help",
  description: "BarLando in San Diego is hiring bartenders, servers, and kitchen help. Join a neighborhood bar and BBQ spot with drinks, games, community events, and Friday karaoke.",
  keywords: [
    "BarLando jobs",
    "bartender jobs San Diego",
    "server jobs San Diego",
    "kitchen jobs San Diego",
    "bar jobs San Diego",
    "hospitality jobs San Diego",
    "bartender jobs College Area",
    "restaurant jobs Rolando",
  ],
  alternates: { canonical: "/jobs/barlando" },
  openGraph: {
    title: "WANTED: Join the BarLando Crew",
    description: "BarLando is hiring bartenders, servers, and kitchen help in San Diego.",
    url: "https://singhub.app/jobs/barlando",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WANTED: Join the BarLando Crew",
    description: "Bartenders, servers, and kitchen help wanted in San Diego.",
  },
};

const roles = [
  {
    id: "bartenders",
    title: "Bartenders",
    copy: "If you like a lively neighborhood room, can keep a bar moving, and know how to make regulars feel like regulars, BarLando wants to hear from you.",
  },
  {
    id: "servers",
    title: "Servers",
    copy: "Good energy matters here. BarLando is looking for people who can take care of guests, move with the room, and be part of a place built around food, drinks, events, and community.",
  },
  {
    id: "kitchen-help",
    title: "Kitchen Help",
    copy: "This is a bar that takes its food more seriously than it takes itself. If you care about putting out good food consistently and keeping your cool when the room gets busy, introduce yourself.",
  },
];

export default function BarLandoJobsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-white md:py-14">
      <Link href="/singboard" className="text-sm font-black text-cyan-300">← Back to SingBOARD</Link>

      <article className="mt-5 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0d12] shadow-2xl">
        <header className="border-b border-white/10 bg-[#f4f1e8] px-6 py-9 text-slate-950 sm:px-10 sm:py-12">
          <p className="text-sm font-black uppercase tracking-[.28em] text-[#e5482d]">Wanted</p>
          <h1 className="mt-2 text-5xl font-black uppercase leading-[.92] sm:text-7xl">Join the BarLando crew.</h1>
          <p className="mt-5 max-w-3xl text-lg font-bold leading-8 sm:text-xl">
            Join a fun neighborhood bar that takes its food more seriously than it takes itself.
          </p>
          <p className="mt-3 max-w-3xl leading-7 text-slate-700">
            BarLando is a Rolando / College Area bar and BBQ spot with a full bar, pool, weekly specials,
            community events, game nights, and Friday karaoke. They are currently looking for bartenders,
            servers, and kitchen help.
          </p>
        </header>

        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_290px]">
          <div>
            <section>
              <p className="text-xs font-black uppercase tracking-[.22em] text-fuchsia-300">The pitch</p>
              <h2 className="mt-2 text-3xl font-black">A bar job with some personality.</h2>
              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                BarLando is not trying to feel like a beige corporate restaurant. It is a neighborhood spot
                built around good food, cold drinks, regulars, games, events, and nights that actually feel
                like something is happening. If you want to work somewhere social, local, and a little less
                buttoned-up, this is worth a conversation.
              </p>
            </section>

            <section className="mt-9 space-y-4">
              <h2 className="text-2xl font-black">Who they&apos;re looking for</h2>
              {roles.map((role) => (
                <div key={role.id} id={role.id} className="rounded-2xl border border-white/10 bg-white/[.045] p-5">
                  <h3 className="text-xl font-black text-white">{role.title}</h3>
                  <p className="mt-2 leading-7 text-slate-300">{role.copy}</p>
                </div>
              ))}
            </section>

            <section className="mt-9 rounded-2xl border border-cyan-300/20 bg-cyan-300/[.06] p-5">
              <h2 className="text-xl font-black">A quick note before you apply</h2>
              <p className="mt-2 leading-7 text-slate-300">
                BarLando has not provided SingHUB with a formal pay range, shift schedule, or requirement list
                yet. Ask the venue directly for the current details for the role you&apos;re interested in.
              </p>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-white/10 bg-white/[.045] p-5">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#ff765f]">BarLando</p>
            <p className="mt-2 font-bold text-white">6548 El Cajon Blvd</p>
            <p className="text-sm text-slate-400">San Diego, CA 92115</p>

            <div className="mt-5 flex flex-col gap-3">
              <a href="tel:+16199133287" className="rounded-xl bg-[#e5482d] px-5 py-3 text-center font-black text-white">
                Call BarLando
              </a>
              <a href="https://barlandobar.com/" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/15 px-5 py-3 text-center font-black text-white">
                Visit BarLando ↗
              </a>
              <Link href="/venues/barlando" className="rounded-xl border border-cyan-300/25 px-5 py-3 text-center font-black text-cyan-200">
                See BarLando on SingHUB
              </Link>
              <ShareJobButton title="BarLando is hiring in San Diego" />
            </div>

            <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-slate-500">
              Know somebody who belongs behind this bar or in this kitchen? Send them this page.
            </p>
          </aside>
        </div>
      </article>
    </main>
  );
}
