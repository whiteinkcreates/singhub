import Link from "next/link";
import type { HostGig, HostProfile } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { HostAvatar } from "@/components/host/HostAvatar";

function getWeeklyNightCount(host: HostProfile) {
  return Object.values(host.schedule).filter((gigs) => gigs.length > 0).length;
}

export function TonightHostCard({ host, gig }: { host: HostProfile; gig: HostGig }) {
  return (
    <Link
      href={`/hosts/${host.slug}`}
      className="group flex min-h-[13rem] w-[17rem] shrink-0 flex-col justify-between rounded-2xl border border-white/10 bg-slate-950/78 p-4 shadow-xl shadow-fuchsia-950/20 transition hover:-translate-y-1 hover:border-cyan-300/60 hover:bg-slate-950 sm:w-[19rem]"
    >
      <div className="flex items-start justify-between gap-3">
        <HostAvatar host={host} />
        <span className="rounded-full border border-red-300/40 bg-red-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-red-100">
          Tonight
        </span>
      </div>

      <div>
        <h3 className="text-xl font-black leading-tight text-white group-hover:text-cyan-100">
          {host.publicDisplayName}
        </h3>
        <p className="mt-2 text-sm font-semibold text-fuchsia-100">{gig.venueName || "Venue TBA"}</p>
        <p className="mt-1 text-sm text-slate-300">
          {[gig.time, gig.neighborhood].filter(Boolean).join(" • ") || "Time TBA"}
        </p>
      </div>
    </Link>
  );
}

export function HostDirectoryCard({ host }: { host: HostProfile }) {
  const weeklyNightCount = getWeeklyNightCount(host);

  return (
    <Link
      href={`/hosts/${host.slug}`}
      className="group rounded-2xl border border-white/10 bg-slate-950/72 p-5 shadow-xl shadow-slate-950/30 transition hover:-translate-y-1 hover:border-fuchsia-300/55 hover:bg-slate-950"
    >
      <div className="flex items-start gap-4">
        <HostAvatar host={host} />
        <div className="min-w-0">
          <h2 className="text-2xl font-black leading-tight text-white group-hover:text-fuchsia-100">
            {host.publicDisplayName}
          </h2>
          <p className="mt-2 text-sm font-semibold text-cyan-100">
            {host.primaryAreas.join(" • ") || "San Diego"}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {host.vibeTags.slice(0, 4).map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
        {weeklyNightCount > 0 && (
          <Badge variant="premium">
            {weeklyNightCount} weekly {weeklyNightCount === 1 ? "night" : "nights"}
          </Badge>
        )}
        {host.profileCompletionLevel === "enhanced" && <Badge variant="verified">Enhanced</Badge>}
      </div>

      {host.bio && <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">{host.bio}</p>}
    </Link>
  );
}
