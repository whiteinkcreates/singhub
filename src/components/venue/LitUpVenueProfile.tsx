/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/Button";
import { LitUpVenueTabs } from "@/components/venue/LitUpVenueTabs";
import type { KaraokeEventListing, VenueListing } from "@/types";
import type { SingersSaySummary } from "@/lib/singersSay.server";
import { getSanDiegoNightlifeWeekday } from "@/lib/nightlifeTime";
import {
  getTonightSpecials,
  getVenueEnhancement,
  type VenueEnhancement,
} from "@/lib/venueEnhancements";

const DEFAULT_BANNER_IMAGE_URL = "/images/venues/default-singhub-banner.svg";
const ACTION_LINK_STYLES = {
  primary:
    "bg-[#ff2aa3] px-5 py-3 text-white shadow-lg shadow-fuchsia-950/30 hover:bg-fuchsia-400",
  secondary:
    "border border-cyan-300/40 bg-cyan-300/[0.07] px-5 py-3 text-cyan-50 hover:border-cyan-200/70 hover:bg-cyan-300/[0.12]",
  quiet: "px-3 py-2 text-slate-400 hover:bg-white/[0.04] hover:text-white",
} as const;

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

function ActionLink({
  href,
  label,
  symbol,
  variant = "quiet",
}: {
  href: string;
  label: string;
  symbol: string;
  variant?: "primary" | "secondary" | "quiet";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-sm font-black transition ${ACTION_LINK_STYLES[variant]}`}
    >
      <span className={variant === "quiet" ? "text-cyan-300" : "text-current"} aria-hidden>
        {symbol}
      </span>
      <span>{label}</span>
    </a>
  );
}

export function LitUpVenueProfile({ venue, events = [], enhancement: savedEnhancement, singersSay }: { venue: VenueListing; events?: KaraokeEventListing[]; enhancement?: VenueEnhancement; singersSay?: SingersSaySummary }) {
  const enhancement = savedEnhancement || getVenueEnhancement(venue.slug);
  if (!enhancement) return null;

  const heroUrl = clean(enhancement.heroImageUrl) || clean(venue.bannerImageUrl) || DEFAULT_BANNER_IMAGE_URL;
  const heroAlt = clean(enhancement.heroImageAlt) || clean(venue.bannerImageAlt) || `${venue.venueName} venue`;
  const heroPosition = enhancement.heroPosition || venue.bannerImagePosition || "center";
  const logoUrl = clean(enhancement.logoImageUrl);
  const logoAlt = clean(enhancement.logoImageAlt) || `${venue.venueName} logo`;
  const directionsUrl = getDirectionsUrl(venue);
  const instagramUrl = getInstagramUrl(venue.instagram);
  const websiteUrl = clean(venue.website);
  const phone = clean(enhancement.phone);
  const weekday = getSanDiegoNightlifeWeekday();
  const todayEvents = events.filter((event) => clean(event.karaokeDay)?.toLowerCase() === weekday.toLowerCase());
  const tonightSpecials = getTonightSpecials(enhancement, weekday);
  const nextKaraokeEvent = events.find((event) => event.recurring) ?? events[0];
  const karaokeLabel = nextKaraokeEvent ? [clean(nextKaraokeEvent.karaokeDay), clean(nextKaraokeEvent.startTime)].filter(Boolean).join(" ") : undefined;

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#071019] shadow-2xl shadow-black/30">
      <section className="relative min-h-[20rem] overflow-hidden md:min-h-[28rem]">
        <img src={heroUrl} alt={heroAlt} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: heroPosition }} loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071019] via-[#071019]/30 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#22d3ee] via-[#ff2aa3] to-[#8b5cf6]" />
        {enhancement.gallery.length > 0 ? <div className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-xs font-black text-white backdrop-blur">1 / {enhancement.gallery.length + 1}</div> : null}
        <div className="relative flex min-h-[20rem] flex-col justify-end p-5 md:min-h-[28rem] md:p-8">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#ff2aa3] px-3 py-1.5 text-[0.7rem] font-black uppercase tracking-[0.12em] text-white">Karaoke</span>
            {karaokeLabel ? <span className="rounded-full border border-cyan-300/60 bg-[#061820]/75 px-3 py-1.5 text-[0.7rem] font-black uppercase tracking-[0.12em] text-cyan-100 backdrop-blur">{karaokeLabel}</span> : null}
            {venue.isFeatured ? <span className="rounded-full border border-violet-300/50 bg-black/45 px-3 py-1.5 text-[0.7rem] font-black uppercase tracking-[0.12em] text-violet-100 backdrop-blur">Featured</span> : null}
          </div>
        </div>
      </section>

      <div className="relative p-4 sm:p-6 md:p-8">
        {logoUrl ? <div className="absolute right-5 top-0 flex h-24 w-24 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border-2 border-cyan-300/60 bg-[#071019] p-3 shadow-xl shadow-black/30 md:right-8 md:h-28 md:w-28"><img src={logoUrl} alt={logoAlt} className="h-full w-full object-contain" /></div> : null}
        <div className={`flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between ${logoUrl ? "pr-28 md:pr-32" : ""}`}>
          <div className="max-w-3xl">
            <h1 className="text-4xl font-black leading-none text-white md:text-5xl">{venue.venueName}</h1>
            <p className="mt-2 text-sm font-semibold text-slate-400">{[venue.neighborhood || venue.city, clean(venue.address)].filter(Boolean).join(" • ")}</p>
            {enhancement.tagline ? <p className="mt-4 text-base leading-7 text-slate-200 md:text-lg">{enhancement.tagline}</p> : null}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {venue.vibeTags.slice(0, 4).map((tag) => <span key={tag} className="inline-flex items-center gap-2 text-xs font-bold text-slate-400"><span className="h-1 w-1 rounded-full bg-fuchsia-300" aria-hidden />{tag}</span>)}
              {enhancement.amenities.slice(0, Math.max(0, 4 - venue.vibeTags.length)).map((tag) => <span key={tag} className="inline-flex items-center gap-2 text-xs font-bold text-slate-400"><span className="h-1 w-1 rounded-full bg-cyan-300" aria-hidden />{tag}</span>)}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-y border-white/10 py-4">
          {directionsUrl ? <ActionLink href={directionsUrl} label="Get directions" symbol="⌖" variant="primary" /> : null}
          {phone ? <ActionLink href={`tel:${phone}`} label="Call" symbol="☎" variant="secondary" /> : null}
          <div className="flex flex-wrap items-center gap-1 sm:ml-1">
            {websiteUrl ? <ActionLink href={websiteUrl} label="Website" symbol="↗" /> : null}
            {instagramUrl ? <ActionLink href={instagramUrl} label="Instagram" symbol="◎" /> : null}
            {enhancement.menuUrl ? <ActionLink href={enhancement.menuUrl} label="Menu" symbol="≡" /> : null}
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(120deg,rgba(88,28,135,.22),rgba(9,18,27,.98)_48%,rgba(8,145,178,.12))] shadow-xl shadow-black/20">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 px-5 py-4 md:px-6">
            <div><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">Tonight at {venue.venueName}</p><h2 className="mt-1 text-2xl font-black text-white">{weekday}</h2></div>
            {todayEvents.length === 0 && tonightSpecials.length === 0 ? <p className="text-sm text-slate-400">Nothing featured for tonight yet.</p> : null}
          </div>
          <div className="grid divide-y divide-white/10 lg:grid-cols-[0.85fr_1.15fr] lg:divide-x lg:divide-y-0">
            <div className="px-5 py-5 md:px-6">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-fuchsia-200">Karaoke</p>
              {todayEvents.length > 0 ? <div className="mt-3 space-y-4">{todayEvents.map((event) => <div key={event.eventId}><p className="text-2xl font-black text-white">{clean(event.startTime) ? `${event.startTime}${clean(event.endTime) ? ` – ${event.endTime}` : ""}` : event.karaokeDay}</p>{clean(event.hostName) ? <p className="mt-1 text-sm text-slate-300">Hosted by {event.hostName}</p> : null}</div>)}</div> : <p className="mt-3 text-sm text-slate-500">No karaoke scheduled tonight.</p>}
            </div>
            <div className="px-5 py-5 md:px-6">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-cyan-200">Eat &amp; drink</p>
              {tonightSpecials.length > 0 ? <div className="mt-3 divide-y divide-white/10">{tonightSpecials.map((special) => <div key={`${special.day}-${special.title}`} className="grid gap-1 py-3 first:pt-0 sm:grid-cols-[auto_1fr] sm:gap-4"><p className="text-lg font-black text-white">{special.price || "Special"}</p><div><p className="font-bold text-cyan-50">{special.title}</p>{special.detail ? <p className="mt-1 text-sm text-slate-400">{special.detail}</p> : null}</div></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No deal featured tonight.</p>}
            </div>
          </div>
        </section>

        <LitUpVenueTabs venueName={venue.venueName} enhancement={enhancement} events={events} singersSay={singersSay} activeDay={weekday} />

        <div className="mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-6"><Button href={`/claim-listing?venue=${venue.slug}`} variant="ghost">Claim or update this listing</Button></div>
      </div>
    </article>
  );
}
