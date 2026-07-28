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
          {[gig.time, gig.neighborhood].filter(Boolean).join(" / ") || "Time TBA"}
        </p>
      </div>
      </div>
    </Link>
  );
}

export function HostDirectoryCard({ host }: { host: HostProfile }) {
  const weeklyNightCount = getWeeklyNightCount(host);

  return (
    <Link
      href={`/hosts/${host.slug}`}
      className="group relative overflow-hidden rounded-3xl border border-fuchsia-300/20 bg-slate-950 p-5 shadow-2xl shadow-slate-950/40 transition hover:-translate-y-1 hover:border-cyan-300/70 hover:shadow-fuchsia-950/40"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.22),transparent_42%)] opacity-80 transition group-hover:opacity-100" />
      <div className="absolute right-4 top-4 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] text-cyan-100">
        Host Card
      </div>
      <div className="relative z-10">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-fuchsia-400/25 to-cyan-300/20 p-1 shadow-lg shadow-fuchsia-950/30">
          <HostAvatar host={host} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-200">
            Host Energy
          </p>
          <h2 className="mt-1 text-2xl font-black leading-tight text-white group-hover:text-cyan-100">
            {host.publicDisplayName}
          </h2>
          <p className="mt-2 text-sm font-semibold text-cyan-100">
            {host.primaryAreas.join(" / ") || "San Diego"}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-3">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-slate-400">
          Where to catch them
        </p>
        <p className="mt-1 text-sm font-bold text-white">
          {host.primaryAreas.join(" / ") || "San Diego karaoke"} · {weeklyNightCount > 0 ? `${weeklyNightCount} weekly ${weeklyNightCount === 1 ? "night" : "nights"}` : "Schedule details coming soon"}
        </p>
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
        {host.profileCompletionLevel === "enhanced" && <Badge variant="verified">Verified Host</Badge>}
      </div>

      {host.bio && <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">{host.bio}</p>}

      <span className="mt-5 inline-flex text-sm font-black text-fuchsia-100 transition group-hover:text-cyan-100">
        View host spotlight →
      </span>
    </Link>
  );
}
