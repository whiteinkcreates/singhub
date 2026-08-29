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

function getUsableEventNotes(value: string | undefined) {
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

function getScheduleCopy(events: KaraokeEventListing[]) {
  const recurringCount = events.filter((event) => event.recurring).length;
  const dateSpecificCount = events.length - recurringCount;

  if (dateSpecificCount > 0 && recurringCount === 0) {
    return {
      title: events.length === 1 ? "Upcoming karaoke event" : "Upcoming karaoke events",
      description:
        "Date-specific karaoke events currently verified on SingHUB. These are not treated as recurring unless the schedule is separately confirmed.",
    };
  }

  if (dateSpecificCount > 0) {
    return {
      title: "Karaoke schedule + special events",
      description:
        "Recurring karaoke nights plus date-specific events currently verified on SingHUB.",
    };
  }

  return {
    title: "Karaoke schedule",
    description: "Recurring nights, times, and KJs currently listed on SingHUB.",
  };
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
            const eventNotes = getUsableEventNotes(event.eventNotes);
            const eventLabel =
              !event.recurring && eventNotes ? eventNotes : formatEvent(event);

            return (
              <li key={event.eventId}>
                {eventLabel}
                {event.recurring && hostName ? ` • KJ: ${hostName}` : ""}
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

  const scheduleCopy = getScheduleCopy(events);

  return (
    <section className="mt-8 rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
      <h2 className="text-xl font-black text-white">{scheduleCopy.title}</h2>
      <p className="mt-2 text-sm leading-6 text-cyan-100">
        {scheduleCopy.description}
      </p>

      <div className="mt-5 grid gap-3">
        {events.map((event) => {
          const hostName = getUsableHostName(event.hostName);
          const eventNotes = getUsableEventNotes(event.eventNotes);

          return (
            <article
              key={event.eventId}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              {!event.recurring && (
                <p className="mb-2 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em] text-fuchsia-100">
                  Date-specific event
                </p>
              )}

              <h3 className="text-base font-black text-white">
                {formatEvent(event)}
              </h3>

              {!event.recurring && eventNotes && (
                <p className="mt-2 text-sm leading-6 text-cyan-50">{eventNotes}</p>
              )}

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
