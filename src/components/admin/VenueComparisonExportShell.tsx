"use client";

import { useMemo, useState } from "react";
import { VenueComparisonTool } from "@/components/admin/VenueComparisonTool";
import type { KaraokeEventListing, VenueListing } from "@/types";

type VenueComparisonExportShellProps = { venues: VenueListing[]; events: KaraokeEventListing[] };
type VenueQuestion = { key: string; label: string; question: string; group: "core" | "enhanced" };

const STALE_ADMIN_EVENT_IDS = new Set([
  // One-time Cordova Summer Pride Karaoke Contest. Removed from canonical Events,
  // but excluded here too so an unsynced/cached copy cannot appear in sales PDFs.
  "event-0020",
]);

function cleanValue(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed || /^(tbd|unknown|-|n\/a)$/i.test(trimmed)) return undefined;
  return trimmed;
}

function getVenueEvents(events: KaraokeEventListing[], venueSlug: string) {
  return events.filter((event) => event.venueSlug === venueSlug);
}

function getVenueQuestions(venue: VenueListing, venueEvents: KaraokeEventListing[]) {
  const questions: VenueQuestion[] = [];
  const add = (group: "core" | "enhanced", key: string, label: string, question: string) =>
    questions.push({ group, key, label, question });
  const scheduleComplete = venueEvents.length > 0 && venueEvents.every((event) => cleanValue(event.karaokeDay) && cleanValue(event.startTime));
  const hasHost = venueEvents.some((event) => cleanValue(event.hostName));

  if (!scheduleComplete) add("core", "schedule", "Karaoke schedule", "What are your current recurring karaoke day(s), start time(s), and end time(s)?");
  if (!hasHost) add("core", "host", "KJ / host", "Who currently hosts karaoke? If the host rotates or the night is self-directed, how should we describe that setup?");
  if (!cleanValue(venue.address)) add("core", "address", "Address", "What is the correct public address for the venue?");
  if (!cleanValue(venue.description)) add("core", "description", "Venue description", "How would you describe the karaoke experience, room, crowd, or overall vibe to someone deciding where to sing?");
  if (venue.vibeTags.length === 0) add("core", "vibe", "Vibe", "What 3-5 words best describe the room and crowd?");
  if (!cleanValue(venue.coverCharge)) add("core", "cover", "Cover charge", "Is there normally a cover charge for karaoke?");
  if (!cleanValue(venue.agePolicy)) add("core", "age-policy", "Age policy", "Is the venue 21+, all ages, or does the age policy change by time of day?");
  if (!cleanValue(venue.website)) add("core", "website", "Website", "What is the official venue website?");
  if (!cleanValue(venue.instagram)) add("core", "instagram", "Instagram", "What is the venue's official Instagram account?");

  if (!cleanValue(venue.bannerImageUrl)) add("enhanced", "hero", "Photos / flyers", "What photo best represents the venue or karaoke night? Please attach any venue photos or current flyers you would like SingHUB to use.");
  if (!cleanValue(venue.specials)) add("enhanced", "specials", "Weekly specials", "What recurring food, drink, karaoke-night, or weekly specials should we feature?");
  if (!cleanValue(venue.happyHour)) add("enhanced", "happy-hour", "Happy hour", "Do you have a regular happy hour? If so, what days, times, and offers should we list?");
  if (!cleanValue(venue.foodHighlights)) add("enhanced", "food", "Food highlights", "What food items, kitchen hours, or late-night bites would you most want a new guest to know about?");
  if (!cleanValue(venue.drinkHighlights)) add("enhanced", "drinks", "Drink highlights", "Any signature drinks, local drafts, buckets, shots, or karaoke-night drink specials worth highlighting?");
  if (!cleanValue(venue.parkingInfo)) add("enhanced", "parking", "Parking / arrival", "What should a first-time guest know about parking, nearby lots, rideshare drop-off, or getting into the venue?");
  if (!cleanValue(venue.accessibilityNotes)) add("enhanced", "accessibility", "Accessibility", "Is there anything useful we should tell guests about entry, seating, restrooms, or stage-area accessibility?");
  if (!cleanValue(venue.reservationLink)) add("enhanced", "reservation", "Reservation / event link", "Do you use a reservation, ticket, event, menu, or flyer link that SingHUB should send people to?");
  if (!cleanValue(venue.bookingContact)) add("enhanced", "booking", "Booking / event contact", "Who should we list as the best contact for groups, private events, or event questions, if applicable?");

  return questions;
}

