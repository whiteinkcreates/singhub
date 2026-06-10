"use client";

import { useMemo, useState } from "react";
import type { ScoutCandidate } from "@/types";

const ALL = "all";

function labelize(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function scoreClasses(score: number | null) {
  if (score === null) {
    return "border-slate-700 bg-slate-900/70 text-slate-300";
  }

  if (score >= 75) {
    return "border-cyan-400/50 bg-cyan-400/10 text-cyan-200";
  }

  if (score >= 50) {
    return "border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-200";
  }

  return "border-purple-400/50 bg-purple-400/10 text-purple-200";
}

function statusClasses(status: string) {
  if (status === "confirmed" || status === "basic_listing_approved") {
    return "border-cyan-400/50 bg-cyan-400/10 text-cyan-200";
  }

  if (status === "premium_prospect") {
    return "border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-200";
  }

  if (status === "false_positive" || status === "stale") {
    return "border-slate-600 bg-slate-800/80 text-slate-300";
  }

  return "border-purple-400/50 bg-purple-400/10 text-purple-200";
}

type ScoutReviewQueueProps = {
  candidates: ScoutCandidate[];
};

export function ScoutReviewQueue({ candidates }: ScoutReviewQueueProps) {
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [confidenceFilter, setConfidenceFilter] = useState(ALL);
  const [sourceFilter, setSourceFilter] = useState(ALL);
  const [premiumOnly, setPremiumOnly] = useState(false);

  const statusOptions = useMemo(
    () => Array.from(new Set(candidates.map((candidate) => candidate.reviewStatus))).sort(),
    [candidates],
  );

  const confidenceOptions = useMemo(
    () => Array.from(new Set(candidates.map((candidate) => candidate.confidenceLevel))).sort(),
    [candidates],
  );

  const sourceOptions = useMemo(
    () =>
      Array.from(
        new Set(candidates.map((candidate) => candidate.sourceType).filter(Boolean)),
      ).sort() as string[],
    [candidates],
  );

  const filteredCandidates = candidates.filter((candidate) => {
    if (statusFilter !== ALL && candidate.reviewStatus !== statusFilter) {
      return false;
    }

    if (confidenceFilter !== ALL && candidate.confidenceLevel !== confidenceFilter) {
      return false;
    }

    if (sourceFilter !== ALL && candidate.sourceType !== sourceFilter) {
      return false;
    }

    if (premiumOnly && !candidate.premiumProspect) {
      return false;
    }

    return true;
  });

  return (
    <section className="mt-10 space-y-6">
      <div className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-cyan-950/20 md:grid-cols-4">
        <label className="space-y-2 text-sm text-slate-300">
          <span className="font-bold text-white">Review status</span>
          <select
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-cyan-300"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value={ALL}>All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {labelize(status)}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          <span className="font-bold text-white">Confidence</span>
          <select
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-cyan-300"
            value={confidenceFilter}
            onChange={(event) => setConfidenceFilter(event.target.value)}
          >
            <option value={ALL}>All confidence</option>
            {confidenceOptions.map((level) => (
              <option key={level} value={level}>
                {labelize(level)}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          <span className="font-bold text-white">Source type</span>
          <select
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-cyan-300"
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
          >
            <option value={ALL}>All sources</option>
            {sourceOptions.map((source) => (
              <option key={source} value={source}>
                {labelize(source)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-end gap-3 rounded-2xl border border-white/10 bg-slate-900 px-3 py-3 text-sm font-bold text-white">
          <input
            type="checkbox"
            checked={premiumOnly}
            onChange={(event) => setPremiumOnly(event.target.checked)}
            className="h-5 w-5 accent-fuchsia-400"
          />
          Premium prospects only
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
        <p>
          Showing <span className="font-black text-white">{filteredCandidates.length}</span> of{" "}
          <span className="font-black text-white">{candidates.length}</span> messy karaoke leads.
        </p>
        <p className="text-cyan-200">Review here first. Public Venue Index later.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredCandidates.map((candidate) => (
          <article
            key={candidate.candidateId}
            className="rounded-3xl border border-white/10 bg-slate-950/75 p-5 shadow-xl shadow-slate-950/30"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
                  {candidate.candidateId}
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">{candidate.venueName}</h2>
                <p className="mt-1 text-sm text-slate-300">
                  {[candidate.possibleNeighborhood, candidate.possibleCity]
                    .filter(Boolean)
                    .join(" • ") || "Location needs review"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-black ${statusClasses(
                    candidate.reviewStatus,
                  )}`}
                >
                  {labelize(candidate.reviewStatus)}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-black ${scoreClasses(
                    candidate.confidenceScore,
                  )}`}
                >
                  {candidate.confidenceScore ?? "?"} score
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <p>
                <span className="font-bold text-white">Claimed night:</span>{" "}
                {candidate.claimedKaraokeDay || "Needs review"}
              </p>
              <p>
                <span className="font-bold text-white">Claimed time:</span>{" "}
                {candidate.claimedKaraokeTime || "Needs review"}
              </p>
              <p>
                <span className="font-bold text-white">Host/KJ:</span>{" "}
                {candidate.hostKjName || "Not found yet"}
              </p>
              <p>
                <span className="font-bold text-white">Source:</span>{" "}
                {candidate.sourceType ? labelize(candidate.sourceType) : "Unknown"}
              </p>
              <p>
                <span className="font-bold text-white">Confidence:</span>{" "}
                {labelize(candidate.confidenceLevel)}
              </p>
              <p>
                <span className="font-bold text-white">Premium:</span>{" "}
                {candidate.premiumProspect ? "Yes" : "No"}
              </p>
            </div>

            {candidate.evidenceSnippet && (
              <blockquote className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50">
                “{candidate.evidenceSnippet}”
              </blockquote>
            )}

            <div className="mt-5 space-y-2 text-sm text-slate-300">
              {candidate.scoutNotes && (
                <p>
                  <span className="font-bold text-white">Notes:</span> {candidate.scoutNotes}
                </p>
              )}
              {candidate.instagramHandle && (
                <p>
                  <span className="font-bold text-white">Instagram:</span>{" "}
                  {candidate.instagramHandle}
                </p>
              )}
              {candidate.sourceUrl && (
                <a
                  className="inline-flex font-bold text-cyan-300 hover:text-cyan-100"
                  href={candidate.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open source evidence →
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
