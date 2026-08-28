import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const primaryNavItems = [
  { href: "/find-karaoke", label: "Find Karaoke" },
  { href: "/singboard", label: "SingBoard" },
  { href: "/places", label: "Venue Index" },
  { href: "/neighborhoods", label: "Neighborhoods" },
  { href: "/hosts", label: "Hosts" },
];

const utilityNavItems = [
  { href: "/submit-listing", label: "Submit Listing" },
  { href: "/claim-listing", label: "Claim Listing" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 md:gap-5 md:py-3">
        <Link
          href="/"
          className="group inline-flex min-w-0 shrink-0 items-center rounded-xl px-1 py-0 transition hover:scale-[1.01]"
          aria-label="SingHUB home"
        >
          <Image
            src="/images/header-singhub-logo.png"
            alt="SingHUB"
            width={2400}
            height={600}
            priority
            className="h-10 w-auto max-w-[180px] object-contain sm:max-w-[210px] md:h-14 md:max-w-[280px]"
          />
        </Link>

        <nav className="hidden min-w-0 items-center justify-end gap-1.5 text-sm font-semibold text-slate-200 md:flex md:gap-2">
          {primaryNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white"
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

        <details className="group relative md:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-black text-white transition hover:bg-white/10 [&::-webkit-details-marker]:hidden">
            Menu
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="h-4 w-4 transition group-open:rotate-180"
            >
              <path
                d="m5 7.5 5 5 5-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </summary>

          <div className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-2xl border border-white/15 bg-slate-950/98 p-2 shadow-2xl shadow-black/50 backdrop-blur">
            <nav aria-label="Mobile navigation" className="grid gap-1">
              {primaryNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-bold text-slate-100 transition hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}

              <div className="my-1 border-t border-white/10" />

              <Link
                href="/venues/premium"
                className="flex min-h-11 items-center rounded-xl bg-fuchsia-300/10 px-3 py-2 text-sm font-black text-fuchsia-100 transition hover:bg-fuchsia-300/15 hover:text-white"
              >
                For Venues
              </Link>

              {utilityNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