function QuestionGroup({ title, eyebrow, questions }: { title: string; eyebrow: string; questions: VenueQuestion[] }) {
  if (questions.length === 0) return null;
  return (
    <section className="venue-pdf-question-group rounded-3xl border border-white/10 bg-slate-950/70 p-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-black text-white">{title}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {questions.map((question, index) => (
          <div key={question.key} className="venue-pdf-question-card rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-fuchsia-200">{index + 1}. {question.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-100">{question.question}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function VenueComparisonExportShell({ venues, events }: VenueComparisonExportShellProps) {
  const initialSlug = venues.find((venue) => venue.slug === "cordova-bar")?.slug || venues[0]?.slug || "";
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);
  const selectedVenue = useMemo(() => venues.find((venue) => venue.slug === selectedSlug) || venues[0], [selectedSlug, venues]);
  const comparisonEvents = useMemo(
    () => events.filter((event) => !STALE_ADMIN_EVENT_IDS.has(event.eventId)),
    [events],
  );
  const selectedEvents = useMemo(() => selectedVenue ? getVenueEvents(comparisonEvents, selectedVenue.slug) : [], [comparisonEvents, selectedVenue]);
  const questions = useMemo(() => selectedVenue ? getVenueQuestions(selectedVenue, selectedEvents) : [], [selectedEvents, selectedVenue]);
  const coreQuestions = questions.filter((question) => question.group === "core");
  const enhancedQuestions = questions.filter((question) => question.group === "enhanced");

  function handleExportPdf() {
    if (!selectedVenue) return;
    const previousTitle = document.title;
    const safeVenueName = selectedVenue.venueName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
    document.title = `${safeVenueName}-SingHUB-Profile-Preview`;
    window.print();
    window.setTimeout(() => { document.title = previousTitle; }, 250);
  }

  if (!selectedVenue) return <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-slate-300">No venue listings are available for comparison.</div>;

  return (
    <div className="venue-pdf-root">
      <style>{`
        .venue-pdf-print-only { display: none; }
        .venue-comparison-live > div > section:first-child { display: none; }
        @media print {
          @page { size: landscape; margin: 0.35in; }
          html, body { background: #020617 !important; }
          body * { visibility: hidden !important; }
          .venue-pdf-root, .venue-pdf-root * { visibility: visible !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .venue-pdf-root { position: absolute !important; inset: 0 auto auto 0 !important; width: 100% !important; }
          .venue-pdf-screen-only { display: none !important; }
          .venue-pdf-print-only { display: block !important; }
          .venue-comparison-live section[class*="border-amber-300/25"] { display: none !important; }
          .venue-comparison-live > div { margin-top: 0 !important; }
          .venue-comparison-live > div > div[class*="xl:grid-cols-2"] { display: grid !important; grid-template-columns: minmax(0,1fr) minmax(0,1fr) !important; gap: 14px !important; align-items: start !important; }
          .venue-comparison-live article, .venue-pdf-question-card, .venue-pdf-question-group { break-inside: avoid; page-break-inside: avoid; }
          .venue-pdf-questionnaire { break-before: page; page-break-before: always; }
        }
      `}</style>

      <section className="venue-pdf-screen-only rounded-3xl border border-white/10 bg-slate-950/70 p-5 md:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Select venue</span>
            <select value={selectedSlug} onChange={(event) => setSelectedSlug(event.currentTarget.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-base font-bold text-white outline-none focus:border-cyan-300">
              {venues.map((venue) => <option key={venue.id} value={venue.slug}>{venue.venueName} - {venue.neighborhood}</option>)}
            </select>
          </label>
          <button type="button" onClick={handleExportPdf} className="rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-400 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:scale-[1.02]">Export Venue PDF</button>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-400">Opens your browser print dialog. Choose Save as PDF, then attach the saved file to your venue follow-up email.</p>
      </section>

      <header className="venue-pdf-print-only mb-5 rounded-3xl border border-fuchsia-300/25 bg-slate-950 p-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">SingHUB Founding Venue Pilot</p>
        <h1 className="mt-2 text-3xl font-black text-white">{selectedVenue.venueName} + SingHUB</h1>
        <p className="mt-2 text-lg font-bold text-fuchsia-100">Venue Profile Preview</p>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">Below is your current SingHUB profile next to an example of the richer Founding Venue presentation. The enhanced example uses current venue information where available and shows the additional areas we can build out together.</p>
      </header>

      <div className="venue-comparison-live">
        <VenueComparisonTool key={selectedVenue.slug} venues={[selectedVenue]} events={comparisonEvents} />
      </div>

      <section className="venue-pdf-questionnaire venue-pdf-print-only mt-6 space-y-5">
        <div className="rounded-3xl border border-fuchsia-300/25 bg-fuchsia-300/[0.06] p-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-200">Next step</p>
          <h2 className="mt-2 text-2xl font-black text-white">Help us finish {selectedVenue.venueName}&apos;s profile</h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-200">Reply to the email this PDF came with and answer whatever applies. You do not need to answer everything at once. If any information shown in the current profile is wrong, include the correction in your reply. You can also attach photos, flyers, menus, or event graphics you would like SingHUB to use.</p>
        </div>
        <QuestionGroup eyebrow="Accuracy check" title="A few basics we still need to confirm" questions={coreQuestions} />
        <QuestionGroup eyebrow="Founding Venue profile" title="What should we add to the enhanced profile?" questions={enhancedQuestions} />
        <div className="venue-pdf-question-card rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Anything else?</p>
          <p className="mt-2 text-sm leading-6 text-slate-100">What is something about {selectedVenue.venueName} that a first-time guest usually does not know until they have actually been there?</p>
        </div>
      </section>
    </div>
  );
}
