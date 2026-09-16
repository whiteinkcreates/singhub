/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/Button";
import { EventSchedule } from "@/components/venue/EventSchedule";
import type { KaraokeEventListing, VenueListing } from "@/types";
import {
  getTonightSpecials,
  getVenueEnhancement,
  type VenueEnhancement,
  type VenueSpecial,
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

function formatSchedule(event: KaraokeEventListing) {
  const time = [clean(event.startTime), clean(event.endTime)].filter(Boolean).join(" to ");
  return [clean(event.karaokeDay), time].filter(Boolean).join(" • ");
}

function groupSpecials(specials: VenueSpecial[]) {
  const groups = new Map<string, VenueSpecial[]>();
  for (const special of specials) groups.set(special.day, [...(groups.get(special.day) || []), special]);
  return Array.from(groups.entries());
}

function ActionLink({ href, children, featured = false }: { href: string; children: string; featured?: boolean }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={`inline-flex min-h-12 items-center justify-center rounded-full border px-5 py-3 text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-fuchsia-400 ${featured ? "border-[#ff2aa3] bg-[#ff2aa3] text-white hover:bg-[#ff4bb2]" : "border-white/15 bg-white/[0.04] text-white hover:border-cyan-300/50 hover:bg-cyan-300/[0.06]"}`}>
      {children}
    </a>
  );
}

