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

function cleanValue(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed || /^(tbd|unknown|-|n\/a)$/i.test(trimmed)) return undefined;
  return trimmed;
}

function getVenueEvents(events: KaraokeEventListing[], venueSlug: string) {
  return events.filter((event) => event.venueSlug === venueSlug);
}

function getVenueQuestions(
  venue: VenueListing,
  venueEvents: KaraokeEventListing[],
): VenueQuestion[] {
  const questions: VenueQuestion[] = [];
  const scheduleComplete =
    venueEvents.length > 0 &&
    venueEvents.every(
      (event) => cleanValue(event.karaokeDay) && cleanValue(event.startTime),
    );
  const hosts = venueEvents
    .map((event) => cleanValue(event.hostName))
    .filter((host): host is string => Boolean(host));

  if (!scheduleComplete) {
    questions.push({
      key: "schedule",
      label: "Karaoke schedule",
      question:
        "What are your current recurring karaoke day(s), start time(s), and end time(s)?",
      group: "core",
    });
  }

  if (hosts.length === 0) {
    questions.push({
      key: "host",
      label: "KJ / host",
      question:
        "Who currently hosts karaoke? If the host rotates or the night is self-directed, how should we describe that setup?",
      group: "core",
    });
  }

  if (!cleanValue(venue.address)) {
    questions.push({
      key: "address",
      label: "Address",
      question: "What is the correct public address for the venue?",
      group: "core",
    });
  }

  if (!cleanValue(venue.description)) {
    questions.push({
      key: "description",
      label: "Venue description",
      question:
        "How would you describe the karaoke experience, room, crowd, or overall vibe to someone deciding where to sing?",
      group: "core",
    });
  }

  if (venue.vibeTags.length === 0) {
    questions.push({
      key: "vibe",
      label: "Vibe",
      question:
        "What 3-5 words best describe the room and crowd? For example: high-energy, neighborhood bar, beginner-friendly, late-night, sports bar.",
      group: "core",
    });
  }

  if (!cleanValue(venue.coverCharge)) {
    questions.push({
      key: "cover",
      label: "Cover charge",
      question: "Is there normally a cover charge for karaoke?",
      group: "core",
    });
  }

  if (!cleanValue(venue.agePolicy)) {
    questions.push({
      key: "age-policy",
      label: "Age policy",
      question:
        "Is the venue 21+, all ages, or does the age policy change by time of day?",
      group: "core",
    });
  }

  if (!cleanValue(venue.website)) {
    questions.push({
      key: "website",
      label: "Website",
      question: "What is the official venue website?",
      group: "core",
    });
  }

  if (!cleanValue(venue.instagram)) {
    questions.push({
      key: "instagram",
      label: "Instagram",
      question: "What is the venue's official Instagram account?",
      group: "core",
    });
  }

  const enhancedQuestions: Array<{
    key: string;
    label: string;
    actual: string | undefined;
    question: string;
  }> = [
    {
      key: "hero",
      label: "Photos / flyers",
      actual: cleanValue(venue.bannerImageUrl),
      question:
        "What photo best represents the venue or karaoke night? Please attach any venue photos or current flyers you would like SingHUB to use.",
    },
    {
      key: "specials",
      label: "Weekly specials",
      actual: cleanValue(venue.specials),
      question:
        "What recurring food, drink, karaoke-night, or weekly specials should we feature?",
    },
    {
      key: "happy-hour",
      label: "Happy hour",
      actual: cleanValue(venue.happyHour),
      question:
        "Do you have a regular happy hour? If so, what days, times, and offers should we list?",
    },
    {
      key: "food",
      label: "Food highlights",
      actual: cleanValue(venue.foodHighlights),
      question:
        "What food items, kitchen hours, or late-night bites would you most want a new guest to know about?",
    },
    {
      key: "drinks",
      label: "Drink highlights",
      actual: cleanValue(venue.drinkHighlights),
      question:
        "Any signature drinks, local drafts, buckets, shots, or karaoke-night drink specials worth highlighting?",
    },
    {
      key: "parking",
      label: "Parking / arrival",
      actual: cleanValue(venue.parkingInfo),
      question:
        "What should a first-time guest know about parking, nearby lots, rideshare drop-off, or getting into the venue?",
    },
    {
      key: "accessibility",
      label: "Accessibility",
      actual: cleanValue(venue.accessibilityNotes),
      question:
        "Is there anything useful we should tell guests about entry, seating, restrooms, or stage-area accessibility?",
    },
    {
      key: "reservation",
      label: "Reservation / event link",
      actual: cleanValue(venue.reservationLink),
      question:
        "Do you use a reservation, ticket, event, menu, or flyer link that SingHUB should send people to?",
    },
    {
      key: "booking",
      label: "Booking / event contact",
      actual: cleanValue(venue.bookingContact),
      question:
        "Who should we list as the best contact for groups, private events, or event questions, if applicable?",
    },
  ];

  enhancedQuestions.forEach((item) => {
    if (!item.actual) {
      questions.push({
        key: item.key,
        label: item.label,
        question: item.question,
        group: "enhanced",
      });
    }
  });

  return questions;
}

