/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/Button";
import { SingersSay } from "@/components/venue/SingersSay";
import { VenueProfileTabs } from "@/components/venue/VenueProfileTabs";
import { VenueTag } from "@/components/venue/VenueTag";
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

function compactSchedule(event?: KaraokeEventListing) {
  if (!event) return undefined;
  const day = clean(event.karaokeDay)?.slice(0, 3).toUpperCase();
  const time = clean(event.startTime);
  return [day, time].filter(Boolean).join(" ");
}

function formatSchedule(event: KaraokeEventListing) {
  const time = [clean(event.startTime), clean(event.endTime)].filter(Boolean).join(" to ");
  return [clean(event.karaokeDay), time].filter(Boolean).join(" • ");
}

function displayFact(value: string) {
  if (value === "Food available") return "Food";
  if (value === "Full bar" || value === "Beer & wine") return "Drinks";
  return value;
}

type ActionKind = "directions" | "call" | "website" | "instagram";

function ActionGlyph({ kind }: { kind: ActionKind }) {
  if (kind === "directions") return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M12 21s7-5 7-12a7 7 0 1 0-14 0c0 7 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>;
  if (kind === "call") return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M7 3 4 6c0 7.5 6.5 14 14 14l3-3-4-4-3 2c-2.4-1-4-2.6-5-5l2-3-4-4Z"/></svg>;
  if (kind === "website") return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M10 14 14 10M8.5 16.5l-2 2a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0M15.5 7.5l2-2a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0"/></svg>;
  return <span className="text-[0.7rem] font-black tracking-tight" aria-hidden>IG</span>;
}

