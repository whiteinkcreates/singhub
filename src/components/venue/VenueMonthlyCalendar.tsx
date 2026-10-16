"use client";

import { useMemo, useState } from "react";
import type { VenueProgramEvent } from "@/lib/venueEnhancements";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CATEGORY_LABELS: Record<string, string> = {
  karaoke: "Karaoke",
  live_music: "Live music",
  game: "Games",
  community: "Community",
  special: "Special event",
};

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
function weekStart(date: string) {
  const day = new Date(date + "T12:00:00Z");
  day.setUTCDate(day.getUTCDate() - day.getUTCDay());
  return day.toISOString().slice(0, 10);
}
function shiftDays(date: string, days: number) {
  const value = new Date(date + "T12:00:00Z");
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
export function VenueMonthlyCalendar({
  events, venueName, sourceUrl,
}: { events: VenueProgramEvent[]; venueName: string; sourceUrl?: string }) {
  const [today] = useState(localToday);
  const [month, setMonth] = useState(() => localToday().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showMonth, setShowMonth] = useState(false);
  const [week, setWeek] = useState(() => weekStart(localToday()));
  const weekEnd = shiftDays(week, 6);
  const weeklyEvents = useMemo(() => [...events]
    .filter(item => item.date >= week && item.date <= weekEnd)
    .sort((a,b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title)), [events,week,weekEnd]);
  const monthEvents = useMemo(
    () => [...events].filter(item => item.date.startsWith(month))
      .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title)),
    [events, month],
  );
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
      <h2>This week at {venueName}</h2>
      {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer">Venue calendar ↗</a> : null}
    </div>
    <div className="calendar-shell">
      <div className="calendar-toolbar" aria-label="Choose event week">
        <button type="button" onClick={() => setWeek(value=>shiftDays(value,-7))} aria-label="Previous week">‹</button>
        <strong aria-live="polite">{prettyDate(week)} – {prettyDate(weekEnd)}</strong>
        <button type="button" onClick={() => setWeek(value=>shiftDays(value,7))} aria-label="Next week">›</button>
      </div>
      <div className="calendar-results">
        {weeklyEvents.length ? weeklyEvents.map((event,index)=><article className="calendar-event" key={event.date + event.title + index}>
          <div><time dateTime={event.date}>{prettyDate(event.date)}</time><strong>{event.title}</strong></div>
          <span className={"calendar-kind kind-" + (event.category || "special")}>{CATEGORY_LABELS[event.category || "special"] || "Event"}</span>
          <p>{[event.time,event.detail].filter(Boolean).join(" · ")}</p>
          {event.sourceUrl && event.sourceUrl !== sourceUrl ? <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">Event details ↗</a> : null}
        </article>) : <p>No events listed for this week. Try another week or open the full month.</p>}
      </div>
      <div className="calendar-results-heading" style={{padding:"14px 20px"}}>
        <strong>Looking further ahead?</strong>
        <button type="button" aria-expanded={showMonth} aria-controls="partner-calendar-month" onClick={() => {setShowMonth(value=>!value);setMonth(week.slice(0,7));setSelectedDate(null);}}>
          {showMonth ? "Hide full month" : "Open full month calendar"}
        </button>
      </div>
      {showMonth && <div id="partner-calendar-month">
      <div className="calendar-toolbar" aria-label="Choose event month">
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
            {entries.length ? <span className="calendar-dots" aria-hidden="true">{entries.slice(0, 3).map((item, i) => <i className={"kind-" + (item.category || "special")} key={i} />)}</span> : null}
          </button>;
        })}
      </div>
      <div className="calendar-results">
        <div className="calendar-results-heading">
          <strong>{showAll ? "All " + monthEvents.length + " listed events" : currentSelection ? prettyDate(currentSelection) : "No listed events"}</strong>
          {monthEvents.length > 0 ? <button type="button" onClick={() => setShowAll(value => !value)}>{showAll ? "Show selected day" : "See full lineup (" + monthEvents.length + ")"}</button> : null}
        </div>
        {!shown.length ? <p>No events listed for this selection. Check the venue calendar for changes.</p> : shown.map((event, index) => <article className="calendar-event" key={event.date + event.title + index}>
          <div><time dateTime={event.date}>{prettyDate(event.date)}</time><strong>{event.title}</strong></div>
          <span className={"calendar-kind kind-" + (event.category || "special")}>{CATEGORY_LABELS[event.category || "special"] || "Event"}</span>
          <p>{[event.time, event.detail].filter(Boolean).join(" · ")}</p>
          {event.sourceUrl && event.sourceUrl !== sourceUrl ? <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">Event details ↗</a> : null}
        </article>)}
      </div>
      </div>}
    </div>
    <p className="calendar-disclaimer">Lineup and admission may change. Check with the venue before heading out.</p>
  </section>;
}