function QuestionGroup({
  title,
  eyebrow,
  questions,
}: {
  title: string;
  eyebrow: string;
  questions: VenueQuestion[];
}) {
  if (questions.length === 0) return null;

  return (
    <section className="venue-pdf-question-group rounded-3xl border border-white/10 bg-slate-950/70 p-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-xl font-black text-white">{title}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {questions.map((question, index) => (
          <div
            key={question.key}
            className="venue-pdf-question-card rounded-2xl border border-white/10 bg-white/[0.04] p-4"
          >
            <p className="text-xs font-black uppercase tracking-[0.14em] text-fuchsia-200">
              {index + 1}. {question.label}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-100">
              {question.question}
            </p>
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

  const selectedEvents = useMemo(
    () =>
      selectedVenue ? getVenueEvents(events, selectedVenue.slug) : [],
    [events, selectedVenue],
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

  function handleExportPdf() {
    if (!selectedVenue) return;

    const previousTitle = document.title;
    const safeVenueName = selectedVenue.venueName
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "");

    document.title = `${safeVenueName}-SingHUB-Profile-Preview`;
    window.print();
    document.title = previousTitle;
  }

  return (
    <div
      className="venue-pdf-root"
      onChangeCapture={(event) => {
        const target = event.target as HTMLSelectElement;
        if (target.tagName === "SELECT" && target.value) {
          setSelectedSlug(target.value);
        }
      }}
    >
      <style>{`
        .venue-pdf-print-only { display: none; }

        @media print {
          @page {
            size: landscape;
            margin: 0.35in;
          }

          html,
          body {
            background: #020617 !important;
          }

          body * {
            visibility: hidden !important;
          }

          .venue-pdf-root,
          .venue-pdf-root * {
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .venue-pdf-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
          }

          .venue-pdf-screen-only {
            display: none !important;
          }

          .venue-pdf-print-only {
            display: block !important;
          }

          .venue-comparison-live > div > section:first-child {
            display: none !important;
          }

          .venue-comparison-live section[class*="border-amber-300/25"] {
            display: none !important;
          }

          .venue-comparison-live > div {
            margin-top: 0 !important;
          }

          .venue-comparison-live > div > div[class*="xl:grid-cols-2"] {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
            gap: 14px !important;
            align-items: start !important;
          }

          .venue-comparison-live article,
          .venue-pdf-question-card,
          .venue-pdf-question-group {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .venue-pdf-owner-header {
            break-after: avoid;
            page-break-after: avoid;
          }

          .venue-pdf-questionnaire {
            break-before: page;
            page-break-before: always;
          }
        }
      `}</style>

      <div className="venue-pdf-screen-only mb-5 flex flex-col gap-3 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.05] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
            Venue follow-up
          </p>
          <p className="mt-1 text-sm text-slate-300">
            Export the selected venue's comparison and missing profile questions as a PDF.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportPdf}
          disabled={!selectedVenue}
          className="rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-400 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export Venue PDF
        </button>
      </div>

      {selectedVenue && (
        <header className="venue-pdf-owner-header venue-pdf-print-only mb-5 rounded-3xl border border-fuchsia-300/25 bg-slate-950 p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
            SingHUB Founding Venue Pilot
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">
            {selectedVenue.venueName} + SingHUB
          </h1>
          <p className="mt-2 text-lg font-bold text-fuchsia-100">
            Venue Profile Preview
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
            Below is your current SingHUB profile next to an example of the richer Founding Venue presentation. The enhanced example uses current venue information where available and shows the additional areas we can build out together.
          </p>
        </header>
      )}

      <div className="venue-comparison-live">
        <VenueComparisonTool venues={venues} events={events} />
      </div>

      {selectedVenue && (
        <section className="venue-pdf-questionnaire venue-pdf-print-only mt-6 space-y-5">
          <div className="rounded-3xl border border-fuchsia-300/25 bg-fuchsia-300/[0.06] p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-200">
              Next step
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Help us finish {selectedVenue.venueName}'s profile
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-200">
              Reply to the email this PDF came with and answer whatever applies. You do not need to answer everything at once. If any information shown in the current profile is wrong, include the correction in your reply. You can also attach photos, flyers, menus, or event graphics you would like SingHUB to use.
            </p>
          </div>

          <QuestionGroup
            eyebrow="Accuracy check"
            title="A few basics we still need to confirm"
            questions={coreQuestions}
          />

          <QuestionGroup
            eyebrow="Founding Venue profile"
            title="What should we add to the enhanced profile?"
            questions={enhancedQuestions}
          />

          <div className="venue-pdf-question-card rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
              Anything else?
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-100">
              What is something about {selectedVenue.venueName} that a first-time guest usually does not know until they have actually been there?
            </p>
          </div>

          {questions.length === 0 && (
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.05] p-5 text-sm leading-6 text-slate-100">
              SingHUB already has the main profile fields filled in. Please send any corrections, new specials, current flyers, or other details you would like highlighted.
            </div>
          )}
        </section>
      )}
    </div>
  );
}
