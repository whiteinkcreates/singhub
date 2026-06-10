import { ScoutReviewQueue } from "@/components/scout/ScoutReviewQueue";
import { getScoutCandidates } from "@/lib/scoutData";

export const metadata = {
  title: "AI Scout Review Queue | SingHUB",
  description: "Internal SingHUB review queue for messy karaoke venue and event leads.",
};

function countBy<T extends string>(items: T[]) {
  return items.reduce<Record<string, number>>((counts, item) => {
    counts[item] = (counts[item] ?? 0) + 1;
    return counts;
  }, {});
}

function labelize(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ScoutPage() {
  const candidates = getScoutCandidates();
  const statusCounts = countBy(candidates.map((candidate) => candidate.reviewStatus));
  const confidenceCounts = countBy(candidates.map((candidate) => candidate.confidenceLevel));
  const premiumProspects = candidates.filter((candidate) => candidate.premiumProspect).length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <section className="max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-fuchsia-300">
          Internal Tool
        </p>
        <h1 className="mt-3 text-4xl font-black text-white md:text-6xl">
          AI Scout Review Queue
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          AI Scout is an internal review queue for messy karaoke leads. Candidates
          here are not public listings until reviewed and approved.
        </p>
        <p className="mt-4 text-base leading-7 text-slate-400">
          Use this workspace to chip away at regional karaoke data before anything
          touches the public Venue Index. False positives, stale mentions, IG flyer
          clues, KJ names, and premium prospects all belong here first.
        </p>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-200">
            Total leads
          </p>
          <p className="mt-3 text-4xl font-black text-white">{candidates.length}</p>
        </div>
        <div className="rounded-3xl border border-fuchsia-300/20 bg-fuchsia-300/10 p-5">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-fuchsia-200">
            Premium prospects
          </p>
          <p className="mt-3 text-4xl font-black text-white">{premiumProspects}</p>
        </div>
        <div className="rounded-3xl border border-purple-300/20 bg-purple-300/10 p-5">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-purple-200">
            Public exposure
          </p>
          <p className="mt-3 text-2xl font-black text-white">Hidden</p>
          <p className="mt-2 text-sm text-slate-300">Internal route only. Not linked in public nav.</p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <h2 className="text-xl font-black text-white">Review status</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <span
                key={status}
                className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-sm font-bold text-slate-200"
              >
                {labelize(status)}: {count}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <h2 className="text-xl font-black text-white">Confidence level</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(confidenceCounts).map(([level, count]) => (
              <span
                key={level}
                className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-sm font-bold text-slate-200"
              >
                {labelize(level)}: {count}
              </span>
            ))}
          </div>
        </div>
      </section>

      <ScoutReviewQueue candidates={candidates} />
    </main>
  );
}
