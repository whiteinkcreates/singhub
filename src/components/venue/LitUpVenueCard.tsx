/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { KaraokeEventListing, VenueListing } from "@/types";
import { getVenueEnhancement } from "@/lib/venueEnhancements";

type LitUpVenueCardProps = {
  venue: VenueListing;
  events?: KaraokeEventListing[];
  distanceLabel?: string;
};

const DEFAULT_BANNER_IMAGE_URL = "/images/venues/default-singhub-banner.svg";
const TAG_GLYPHS: Record<string, string> = {
  "Food available": "🍴",
  "Full bar": "🍸",
  "Beer & wine": "🍺",
  "Outdoor seating": "☀",
  "Good for groups": "◉",
  "Pool tables": "●",
  "Bar games": "◆",
  "Dance floor": "♪",
  "Patio": "☀",
  "Game night": "★",
  "Late night food": "☾",
  "BBQ": "♨",
};

function clean(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed || /^(tbd|unknown|-|n\/a)$/i.test(trimmed)) return undefined;
  return trimmed;
}

function scheduleLabel(venue: VenueListing, events: KaraokeEventListing[]) {
  const first = events.find((event) => event.recurring) ?? events[0];
  if (first) {
    const time = clean(first.startTime);
    return [clean(first.karaokeDay), time].filter(Boolean).join(" ");
  }
  return [clean(venue.karaokeDay), clean(venue.startTime)].filter(Boolean).join(" ");
}

export function LitUpVenueCard({ venue, events = [], distanceLabel }: LitUpVenueCardProps) {
  const fallbackEnhancement = getVenueEnhancement(venue.slug);
  const imageUrl = clean(venue.bannerImageUrl) || clean(fallbackEnhancement?.heroImageUrl) || DEFAULT_BANNER_IMAGE_URL;
  const imageAlt = clean(venue.bannerImageAlt) || clean(fallbackEnhancement?.heroImageAlt) || `${venue.venueName} venue`;
  const imagePosition = venue.bannerImagePosition || fallbackEnhancement?.heroPosition || "center";
  const schedule = scheduleLabel(venue, events);
  const highlights = (venue.enhancementAmenities?.length ? venue.enhancementAmenities : fallbackEnhancement?.amenities.length ? fallbackEnhancement.amenities : venue.vibeTags).slice(0, 3);
  const summary = venue.enhancementTagline || fallbackEnhancement?.tagline || venue.description;

  return (
    <article className="group overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0b1118] shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:border-fuchsia-400/50 hover:shadow-fuchsia-950/20">
      <Link href={`/venues/${venue.slug}`} className="block focus:outline-none focus:ring-2 focus:ring-fuchsia-400">
        <div className="relative h-44 overflow-hidden sm:h-52">
          <img src={imageUrl} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-300 group-hover:scale-[1.015] group-hover:opacity-68" style={{ objectPosition: imagePosition }} loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1118] via-[#0b1118]/28 to-black/5" />
          <div className="absolute right-4 top-4 flex flex-wrap justify-end gap-2">{venue.isFeatured ? <span className="rounded-full border border-violet-300/40 bg-black/55 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-violet-100 backdrop-blur">Featured</span> : null}{distanceLabel ? <span className="rounded-full border border-white/15 bg-black/55 px-3 py-1 text-xs font-bold text-white backdrop-blur">{distanceLabel}</span> : null}</div>
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#ff2aa3] px-3 py-1 text-[0.7rem] font-black uppercase tracking-[0.12em] text-white">Karaoke</span>
              {schedule && <span className="rounded-full border border-[#22d3ee]/70 bg-[#07151c]/80 px-3 py-1 text-[0.7rem] font-black uppercase tracking-[0.12em] text-cyan-100 backdrop-blur">{schedule}</span>}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black leading-tight text-white transition group-hover:text-fuchsia-100">{venue.venueName}</h3>
              <p className="mt-1 text-sm text-slate-400">{venue.neighborhood || venue.city}{distanceLabel ? ` • ${distanceLabel}` : ""}</p>
            </div>
            <span className="mt-1 text-xl text-fuchsia-300 transition group-hover:translate-x-0.5" aria-hidden>→</span>
          </div>
          {summary && <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-200">{summary}</p>}
          {highlights.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{highlights.map((item) => <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-slate-300">{TAG_GLYPHS[item] ? <span className="text-cyan-200" aria-hidden>{TAG_GLYPHS[item]}</span> : null}{item}</span>)}</div>}
        </div>
      </Link>
    </article>
  );
}
