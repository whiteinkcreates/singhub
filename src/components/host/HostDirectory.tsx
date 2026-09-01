"use client";

import { useMemo, useState } from "react";
import { HostDirectoryCard } from "@/components/host/HostCard";
import type { HostProfile } from "@/types";

function matchesSearch(host: HostProfile, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const scheduleValues = Object.values(host.schedule).flatMap((gigs) =>
    gigs.flatMap((gig) => [gig.venueName, gig.neighborhood]),
  );

  return [
    host.hostName,
    host.publicDisplayName,
    host.instagramHandle,
    host.bio,
    ...host.primaryAreas,
    ...host.vibeTags,
    ...scheduleValues,
  ].some((value) => value?.toLowerCase().includes(normalizedQuery));
}

export function HostDirectory({ hosts }: { hosts: HostProfile[] }) {
  const [query, setQuery] = useState("");
  const visibleHosts = useMemo(
    () => hosts.filter((host) => matchesSearch(host, query)),
    [hosts, query],
  );

  return (
    <div className="mt-10 space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 md:p-7">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
              Search KJs
            </p>
            <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
              Find the host running your kind of room
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Search by KJ, venue, neighborhood, or karaoke-night style.
            </p>
          </div>

          <label className="block">
            <span className="sr-only">Search karaoke hosts</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Leo, North Park, live band…"
              className="w-full rounded-2xl border border-cyan-300/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20"
            />
          </label>
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-400">
          Showing {visibleHosts.length} host{visibleHosts.length === 1 ? "" : "s"}.
        </p>
      </section>

      {visibleHosts.length > 0 ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleHosts.map((host) => (
            <HostDirectoryCard key={host.slug} host={host} />
          ))}
        </section>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-slate-300">
          No KJs match that search yet.
        </div>
      )}
    </div>
  );
}