function ActionLink({ href, label, kind, featured = false }: { href: string; label: string; kind: ActionKind; featured?: boolean }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="group flex min-w-0 flex-col items-center gap-2 text-center text-xs font-bold text-slate-300">
      <span className={`grid h-12 w-12 place-items-center rounded-full border transition sm:h-14 sm:w-14 ${featured ? "border-fuchsia-300/70 bg-fuchsia-300/12 text-fuchsia-200 group-hover:bg-fuchsia-300/20" : "border-white/20 bg-white/[0.035] text-white group-hover:border-cyan-300/50 group-hover:text-cyan-100"}`}><ActionGlyph kind={kind} /></span>
      <span>{label}</span>
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
  const firstEvent = events.find((event) => event.recurring) || events[0];
  const scheduleTag = compactSchedule(firstEvent);
  const date = new Date();
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "America/Los_Angeles" }).format(date);
  const dateLabel = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "America/Los_Angeles" }).format(date).toUpperCase();
  const todayEvents = events.filter((event) => clean(event.karaokeDay)?.toLowerCase() === weekday.toLowerCase());
  const tonightSpecials = getTonightSpecials(enhancement, weekday);
  const factTags = enhancement.amenities.slice(0, 4).map(displayFact);
  const hasAyce = enhancement.weeklySpecials.some((special) => /all[- ]you[- ]can[- ]eat|ayce/i.test(`${special.title} ${special.detail || ""}`));
  const heroPosition = enhancement.heroPosition === "top" ? "object-[50%_25%]" : enhancement.heroPosition === "bottom" ? "object-bottom" : "object-center";

  return (
    <article className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#061018] shadow-2xl shadow-black/35">
      <section className="relative aspect-[16/8.6] min-h-[19rem] overflow-hidden md:min-h-[28rem]">
        <img src={heroUrl} alt={heroAlt} className={`absolute inset-0 h-full w-full object-cover ${heroPosition}`} loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-[#061018]" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#22d3ee] via-[#ff2aa3] to-[#8b5cf6]" />
      </section>

      <div className="relative px-4 pb-6 sm:px-6 md:px-8">
        <section className="relative -mt-12 rounded-[1.7rem] border border-white/10 bg-[#07121a]/95 p-5 shadow-2xl shadow-black/30 backdrop-blur md:-mt-16 md:p-6">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <h1 className="text-3xl font-black leading-none text-white md:text-5xl">{venue.venueName}</h1>
              <p className="mt-3 text-sm font-semibold text-slate-300">{venue.neighborhood || venue.city}{clean(venue.address) ? ` • ${venue.address}` : ""}</p>
            </div>
            {enhancement.logoImageUrl ? <div className="-mt-10 shrink-0 rounded-full border-2 border-cyan-200 bg-black/80 p-2 shadow-xl shadow-cyan-950/40"><img src={enhancement.logoImageUrl} alt={enhancement.logoImageAlt || `${venue.venueName} logo`} className="h-16 w-16 rounded-full object-contain md:h-20 md:w-20" /></div> : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <VenueTag label="Karaoke" accent="pink" />
            {scheduleTag ? <VenueTag label={scheduleTag} accent="cyan" /> : null}
            {factTags.map((tag) => <VenueTag key={tag} label={tag} />)}
            {hasAyce ? <VenueTag label="All You Can Eat" /> : null}
          </div>

          {(enhancement.tagline || venue.description) ? <p className="mt-4 max-w-3xl text-base leading-7 text-slate-200">{enhancement.tagline || venue.description}</p> : null}

          <div className="mt-5 flex items-start justify-around gap-2 border-t border-white/10 pt-5 sm:justify-start sm:gap-7">
            {directionsUrl ? <ActionLink href={directionsUrl} label="Directions" kind="directions" featured /> : null}
            {phone ? <ActionLink href={`tel:${phone.replace(/[^+\d]/g, "")}`} label="Call" kind="call" /> : null}
            {websiteUrl ? <ActionLink href={websiteUrl} label="Website" kind="website" /> : null}
            {instagramUrl ? <ActionLink href={instagramUrl} label="Instagram" kind="instagram" /> : null}
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035]">
          <div className="flex items-end justify-between gap-4 border-b border-white/10 px-5 py-4">
            <div><p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-300">Tonight at {venue.venueName}</p><h2 className="mt-1 text-xl font-black text-white">{weekday}</h2></div>
            <p className="text-[0.68rem] font-bold tracking-[0.08em] text-slate-500">{dateLabel}</p>
          </div>
          <div className="grid gap-0 md:grid-cols-2">
            <div className="p-5">
              {todayEvents.length > 0 ? todayEvents.slice(0, 2).map((event) => <div key={event.eventId} className="flex gap-3 py-2"><span className="mt-1 text-xl text-fuchsia-300">♪</span><div><p className="font-black text-white">Karaoke {formatSchedule(event).replace(`${event.karaokeDay} • `, "at ")}</p>{clean(event.hostName) ? <p className="mt-1 text-sm text-slate-400">KJ: {event.hostName}</p> : null}</div></div>) : <div className="py-2"><p className="text-sm font-bold text-slate-400">No karaoke scheduled tonight.</p>{firstEvent ? <p className="mt-1 text-sm text-slate-500">Next regular night: {formatSchedule(firstEvent)}</p> : null}</div>}
              {tonightSpecials.slice(0, 3).map((special) => <div key={`${special.day}-${special.title}`} className="flex gap-3 border-t border-white/5 py-3"><span className="mt-0.5 text-lg text-cyan-300">•</span><div><p className="font-black text-white">{special.price ? `${special.price} ` : ""}{special.title}</p>{special.detail ? <p className="mt-1 text-sm text-slate-400">{special.detail}</p> : null}</div></div>)}
            </div>
            {enhancement.gallery[0]?.url ? <img src={enhancement.gallery[0].url} alt={enhancement.gallery[0].alt} className="hidden h-full min-h-48 w-full object-cover md:block" /> : <div className="hidden min-h-48 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,.18),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,.13),transparent_42%)] md:block" />}
          </div>
        </section>

        <VenueProfileTabs venueName={venue.venueName} enhancement={enhancement} events={events} />

        {singersSay ? <SingersSay summary={singersSay} /> : null}

        <div className="mt-7 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-2">
          {enhancement.menuUrl ? <a href={enhancement.menuUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-fuchsia-300/60 px-5 py-3 text-sm font-black text-white transition hover:bg-fuchsia-300/10">View Menu</a> : null}
          {directionsUrl ? <a href={directionsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#ff2aa3] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff4bb2]">Get Directions</a> : null}
        </div>

        <div className="mt-6"><Button href={`/claim-listing?venue=${venue.slug}`} variant="ghost">Claim or update this listing</Button></div>
      </div>
    </article>
  );
}
