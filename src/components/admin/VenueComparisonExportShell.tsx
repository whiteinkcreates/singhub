"use client";

import { useMemo, useState } from "react";
import { VenueComparisonTool } from "@/components/admin/VenueComparisonTool";
import type { KaraokeEventListing, VenueListing } from "@/types";

type VenueComparisonExportShellProps = {
  venues: VenueListing[];
  events: KaraokeEventListing[];
};

type VenueQuestion = {
  key: string;
  label: string;
  question: string;
  group: "core" | "enhanced";
};

type EnhancedItem = {
  key: string;
  label: string;
  actual?: string;
  prompt: string;
};

const DAY_ORDER: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

const ENHANCED_DEMO_IMAGE_URL =
  "https://res.cloudinary.com/dy3lyejkk/image/upload/v1781683694/ChatGPT_Image_Jun_17_2026_01_05_26_AM_sjmyq4.png";

function cleanValue(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed || /^(tbd|unknown|-|n\/a)$/i.test(trimmed)) return undefined;
  return trimmed;
}

function getDayOrder(day: string) {
  const normalized = day.trim().toLowerCase();
  const exact = DAY_ORDER[normalized];
  if (exact) return exact;

  const matchingDay = Object.keys(DAY_ORDER).find((name) =>
    normalized.includes(name),
  );
  return matchingDay ? DAY_ORDER[matchingDay] : 99;
}

function sortEvents(events: KaraokeEventListing[]) {
  return [...events].sort((a, b) => {
    const venueCompare = a.venueSlug.localeCompare(b.venueSlug);
    if (venueCompare !== 0) return venueCompare;
    return getDayOrder(a.karaokeDay || "") - getDayOrder(b.karaokeDay || "");
  });
}

function isStaleAdminComparisonEvent(event: KaraokeEventListing) {
  if (event.eventId === "event-0020") return true;
  if (event.venueSlug !== "cordova-bar") return false;

  const eventDay = event.karaokeDay || "";
  const notes = event.eventNotes || "";
  return /july\s*14/i.test(eventDay) || /summer\s+pride/i.test(notes);
}

function getVenueEvents(events: KaraokeEventListing[], venueSlug: string) {
  return sortEvents(events.filter((event) => event.venueSlug === venueSlug));
}

function getScheduleLine(event: KaraokeEventListing) {
  const time = [cleanValue(event.startTime), cleanValue(event.endTime)]
    .filter(Boolean)
    .join(" - ");
  const host = cleanValue(event.hostName);
  return [event.karaokeDay, time, host ? `KJ: ${host}` : undefined]
    .filter(Boolean)
    .join(" | ");
}

function getHostSummary(events: KaraokeEventListing[]) {
  const hosts = Array.from(
    new Set(
      events
        .map((event) => cleanValue(event.hostName))
        .filter((host): host is string => Boolean(host)),
    ),
  );
  return hosts.length > 0 ? hosts.join(", ") : "Host details are being confirmed.";
}