export function LitUpVenueProfile({ venue, events = [], enhancement: savedEnhancement }: { venue: VenueListing; events?: KaraokeEventListing[]; enhancement?: VenueEnhancement }) {
  const enhancement = savedEnhancement || getVenueEnhancement(venue.slug);
  const heroUrl = clean(enhancement?.heroImageUrl) || clean(venue.bannerImageUrl) || DEFAULT_BANNER_IMAGE_URL;
  const heroAlt = clean(enhancement?.heroImageAlt) || clean(venue.bannerImageAlt) || `${venue.venueName} venue`;
  const directionsUrl = getDirectionsUrl(venue);
  const instagramUrl = getInstagramUrl(venue.instagram);
  const websiteUrl = clean(venue.website);
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "America/Los_Angeles" }).format(new Date());
  const todayEvents = events.filter((event) => clean(event.karaokeDay)?.toLowerCase() === weekday.toLowerCase());
  const tonightSpecials = getTonightSpecials(enhancement, weekday);
  const specialGroups = groupSpecials(enhancement?.weeklySpecials ?? []);
  const hasGallery = Boolean(enhancement?.gallery.length);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#081018] shadow-2xl shadow-black/30">
      <section className="relative min-h-[24rem] overflow-hidden md:min-h-[32rem]">
        <img src={heroUrl} alt={heroAlt} className="absolute inset-0 h-full w-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#081018]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#081018]/65 via-transparent to-[#081018]/20" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#22d3ee] via-[#ff2aa3] to-[#8b5cf6]" />
        <div className="relative flex min-h-[24rem] flex-col justify-end p-5 md:min-h-[32rem] md:p-8">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#ff2aa3] px-3 py-1.5 text-[0.7rem] font-black uppercase tracking-[0.12em] text-white">Karaoke</span>
          </div>
          <h1 className="mt-4 text-4xl font-black leading-none text-white drop-shadow-2xl md:text-6xl">{venue.venueName}</h1>
          <p className="mt-3 text-sm font-semibold text-slate-200 md:text-base">{[venue.neighborhood || venue.city, clean(venue.address)].filter(Boolean).join(" • ")}</p>
          {(enhancement?.tagline || venue.description) && <p className="mt-4 max-w-3xl text-base leading-7 text-white/90 md:text-lg">{enhancement?.tagline || venue.description}</p>}
        </div>
      </section>

      <div className="p-4 sm:p-6 md:p-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {directionsUrl && <ActionLink href={directionsUrl} featured>Get Directions</ActionLink>}
          {enhancement?.menuUrl && <ActionLink href={enhancement.menuUrl}>View Menu</ActionLink>}
          {websiteUrl && <ActionLink href={websiteUrl}>Website</ActionLink>}
          {instagramUrl && <ActionLink href={instagramUrl}>Instagram</ActionLink>}
        </div>

        <nav className="mt-7 flex gap-5 overflow-x-auto border-b border-white/10 text-sm font-bold text-slate-400">
          <a href="#tonight" className="border-b-2 border-[#ff2aa3] pb-3 text-white">Tonight</a>
          <a href="#specials" className="pb-3 transition hover:text-white">Specials</a>
          <a href="#about" className="pb-3 transition hover:text-white">About</a>
          {hasGallery && <a href="#photos" className="pb-3 transition hover:text-white">Photos</a>}
          <a href="#events" className="pb-3 transition hover:text-white">Events</a>
        </nav>

        <section id="tonight" className="mt-7 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">Tonight at {venue.venueName}</p>
          <h2 className="mt-1 text-2xl font-black text-white">{weekday}</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {todayEvents.map((event) => <div key={event.eventId} className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/[0.06] p-4"><p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-200">Karaoke</p><p className="mt-2 text-base font-black text-white">{formatSchedule(event)}</p>{clean(event.hostName) && <p className="mt-1 text-sm text-slate-300">KJ: {event.hostName}</p>}</div>)}
            {tonightSpecials.map((special) => <div key={`${special.day}-${special.title}`} className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] p-4"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Tonight&apos;s deal</p><p className="mt-2 text-base font-black text-white">{special.price ? `${special.price} • ` : ""}{special.title}</p>{special.detail && <p className="mt-1 text-sm text-slate-300">{special.detail}</p>}</div>)}
            {todayEvents.length === 0 && tonightSpecials.length === 0 && <p className="text-sm text-slate-500">No featured item loaded for tonight yet.</p>}
          </div>
        </section>

        {specialGroups.length > 0 && <section id="specials" className="mt-9"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">More reasons to go</p><h2 className="mt-1 text-2xl font-black text-white">Weekly Specials</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{specialGroups.map(([day, specials]) => <div key={day} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">{day}</p><div className="mt-3 space-y-3">{specials.map((special) => <div key={`${day}-${special.title}`}><p className="font-black text-white">{special.price ? `${special.price} ` : ""}{special.title}</p>{special.detail && <p className="mt-1 text-xs leading-5 text-slate-400">{special.detail}</p>}</div>)}</div></div>)}</div></section>}

        {Boolean(enhancement?.dailyDeals.length) && <section className="mt-9"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Every day</p><h2 className="mt-1 text-2xl font-black text-white">Daily Deals</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{enhancement?.dailyDeals.map((deal) => <div key={deal.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-lg font-black text-white">{deal.price || ""}</p><p className="mt-1 text-sm font-bold text-fuchsia-100">{deal.title}</p>{deal.detail && <p className="mt-2 text-xs leading-5 text-slate-400">{deal.detail}</p>}</div>)}</div></section>}

        <section id="about" className="mt-9 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">About</p><h2 className="mt-1 text-2xl font-black text-white">Why this place</h2><p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{enhancement?.about || venue.description}</p></div>
          {Boolean(enhancement?.amenities.length) && <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Good to know</p><div className="mt-4 flex flex-wrap gap-2">{enhancement?.amenities.map((amenity) => <span key={amenity} className="rounded-full border border-white/10 bg-black/15 px-3 py-2 text-xs font-semibold text-slate-200">{amenity}</span>)}</div></div>}
        </section>

        {hasGallery && <section id="photos" className="mt-9"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">Photos</p><h2 className="mt-1 text-2xl font-black text-white">Inside {venue.venueName}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{enhancement?.gallery.map((photo) => <figure key={photo.url} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"><img src={photo.url} alt={photo.alt} className="aspect-[4/3] h-full w-full object-cover" loading="lazy" />{photo.caption && <figcaption className="p-3 text-xs text-slate-400">{photo.caption}</figcaption>}</figure>)}</div></section>}

        <section id="events" className="mt-9"><EventSchedule events={events} /></section>
        <div className="mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-6"><Button href={`/claim-listing?venue=${venue.slug}`} variant="ghost">Claim or update this listing</Button></div>
      </div>
    </article>
  );
}
