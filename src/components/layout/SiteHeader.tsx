import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const navItems = [
  { href: "/karaoke-near-me", label: "Karaoke Near Me", mobile: false },
  { href: "/find-karaoke", label: "Find Karaoke", mobile: true },
  { href: "/singboard", label: "SingBoard", mobile: true },
  { href: "/places", label: "Places", mobile: true },
  { href: "/neighborhoods", label: "Neighborhoods", mobile: false },
  { href: "/hosts", label: "Hosts", mobile: false },
  { href: "/community/san-diego", label: "SD Room", mobile: false },
  { href: "/submit-listing", label: "Submit Listing", mobile: false },
  { href: "/claim-listing", label: "Claim Listing", mobile: false },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-black/88 backdrop-blur">
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

        <nav className="flex min-w-0 items-center justify-end gap-1.5 text-xs font-semibold text-slate-200 md:gap-2 md:text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-2.5 py-1.5 transition hover:bg-white/10 hover:text-white md:px-3 md:py-2 ${
                item.mobile ? "inline-flex" : "hidden md:inline-flex"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Button
            href="/venues/premium"
            variant="secondary"
            className="hidden px-3 py-1.5 md:inline-flex md:px-4 md:py-2"
          >
            For Venues
          </Button>
        </nav>
      </div>
    </header>
  );
}
