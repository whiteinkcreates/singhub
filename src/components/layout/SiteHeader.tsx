import Image from "next/image";
import Link from "next/link";
import headerLogo from "../../singhub-mark.png";
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
    <header className="sticky top-0 z-10 border-b border-white/10 bg-black/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          className="group inline-flex w-fit items-center rounded-2xl px-1 py-1 transition hover:scale-[1.01]"
          aria-label="SingHUB home"
        >
          <Image
            src={headerLogo}
            alt="SingHUB"
            priority
            className="h-auto w-[230px] max-w-[70vw] object-contain drop-shadow-[0_0_22px_rgba(217,70,239,0.5)] md:w-[300px]"
          />
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
