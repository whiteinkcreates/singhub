import Image from "next/image";
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
    <header className="sticky top-0 z-10 border-b border-white/10 bg-black/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2 md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          className="group inline-flex w-fit items-center rounded-xl px-1 py-0 transition hover:scale-[1.01]"
          aria-label="SingHUB home"
        >
          <Image
            src="/images/header-singhub-logo.png"
            alt="SingHUB"
            width={2400}
            height={600}
            priority
            className="h-11 w-auto max-w-[210px] object-contain md:h-14 md:max-w-[280px]"
          />
        </Link>

        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-200 md:gap-2 md:text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-2.5 py-1.5 transition hover:bg-white/10 hover:text-white md:px-3 md:py-2"
            >
              {item.label}
            </Link>
          ))}
          <Button
            href="/venues/premium"
            variant="secondary"
            className="px-3 py-1.5 md:px-4 md:py-2"
          >
            For Venues
          </Button>
        </nav>
      </div>
    </header>
  );
}
