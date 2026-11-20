import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Find Your Mic | SingHUB",
  description: "Find karaoke, meet local hosts, and connect with SingHUB in San Diego.",
  robots: { index: false, follow: true },
};

const linkStyle =
  "group flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/[.055] px-5 py-4 text-left transition hover:border-fuchsia-300/50 hover:bg-white/[.09] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300";

export default function SingHubCardPage() {
  return (
    <main className="relative isolate min-h-[85vh] overflow-hidden bg-[#080b17] px-4 py-12 text-white sm:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse 70% 45% at 20% 5%, rgba(233,35,161,.20), transparent 70%), radial-gradient(ellipse 60% 55% at 100% 80%, rgba(0,202,255,.15), transparent 75%)" }} />
      <div className="mx-auto w-full max-w-lg">
        <div className="mx-auto mb-8 flex max-w-[260px] items-center justify-center rounded-xl bg-black/40 px-4 py-2">
          {/* The site's canonical wordmark, shared with the main navigation. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" width={240} height={98} className="h-auto w-full object-contain" />
        </div>
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[.26em] text-cyan-300">San Diego karaoke community</p>
          <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
            Find your mic.<br /><span className="text-fuchsia-300">Find your people.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-slate-300">
            Find a karaoke night, discover the people behind the mic, or connect with the SingHUB team.
          </p>
        </div>

        <div className="mt-9 grid gap-3">
          <Link href="/discover" className="group flex min-h-20 items-center justify-between gap-4 rounded-2xl bg-cyan-300 px-5 py-4 font-black text-slate-950 shadow-[0_0_36px_rgba(34,211,238,.16)] transition hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fuchsia-300">
            <span><span className="block text-lg">Find karaoke tonight</span><span className="mt-1 block text-xs font-semibold text-slate-700">Venues, nights, neighborhoods and more</span></span>
            <span aria-hidden="true" className="text-2xl">↗</span>
          </Link>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/venues/premium" className={linkStyle}>
              <span><span className="block font-bold">Own a venue?</span><span className="mt-1 block text-xs leading-5 text-slate-300">See SingHUB for venues</span></span>
              <span aria-hidden="true" className="text-xl text-fuchsia-300">↗</span>
            </Link>
            <Link href="/hosts" className={linkStyle}>
              <span><span className="block font-bold">Host karaoke?</span><span className="mt-1 block text-xs leading-5 text-slate-300">Meet the KJs and hosts</span></span>
              <span aria-hidden="true" className="text-xl text-cyan-300">↗</span>
            </Link>
          </div>
          <a href="/card/contact.vcf" download="SingHUB-Corey-White.vcf" className={linkStyle}>
            <span><span className="block font-bold">Save founder contact</span><span className="mt-1 block text-xs text-slate-300">Corey White · SingHUB</span></span>
            <span aria-hidden="true" className="text-xl text-cyan-300">↓</span>
          </a>
        </div>

        <p className="mt-7 text-center text-sm text-slate-400">
          Want to talk? <a href="mailto:hello@singhub.app?subject=Hello%20from%20your%20SingHUB%20card" className="font-semibold text-fuchsia-200 underline decoration-fuchsia-300/50 underline-offset-4 hover:text-white">hello@singhub.app</a>
        </p>
        <p className="mt-4 text-center text-xs text-slate-600">No app download required.</p>
      </div>
    </main>
  );
}
