"use client";

import { useHotelGuestPlan } from "./HotelGuestPlan";
import { useListReturn } from "@/components/v2/listReturn";
import { selectHotelStandouts } from "@/lib/v2/presentation";
import { HotelPhotoCredit } from "./HotelPhotoCredit";
import type { HotelPhotoCredit as Credit } from "@/lib/hotelPhotoCredit";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";
import { SITE_WORDMARK_SRC } from "@/lib/siteWordmark";
import type { HotelGuideVenue } from "@/components/hotel/HotelGuideExperience";

type Props = {
  hotelSlug: string;
  experienceSlug: string;
  hotelName: string;
  hotelShortName: string;
  hotelSiteUrl?: string;
  brandLogoUrl?: string;
  heroImageUrl?: string;
  heroCredit?: Credit;
  heroAlt?: string;
  heroPosition?: string;
  fallbackHeroImageUrl?: string;
  primaryColor: string;
  accentColor: string;
  pageBackground: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  headingFontFamily: string;
  bodyFontFamily: string;
  eyebrow: string;
  headline: string;
  intro: string;
  tonightVenues: HotelGuideVenue[];
  weekVenues: HotelGuideVenue[];
};

type FocusMode = "all" | "food" | "vibe" | "near";

const CONTROLLED_VIBES = new Set([
  "Divey",
  "Big Crowd",
  "Neighborhood Bar",
  "Polished",
  "LGBTQ-Friendly",
  "Party Crowd",
  "Serious Singers",
  "Late Night",
  "Live Band",
  "Private Rooms",
]);

function displayVibes(venue: HotelGuideVenue) {
  return venue.vibeTags.filter((tag) => CONTROLLED_VIBES.has(tag)).slice(0, 4);
}

const tierMeta = {
  walkable: { label: "Walkable", helper: "Easy to reach from your stay" },
  quick: { label: "Quick Ride", helper: "Nearby karaoke worth a short ride" },
  standout: { label: "Local Standouts", helper: "Distinctive karaoke experiences worth the trip" },
} as const;

function splitByTier(venues: HotelGuideVenue[]) {
  return {
    walkable: venues.filter((venue) => venue.tier === "walkable"),
    quick: venues.filter((venue) => venue.tier === "quick"),
    standout: selectHotelStandouts(venues.filter((venue) => venue.tier === "standout")),
  };
}

function KaraokeMicBackdrop({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 620 1500"
      aria-hidden
      className="pointer-events-none absolute right-[-115px] top-[430px] z-[1] h-[1260px] w-[620px] opacity-[0.09] mix-blend-multiply sm:right-[-80px] sm:top-[470px] sm:h-[1380px] sm:w-[680px]"
      style={{ color }}
      fill="none"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <g transform="translate(345 120) rotate(-9 90 230)">
          <rect x="52" y="34" width="138" height="168" rx="68" strokeWidth="14" />
          <path d="M72 82h98M66 112h110M68 142h106" strokeWidth="7" opacity="0.7" />
          <path d="M88 202h66l-12 310H100L88 202Z" strokeWidth="14" />
          <path d="M104 265h34M102 320h38M100 375h40" strokeWidth="6" opacity="0.55" />
          <path d="M121 512v88" strokeWidth="12" />
        </g>
        <path d="M405 555c38 2 64 27 64 64v54" strokeWidth="13" />
        <path d="M469 672v430" strokeWidth="14" />
        <path d="M394 1104h150" strokeWidth="15" />
        <path d="M420 1104c8 45 27 74 49 74s42-29 50-74" strokeWidth="10" opacity="0.75" />
        <path d="M465 565c76 66 105 154 90 258-18 126-8 246 33 331 42 88 18 164-79 189-126 32-262 11-393 39-69 15-106 44-124 76" strokeWidth="12" />
      </g>
    </svg>
  );
}

