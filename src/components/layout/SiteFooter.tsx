import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-slate-400 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-semibold text-white">SingHUB</p>
          <p className="mt-2 max-w-xl leading-6">
            Find karaoke near you, starting with San Diego. Search karaoke
            nights, places, neighborhoods, and hosts without piecing together
            scattered posts.
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
            Karaoke entries powered by{" "}
            <Link href="/scout" className="text-fuchsia-200 hover:text-white">
              SingHUB Scout
            </Link>
            .
          </p>
        </div>

        <nav aria-label="Explore SingHUB">
          <p className="font-black uppercase tracking-[0.16em] text-white">
            Explore
          </p>
          <div className="mt-3 grid gap-3 font-semibold text-slate-300">
            <Link href="/find-karaoke" className="hover:text-white">
              Find Karaoke
            </Link>
            <Link href="/places" className="hover:text-white">
              Karaoke Places
            </Link>
            <Link href="/hosts" className="hover:text-white">
              Hosts
            </Link>
            <Link href="/community/san-diego" className="hover:text-white">
              San Diego Community
            </Link>
          </div>
        </nav>

        <nav aria-label="Contribute to SingHUB">
          <p className="font-black uppercase tracking-[0.16em] text-white">
            Contribute
          </p>
          <div className="mt-3 grid gap-3 font-semibold text-slate-300">
            <Link href="/submit-listing" className="hover:text-white">
              Submit a Listing
            </Link>
            <Link href="/claim-listing" className="hover:text-white">
              Claim a Listing
            </Link>
            <Link href="/venues/premium" className="hover:text-white">
              For Venues
            </Link>
          </div>
        </nav>

        <nav aria-label="About and contact">
          <p className="font-black uppercase tracking-[0.16em] text-white">
            SingHUB
          </p>
          <div className="mt-3 grid gap-3 font-semibold text-slate-300">
            <Link href="/about" className="hover:text-white">
              About SingHUB
            </Link>
            <a
              href="mailto:hello@singhub.app"
              className="break-all text-cyan-200 hover:text-white"
            >
              hello@singhub.app
            </a>
          </div>
        </nav>
      </div>
    </footer>
  );
}
