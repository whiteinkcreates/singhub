import Link from "next/link";
import { Button } from "@/components/ui/Button";

const navItems = [
  { href: "/find-karaoke", label: "Find Karaoke" },
  { href: "/submit-listing", label: "Submit Listing" },
  { href: "/claim-listing", label: "Claim Listing" },
  { href: "/scout", label: "Scout" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="text-2xl font-black tracking-tight text-white">
          Sing<span className="text-fuchsia-400">HUB</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-200">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <Button href="/venues/premium" variant="secondary" className="px-4 py-2">
            Premium Profile
          </Button>
        </nav>
      </div>
    </header>
  );
}
