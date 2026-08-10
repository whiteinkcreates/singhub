import type { KaraokeEventListing } from "@/types";

type EventScheduleProps = {
  events: KaraokeEventListing[];
  variant?: "compact" | "full";
};

function getUsableHostName(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed || /^(tbd|unknown|-|n\/a)$/i.test(trimmed)) return null;
  return trimmed;
}

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
  if (!events.length) return null;

  if (variant === "compact") {
    const visibleEvents = events.slice(0, 3);
    const hiddenCount = events.length - visibleEvents.length;

    return (
      <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
          Karaoke schedule
        </p>

        <ul className="mt-2 space-y-1 text-sm font-semibold text-cyan-50">
          {visibleEvents.map((event) => {
            const hostName = getUsableHostName(event.hostName);

            return (
              <li key={event.eventId}>
                {formatEvent(event)}
                {hostName ? ` • KJ: ${hostName}` : ""}
              </li>
            );
          })}
        </ul>

        {hiddenCount > 0 && (
          <p className="mt-2 text-xs text-cyan-100">
            +{hiddenCount} more night{hiddenCount === 1 ? "" : "s"} on the
            venue profile.
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="mt-8 rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
      <h2 className="text-xl font-black text-white">Karaoke schedule</h2>
      <p className="mt-2 text-sm leading-6 text-cyan-100">
        Recurring nights, times, and KJs currently listed on SingHUB.
      </p>

      <div className="mt-5 grid gap-3">
        {events.map((event) => {
          const hostName = getUsableHostName(event.hostName);

          return (
            <article
              key={event.eventId}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <h3 className="text-base font-black text-white">
                {formatEvent(event)}
              </h3>

              {hostName && (
                <p className="mt-1 text-sm font-semibold text-fuchsia-200">
                  KJ / Host: {hostName}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