function getVenueQuestions(
  venue: VenueListing,
  venueEvents: KaraokeEventListing[],
) {
  const questions: VenueQuestion[] = [];
  const add = (
    group: "core" | "enhanced",
    key: string,
    label: string,
    question: string,
  ) => questions.push({ group, key, label, question });

  const scheduleComplete =
    venueEvents.length > 0 &&
    venueEvents.every(
      (event) => cleanValue(event.karaokeDay) && cleanValue(event.startTime),
    );
  const hasHost = venueEvents.some((event) => cleanValue(event.hostName));

  if (!scheduleComplete)
    add(
      "core",
      "schedule",
      "Karaoke schedule",
      "What are your current recurring karaoke day(s), start time(s), and end time(s)?",
    );
  if (!hasHost)
    add(
      "core",
      "host",
      "KJ / host",
      "Who currently hosts karaoke? If the host rotates or the night is self-directed, how should we describe that setup?",
    );
  if (!cleanValue(venue.address))
    add("core", "address", "Address", "What is the correct public address for the venue?");
  if (!cleanValue(venue.description))
    add(
      "core",
      "description",
      "Venue description",
      "How would you describe the karaoke experience, room, crowd, or overall vibe to someone deciding where to sing?",
    );
  if (venue.vibeTags.length === 0)
    add("core", "vibe", "Vibe", "What 3-5 words best describe the room and crowd?");
  if (!cleanValue(venue.coverCharge))
    add("core", "cover", "Cover charge", "Is there normally a cover charge for karaoke?");
  if (!cleanValue(venue.agePolicy))
    add(
      "core",
      "age-policy",
      "Age policy",
      "Is the venue 21+, all ages, or does the age policy change by time of day?",
    );
  if (!cleanValue(venue.website))
    add("core", "website", "Website", "What is the official venue website?");
  if (!cleanValue(venue.instagram))
    add("core", "instagram", "Instagram", "What is the venue's official Instagram account?");

  if (!cleanValue(venue.bannerImageUrl))
    add(
      "enhanced",
      "hero",
      "Photos / flyers",
      "What photo best represents the venue or karaoke night? Send any venue photos or current flyers you would like SingHUB to use.",
    );
  if (!cleanValue(venue.specials))
    add(
      "enhanced",
      "specials",
      "Weekly specials",
      "What recurring food, drink, karaoke-night, or weekly specials should we feature?",
    );
  if (!cleanValue(venue.happyHour))
    add(
      "enhanced",
      "happy-hour",
      "Happy hour",
      "Do you have a regular happy hour? If so, what days, times, and offers should we list?",
    );
  if (!cleanValue(venue.foodHighlights))
    add(
      "enhanced",
      "food",
      "Food highlights",
      "What food items, kitchen hours, or late-night bites would you most want a new guest to know about?",
    );
  if (!cleanValue(venue.drinkHighlights))
    add(
      "enhanced",
      "drinks",
      "Drink highlights",
      "Any signature drinks, local drafts, buckets, shots, or karaoke-night drink specials worth highlighting?",
    );
  if (!cleanValue(venue.parkingInfo))
    add(
      "enhanced",
      "parking",
      "Parking / arrival",
      "What should a first-time guest know about parking, nearby lots, rideshare drop-off, or getting into the venue?",
    );
  if (!cleanValue(venue.accessibilityNotes))
    add(
      "enhanced",
      "accessibility",
      "Accessibility",
      "Is there anything useful we should tell guests about entry, seating, restrooms, or stage-area accessibility?",
    );
  if (!cleanValue(venue.reservationLink))
    add(
      "enhanced",
      "reservation",
      "Reservation / event link",
      "Do you use a reservation, ticket, event, menu, or flyer link that SingHUB should send people to?",
    );
  if (!cleanValue(venue.bookingContact))
    add(
      "enhanced",
      "booking",
      "Booking / event contact",
      "Who should we list as the best contact for groups, private events, or event questions, if applicable?",
    );

  return questions;
}

function getEnhancedItems(venue: VenueListing): EnhancedItem[] {
  return [
    {
      key: "specials",
      label: "Weekly specials",
      actual: cleanValue(venue.specials),
      prompt: "Karaoke-night deals and recurring weekly offers",
    },
    {
      key: "happy-hour",
      label: "Happy hour",
      actual: cleanValue(venue.happyHour),
      prompt: "Times, offers, and recurring drink or food deals",
    },
    {
      key: "food",
      label: "Food highlights",
      actual: cleanValue(venue.foodHighlights),
      prompt: "Kitchen hours, late-night bites, and signature items",
    },
    {
      key: "drinks",
      label: "Drink highlights",
      actual: cleanValue(venue.drinkHighlights),
      prompt: "Signature drinks, local drafts, buckets, shots, or specials",
    },
    {
      key: "parking",
      label: "Parking / arrival",
      actual: cleanValue(venue.parkingInfo),
      prompt: "Parking, nearby lots, rideshare tips, and arrival notes",
    },
    {
      key: "accessibility",
      label: "Accessibility",
      actual: cleanValue(venue.accessibilityNotes),
      prompt: "Entry, seating, restroom, and stage-area accessibility details",
    },
    {
      key: "reservation",
      label: "Reservation / event link",
      actual: cleanValue(venue.reservationLink),
      prompt: "Direct reservation, event, menu, ticket, or flyer links",
    },
    {
      key: "booking",
      label: "Booking / event contact",
      actual: cleanValue(venue.bookingContact),
      prompt: "Best contact for groups, private events, or event questions",
    },
  ];
}

