import Link from "next/link";

const footerLinks = [
  { href: "/find-karaoke", label: "Find Karaoke" },
  { href: "/places", label: "Venue Index" },
  { href: "/hosts", label: "Hosts" },
  { href: "/singboard", label: "SingBoard" },
  { href: "/submit-listing", label: "Submit Listing" },
  { href: "/claim-listing", label: "Claim Listing" },
  { href: "/venues/premium", label: "For Venues" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/70">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm text-slate-400 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="font-semibold text-white">SingHUB</p>
          <p className="mt-2 max-w-2xl">
            Find karaoke near you, starting with San Diego. Listings are updated
            as we verify schedules, add venues, and build the local karaoke
            community.
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="flex max-w-xl flex-wrap gap-x-4 gap-y-3 font-semibold text-slate-300 md:justify-end"
        >
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
