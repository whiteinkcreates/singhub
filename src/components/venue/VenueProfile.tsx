/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/Button";
import { EventSchedule } from "@/components/venue/EventSchedule";
import { VibeCheckLauncher } from "@/components/venue/VibeCheckLauncher";
import { VenueSignalBadges, VenueSignalDetails } from "@/components/venue/VenueSignals";
import { LitUpVenueProfile } from "@/components/venue/LitUpVenueProfile";
import { SingersSay } from "@/components/venue/SingersSay";
import { isPartnerVenue, type VenueEnhancement } from "@/lib/venueEnhancements";
import type { SingersSaySummary } from "@/lib/singersSay.server";
import type { KaraokeEventListing, VenueListing } from "@/types";

type VenueProfileProps = { venue: VenueListing; events?: KaraokeEventListing[]; enhancement?: VenueEnhancement; singersSay?: SingersSaySummary; };
const DEFAULT_HERO = "/images/og/singhub-og.png";

function usable(value?: string) {
  const v=value?.trim(); return !v || /^(tbd|unknown|-|n\/a)$/i.test(v) ? null : v;
}
function DetailLine({label,value}:{label:string;value?:string|null}) {
  if(!value) return null;
  return <div><dt className="font-semibold text-slate-500">{label}</dt><dd className="mt-1 text-slate-200">{value}</dd></div>;
}
function scheduleHeadline(venue:VenueListing,events:KaraokeEventListing[]) {
  if(events.length){const days=[...new Set(events.map(e=>usable(e.karaokeDay)).filter(Boolean))] as string[]; const starts=[...new Set(events.map(e=>usable(e.startTime)).filter(Boolean))] as string[]; return [venue.neighborhood,days.join(", "),starts.length===1?starts[0]:null].filter(Boolean).join(" • ");}
  if(venue.listingStatus==="ai_scouted") return `${venue.neighborhood} • Karaoke place profile`;
  const d=usable(venue.karaokeDay),s=usable(venue.startTime),e=usable(venue.endTime);
  return !d||!s ? venue.neighborhood : [venue.neighborhood,d,e?`${s} to ${e}`:s].filter(Boolean).join(" • ");
}
function hostSummary(venue:VenueListing,events:KaraokeEventListing[]) {
  if(events.length){const hosts=[...new Set(events.map(e=>usable(e.hostName)).filter(Boolean))] as string[]; return hosts.length?hosts.join(" • "):null;}
  return usable(venue.hostName);
}

function BasicProfile({venue,events=[],enhancement}:VenueProfileProps) {
  const hero=usable(enhancement?.heroImageUrl)||usable(venue.bannerImageUrl)||DEFAULT_HERO;
  const heroAlt=usable(enhancement?.heroImageAlt)||usable(venue.bannerImageAlt)||`${venue.venueName} venue`;
  const heroPosition=enhancement?.heroPosition||venue.bannerImagePosition||"center";
  const whyHere=usable(enhancement?.tagline)||usable(venue.description);
  return <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#071019] shadow-2xl shadow-black/30">
    <section className="relative min-h-[18rem] overflow-hidden md:min-h-[24rem]">
      <img src={hero} alt={heroAlt} className="absolute inset-0 h-full w-full object-cover" style={{objectPosition:heroPosition}} loading="eager"/>
      <div className="absolute inset-0 bg-gradient-to-t from-[#071019] via-[#071019]/30 to-black/15"/>
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#22d3ee] via-[#ff2aa3] to-[#8b5cf6]"/>
      <div className="relative flex min-h-[18rem] flex-col justify-end p-5 md:min-h-[24rem] md:p-8">
        <VenueSignalBadges venue={venue}/>
        <h1 className="mt-4 text-4xl font-black text-white md:text-5xl">{venue.venueName}</h1>
        <p className="mt-2 text-sm font-semibold text-cyan-100">{scheduleHeadline(venue,events)}</p>
      </div>
    </section>
    <div className="grid gap-8 p-5 md:p-8 lg:grid-cols-[1fr_22rem]">
      <section>
        {whyHere?<div className="mb-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">Why sing here</p><p className="mt-2 max-w-3xl text-lg leading-8 text-slate-200">{whyHere}</p></div>:null}
        <EventSchedule events={events}/><VenueSignalDetails venue={venue}/>
      </section>
      <aside className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5">
        <h2 className="text-xl font-black text-white">Venue details</h2>
        <dl className="mt-4 space-y-3 text-sm text-slate-300">
          <DetailLine label="Address" value={venue.address}/><DetailLine label="KJ / Host" value={hostSummary(venue,events)}/><DetailLine label="Cover" value={venue.coverCharge}/><DetailLine label="Age policy" value={venue.agePolicy}/>
        </dl>
        <div className="mt-6"><Button href={`/claim-listing?venue=${venue.slug}`} variant="ghost">Own or manage this venue?</Button></div>
        <p className="mt-3 text-xs leading-5 text-slate-500">SingHUB keeps karaoke listings free. Venue Partners can share specials, events, galleries and more.</p>
      </aside>
    </div>
  </article>;
}

export function VenueProfile({venue,events=[],enhancement,singersSay}:VenueProfileProps) {
  const vibeCheckEvents=events.map(e=>({eventId:e.eventId,karaokeDay:e.karaokeDay,startTime:e.startTime,hostName:e.hostName}));
  const partner=enhancement!==undefined ? Boolean(enhancement.enabled) : venue.profileTier==="premium"||isPartnerVenue(venue.slug);
  return <>
    {partner ? <LitUpVenueProfile venue={venue} events={events} enhancement={enhancement} singersSay={singersSay}/> : <><BasicProfile venue={venue} events={events} enhancement={enhancement}/>{singersSay?<SingersSay summary={singersSay}/>:null}</>}
    <VibeCheckLauncher venue={{id:venue.id,slug:venue.slug,name:venue.venueName}} events={vibeCheckEvents}/>
  </>;
}
