"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { HOTEL_AT_MARK_SRC } from "@/lib/hotelAtMark";
import { SITE_WORDMARK_SRC } from "@/lib/siteWordmark";
import { HotelGuideMap } from "@/components/hotel/HotelGuideMap";
import { createClient } from "@/lib/supabase/client";

export type HotelGuideVenue = {
  slug: string;
  name: string;
  neighborhood: string;
  address: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  distanceMiles: number;
  distanceLabel: string;
  tier: "walkable" | "quick" | "standout";
  vibeTags: string[];
  venueType: "live_bar" | "private_room";
  tonightSchedule?: string;
  weekSchedule: string[];
  standoutReason?: string;
};

type Props = {
  hotelSlug: string;
  hotelName: string;
  hotelShortName: string;
  hotelAddress: string;
  hotelLatitude: number;
  hotelLongitude: number;
  heroImageUrl?: string;
  tonightVenues: HotelGuideVenue[];
  weekVenues: HotelGuideVenue[];
};

const tierMeta = {
  walkable: {
    label: "Walkable",
    helper: "If you want something you can walk to in about 5–10 minutes…",
  },
  quick: {
    label: "Quick Trip",
    helper: "If you do not mind a short drive or Uber, you have a few more options.",
  },
  standout: {
    label: "Standout Spots",
    helper: "If distance is no problem, these are San Diego karaoke experiences worth talking about when you get home.",
  },
} as const;

function splitByTier(venues: HotelGuideVenue[]) {
  return {
    walkable: venues.filter((venue) => venue.tier === "walkable"),
    quick: venues.filter((venue) => venue.tier === "quick"),
    standout: venues.filter((venue) => venue.tier === "standout"),
  };
}

