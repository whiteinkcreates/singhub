import type { KaraokeNightEvent, VenueListing } from "@/types";

type EventSummaryProps = {
  events?: KaraokeNightEvent[];
  fallbackVenue?: VenueListing;
  compact?: boolean;
};

function formatEventTime(event: KaraokeNightEvent) {
  return event.endTime ? `${event.startTime} to ${event.endTime}` : event.startTime;
}

function formatFallbackTime(venue: VenueListing) {
  return venue.endTime ? `${venue.startTime} to ${venue.endTime}` : venue.startTime;
}

export function EventSummary({
  events = [],
  fallbackVenue,
  compact = false,
}: EventSummaryProps) {
  const fallbackEvent =
    events.length === 0 && fallbackVenue?.karaokeDay && fallbackVenue.startTime
      ? fallbackVenue
      : null;

  if (events.length === 0 && !fallbackEvent) {
    return (
      <p className="mt-3 text-sm font-semibold text-slate-400">
        Schedule details coming soon.
      </p>
    );
  }

  if (compact) {
    const summaryEvents = events.length > 0 ? events : [];

    return (
      <div className="mt-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-50">
        <p className="font-bold uppercase tracking-[0.18em] text-cyan-200">
          {summaryEvents.length > 1 ? "Upcoming karaoke nights" : "Next karaoke night"}
        </p>
        {summaryEvents.length > 0 ? (
          <ul className="mt-2 space-y-1">
            {summaryEvents.map((event) => (
              <li key={event.id}>
                <span className="font-semibold">{event.dayOfWeek}</span> •{" "}
                {formatEventTime(event)}
                {event.kjName ? ` • KJ: ${event.kjName}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          fallbackEvent && (
            <p className="mt-2">
              <span className="font-semibold">{fallbackEvent.karaokeDay}</span> •{" "}
              {formatFallbackTime(fallbackEvent)}
              {fallbackEvent.hostName ? ` • KJ: ${fallbackEvent.hostName}` : ""}
            </p>
          )
        )}
      </div>
    );
  }

  return (
    <section className="mt-8 rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-6">
      <h2 className="text-2xl font-black text-white">Karaoke schedule</h2>
      <p className="mt-2 text-sm leading-6 text-cyan-50">
        Event nights are loaded from public/data/events_by_night.tsv separately
        from the venue profile data.
      </p>
      {events.length > 0 ? (
        <div className="mt-5 grid gap-4">
          {events.map((event) => (
            <article
              key={event.id}
              className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">
                    {event.eventName ?? `${event.dayOfWeek} Karaoke`}
                  </h3>
                  <p className="mt-1 font-semibold text-cyan-200">
                    {event.dayOfWeek} • {formatEventTime(event)}
                  </p>
                  {event.kjName && (
                    <p className="mt-1 text-sm text-slate-300">KJ: {event.kjName}</p>
                  )}
                </div>
                {event.recurring && (
                  <span className="rounded-full border border-cyan-400/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                    Weekly
                  </span>
                )}
              </div>
              {event.notes && (
                <p className="mt-3 text-sm leading-6 text-slate-300">{event.notes}</p>
              )}
            </article>
          ))}
        </div>
      ) : (
        fallbackEvent && (
          <article className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <h3 className="text-lg font-black text-white">Legacy venue schedule</h3>
            <p className="mt-1 font-semibold text-cyan-200">
              {fallbackEvent.karaokeDay} • {formatFallbackTime(fallbackEvent)}
            </p>
            {fallbackEvent.hostName && (
              <p className="mt-1 text-sm text-slate-300">KJ: {fallbackEvent.hostName}</p>
            )}
          </article>
        )
      )}
    </section>
  );
}
