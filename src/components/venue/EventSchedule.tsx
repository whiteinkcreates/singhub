import type { KaraokeEventListing } from "@/types";

type EventScheduleProps = {
  events: KaraokeEventListing[];
  variant?: "compact" | "full";
};

function formatEvent(event: KaraokeEventListing) {
  const time =
    event.startTime && event.endTime
      ? `${event.startTime} to ${event.endTime}`
      : event.startTime || event.endTime || "Time TBD";

  return `${event.karaokeDay || "Day TBD"} • ${time}`;
}

export function EventSchedule({
  events,
  variant = "full",
}: EventScheduleProps) {
  if (!events.length) {
    return null;
  }

  if (variant === "compact") {
    const visibleEvents = events.slice(0, 3);
    const hiddenCount = events.length - visibleEvents.length;

    return (
      <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
          Karaoke schedule
        </p>

        <ul className="mt-2 space-y-1 text-sm font-semibold text-cyan-50">
          {visibleEvents.map((event) => (
            <li key={event.eventId}>
              {formatEvent(event)}
              {event.hostName ? ` • KJ: ${event.hostName}` : ""}
            </li>
          ))}
        </ul>

        {hiddenCount > 0 && (
          <p className="mt-2 text-xs text-cyan-100">
            +{hiddenCount} more schedule row{hiddenCount === 1 ? "" : "s"} on
            the venue profile.
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="mt-8 rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
      <h2 className="text-xl font-black text-white">Karaoke schedule</h2>
      <p className="mt-2 text-sm leading-6 text-cyan-100">
        Schedule details are separated by night so different KJs, times, and
        recurring events can be tracked cleanly.
      </p>

      <div className="mt-5 grid gap-3">
        {events.map((event) => (
          <article
            key={event.eventId}
            className="rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-base font-black text-white">
                  {formatEvent(event)}
                </h3>

                {event.hostName && (
                  <p className="mt-1 text-sm font-semibold text-fuchsia-200">
                    KJ / Host: {event.hostName}
                  </p>
                )}

                {event.eventNotes && (
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {event.eventNotes}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.16em]">
                <span className="rounded-full border border-white/10 px-3 py-1 text-slate-300">
                  {event.activeStatus || "active"}
                </span>

                {event.reviewStatus && (
                  <span className="rounded-full border border-purple-300/30 bg-purple-300/10 px-3 py-1 text-purple-100">
                    {event.reviewStatus.replaceAll("_", " ")}
                  </span>
                )}

                {typeof event.eventConfidenceScore === "number" && (
                  <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-cyan-100">
                    {event.eventConfidenceScore}% confidence
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