function TierIcon({ tier }: { tier: keyof typeof tierMeta }) {
  const common =
    "h-7 w-7 text-cyan-300 drop-shadow-[0_0_9px_rgba(34,211,238,0.5)]";

  if (tier === "walkable") {
    return (
      <svg viewBox="0 0 32 32" className={common} fill="none" aria-hidden>
        <circle cx="17" cy="6.5" r="2.6" fill="currentColor" />
        <path
          d="M15.7 10.2 13 15.1l-3.7 2.6m6.4-7.5 4.2 3.5 4 .8m-8.2.4 3.8 4.6 1.6 6.3m-5.4-10.9-2 6.6-4.4 4.4"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (tier === "quick") {
    return (
      <svg viewBox="0 0 32 32" className={common} fill="none" aria-hidden>
        <path
          d="M7.2 20.5v-4.1l2.4-5.2c.45-.98 1.42-1.62 2.5-1.62h7.8c1.08 0 2.05.64 2.5 1.62l2.4 5.2v4.1"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 16.4h16m-13.9 0 1.6-3.7h8.6l1.6 3.7"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10.4" cy="21.3" r="2.1" fill="currentColor" />
        <circle cx="21.6" cy="21.3" r="2.1" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" className={common} fill="none" aria-hidden>
      <path
        d="m16 4.8 3.3 6.7 7.4 1.08-5.35 5.2 1.26 7.35L16 21.65l-6.61 3.48 1.26-7.35-5.35-5.2 7.4-1.08L16 4.8Z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VenueCard({
  venue,
  mode,
  onAddToPlan,
}: {
  venue: HotelGuideVenue;
  mode: "tonight" | "week";
  onAddToPlan: (venue: HotelGuideVenue) => void;
}) {
  const [imageVisible, setImageVisible] = useState(Boolean(venue.imageUrl));
  const schedule =
    mode === "tonight"
      ? venue.tonightSchedule
      : venue.weekSchedule.slice(0, 3).join("  •  ");

  return (
    <article className="group relative snap-start overflow-hidden rounded-[22px] border border-white/[0.09] bg-gradient-to-b from-[#0d1826] to-[#08111d] shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-[0_22px_60px_rgba(0,0,0,0.36)]">
      <div className="absolute inset-x-10 top-0 z-20 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent opacity-60" />

      {venue.imageUrl && imageVisible ? (
        <div className="relative h-44 overflow-hidden bg-[#0d1724]">
          <img
            src={venue.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
            loading="lazy"
            onError={() => setImageVisible(false)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09131f] via-[#09131f]/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-cyan-950/20 to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {venue.venueType === "private_room" ? (
              <span className="rounded-full border border-cyan-200/30 bg-[#06111c]/85 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.13em] text-cyan-100 backdrop-blur-md">
                Private rooms
              </span>
            ) : null}
            {venue.standoutReason ? (
              <span className="rounded-full border border-violet-300/30 bg-[#100d25]/85 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.13em] text-violet-100 backdrop-blur-md">
                Standout
              </span>
            ) : null}
          </div>

          <div className="absolute bottom-3 left-3 rounded-full border border-cyan-200/20 bg-black/55 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100 backdrop-blur-md">
            {venue.distanceLabel}
          </div>
        </div>
      ) : (
        <div className="relative h-24 overflow-hidden border-b border-white/[0.06] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,.12),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(236,72,153,.08),transparent_28%),#0b1623]">
          <div className="absolute inset-y-0 right-0 w-32 bg-[linear-gradient(115deg,transparent,rgba(255,255,255,.025),transparent)]" />
          <div className="absolute bottom-3 left-4 text-[10px] font-black uppercase tracking-[0.15em] text-cyan-200">
            {venue.distanceLabel}
          </div>
        </div>
      )}

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link href={`/venues/${venue.slug}`} className="group/title">
              <h3 className="text-lg font-black leading-tight text-white transition group-hover/title:text-cyan-100 sm:text-xl">
                {venue.name}
              </h3>
            </Link>
            <p className="mt-1 text-xs font-bold text-slate-500">{venue.neighborhood}</p>
          </div>
          <span className="mt-0.5 text-xl text-cyan-300/50 transition group-hover:text-cyan-200" aria-hidden>
            →
          </span>
        </div>

        {venue.standoutReason ? (
          <div className="mt-4 border-l-2 border-violet-300/60 pl-3">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-300">
              Why it stands out
            </p>
            <p className="mt-1 text-sm font-bold text-violet-50">{venue.standoutReason}</p>
          </div>
        ) : null}

        {venue.venueType === "private_room" ? (
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Private-room karaoke. Check room availability before heading over.
          </p>
        ) : schedule ? (
          <div className="mt-4 flex items-start gap-2.5">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,.8)]" />
            <p className="line-clamp-2 text-sm font-medium leading-6 text-slate-300">{schedule}</p>
          </div>
        ) : null}

        {venue.vibeTags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {venue.vibeTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-fuchsia-300/15 bg-fuchsia-300/[0.045] px-2.5 py-1 text-[10px] font-bold text-fuchsia-100/85"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link href={`/venues/${venue.slug}`} className="inline-flex items-center gap-2 text-sm font-black text-cyan-200 transition hover:text-cyan-100">
            View venue <span aria-hidden>→</span>
          </Link>
          <button type="button" onClick={() => onAddToPlan(venue)} className="rounded-full border border-white/15 bg-white/[0.045] px-3 py-1.5 text-xs font-black text-white transition hover:border-cyan-300/35 hover:bg-cyan-300/10">
            Add to plan
          </button>
        </div>
      </div>
    </article>
  );
}

function TierSection({
  tier,
  venues,
  mode,
  onAddToPlan,
}: {
  tier: keyof typeof tierMeta;
  venues: HotelGuideVenue[];
  mode: "tonight" | "week";
  onAddToPlan: (venue: HotelGuideVenue) => void;
}) {
  if (venues.length === 0) return null;

  const meta = tierMeta[tier];
  const visibleVenues = venues.slice(0, tier === "walkable" ? 6 : 3);

  return (
    <section className="py-8 sm:py-10">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.055] shadow-[inset_0_0_18px_rgba(34,211,238,.035)]">
            <TierIcon tier={tier} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight text-white">{meta.label}</h2>
              <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                {visibleVenues.length} {visibleVenues.length === 1 ? "spot" : "spots"}
              </span>
            </div>
            <p className="mt-1 max-w-lg text-sm leading-5 text-slate-500">{meta.helper}</p>
          </div>
        </div>
      </div>

      <div className="-mx-5 grid snap-x snap-mandatory grid-flow-col auto-cols-[84%] gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {visibleVenues.map((venue) => (
          <VenueCard key={venue.slug} venue={venue} mode={mode} onAddToPlan={onAddToPlan} />
        ))}
      </div>
    </section>
  );
}

