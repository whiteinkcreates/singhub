import Link from "next/link";
import type { HostGig, HostProfile } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { HostAvatar } from "@/components/host/HostAvatar";
import {
  HOST_WEEKDAYS,
  getTodayInLosAngeles,
  isHostConfirmed,
} from "@/lib/hostData";

function getWeeklyNightCount(host: HostProfile) {
  return Object.values(host.schedule).filter((gigs) => gigs.length > 0).length;
}

function getHostEnergy(host: HostProfile) {
  const tags = host.vibeTags.join(" ").toLowerCase();
  const bio = (host.bio || "").toLowerCase();
  const text = `${tags} ${bio}`;

  if (text.includes("deep") || text.includes("songbook")) return "Deep-cut dealer";
  if (text.includes("party") || text.includes("dance")) return "Party starter";
  if (text.includes("first") || text.includes("friendly")) return "First-timer friendly";
  if (text.includes("contest") || text.includes("show")) return "Show runner";
  if (text.includes("dive") || text.includes("regular")) return "Neighborhood favorite";

  return "Karaoke host";
}

function getNextGigLine(host: HostProfile) {
  const today = getTodayInLosAngeles();
  const todayIndex = HOST_WEEKDAYS.indexOf(today);

  for (let offset = 0; offset < HOST_WEEKDAYS.length; offset += 1) {
    const day = HOST_WEEKDAYS[(todayIndex + offset) % HOST_WEEKDAYS.length];
    const gig = host.schedule[day]?.[0];

    if (gig) {
      const dayLabel = offset === 0 ? "Tonight" : offset === 1 ? "Tomorrow" : day;
      return [dayLabel, gig.venueName, gig.time].filter(Boolean).join(" / ");
    }
  }

  return "Schedule details coming soon";
}

export function TonightHostCard({ host, gig }: { host: HostProfile; gig: HostGig }) {
  return (
    <Link
      href={`/hosts/${host.slug}`}
      className="group relative flex min-h-[14rem] w-[18rem] shrink-0 overflow-hidden rounded-3xl border border-fuchsia-300/25 bg-slate-950 p-4 shadow-2xl shadow-fuchsia-950/30 transition hover:-translate-y-1 hover:border-cyan-300/70 sm:w-[20rem]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.28),transparent_38%)] opacity-90 transition group-hover:opacity-100" />

      <div className="relative z-10 flex w-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <HostAvatar host={host} />
          <span className="rounded-full border border-red-300/50 bg-red-400/15 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-red-100">
            Tonight
          </span>
        </div>

        <div>
          <h3 className="text-2xl font-black leading-tight text-white group-hover:text-cyan-100">
            {host.publicDisplayName}
          </h3>
          <p className="mt-2 text-sm font-black text-fuchsia-100">
            {gig.venueName || "Venue TBA"}
          </p>
          <p className="mt-1 text-sm text-slate-200">
            {[gig.time, gig.neighborhood].filter(Boolean).join(" / ") ||
              "Schedule details coming soon"}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function HostDirectoryCard({ host }: { host: HostProfile }) {
  const weeklyNightCount = getWeeklyNightCount(host);
  const hostEnergy = getHostEnergy(host);
  const nextGigLine = getNextGigLine(host);
  const confirmed = isHostConfirmed(host);

  return (
    <Link
      href={`/hosts/${host.slug}`}
      className="group relative isolate block overflow-hidden rounded-3xl border border-fuchsia-300/20 bg-slate-950 p-5 shadow-2xl shadow-slate-950/40 transition hover:-translate-y-1 hover:border-cyan-300/70 hover:shadow-fuchsia-950/40"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.22),transparent_42%)] opacity-80 transition group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-full bg-gradient-to-br from-fuchsia-400/25 to-cyan-300/20 p-1">
            <HostAvatar host={host} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-200">
              {hostEnergy}
            </p>
            <h2 className="mt-1 text-2xl font-black leading-tight text-white group-hover:text-cyan-100">
              {host.publicDisplayName}
            </h2>
            <p className="mt-2 text-sm font-semibold text-cyan-100">
              {host.primaryAreas.join(" / ") || "San Diego karaoke"}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-3">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-slate-400">
            Catch them next
          </p>
          <p className="mt-1 text-sm font-bold text-white">{nextGigLine}</p>
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

          {confirmed && <Badge variant="verified">Host Confirmed</Badge>}
          {host.featured && <Badge variant="premium">Featured KJ</Badge>}
        </div>

        {host.bio && (
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-200">
            {host.bio}
          </p>
        )}

        <span className="mt-5 inline-flex text-sm font-black text-fuchsia-100 transition group-hover:text-cyan-100">
          View KJ profile →
        </span>
      </div>
    </Link>
  );
}
