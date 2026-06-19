import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { VenueCard } from "@/components/venue/VenueCard";
import { getTickerItems } from "@/lib/tickerData";
import { getFeaturedVenueListings } from "@/lib/venueData";

const heroQuickLinks = [
  { href: "/find-karaoke?type=live", label: "Live karaoke", tone: "fuchsia" },
  { href: "/find-karaoke?type=private-room", label: "Private rooms", tone: "cyan" },
  { href: "/find-karaoke?day=tonight", label: "Tonight", tone: "fuchsia" },
];

function KaraokeTicker({ items }: { items: string[] }) {
  const tickerItems = [...items, ...items, ...items];

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-fuchsia-300/40 bg-slate-950/70 shadow-lg shadow-fuchsia-950/40 backdrop-blur md:mt-8">
      <div className="flex min-w-max animate-[marquee_32s_linear_infinite] gap-8 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-cyan-100 hover:[animation-play-state:paused] md:text-sm md:tracking-[0.18em]">
        {tickerItems.map((item, index) => (
          <span key={`${item}-${index}`} className="flex shrink-0 items-center gap-8 whitespace-nowrap">
            <span>{item}</span>
            <span className="text-fuchsia-300">✦</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const featuredVenues = getFeaturedVenueListings();
  const tickerItems = getTickerItems();

  return (
    <main>
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 md:py-10">
        <div className="relative overflow-hidden rounded-[1.55rem] border-2 border-fuchsia-300/50 bg-slate-950 shadow-2xl shadow-fuchsia-950/50 sm:rounded-[2rem] md:rounded-[2.5rem]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-95"
            style={{ backgroundImage: "url('/images/hero/san-diego-skyline-vector.svg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/82 to-slate-950/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-slate-950/45" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(217,70,239,0.28),transparent_24rem),radial-gradient(circle_at_78%_38%,rgba(34,211,238,0.22),transparent_26rem)]" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-blue-400" />

          <div className="relative min-h-[36rem] px-4 py-6 sm:px-6 sm:py-8 md:min-h-[40rem] md:px-10 md:py-10 lg:px-14 lg:py-12">
            <div className="flex h-full max-w-4xl flex-col justify-end md:justify-center">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.24em] text-cyan-200 sm:text-sm sm:tracking-[0.32em]">
                San Diego Karaoke Starts Here
              </p>

              <div className="w-full max-w-[min(100%,47rem)] rounded-[1.35rem] border-2 border-cyan-300/70 bg-slate-950/60 px-4 py-4 shadow-[0_0_34px_rgba(34,211,238,0.35)] backdrop-blur sm:w-fit sm:rounded-[1.7rem] sm:px-5 md:px-7 md:py-5">
                <span className="block animate-pulse text-[3.35rem] font-black uppercase leading-[0.9] tracking-tight text-cyan-100 drop-shadow-[0_0_28px_rgba(34,211,238,0.95)] sm:text-7xl md:text-8xl lg:text-9xl">
                  Karaoke
                </span>
                <span className="mt-2 block text-[2.4rem] font-black leading-none text-fuchsia-300 drop-shadow-[0_0_22px_rgba(217,70,239,0.9)] sm:text-5xl md:text-6xl lg:text-7xl">
                  Near You
                </span>
                <span className="mt-2 block text-[2rem] font-black leading-none text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.65)] sm:text-4xl md:text-5xl lg:text-6xl">
                  in San Diego
                </span>
              </div>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-100 md:mt-7 md:text-lg md:leading-8">
                Find karaoke bars, private rooms, and live karaoke nights in San
                Diego without digging through outdated calendars and random
                Instagram posts.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row md:mt-7">
                <Button href="/find-karaoke">Find Karaoke Tonight</Button>
                <Button href="/venues/premium" variant="secondary">
                  For Venues
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-slate-100">
                {heroQuickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full border px-4 py-2 backdrop-blur transition hover:-translate-y-0.5 hover:bg-slate-950/80 ${
                      link.tone === "cyan"
                        ? "border-cyan-300/50 bg-slate-950/55 text-cyan-100 hover:border-cyan-200"
                        : "border-fuchsia-300/50 bg-slate-950/55 text-fuchsia-100 hover:border-fuchsia-200"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <KaraokeTicker items={tickerItems} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-fuchsia-300">
              Featured Nights
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              Start with these local karaoke nights
            </h2>
          </div>
          <Button href="/find-karaoke" variant="ghost">
            View all karaoke nights
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      </section>
    </main>
  );
}
