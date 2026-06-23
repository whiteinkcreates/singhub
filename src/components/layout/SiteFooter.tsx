import Link from "next/link";

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
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
            Karaoke entries powered by{" "}
            <Link href="/scout" className="text-fuchsia-200 hover:text-white">
              SingHUB Scout
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-4 font-semibold text-slate-300">
          <Link href="/find-karaoke" className="hover:text-white">
            Find Karaoke
          </Link>
          <Link href="/submit-listing" className="hover:text-white">
            Submit
          </Link>
          <Link href="/claim-listing" className="hover:text-white">
            Claim
          </Link>
        </div>
      </div>
    </footer>
  );
}
