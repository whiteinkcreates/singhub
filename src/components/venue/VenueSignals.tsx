import type { ReactNode } from "react";
import type { VenueListing } from "@/types";
import {
  getVenueSignalData,
  isRadarVenue,
  isVerifiedKaraokeVenue,
} from "@/lib/venueSignals";

type SignalTone = "radar" | "visited" | "verified" | "salute" | "madhatter";

type SignalBadgeProps = {
  icon: string;
  children: ReactNode;
  tone: SignalTone;
  title?: string;
};

const toneClasses: Record<SignalTone, string> = {
  radar:
    "border-violet-300/55 bg-violet-300/10 text-violet-100 shadow-[0_0_18px_rgba(167,139,250,0.16)]",
  visited:
    "border-fuchsia-300/55 bg-fuchsia-300/10 text-fuchsia-100 shadow-[0_0_18px_rgba(217,70,239,0.16)]",
  verified:
    "border-cyan-300/55 bg-cyan-300/10 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.16)]",
  salute:
    "border-amber-300/60 bg-amber-300/10 text-amber-100 shadow-[0_0_20px_rgba(252,211,77,0.2)]",
  madhatter:
    "border-red-300/55 bg-red-300/10 text-red-100 shadow-[0_0_18px_rgba(248,113,113,0.16)]",
};

export function SignalBadge({ icon, children, tone, title }: SignalBadgeProps) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] ${toneClasses[tone]}`}
    >
      <span
        aria-hidden="true"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-current/35 bg-slate-950/70 text-sm leading-none"
      >
        {icon}
      </span>
      <span>{children}</span>
    </span>
  );
}

export function MadHatterBadge({ compact = false }: { compact?: boolean }) {
  return (
    <SignalBadge icon="🎩" tone="madhatter" title="MadHatter, SingHUB founder and scene scout">
      {compact ? "MadHatter" : "Scouted by MadHatter"}
    </SignalBadge>
  );
}

export function VenueSignalBadges({ venue }: { venue: VenueListing }) {
  const signalData = getVenueSignalData(venue);

  return (
    <div className="flex flex-wrap gap-2">
      {isRadarVenue(venue) && (
        <SignalBadge
          icon="📡"
          tone="radar"
          title="A karaoke-related place saved for discovery or additional verification"
        >
          On the Radar
        </SignalBadge>
      )}

      {signalData.visit && (
        <SignalBadge
          icon="📍"
          tone="visited"
          title={`A SingHUB scout visited in ${signalData.visit.visitedAt}`}
        >
          SingHUB Has Been Here
        </SignalBadge>
      )}

      {isVerifiedKaraokeVenue(venue) && (
        <SignalBadge
          icon="✅"
          tone="verified"
          title="Current karaoke evidence has been verified"
        >
          Verified Karaoke
        </SignalBadge>
      )}

      {signalData.salute && (
        <SignalBadge
          icon="🫡"
          tone="salute"
          title="A SingHUB achievement awarded for a standout karaoke experience"
        >
          SingHUB Salute
        </SignalBadge>
      )}
    </div>
  );
}

export function VenueSignalDetails({ venue }: { venue: VenueListing }) {
  const signalData = getVenueSignalData(venue);

  if (!signalData.visit && !signalData.salute && !signalData.singersSay) {
    return null;
  }

  return (
    <div className="mt-8 grid gap-4">
      {signalData.visit && (
        <section className="rounded-2xl border border-fuchsia-300/25 bg-fuchsia-300/[0.07] p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black text-white">SingHUB Has Been Here</h2>
            <MadHatterBadge compact />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            Visited {signalData.visit.visitedAt}. {signalData.visit.note}
          </p>
        </section>
      )}

      {signalData.salute && (
        <section className="rounded-2xl border border-amber-300/30 bg-amber-300/[0.08] p-5">
          <div className="flex flex-wrap items-center gap-2">
            <SignalBadge icon="🫡" tone="salute">
              SingHUB Salute
            </SignalBadge>
            <h2 className="text-lg font-black text-white">{signalData.salute.label}</h2>
          </div>
          {signalData.salute.eventLabel && (
            <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em] text-amber-200">
              {signalData.salute.eventLabel}
            </p>
          )}
          {signalData.salute.note && (
            <p className="mt-3 text-sm leading-6 text-slate-200">{signalData.salute.note}</p>
          )}
        </section>
      )}

      {signalData.singersSay && (
        <section className="rounded-2xl border border-cyan-300/25 bg-cyan-300/[0.06] p-5">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
            Singers Say
          </p>
          <p className="mt-3 text-base leading-7 text-slate-100">{signalData.singersSay}</p>
        </section>
      )}
    </div>
  );
}