function QuickIcon({ kind }: { kind: "mic" | "food" | "spark" | "pin" }) {
  const cls = "h-5 w-5";
  if (kind === "food") {
    return <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden><path d="M7 3v7m3-7v7M5 7h7m-3 3v11m7-18v18m0-18c2 1 3 3 3 5s-1 4-3 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  }
  if (kind === "spark") {
    return <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden><path d="m12 2 1.6 5.1L19 9l-5.4 1.9L12 16l-1.6-5.1L5 9l5.4-1.9L12 2Zm6 12 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>;
  }
  if (kind === "pin") {
    return <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.8"/></svg>;
  }
  return <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden><rect x="8" y="3" width="8" height="11" rx="4" stroke="currentColor" strokeWidth="1.8"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3m-3 0h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}

function QuickAction({
  active,
  title,
  helper,
  icon,
  onClick,
  primaryColor,
  accentColor,
  textColor,
  mutedTextColor,
}: {
  active: boolean;
  title: string;
  helper: string;
  icon: "mic" | "food" | "spark" | "pin";
  onClick: () => void;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  mutedTextColor: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="group relative overflow-hidden rounded-[1.35rem] border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        borderColor: active ? `${primaryColor}66` : "#E2E8F0",
        background: active
          ? `linear-gradient(135deg, ${primaryColor}14, ${accentColor}12)`
          : "rgba(255,255,255,.9)",
        boxShadow: active ? `0 10px 28px ${primaryColor}16` : undefined,
      }}
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${primaryColor}12`, color: active ? accentColor : primaryColor }}
      >
        <QuickIcon kind={icon} />
      </span>
      <span className="mt-3 block text-sm font-black" style={{ color: textColor }}>{title}</span>
      <span className="mt-1 block text-[11px] leading-4" style={{ color: mutedTextColor }}>{helper}</span>
    </button>
  );
}

function SmallBadge({
  children,
  color,
}: {
  children: ReactNode;
  color: string;
}) {
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em]"
      style={{ backgroundColor: `${color}10`, color }}
    >
      {children}
    </span>
  );
}

function EditorialCard({
  venue,
  experienceSlug,
  primaryColor,
  accentColor,
  surfaceColor,
  textColor,
  mutedTextColor,
}: {
  venue: HotelGuideVenue;
  experienceSlug: string;
  primaryColor: string;
  accentColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
}) {
  const [imageVisible, setImageVisible] = useState(Boolean(venue.imageUrl));
  return (
    <Link
      href={`/venues/${venue.slug}?source=${encodeURIComponent(experienceSlug)}`}
      onClick={() => trackEvent("hotel_experience_editorial_click", { hotel_experience: experienceSlug, venue_slug: venue.slug })}
      className="group overflow-hidden rounded-[1.6rem] border border-slate-200/90 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
      style={{ backgroundColor: surfaceColor }}
    >
      {venue.imageUrl && imageVisible ? (
        <div className="relative h-36 overflow-hidden">
          <img src={venue.imageUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]" onError={() => setImageVisible(false)} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3"><SmallBadge color="#FFFFFF">{venue.distanceLabel}</SmallBadge></div>
        </div>
      ) : null}
      <div className="p-4">
        <h3 className="text-lg font-black" style={{ color: textColor }}>{venue.name}</h3>
        {venue.whyHere ? <p className="mt-2 text-sm font-bold leading-5" style={{ color: primaryColor }}>{venue.whyHere}</p> : null}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {venue.foodSummary ? <SmallBadge color={accentColor}>Food</SmallBadge> : null}
          {displayVibes(venue).slice(0, 2).map((tag) => <SmallBadge key={tag} color={primaryColor}>{tag}</SmallBadge>)}
        </div>
        {venue.tonightSchedule ? <p className="mt-3 text-xs leading-5" style={{ color: mutedTextColor }}>{venue.tonightSchedule}{venue.hostName ? ` · ${venue.hostName}` : ""}</p> : null}
      </div>
    </Link>
  );
}

function VenueCard({
  venue,
  onPlan,
  added,
  mode,
  experienceSlug,
  primaryColor,
  accentColor,
  surfaceColor,
  textColor,
  mutedTextColor,
}: {
  venue: HotelGuideVenue;
  onPlan: () => void;
  added: boolean;
  mode: "tonight" | "week";
  experienceSlug: string;
  primaryColor: string;
  accentColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
}) {
  const [imageVisible, setImageVisible] = useState(Boolean(venue.imageUrl));
  const schedule = mode === "tonight" ? venue.tonightSchedule : venue.weekSchedule.slice(0, 2).join(" • ");
  const href = `/venues/${venue.slug}?source=${encodeURIComponent(experienceSlug)}`;

  return (
    <article className="overflow-hidden rounded-[1.45rem] border border-slate-200/90 shadow-sm" style={{backgroundColor:surfaceColor}}>
    <Link
      href={href}
      onClick={() =>
        trackEvent("hotel_experience_venue_click", {
          hotel_experience: experienceSlug,
          venue_slug: venue.slug,
          tier: venue.tier,
          mode,
        })
      }
      className="group block overflow-hidden rounded-[1.45rem] border border-slate-200/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
      style={{ backgroundColor: surfaceColor }}
    >
      <div className="flex gap-3 p-3">
        {venue.imageUrl && imageVisible ? (
          <img src={venue.imageUrl} alt="" className="h-[96px] w-[112px] shrink-0 rounded-xl object-cover" loading="lazy" onError={() => setImageVisible(false)} />
        ) : (
          <div className="flex h-[96px] w-[112px] shrink-0 items-center justify-center rounded-xl text-xs font-black uppercase tracking-[0.12em]" style={{ backgroundColor: `${primaryColor}0D`, color: primaryColor }}>
            Karaoke
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-black" style={{ color: textColor }}>{venue.name}</h3>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: primaryColor }}>{venue.distanceLabel}</p>
            </div>
            <span className="pt-0.5 text-xl leading-none" style={{ color: primaryColor }} aria-hidden>›</span>
          </div>

          {venue.whyHere ? (
            <p className="mt-1.5 line-clamp-2 text-xs font-semibold leading-5" style={{ color: textColor }}>{venue.whyHere}</p>
          ) : schedule ? (
            <p className="mt-1.5 line-clamp-2 text-xs leading-5" style={{ color: mutedTextColor }}>{schedule}</p>
          ) : null}

          <div className="mt-2 flex flex-wrap gap-1">
            {venue.foodSummary ? <SmallBadge color={accentColor}>Food</SmallBadge> : null}
            {displayVibes(venue).slice(0, 2).map((tag) => <SmallBadge key={tag} color={primaryColor}>{tag}</SmallBadge>)}
          </div>
        </div>
      </div>

      {venue.singersSay ? (
        <div className="border-t border-slate-100 px-3 py-2.5">
          <p className="text-[9px] font-black uppercase tracking-[0.12em]" style={{ color: accentColor }}>Singers Say</p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-4" style={{ color: mutedTextColor }}>{venue.singersSay}</p>
          {venue.singersSaySource ? <p className="mt-1 text-[9px] font-semibold" style={{ color: mutedTextColor }}>{venue.singersSaySource}{venue.singersSayUpdatedAt ? ` · ${venue.singersSayUpdatedAt}` : ""}</p> : null}
        </div>
      ) : null}
    </Link>
    <div className="px-3 pb-3"><button type="button" onClick={onPlan} className="w-full rounded-xl border px-4 py-2.5 text-sm font-bold" style={{color:primaryColor,borderColor:primaryColor}}>{added ? "Saved to my plan" : "Add to plan"}</button></div>
    </article>
  );
}

function TierIcon({ tier, color }: { tier: keyof typeof tierMeta; color: string }) {
  if (tier === "walkable") return <span aria-hidden style={{ color }}>↗</span>;
  if (tier === "quick") return <span aria-hidden style={{ color }}>→</span>;
  return <span aria-hidden style={{ color }}>★</span>;
}

function TierSection({
  tier,
  venues,
  openPlan,
  savedPlans,
  mode,
  experienceSlug,
  primaryColor,
  accentColor,
  surfaceColor,
  textColor,
  mutedTextColor,
}: {
  tier: keyof typeof tierMeta;
  venues: HotelGuideVenue[];
  openPlan: (venue: HotelGuideVenue) => void;
  savedPlans: string[];
  mode: "tonight" | "week";
  experienceSlug: string;
  primaryColor: string;
  accentColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
}) {
  if (venues.length === 0) return null;
  const meta = tierMeta[tier];

  return (
    <section className="py-5">
      <div className="mb-3">
        <h2 className="flex items-center gap-2 text-xl font-black uppercase tracking-[0.12em]" style={{ color: textColor }}>
          <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: `${primaryColor}10` }}>
            <TierIcon tier={tier} color={primaryColor} />
          </span>
          {meta.label}
        </h2>
        <p className="mt-1 text-xs font-medium" style={{ color: mutedTextColor }}>{meta.helper}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {venues.map((venue) => (
          <VenueCard
            key={venue.slug}
            venue={venue}
            onPlan={()=>openPlan(venue)}
            added={savedPlans.includes(venue.slug)}
            mode={mode}
            experienceSlug={experienceSlug}
            primaryColor={primaryColor}
            accentColor={accentColor}
            surfaceColor={surfaceColor}
            textColor={textColor}
            mutedTextColor={mutedTextColor}
          />
        ))}
      </div>
    </section>
  );
}

export function BrandedHotelExperience({
  hotelSlug,
  experienceSlug,
  hotelName,
  hotelShortName,
  hotelSiteUrl,
  brandLogoUrl,
  heroImageUrl,
  heroCredit,
  heroAlt,
  heroPosition,
  fallbackHeroImageUrl,
  primaryColor,
  accentColor,
  pageBackground,
  surfaceColor,
  textColor,
  mutedTextColor,
  headingFontFamily,
  bodyFontFamily,
  eyebrow,
  headline,
  intro,
  tonightVenues,
  weekVenues,
}: Props) {
  const {openPlan,savedPlans,overlay:planOverlay}=useHotelGuestPlan({hotelSlug,hotelName,hotelShortName,returnPath:"/hotelexperience/"+experienceSlug,tonightVenues,weekVenues});
  const [mode, setMode] = useState<"tonight" | "week">("tonight");
  const [focus, setFocus] = useState<FocusMode>("all");
  const [selectedVibe, setSelectedVibe] = useState("");
  useListReturn({mode,focus,selectedVibe}, saved => {
    if (saved?.mode === "tonight" || saved?.mode === "week") setMode(saved.mode);
    if (["all","food","vibe","near"].includes(saved?.focus)) setFocus(saved.focus);
    if (typeof saved?.selectedVibe === "string") setSelectedVibe(saved.selectedVibe);
  });
  const [heroSource, setHeroSource] = useState(heroImageUrl || fallbackHeroImageUrl || "");
  const [heroVisible, setHeroVisible] = useState(Boolean(heroImageUrl || fallbackHeroImageUrl));
  const [logoVisible, setLogoVisible] = useState(Boolean(brandLogoUrl));

  const baseVenues = mode === "tonight" ? tonightVenues : weekVenues;
  const vibeChoices = useMemo(
    () => Array.from(new Set(baseVenues.flatMap((venue) => displayVibes(venue)))).slice(0, 10),
    [baseVenues],
  );

  const activeVenues = useMemo(() => {
    if (focus === "food") return baseVenues.filter((venue) => Boolean(venue.foodSummary));
    if (focus === "near") return baseVenues.filter((venue) => venue.tier !== "standout");
    if (focus === "vibe" && selectedVibe) return baseVenues.filter((venue) => displayVibes(venue).includes(selectedVibe));
    return baseVenues;
  }, [baseVenues, focus, selectedVibe]);

  const grouped = useMemo(() => splitByTier(activeVenues), [activeVenues]);
  const shortlist = useMemo(
    () => [...baseVenues].sort((a, b) => a.distanceMiles - b.distanceMiles).slice(0, 3),
    [baseVenues],
  );

  useEffect(() => {
    trackEvent("hotel_experience_view", { hotel_experience: experienceSlug, hotel_name: hotelName, version: "1.2" });
  }, [experienceSlug, hotelName]);

  function setExperienceMode(nextMode: "tonight" | "week") {
    setMode(nextMode);
    setFocus("all");
    setSelectedVibe("");
    trackEvent("hotel_experience_toggle", { hotel_experience: experienceSlug, mode: nextMode });
  }

  function chooseFocus(nextFocus: FocusMode) {
    setFocus(nextFocus);
    if (nextFocus !== "vibe") setSelectedVibe("");
    trackEvent("hotel_experience_quick_action", { hotel_experience: experienceSlug, focus: nextFocus, mode });
  }

  return (
    <main className="min-h-screen" data-hotel-slug={hotelSlug} data-hotel-experience={experienceSlug} style={{ backgroundColor: pageBackground, color: textColor, fontFamily: bodyFontFamily }}>
      <div className="relative isolate mx-auto min-h-screen max-w-4xl overflow-hidden bg-white shadow-[0_24px_80px_rgba(15,23,42,.12)]">
        <KaraokeMicBackdrop color={primaryColor} />

        <header className="relative z-10 flex items-center justify-between gap-4 bg-white/[0.96] px-5 py-4 backdrop-blur-sm sm:px-8">
          {hotelSiteUrl ? (
            <a href={hotelSiteUrl} target="_blank" rel="noreferrer" className="flex min-h-14 items-center" aria-label={`Visit ${hotelName} website`}>
              {logoVisible && brandLogoUrl ? (
                <img src={brandLogoUrl} alt={hotelName} className="max-h-14 max-w-[220px] object-contain" onError={() => setLogoVisible(false)} />
              ) : (
                <span className="text-lg font-black" style={{ color: primaryColor }}>{hotelShortName}</span>
              )}
            </a>
          ) : (
            <div className="flex min-h-14 items-center">
              {logoVisible && brandLogoUrl ? (
                <img src={brandLogoUrl} alt={hotelName} className="max-h-14 max-w-[220px] object-contain" onError={() => setLogoVisible(false)} />
              ) : (
                <span className="text-lg font-black" style={{ color: primaryColor }}>{hotelShortName}</span>
              )}
            </div>
          )}
          <span className="rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em]" style={{ borderColor: `${accentColor}44`, backgroundColor: `${accentColor}10`, color: accentColor }}>
            Local nightlife guide
          </span>
        </header>

        {heroSource && heroVisible ? (
          <div className="relative z-10 mx-3 h-52 overflow-hidden rounded-b-[2.5rem] sm:mx-5 sm:h-72">
            <img
              src={heroSource}
              alt={heroAlt || `${hotelName} property photograph`}
              style={{ objectPosition: heroPosition }}
              className="h-full w-full object-cover"
              onError={() => {
                if (fallbackHeroImageUrl && heroSource !== fallbackHeroImageUrl) {
                  setHeroSource(fallbackHeroImageUrl);
                  return;
                }
                setHeroVisible(false);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
            {heroSource === heroImageUrl && <HotelPhotoCredit credit={heroCredit} />}
          </div>
        ) : null}

        <section className="relative z-10 bg-white/[0.84] px-5 pb-4 pt-7 sm:px-8 sm:pt-9">
          <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: primaryColor }}>{eyebrow}</p>
          <h1 className="mt-2 max-w-2xl text-4xl font-black leading-[0.98] tracking-[-0.035em] sm:text-5xl" style={{ color: textColor, fontFamily: headingFontFamily }}>
            {headline}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7" style={{ color: mutedTextColor }}>{intro}</p>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <QuickAction active={focus === "all" && mode === "tonight"} title="Sing Tonight" helper="What is on right now" icon="mic" onClick={() => { setExperienceMode("tonight"); chooseFocus("all"); }} primaryColor={primaryColor} accentColor={accentColor} textColor={textColor} mutedTextColor={mutedTextColor} />
            <QuickAction active={focus === "food"} title="Karaoke + Food" helper="Dinner and a mic" icon="food" onClick={() => chooseFocus("food")} primaryColor={primaryColor} accentColor={accentColor} textColor={textColor} mutedTextColor={mutedTextColor} />
            <QuickAction active={focus === "vibe"} title="Match My Vibe" helper="Find your kind of room" icon="spark" onClick={() => chooseFocus("vibe")} primaryColor={primaryColor} accentColor={accentColor} textColor={textColor} mutedTextColor={mutedTextColor} />
            <QuickAction active={focus === "near"} title="Near Me" helper="Walkable or quick ride" icon="pin" onClick={() => chooseFocus("near")} primaryColor={primaryColor} accentColor={accentColor} textColor={textColor} mutedTextColor={mutedTextColor} />
          </div>

          {focus === "vibe" ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: primaryColor }}>Pick your vibe</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {vibeChoices.length > 0 ? vibeChoices.map((vibe) => (
                  <button key={vibe} type="button" aria-pressed={selectedVibe === vibe} onClick={() => { setSelectedVibe(vibe); trackEvent("hotel_experience_vibe_select", { hotel_experience: experienceSlug, vibe }); }} className="rounded-full border px-3 py-2 text-xs font-black transition hover:-translate-y-0.5" style={{ borderColor: selectedVibe === vibe ? `${primaryColor}77` : "#CBD5E1", backgroundColor: selectedVibe === vibe ? `${primaryColor}12` : "#FFFFFF", color: selectedVibe === vibe ? primaryColor : mutedTextColor }}>
                    {vibe}
                  </button>
                )) : <p className="text-sm" style={{ color: mutedTextColor }}>Vibe notes are being added for nearby venues.</p>}
              </div>
            </div>
          ) : null}

          <div className="mt-5 grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-100 p-1">
            <button type="button" aria-pressed={mode === "tonight"} onClick={() => setExperienceMode("tonight")} className="rounded-xl px-4 py-3 text-sm font-black transition" style={mode === "tonight" ? { backgroundColor: primaryColor, color: "#FFFFFF" } : { color: mutedTextColor }}>Tonight</button>
            <button type="button" aria-pressed={mode === "week"} onClick={() => setExperienceMode("week")} className="rounded-xl px-4 py-3 text-sm font-black transition" style={mode === "week" ? { backgroundColor: primaryColor, color: "#FFFFFF" } : { color: mutedTextColor }}>This Week</button>
          </div>
        </section>

        {mode === "tonight" && focus === "all" && shortlist.length > 0 ? (
          <section className="relative z-10 border-y border-slate-100 bg-[linear-gradient(180deg,#fff,#f8fafc)] px-5 py-7 sm:px-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accentColor }}>Tonight&apos;s Shortlist</p>
                <h2 className="mt-1 text-2xl font-black" style={{ color: textColor }}>Three easy places to start</h2>
              </div>
              <p className="hidden max-w-xs text-right text-xs sm:block" style={{ color: mutedTextColor }}>A quick local read before you head out.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {shortlist.map((venue) => <EditorialCard key={venue.slug} venue={venue} experienceSlug={experienceSlug} primaryColor={primaryColor} accentColor={accentColor} surfaceColor={surfaceColor} textColor={textColor} mutedTextColor={mutedTextColor} />)}
            </div>
          </section>
        ) : null}

        <div className="relative z-10 px-5 sm:px-8">
          {activeVenues.length === 0 ? (
            <div className="my-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-lg font-black" style={{ color: textColor }}>
                {focus === "food" ? "No nearby karaoke + food matches are verified for this view yet." : focus === "vibe" && selectedVibe ? `No nearby venues are tagged ${selectedVibe} yet.` : `No verified karaoke is listed ${mode === "tonight" ? "tonight" : "this week"} close enough to recommend right now.`}
              </p>
              <button type="button" onClick={() => { setFocus("all"); setSelectedVibe(""); }} className="mt-5 rounded-full px-5 py-2.5 text-sm font-black text-white" style={{ backgroundColor: primaryColor }}>Show all options</button>
            </div>
          ) : (
            <>
              <TierSection openPlan={openPlan} savedPlans={savedPlans} tier="walkable" venues={grouped.walkable} mode={mode} experienceSlug={experienceSlug} primaryColor={primaryColor} accentColor={accentColor} surfaceColor={surfaceColor} textColor={textColor} mutedTextColor={mutedTextColor} />
              <TierSection openPlan={openPlan} savedPlans={savedPlans} tier="quick" venues={grouped.quick} mode={mode} experienceSlug={experienceSlug} primaryColor={primaryColor} accentColor={accentColor} surfaceColor={surfaceColor} textColor={textColor} mutedTextColor={mutedTextColor} />
              <TierSection openPlan={openPlan} savedPlans={savedPlans} tier="standout" venues={grouped.standout} mode={mode} experienceSlug={experienceSlug} primaryColor={primaryColor} accentColor={accentColor} surfaceColor={surfaceColor} textColor={textColor} mutedTextColor={mutedTextColor} />
            </>
          )}
        </div>

        <div className="relative z-10 px-5 py-3 text-sm font-bold sm:px-8"><Link href="/account">My SingHUB · {savedPlans.length} saved karaoke picks</Link></div>
        <footer className="relative z-10 mt-5 border-t border-slate-200 bg-white/[0.9] px-5 py-7 sm:px-8">
          <Link
            href={`/find-karaoke?source=${encodeURIComponent(experienceSlug)}`}
            onClick={() => trackEvent("hotel_experience_full_singhub_click", { hotel_experience: experienceSlug, mode })}
            className="flex w-full items-center justify-center rounded-2xl border border-white/20 px-5 py-3.5 text-center text-sm font-black text-white transition hover:brightness-105"
            style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`, boxShadow: `0 12px 28px ${primaryColor}24` }}
          >
            Explore more local karaoke on SingHUB
          </Link>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="max-w-md text-center text-[11px] leading-5 sm:text-left" style={{ color: mutedTextColor }}>
              SingHUB maintains the local karaoke information. Schedules can change, especially on holidays and private-event nights.
            </p>
            <div className="flex shrink-0 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: mutedTextColor }}>
              <span>Powered by</span>
              <img src={SITE_WORDMARK_SRC} alt="SingHUB" className="h-auto w-[92px]" />
            </div>
          </div>
        </footer>
      </div>
      {planOverlay}
    </main>
  );
}
