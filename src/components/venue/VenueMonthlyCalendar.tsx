"use client";

import { useId, useMemo, useState } from "react";
import type {VenueProgramEvent,VenueWeeklyProgram} from "@/lib/venueEnhancements";
import type {KaraokeEventListing} from "@/types";
import {venueCalendarOccurrences} from "@/lib/venueCalendarOccurrences";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CATEGORY_LABELS: Record<string, string> = {
  karaoke: "Karaoke",
  live_music: "Live music",
  game: "Games",
  trivia: "Trivia",
  bingo: "Bingo",
  sports: "Sports",
  community: "Community",
  special: "Special event",
};

/** A dot represents a dated event. Never infer calendar dots from evergreen amenities. */
function eventCategory(event:VenueProgramEvent):string {
  const label=event.title.toLowerCase();
  if(event.category==="game"||event.category==="special"||!event.category){
    if(/\btrivia\b/i.test(label))return "trivia";
    if(/\bbingo\b/i.test(label))return "bingo";
    if(/\b(football|ufc|fight night|basketball|watch party|sports screening)\b/i.test(label))return "sports";
  }
  return event.category||"special";
}
function localToday(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function monthDate(date: string) {
  return new Date(date + "-01T12:00:00Z");
}

function prettyDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" })
    .format(new Date(date + "T12:00:00Z"));
}

