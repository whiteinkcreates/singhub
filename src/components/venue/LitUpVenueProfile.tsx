/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/Button";
import { LitUpVenueTabs } from "@/components/venue/LitUpVenueTabs";
import type { KaraokeEventListing, VenueListing } from "@/types";
import type { SingersSaySummary } from "@/lib/singersSay.server";
import {
  getTonightSpecials,
  getVenueEnhancement,
  type VenueEnhancement,
} from "@/lib/venueEnhancements";

const DEFAULT_BANNER_IMAGE_URL = "/images/venues/default-singhub-banner.svg";

function clean(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed || /^(tbd|unknown|-|n\/a)$/i.test(trimmed)) return undefined;
  return trimmed;
}

function getDirectionsUrl(venue: VenueListing) {
  if (!clean(venue.address)) return undefined;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.venueName} ${venue.address}`)}`;
}

function getInstagramUrl(value?: string) {
  const instagram = clean(value);
  if (!instagram) return undefined;
  if (instagram.startsWith("http://") || instagram.startsWith("https://")) return instagram;
  return `https://www.instagram.com/${instagram.replace(/^@/, "")}`;
}

function ActionLink({ href, label, symbol, featured = false }: { href: string; label: string; symbol: string; featured?: boolean }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={`group flex min-h-16 flex-col items-center justify-center rounded-2xl border px-3 py-3 text-center transition ${featured ? "border-[#ff2aa3] bg-[#ff2aa3]/10 text-fuchsia-100 hover:bg-[#ff2aa3]/20" : "border-white/12 bg-white/[0.035] text-slate-200 hover:border-cyan-300/40 hover:bg-cyan-300/[0.05]"}`}>
      <span className={`text-xl font-black ${featured ? "text-fuchsia-300" : "text-cyan-200"}`} aria-hidden>{symbol}</span>
      <span className="mt-1 text-xs font-black">{label}</span>
    </a>
  );
}

export function LitUpVenueProfile({ venue, events = [], enhancement: savedEnhancement, singersSay }: { venue: VenueListing; events?: KaraokeEventListing[]; enhancement?: VenueEnhancement; singersSay?: SingersSaySummary }) {
  const enhancement = savedEnhancement || getVenueEnhancement(venue.slug);
  if (!enhancement) return null;

  const heroUrl = clean(enhancement.heroImageUrl) || clean(venue.bannerImageUrl) || DEFAULT_BANNER_IMAGE_URL;
  const heroAlt = clean(enhancement.heroImageAlt) || clean(venue.bannerImageAlt) || `${venue.venueName} venue`;
  const directionsUrl = getDirectionsUrl(venue);
  const instagramUrl = getInstagramUrl(venue.instagram);
  const websiteUrl = clean(venue.website);
  const phone = clean(enhancement.phone);
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "America/Los_Angeles" }).format(new Date());
  const todayEvents = events.filter((event) => clean(event.karaokeDay)?.toLowerCase() === weekday.toLowerCase());
  const tonightSpecials = getTonightSpecials(enhancement, weekday);
  const nextKaraokeEvent = events.find((event) => event.recurring) ?? events[0];
  const karaokeLabel = nextKaraokeEvent ? [clean(nextKaraokeEvent.karaokeDay), clean(nextKaraokeEvent.startTime)].filter(Boolean).join(" ") : undefined;

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#071019] shadow-2xl shadow-black/30">
      <section className="relative min-h-[20rem] overflow-hidden md:min-h-[28rem]">
        <img src={heroUrl} alt={heroAlt} className="absolute inset-0 h-full w-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071019] via-[#071019]/30 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#22d3ee] via-[#ff2aa3] to-[#8b5cf6]" />
        {enhancement.gallery.length > 0 ? <div className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-xs font-black text-white backdrop-blur">1 / {enhancement.gallery.length + 1}</div> : null}
        <div className="relative flex min-h-[20rem] flex-col justify-end p-5 md:min-h-[28rem] md:p-8">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#ff2aa3] px-3 py-1.5 text-[0.7rem] font-black uppercase tracking-[0.12em] text-white">Karaoke</span>
            {karaokeLabel ? <span className="rounded-full border border-cyan-300/60 bg-[#061820]/75 px-3 py-1.5 text-[0.7rem] font-black uppercase tracking-[0.12em] text-cyan-100 backdrop-blur">{karaokeLabel}</span> : null}
          </div>
        </div>
      </section>

      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-black leading-none text-white md:text-5xl">{venue.venueName}</h1>
            <p className="mt-2 text-sm font-semibold text-slate-400">{[venue.neighborhood || venue.city, clean(venue.address)].filter(Boolean).join(" • ")}</p>
            {enhancement.tagline ? <p className="mt-4 text-base leading-7 text-slate-200 md:text-lg">{enhancement.tagline}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {venue.vibeTags.slice(0, 5).map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-300">{tag}</span>)}
              {enhancement.amenities.slice(0, Math.max(0, 5 - venue.vibeTags.length)).map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-300">{tag}</span>)}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {directionsUrl ? <ActionLink href={directionsUrl} label="Directions" symbol="⌖" featured /> : null}
          {phone ? <ActionLink href={`tel:${phone}`} label="Call" symbol="☎" /> : null}
          {websiteUrl ? <ActionLink href={websiteUrl} label="Website" symbol="↗" /> : null}
          {instagramUrl ? <ActionLink href={instagramUrl} label="Instagram" symbol="◎" /> : null}
          {enhancement.menuUrl ? <ActionLink href={enhancement.menuUrl} label="Menu" symbol="≡" /> : null}
        </div>

        <section className="mt-7 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-4 md:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">Tonight at {venue.venueName}</p><h2 className="mt-1 text-2xl font-black text-white">{weekday}</h2></div>
            {todayEvents.length === 0 && tonightSpecials.length === 0 ? <p className="text-xs text-slate-500">Nothing featured for tonight yet.</p> : null}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {todayEvents.map((event) => <div key={event.eventId} className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/[0.06] p-4"><p className="text-xs font-black uppercase tracking-[0.15em] text-fuchsia-200">Karaoke</p><p className="mt-2 text-lg font-black text-white">{clean(event.startTime) ? `${event.startTime}${clean(event.endTime) ? ` – ${event.endTime}` : ""}` : event.karaokeDay}</p>{clean(event.hostName) ? <p className="mt-1 text-sm text-slate-300">KJ: {event.hostName}</p> : null}</div>)}
            {tonightSpecials.map((special) => <div key={`${special.day}-${special.title}`} className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] p-4"><p className="text-xs font-black uppercase tracking-[0.15em] text-cyan-200">Tonight&apos;s deal</p><p className="mt-2 text-lg font-black text-white">{special.price ? `${special.price} ` : ""}{special.title}</p>{special.detail ? <p className="mt-1 text-sm text-slate-300">{special.detail}</p> : null}</div>)}
          </div>
        </section>

        <LitUpVenueTabs venueName={venue.venueName} enhancement={enhancement} events={events} singersSay={singersSay} />

        <div className="mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-6"><Button href={`/claim-listing?venue=${venue.slug}`} variant="ghost">Claim or update this listing</Button></div>
      </div>
    </article>
  );
}
