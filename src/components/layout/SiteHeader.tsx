import Link from "next/link";
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
    <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="group inline-flex w-fit -rotate-2 flex-col items-center rounded-xl border border-fuchsia-300/40 bg-slate-950/80 px-4 py-2 shadow-lg shadow-fuchsia-950/40 transition hover:rotate-0 hover:border-cyan-300/60">
          <span className="text-[0.65rem] font-black uppercase tracking-[0.38em] text-cyan-200 group-hover:text-cyan-100">Karaoke</span>
          <span className="text-2xl font-black leading-none tracking-tight text-white drop-shadow-[0_0_14px_rgba(217,70,239,0.8)]">Sing<span className="text-fuchsia-400">HUB</span></span>
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