/** Weekly-first venue programming. This never edits the canonical karaoke schedule. */
export function VenueMonthlyCalendar({
  events, venueName, sourceUrl, partial = false, weeklyProgramming = [], karaokeEvents = [],
}: { events: VenueProgramEvent[]; venueName: string; sourceUrl?: string; partial?: boolean; weeklyProgramming?: VenueWeeklyProgram[]; karaokeEvents?: KaraokeEventListing[] }) {
  const [today] = useState(localToday);
  const [month, setMonth] = useState(() => localToday().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showMonth, setShowMonth] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const monthId = useId();
  // Calendar arithmetic uses the venue date, never the viewer's timezone.
  const weekStart = new Date(today + "T12:00:00Z");
  weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay() + weekOffset * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  const weekFirst = weekStart.toISOString().slice(0, 10);
  const weekLast = weekEnd.toISOString().slice(0, 10);
  const weeklyEvents = useMemo(() => venueCalendarOccurrences({
    datedEvents:events, weeklyProgramming, karaokeEvents, startDate:weekFirst, endDate:weekLast,
  }), [events, weeklyProgramming, karaokeEvents, weekFirst, weekLast]);
  const monthEvents = useMemo(() => {
    const firstDate=month+"-01";
    const lastDate=new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5,7)),0)).toISOString().slice(0,10);
    return venueCalendarOccurrences({
      datedEvents:events, weeklyProgramming, karaokeEvents, startDate:firstDate, endDate:lastDate,
    });
  }, [events, weeklyProgramming, karaokeEvents, month]);
  const eventsByDate = useMemo(() => {
    const map = new Map<string, VenueProgramEvent[]>();
    for (const event of monthEvents) map.set(event.date, [...(map.get(event.date) || []), event]);
    return map;
  }, [monthEvents]);
  const firstUpcoming = monthEvents.find(item => item.date >= today)?.date || monthEvents[0]?.date || null;
  const currentSelection = selectedDate?.startsWith(month) ? selectedDate : firstUpcoming;
  const shown = showAll ? monthEvents : monthEvents.filter(event => event.date === currentSelection);
  const first = monthDate(month);
  const firstWeekday = first.getUTCDay();
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const slots = Array.from({ length: Math.ceil((firstWeekday + daysInMonth) / 7) * 7 }, (_, i) => i - firstWeekday + 1);
  const monthLabel = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", year: "numeric" }).format(first);

  function moveMonth(delta: number) {
    const next = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + delta, 1));
    setMonth(`${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`);
    setSelectedDate(null);
    setShowAll(false);
  }

  return <section className="section partner-calendar" aria-label={venueName + " events"}>
    <div className="section-heading">
      <h2>{showMonth ? (partial ? "Dates on the calendar" : "Full month lineup") : "This week at " + venueName}</h2>
      {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer">Venue calendar ↗</a> : null}
    </div>
    {!showMonth && <div className="calendar-shell">
      <div className="calendar-toolbar" aria-label="Choose event week">
        <button type="button" onClick={() => setWeekOffset(value => value - 1)} aria-label="Previous week">‹</button>
        <strong aria-live="polite">{prettyDate(weekFirst)} – {prettyDate(weekLast)}</strong>
        <button type="button" onClick={() => setWeekOffset(value => value + 1)} aria-label="Next week">›</button>
      </div>
      <div className="calendar-results">
        {!weeklyEvents.length ? <p>No dates listed for this week. Check with the venue for current programming.</p> : weeklyEvents.map((event, index) => <article className="calendar-event" key={event.date + event.title + index}>
          <div><time dateTime={event.date}>{prettyDate(event.date)}</time><strong>{event.title}</strong></div>
          <span className={"calendar-kind kind-" + eventCategory(event)}>{CATEGORY_LABELS[eventCategory(event)] || "Event"}</span>
          <p>{[event.time, event.detail].filter(Boolean).join(" · ")}</p>
          {event.sourceUrl && event.sourceUrl !== sourceUrl ? <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">Event details ↗</a> : null}
        </article>)}
      </div>
    </div>}
    <button type="button" aria-expanded={showMonth} aria-controls={monthId} onClick={() => {
      setShowMonth(value => !value);
      setMonth(weekFirst.slice(0, 7));
      setSelectedDate(null);
      setShowAll(false);
    }}>{showMonth ? "Show this week" : partial ? "Open listed dates calendar" : "Open full month calendar"}</button>
    {showMonth && <div className="calendar-shell" id={monthId}>
      <div className="calendar-toolbar">
        <button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month">‹</button>
        <strong aria-live="polite">{monthLabel}</strong>
        <button type="button" onClick={() => moveMonth(1)} aria-label="Next month">›</button>
      </div>
      <div className="calendar-grid" role="group" aria-label={monthLabel}>
        {WEEKDAYS.map(day => <span className="calendar-weekday" key={day}>{day}</span>)}
        {slots.map((date, index) => {
          if (date < 1 || date > daysInMonth) return <span className="calendar-empty" key={"empty-" + index} aria-hidden="true" />;
          const key = month + "-" + String(date).padStart(2, "0");
          const entries = eventsByDate.get(key) || [];
          const selected = !showAll && currentSelection === key;
          return <button key={key} type="button" className={"calendar-day" + (selected ? " selected" : "") + (key === today ? " today" : "") + (key < today ? " past" : "")}
            aria-label={prettyDate(key) + (entries.length ? ", " + entries.length + " events" : ", no listed events")}
            aria-pressed={selected} onClick={() => { setSelectedDate(key); setShowAll(false); }}>
            <span>{date}</span>
            {entries.length ? <span className="calendar-dots" aria-hidden="true">{entries.slice(0, 3).map((item, i) => <i className={"kind-" + eventCategory(item)} key={i} />)}</span> : null}
          </button>;
        })}
      </div>
      <div className="calendar-legend" aria-label="Calendar dot colors">{(["karaoke","trivia","bingo","live_music","sports","game","community","special"] as const).map(category=><span key={category} className="calendar-legend-item"><i className={"kind-"+category} aria-hidden="true"/>{CATEGORY_LABELS[category]}</span>)}</div>
      <div className="calendar-results">
        <div className="calendar-results-heading">
          <strong>{showAll ? "All " + monthEvents.length + " listed events" : currentSelection ? prettyDate(currentSelection) : "No listed events"}</strong>
          {monthEvents.length > 0 ? <button type="button" onClick={() => setShowAll(value => !value)}>{showAll ? "Show selected day" : "See full lineup (" + monthEvents.length + ")"}</button> : null}
        </div>
        {!shown.length ? <p>No events listed for this selection. Check the venue calendar for changes.</p> : shown.map((event, index) => <article className="calendar-event" key={event.date + event.title + index}>
          <div><time dateTime={event.date}>{prettyDate(event.date)}</time><strong>{event.title}</strong></div>
          <span className={"calendar-kind kind-" + eventCategory(event)}>{CATEGORY_LABELS[eventCategory(event)] || "Event"}</span>
          <p>{[event.time, event.detail].filter(Boolean).join(" · ")}</p>
          {event.sourceUrl && event.sourceUrl !== sourceUrl ? <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">Event details ↗</a> : null}
        </article>)}
      </div>
    </div>}
    <p className="calendar-disclaimer">{partial ? "Regular programs and selected special dates are shown. This is not the venue's complete event calendar. Confirm any changes or cancellations with the venue." : "Lineup and admission may change. Check with the venue before heading out."}</p>
  </section>;
}