export function HotelGuideExperience({
  hotelSlug,
  hotelName,
  hotelShortName,
  hotelAddress,
  hotelLatitude,
  hotelLongitude,
  heroImageUrl,
  tonightVenues,
  weekVenues,
}: Props) {
  const [mode, setMode] = useState<"tonight" | "week">("tonight");
  const [heroVisible, setHeroVisible] = useState(Boolean(heroImageUrl));
  const [planVenue, setPlanVenue] = useState<HotelGuideVenue | null>(null);
  const [planEmail, setPlanEmail] = useState("");
  const [planMessage, setPlanMessage] = useState("");
  const activeVenues = mode === "tonight" ? tonightVenues : weekVenues;
  const grouped = useMemo(() => splitByTier(activeVenues), [activeVenues]);
  const visibleOptionCount = Math.min(grouped.walkable.length, 6) + Math.min(grouped.quick.length, 3) + Math.min(grouped.standout.length, 3);
  const visibleWalkableCount = Math.min(grouped.walkable.length, 6);

  const savePlan = useCallback(async (userId: string, venue: HotelGuideVenue) => {
    const supabase = createClient();
    const { error } = await supabase.from("hotel_guest_plans").upsert({
      user_id: userId,
      hotel_slug: hotelSlug,
      hotel_name: hotelName,
      venue_slug: venue.slug,
      venue_name: venue.name,
    });
    if (error) throw error;
    await supabase.from("singer_saved_hotels").upsert({
      user_id: userId,
      hotel_slug: hotelSlug,
      hotel_name: hotelName,
    });
  }, [hotelName, hotelSlug]);

  useEffect(() => {
    const pendingSlug = new URLSearchParams(window.location.search).get("plan");
    if (!pendingSlug) return;
    const venue = [...tonightVenues, ...weekVenues].find((item) => item.slug === pendingSlug);
    if (!venue) return;
    void createClient().auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      try {
        await savePlan(data.user.id, venue);
        setPlanMessage(`${venue.name} is in your ${hotelShortName} plan.`);
        window.history.replaceState({}, "", `/hotel/${hotelSlug}`);
      } catch (error) {
        setPlanMessage(error instanceof Error ? error.message : "We could not save that stop.");
      }
    });
  }, [hotelShortName, hotelSlug, savePlan, tonightVenues, weekVenues]);

  async function addToPlan(venue: HotelGuideVenue) {
    const { data } = await createClient().auth.getUser();
    if (data.user) {
      try {
        await savePlan(data.user.id, venue);
        setPlanMessage(`${venue.name} is in your ${hotelShortName} plan.`);
      } catch (error) {
        setPlanMessage(error instanceof Error ? error.message : "We could not save that stop.");
      }
      return;
    }
    setPlanVenue(venue);
  }

  async function emailPlanLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!planVenue || !planEmail.trim()) return;
    const next = `/hotel/${hotelSlug}?plan=${encodeURIComponent(planVenue.slug)}`;
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await createClient().auth.signInWithOtp({
      email: planEmail.trim(),
      options: { emailRedirectTo: redirectUrl, shouldCreateUser: true },
    });
    setPlanMessage(error ? error.message : `Check your email to save ${planVenue.name} to your plan.`);
    if (!error) setPlanVenue(null);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050d17] text-white">
      <section className="relative isolate overflow-hidden border-b border-cyan-200/[0.08]">
        {heroImageUrl && heroVisible ? (
          <img
            src={heroImageUrl}
            alt=""
            className="absolute inset-0 -z-30 h-full w-full object-cover opacity-50"
            onError={() => setHeroVisible(false)}
          />
        ) : null}

        <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_16%_10%,rgba(236,72,153,.16),transparent_28%),radial-gradient(circle_at_84%_5%,rgba(34,211,238,.18),transparent_30%),#07111e]" />
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-[#020713]/25 via-[#06101e]/72 to-[#050d17]" />
        <div className="absolute -left-16 top-28 -z-10 h-56 w-56 rounded-full bg-fuchsia-500/[0.055] blur-3xl" />
        <div className="absolute -right-20 top-16 -z-10 h-64 w-64 rounded-full bg-cyan-400/[0.065] blur-3xl" />

        <div className="mx-auto max-w-5xl px-5 pb-9 pt-6 text-center sm:pb-12 sm:pt-8">
          <div className="mx-auto flex max-w-xl flex-col items-center">
            <div className="inline-flex flex-col items-start">
              <div className="flex items-center">
                <img src={SITE_WORDMARK_SRC} alt="SingHUB" className="h-auto w-[220px] drop-shadow-[0_0_18px_rgba(34,211,238,0.16)] sm:w-[280px]" />
                <div className="relative -ml-4 sm:-ml-5">
              <div className="pointer-events-none absolute -left-5 -top-3 h-16 w-16 rounded-full bg-fuchsia-500/25 blur-2xl" />
              <div className="pointer-events-none absolute bottom-[-18px] left-1/2 h-12 w-24 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-2xl" />
                  <img src={HOTEL_AT_MARK_SRC} alt=" at " className="relative h-auto w-[62px] drop-shadow-[0_0_14px_rgba(34,211,238,.45)] sm:w-[76px]" />
                </div>
              </div>
              <p className="-mt-3 pl-2 text-left text-lg font-black tracking-[0.08em] text-white drop-shadow-[0_-4px_8px_rgba(34,211,238,.55)] sm:text-xl">{hotelName}</p>
            </div>

            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200/75">
              Hotel Guest Guide
            </p>
          </div>

          <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-black tracking-[-0.035em] text-white sm:text-5xl">
            {mode === "tonight" ? "Karaoke tonight" : "Karaoke this week"} near {hotelShortName}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Current SingHUB listings, sorted by what is easiest to reach from your stay.
          </p>

          <div className="mx-auto mt-6 max-w-md rounded-[22px] border border-cyan-200/15 bg-[#06111d]/75 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,.28)] backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setMode("tonight")}
                className={`rounded-[17px] px-5 py-3 text-sm font-black transition ${mode === "tonight" ? "bg-gradient-to-r from-cyan-300 to-sky-400 text-slate-950 shadow-[0_0_22px_rgba(34,211,238,.22)]" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"}`}
              >
                Tonight
              </button>
              <button
                onClick={() => setMode("week")}
                className={`rounded-[17px] px-5 py-3 text-sm font-black transition ${mode === "week" ? "bg-gradient-to-r from-cyan-300 to-sky-400 text-slate-950 shadow-[0_0_22px_rgba(34,211,238,.22)]" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"}`}
              >
                This Week
              </button>
            </div>
          </div>

          {activeVenues.length > 0 ? (
            <div className="mx-auto mt-5 flex max-w-lg flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-[0.11em] text-slate-500">
              <span><strong className="text-cyan-200">{visibleOptionCount}</strong> current options</span>
              {grouped.walkable.length > 0 ? <span><strong className="text-cyan-200">{visibleWalkableCount}</strong> walkable</span> : null}
              {grouped.quick.length > 0 ? <span><strong className="text-cyan-200">{grouped.quick.length}</strong> quick trip</span> : null}
            </div>
          ) : null}
        </div>
      </section>

      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.045),transparent_28%)]" />
        <div className="relative mx-auto max-w-5xl px-5 pb-16">
          <section className="pt-8 sm:pt-10">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.065] to-transparent p-6 shadow-[0_24px_70px_rgba(0,0,0,.24)] sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Curated for guests of {hotelName}</p>
              <h2 className="mt-3 max-w-3xl text-2xl font-black leading-tight text-white sm:text-3xl">New in town? Looking for a mic? Let me show you where San Diego really sings.</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">San Diego has more than 100 places to sing karaoke in a typical week. {mode === "tonight" ? `Tonight, you have ${visibleOptionCount} current options in this guide.` : `This week, you have ${visibleOptionCount} current options in this guide.`} Take a look and build your local gig tour.</p>
            </div>
          </section>

          {planMessage ? <p role="status" className="mt-5 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-center text-sm font-bold text-cyan-100">{planMessage}</p> : null}

          {activeVenues.length > 0 ? (
            <div className="pt-7 sm:pt-9">
              <HotelGuideMap
                hotelName={hotelName}
                hotelAddress={hotelAddress}
                hotelLatitude={hotelLatitude}
                hotelLongitude={hotelLongitude}
                venues={activeVenues.map((venue) => ({
                  slug: venue.slug,
                  name: venue.name,
                  neighborhood: venue.neighborhood,
                  latitude: venue.latitude,
                  longitude: venue.longitude,
                  distanceLabel: venue.distanceLabel,
                  tier: venue.tier,
                }))}
              />
            </div>
          ) : null}

          {activeVenues.length === 0 ? (
            <div className="mx-auto max-w-xl py-16 text-center">
              <p className="text-xl font-black text-white">
                No verified karaoke is listed {mode === "tonight" ? "tonight" : "this week"} close enough to recommend from this hotel.
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                We would rather show nothing than invent a nearby option or send a guest somewhere stale.
              </p>
              {mode === "tonight" && weekVenues.length > 0 ? (
                <button
                  onClick={() => setMode("week")}
                  className="mt-6 rounded-full bg-gradient-to-r from-cyan-300 to-sky-400 px-5 py-2.5 text-sm font-black text-slate-950 shadow-md shadow-cyan-950/25"
                >
                  See what is on this week
                </button>
              ) : (
                <Link
                  href="/find-karaoke"
                  className="mt-6 inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/10 px-5 py-2.5 text-sm font-black text-cyan-100"
                >
                  Browse all San Diego karaoke
                </Link>
              )}
            </div>
          ) : (
            <>
              <TierSection tier="walkable" venues={grouped.walkable} mode={mode} onAddToPlan={addToPlan} />
              <TierSection tier="quick" venues={grouped.quick} mode={mode} onAddToPlan={addToPlan} />
              <TierSection tier="standout" venues={grouped.standout} mode={mode} onAddToPlan={addToPlan} />
            </>
          )}

          <div className="mt-6 border-t border-white/[0.07] pt-7 text-center">
            <p className="mx-auto max-w-xl text-xs leading-5 text-slate-500">
              Curated by SingHUB from current karaoke listings. Schedules can change, especially on holidays and private-event nights.
            </p>
            <Link href="/find-karaoke" className="mt-3 inline-flex items-center gap-2 text-sm font-black text-cyan-200 hover:text-cyan-100">
              See all San Diego karaoke <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>

      {planVenue ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-labelledby="plan-title" onClick={() => setPlanVenue(null)}>
          <div className="w-full max-w-md rounded-[2rem] border border-cyan-300/25 bg-[#07111d] p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Your {hotelShortName} plan</p>
            <h2 id="plan-title" className="mt-2 text-2xl font-black text-white">Add {planVenue.name}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">Enter your email so this stop stays with you after you leave the hotel guide.</p>
            <form onSubmit={emailPlanLink} className="mt-5 space-y-3">
              <label className="sr-only" htmlFor="plan-email">Email address</label>
              <input id="plan-email" type="email" required value={planEmail} onChange={(event) => setPlanEmail(event.target.value)} placeholder="you@example.com" className="min-h-12 w-full rounded-full border border-white/15 bg-black/35 px-5 text-white outline-none focus:border-cyan-300" />
              <button className="min-h-12 w-full rounded-full bg-gradient-to-r from-cyan-300 to-sky-400 px-5 text-sm font-black text-slate-950">Email my plan link</button>
            </form>
            <button type="button" onClick={() => setPlanVenue(null)} className="mt-3 w-full py-2 text-sm font-bold text-slate-500 hover:text-white">Not now</button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
