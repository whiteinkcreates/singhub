import Link from "next/link";
import { SingHubMark } from "@/components/brand/SingHubMark";
import { Button } from "@/components/ui/Button";

const navItems = [
  { href: "/karaoke-near-me", label: "Karaoke Near Me" },
  { href: "/find-karaoke", label: "Find Karaoke" },
  { href: "/neighborhoods", label: "Neighborhoods" },
  { href: "/submit-listing", label: "Submit Listing" },
  { href: "/claim-listing", label: "Claim Listing" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/82 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          className="group inline-flex w-fit items-center gap-3 rounded-2xl border border-fuchsia-300/30 bg-slate-950/70 px-3 py-2 shadow-lg shadow-fuchsia-950/40 transition hover:border-cyan-300/60 hover:shadow-cyan-950/40"
        >
          <SingHubMark className="h-12 w-12 shrink-0 rounded-xl shadow-[0_0_22px_rgba(34,211,238,0.18)] transition group-hover:scale-105" />
          <span className="flex flex-col leading-none">
            <span className="text-[0.62rem] font-black uppercase tracking-[0.34em] text-cyan-200 group-hover:text-cyan-100">
              Karaoke Finder
            </span>
            <span className="mt-1 text-2xl font-black tracking-tight text-white drop-shadow-[0_0_14px_rgba(217,70,239,0.85)]">
              Sing<span className="bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">HUB</span>
            </span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-200">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white">
              {item.label}
            </Link>
          ))}
          <Button href="/venues/premium" variant="secondary" className="px-4 py-2">For Venues</Button>
        </nav>
      </div>
    </header>
  );
}
