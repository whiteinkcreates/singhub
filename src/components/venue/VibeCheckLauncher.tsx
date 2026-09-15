"use client";

import { useEffect, useState } from "react";
import { VibeCheck } from "@/components/venue/VibeCheck";

type VibeCheckEvent = {
  eventId: string;
  karaokeDay: string;
  startTime: string;
  hostName?: string;
};

type VibeCheckLauncherProps = {
  venue: {
    id: string;
    slug: string;
    name: string;
  };
  events: VibeCheckEvent[];
};

export function VibeCheckLauncher({ venue, events }: VibeCheckLauncherProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  if (events.length === 0) return null;

  return (
    <>
      <section className="mt-7 rounded-2xl border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(8,47,73,.3),rgba(15,23,42,.96)_55%,rgba(88,28,135,.18))] p-4 shadow-[0_18px_45px_rgba(0,0,0,.22)] md:flex md:items-center md:justify-between md:gap-5 md:p-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">
            Singer feedback
          </p>
          <h2 className="mt-1 text-lg font-black text-white md:text-xl">
            Been here for karaoke?
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
            Help the next singer know what the night is actually like. Only review a karaoke night you attended.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-4 min-h-11 w-full shrink-0 rounded-xl border border-fuchsia-300/35 bg-fuchsia-500/15 px-6 text-sm font-black uppercase tracking-[0.12em] text-fuchsia-100 transition hover:-translate-y-0.5 hover:border-fuchsia-200 hover:bg-fuchsia-500/25 md:mt-0 md:w-auto"
        >
          Review
        </button>
      </section>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/90 px-3 py-5 backdrop-blur-sm md:px-6 md:py-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Review ${venue.name} karaoke night`}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setIsOpen(false);
          }}
        >
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-slate-950 p-4 shadow-2xl md:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">
                  Singer review
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Review the karaoke night you actually attended at {venue.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-xl font-bold text-slate-300 transition hover:border-white/30 hover:text-white"
                aria-label="Close review"
              >
                ×
              </button>
            </div>

            <VibeCheck venue={venue} events={events} />
          </div>
        </div>
      ) : null}
    </>
  );
}