function PrintQuestionGroup({
  eyebrow,
  title,
  questions,
}: {
  eyebrow: string;
  title: string;
  questions: VenueQuestion[];
}) {
  if (questions.length === 0) return null;

  return (
    <section className="venue-pdf-question-section">
      <div className="venue-pdf-question-heading">
        <p className="venue-pdf-eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
      </div>
      <div className="venue-pdf-question-grid">
        {questions.map((question, index) => (
          <div key={question.key} className="venue-pdf-question-card">
            <p className="venue-pdf-question-label">
              {index + 1}. {question.label}
            </p>
            <p className="venue-pdf-question-copy">{question.question}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function VenueComparisonExportShell({
  venues,
  events,
}: VenueComparisonExportShellProps) {
  const initialSlug =
    venues.find((venue) => venue.slug === "cordova-bar")?.slug ||
    venues[0]?.slug ||
    "";
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);
  const selectedVenue = useMemo(
    () => venues.find((venue) => venue.slug === selectedSlug) || venues[0],
    [selectedSlug, venues],
  );
  const comparisonEvents = useMemo(
    () => sortEvents(events.filter((event) => !isStaleAdminComparisonEvent(event))),
    [events],
  );
  const selectedEvents = useMemo(
    () =>
      selectedVenue
        ? getVenueEvents(comparisonEvents, selectedVenue.slug)
        : [],
    [comparisonEvents, selectedVenue],
  );
  const questions = useMemo(
    () =>
      selectedVenue ? getVenueQuestions(selectedVenue, selectedEvents) : [],
    [selectedEvents, selectedVenue],
  );
  const coreQuestions = questions.filter((question) => question.group === "core");
  const enhancedQuestions = questions.filter(
    (question) => question.group === "enhanced",
  );
  const enhancedItems = selectedVenue ? getEnhancedItems(selectedVenue) : [];

  function handleExportPdf() {
    if (!selectedVenue) return;
    const previousTitle = document.title;
    const safeVenueName = selectedVenue.venueName
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "");
    document.title = `${safeVenueName}-SingHUB-Profile-Preview`;
    window.print();
    window.setTimeout(() => {
      document.title = previousTitle;
    }, 250);
  }

  if (!selectedVenue) {
    return (
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-slate-300">
        No venue listings are available for comparison.
      </div>
    );
  }

  const heroImage = cleanValue(selectedVenue.bannerImageUrl) || ENHANCED_DEMO_IMAGE_URL;

  return (
    <div className="venue-pdf-root">
      <style>{`
        .venue-pdf-print-only { display: none; }
        .venue-comparison-live > div > section:first-child { display: none; }

        @media print {
          @page { size: letter landscape; margin: 0; }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          body * { visibility: hidden !important; }

          .venue-pdf-root,
          .venue-pdf-root * {
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .venue-pdf-root {
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .venue-pdf-screen-only,
          .venue-comparison-live {
            display: none !important;
          }

          .venue-pdf-print-only { display: block !important; }

          .venue-pdf-page {
            box-sizing: border-box !important;
            width: 11in !important;
            min-height: 8.5in !important;
            padding: 0.38in 0.46in !important;
            background: #ffffff !important;
            color: #0f172a !important;
            break-after: page !important;
            page-break-after: always !important;
          }

          .venue-pdf-page:last-child {
            break-after: auto !important;
            page-break-after: auto !important;
          }

          .venue-pdf-topline {
            height: 6px !important;
            border-radius: 999px !important;
            background: #0f172a !important;
          }

          .venue-pdf-doc-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
            gap: 24px !important;
            margin-top: 14px !important;
            padding-bottom: 14px !important;
            border-bottom: 2px solid #e2e8f0 !important;
          }

          .venue-pdf-eyebrow {
            margin: 0 !important;
            color: #0e7490 !important;
            font-size: 9pt !important;
            line-height: 1.2 !important;
            font-weight: 900 !important;
            letter-spacing: 0.16em !important;
            text-transform: uppercase !important;
          }

          .venue-pdf-doc-header h1,
          .venue-pdf-page h2,
          .venue-pdf-page h3,
          .venue-pdf-page p {
            color: #0f172a !important;
          }

          .venue-pdf-doc-header h1 {
            margin: 5px 0 0 !important;
            font-size: 24pt !important;
            line-height: 1.05 !important;
            font-weight: 900 !important;
          }

          .venue-pdf-doc-header-copy {
            max-width: 4.25in !important;
            margin: 0 !important;
            color: #475569 !important;
            font-size: 9.5pt !important;
            line-height: 1.45 !important;
            text-align: right !important;
          }

          .venue-pdf-comparison-grid {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
            gap: 16px !important;
            margin-top: 16px !important;
            align-items: start !important;
          }

          .venue-pdf-profile-card {
            box-sizing: border-box !important;
            border: 2px solid #cbd5e1 !important;
            border-radius: 18px !important;
            background: #ffffff !important;
            padding: 16px !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .venue-pdf-profile-card.enhanced {
            border-color: #c084fc !important;
          }

          .venue-pdf-card-kicker {
            display: inline-block !important;
            margin: 0 0 7px !important;
            padding: 4px 8px !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 999px !important;
            color: #334155 !important;
            background: #ffffff !important;
            font-size: 8pt !important;
            line-height: 1 !important;
            font-weight: 900 !important;
            letter-spacing: 0.08em !important;
            text-transform: uppercase !important;
          }

          .venue-pdf-profile-card.enhanced .venue-pdf-card-kicker {
            border-color: #d8b4fe !important;
            color: #7e22ce !important;
          }

          .venue-pdf-profile-card h2 {
            margin: 0 !important;
            font-size: 18pt !important;
            line-height: 1.08 !important;
            font-weight: 900 !important;
          }

          .venue-pdf-location {
            margin: 5px 0 0 !important;
            color: #475569 !important;
            font-size: 9.5pt !important;
            line-height: 1.35 !important;
            font-weight: 700 !important;
          }

          .venue-pdf-description {
            margin: 11px 0 0 !important;
            color: #334155 !important;
            font-size: 9.5pt !important;
            line-height: 1.45 !important;
          }

          .venue-pdf-subhead {
            margin: 13px 0 7px !important;
            color: #0f172a !important;
            font-size: 9pt !important;
            line-height: 1.2 !important;
            font-weight: 900 !important;
            letter-spacing: 0.1em !important;
            text-transform: uppercase !important;
          }

          .venue-pdf-schedule {
            display: grid !important;
            gap: 4px !important;
          }

          .venue-pdf-schedule-row {
            margin: 0 !important;
            padding: 5px 7px !important;
            border-left: 3px solid #06b6d4 !important;
            background: #f8fafc !important;
            color: #0f172a !important;
            font-size: 8.6pt !important;
            line-height: 1.3 !important;
            font-weight: 700 !important;
          }

          .venue-pdf-detail-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 7px !important;
            margin-top: 11px !important;
          }

          .venue-pdf-detail {
            border: 1px solid #e2e8f0 !important;
            border-radius: 10px !important;
            background: #ffffff !important;
            padding: 8px !important;
          }

          .venue-pdf-detail-label {
            margin: 0 !important;
            color: #64748b !important;
            font-size: 7.6pt !important;
            line-height: 1.2 !important;
            font-weight: 900 !important;
            letter-spacing: 0.08em !important;
            text-transform: uppercase !important;
          }

          .venue-pdf-detail-value {
            margin: 4px 0 0 !important;
            color: #0f172a !important;
            font-size: 8.6pt !important;
            line-height: 1.35 !important;
            font-weight: 700 !important;
          }

          .venue-pdf-hero-strip {
            height: 0.7in !important;
            margin: 10px 0 0 !important;
            border-radius: 12px !important;
            background-size: cover !important;
            background-position: center !important;
            border: 1px solid #e2e8f0 !important;
          }

          .venue-pdf-enhanced-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 7px !important;
            margin-top: 10px !important;
          }

          .venue-pdf-enhanced-item {
            border: 1px solid #e2e8f0 !important;
            border-radius: 10px !important;
            background: #fafafa !important;
            padding: 8px !important;
          }

          .venue-pdf-enhanced-label {
            margin: 0 !important;
            color: #7e22ce !important;
            font-size: 7.7pt !important;
            line-height: 1.2 !important;
            font-weight: 900 !important;
            letter-spacing: 0.06em !important;
            text-transform: uppercase !important;
          }

          .venue-pdf-enhanced-copy {
            margin: 4px 0 0 !important;
            color: #334155 !important;
            font-size: 8.3pt !important;
            line-height: 1.32 !important;
          }

          .venue-pdf-trust-note {
            margin-top: 14px !important;
            padding: 10px 12px !important;
            border: 1px solid #bae6fd !important;
            border-radius: 12px !important;
            background: #f0f9ff !important;
            color: #164e63 !important;
            font-size: 9pt !important;
            line-height: 1.4 !important;
            font-weight: 700 !important;
          }

          .venue-pdf-question-intro {
            margin-top: 14px !important;
            padding-bottom: 12px !important;
            border-bottom: 2px solid #e2e8f0 !important;
          }

          .venue-pdf-question-intro h2 {
            margin: 4px 0 0 !important;
            font-size: 21pt !important;
            line-height: 1.1 !important;
            font-weight: 900 !important;
          }

          .venue-pdf-question-intro p:last-child {
            max-width: 8.7in !important;
            margin: 7px 0 0 !important;
            color: #475569 !important;
            font-size: 9.5pt !important;
            line-height: 1.45 !important;
          }

          .venue-pdf-question-section {
            margin-top: 12px !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .venue-pdf-question-heading {
            display: flex !important;
            align-items: baseline !important;
            gap: 10px !important;
            margin-bottom: 7px !important;
          }

          .venue-pdf-question-heading h3 {
            margin: 0 !important;
            font-size: 12pt !important;
            line-height: 1.2 !important;
            font-weight: 900 !important;
          }

          .venue-pdf-question-grid {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 7px !important;
          }

          .venue-pdf-question-card {
            border: 1px solid #cbd5e1 !important;
            border-radius: 10px !important;
            background: #ffffff !important;
            padding: 8px 9px !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .venue-pdf-question-label {
            margin: 0 !important;
            color: #7e22ce !important;
            font-size: 7.8pt !important;
            line-height: 1.2 !important;
            font-weight: 900 !important;
            letter-spacing: 0.06em !important;
            text-transform: uppercase !important;
          }

          .venue-pdf-question-copy {
            margin: 4px 0 0 !important;
            color: #0f172a !important;
            font-size: 8.5pt !important;
            line-height: 1.35 !important;
          }

          .venue-pdf-anything {
            margin-top: 9px !important;
            border: 1px solid #bae6fd !important;
            border-radius: 10px !important;
            background: #ffffff !important;
            padding: 9px 11px !important;
          }

          .venue-pdf-anything p:last-child {
            margin: 4px 0 0 !important;
            color: #0f172a !important;
            font-size: 9pt !important;
            line-height: 1.35 !important;
          }
        }
      `}</style>

      <section className="venue-pdf-screen-only rounded-3xl border border-white/10 bg-slate-950/70 p-5 md:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
              Select venue
            </span>
            <select
              value={selectedSlug}
              onChange={(event) => setSelectedSlug(event.currentTarget.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-base font-bold text-white outline-none focus:border-cyan-300"
            >
              {venues.map((venue) => (
                <option key={venue.id} value={venue.slug}>
                  {venue.venueName} - {venue.neighborhood}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={handleExportPdf}
            className="rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-400 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:scale-[1.02]"
          >
            Export Venue PDF
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-400">
          Opens your browser print dialog. Choose Save as PDF, then send or
          share the saved file with the venue.
        </p>
      </section>

      <div className="venue-comparison-live">
        <VenueComparisonTool
          key={selectedVenue.slug}
          venues={[selectedVenue]}
          events={comparisonEvents}
        />
      </div>

      <section className="venue-pdf-page venue-pdf-print-only">
        <div className="venue-pdf-topline" />
        <header className="venue-pdf-doc-header">
          <div>
            <p className="venue-pdf-eyebrow">SingHUB Founding Venue Pilot</p>
            <h1>{selectedVenue.venueName} + SingHUB</h1>
          </div>
          <p className="venue-pdf-doc-header-copy">
            Your current SingHUB presence beside a clearer view of what an
            Enhanced profile can add.
          </p>
        </header>

        <div className="venue-pdf-comparison-grid">
          <article className="venue-pdf-profile-card">
            <span className="venue-pdf-card-kicker">Current free profile</span>
            <h2>{selectedVenue.venueName}</h2>
            <p className="venue-pdf-location">
              {[selectedVenue.neighborhood, selectedVenue.address]
                .filter(Boolean)
                .join(" | ")}
            </p>
            <p className="venue-pdf-description">
              {cleanValue(selectedVenue.description) ||
                "The core venue description is still being completed."}
            </p>

            <p className="venue-pdf-subhead">Verified karaoke schedule</p>
            <div className="venue-pdf-schedule">
              {selectedEvents.length > 0 ? (
                selectedEvents.map((event) => (
                  <p key={event.eventId} className="venue-pdf-schedule-row">
                    {getScheduleLine(event)}
                  </p>
                ))
              ) : (
                <p className="venue-pdf-schedule-row">
                  Schedule details are being confirmed.
                </p>
              )}
            </div>

            <div className="venue-pdf-detail-grid">
              <div className="venue-pdf-detail">
                <p className="venue-pdf-detail-label">KJ / host</p>
                <p className="venue-pdf-detail-value">
                  {getHostSummary(selectedEvents)}
                </p>
              </div>
              <div className="venue-pdf-detail">
                <p className="venue-pdf-detail-label">Profile status</p>
                <p className="venue-pdf-detail-value">
                  Core listing stays accurate and available whether or not a
                  venue joins the Founding Venue Pilot.
                </p>
              </div>
            </div>
          </article>

          <article className="venue-pdf-profile-card enhanced">
            <span className="venue-pdf-card-kicker">Enhanced profile example</span>
            <h2>A richer venue presence</h2>
            <p className="venue-pdf-location">
              Build on the verified karaoke listing with the details that help
              singers decide where they want to go.
            </p>
            <div
              className="venue-pdf-hero-strip"
              style={{ backgroundImage: `url('${heroImage}')` }}
            />

            <div className="venue-pdf-enhanced-grid">
              {enhancedItems.map((item) => (
                <div key={item.key} className="venue-pdf-enhanced-item">
                  <p className="venue-pdf-enhanced-label">{item.label}</p>
                  <p className="venue-pdf-enhanced-copy">
                    {item.actual || item.prompt}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <p className="venue-pdf-trust-note">
          Accurate karaoke information is the baseline. Enhanced profiles add
          stronger presentation, richer venue details, and more ways for
          SingHUB to feature what makes the venue worth choosing.
        </p>
      </section>

      <section className="venue-pdf-page venue-pdf-print-only">
        <div className="venue-pdf-topline" />
        <div className="venue-pdf-question-intro">
          <p className="venue-pdf-eyebrow">Next step</p>
          <h2>Help us finish {selectedVenue.venueName}&apos;s profile</h2>
          <p>
            Send back whatever applies. You do not need to answer everything at
            once. If anything in the current profile is wrong, include the
            correction. You can also send photos, flyers, menus, or event
            graphics you would like SingHUB to use.
          </p>
        </div>

        <PrintQuestionGroup
          eyebrow="Accuracy check"
          title="A few basics we still need to confirm"
          questions={coreQuestions}
        />
        <PrintQuestionGroup
          eyebrow="Enhanced profile"
          title="What should we add?"
          questions={enhancedQuestions}
        />

        <div className="venue-pdf-anything">
          <p className="venue-pdf-eyebrow">Anything else?</p>
          <p>
            What is something about {selectedVenue.venueName} that a first-time
            guest usually does not know until they have actually been there?
          </p>
        </div>
      </section>
    </div>
  );
}
