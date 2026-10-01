import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

type ScoutMarket = {
  id: string;
  slug: string;
  name: string;
  state_code: string;
  scope_label: string | null;
  stage: string;
  research_status: string;
  priority: string;
  objective: string | null;
  updated_at: string;
};

type ScoutLead = {
  id: string;
  market_id: string | null;
  lead_name: string;
  neighborhood: string | null;
  city: string | null;
  karaoke_evidence: string | null;
  reported_day_time: string | null;
  priority: string | null;
  scout_status: string | null;
  verification_status: string | null;
  likelihood_score: number | null;
  created_at: string | null;
};

type ScoutRun = {
  id: string;
  market_id: string;
  status: string;
  run_type: string;
  objective: string;
  created_at: string;
};

function labelize(value: string | null) {
  if (!value) return "Unsorted";
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function marketStats(leads: ScoutLead[], marketId: string) {
  const marketLeads = leads.filter((lead) => lead.market_id === marketId);
  return {
    total: marketLeads.length,
    verified: marketLeads.filter((lead) => lead.verification_status === "verified").length,
    review: marketLeads.filter((lead) =>
      ["needs_review", "uncalled", "called", "dm_sent"].includes(lead.verification_status ?? ""),
    ).length,
    ready: marketLeads.filter((lead) => lead.scout_status === "ready_to_publish").length,
  };
}

export const metadata = {
  title: "SCOUT Command Center | SingHUB Admin",
  description: "Internal SingHUB SCOUT market and venue intelligence dashboard.",
};

export default async function AdminScoutPage() {
  const supabase = createAdminClient();

  const [marketsResult, leadsResult, runsResult] = await Promise.all([
    supabase
      .from("scout_markets")
      .select("id, slug, name, state_code, scope_label, stage, research_status, priority, objective, updated_at")
      .order("priority", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("scout_leads")
      .select(
        "id, market_id, lead_name, neighborhood, city, karaoke_evidence, reported_day_time, priority, scout_status, verification_status, likelihood_score, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("scout_runs")
      .select("id, market_id, status, run_type, objective, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const markets = (marketsResult.data ?? []) as ScoutMarket[];
  const leads = (leadsResult.data ?? []) as ScoutLead[];
  const runs = (runsResult.data ?? []) as ScoutRun[];
  const error = marketsResult.error ?? leadsResult.error ?? runsResult.error;
  const marketNames = new Map(markets.map((market) => [market.id, market.name]));

  const verified = leads.filter((lead) => lead.verification_status === "verified").length;
  const ready = leads.filter((lead) => lead.scout_status === "ready_to_publish").length;
  const needsReview = leads.filter((lead) =>
    ["needs_review", "uncalled", "called", "dm_sent"].includes(lead.verification_status ?? ""),
  ).length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 text-white">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
            SingHUB Intelligence
          </p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">SCOUT Command Center</h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            Market-first karaoke intelligence. Discover signals, preserve evidence, verify the graph,
            and decide where SingHUB earns the right to launch next.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/scout/leads"
            className="rounded-full border border-fuchsia-300/50 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-fuchsia-100 transition hover:-translate-y-0.5 hover:bg-fuchsia-300/10"
          >
            Lead Queue
          </Link>
          <Link
            href="/scout/import"
            className="rounded-full border border-cyan-300/50 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/10"
          >
            Candidate Import
          </Link>
        </div>
      </section>

      {error ? (
        <div className="mt-8 rounded-2xl border border-red-400/60 bg-red-950/40 p-5">
          <p className="font-bold text-red-200">SCOUT data error</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-red-100">{error.message}</pre>
        </div>
      ) : (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Markets", markets.length],
              ["Venue leads", leads.length],
              ["Needs verification", needsReview],
              ["Verified / ready", `${verified} / ${ready}`],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
                <p className="mt-3 text-4xl font-black">{value}</p>
              </div>
            ))}
          </section>

          <section className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300">Markets</p>
                <h2 className="mt-2 text-3xl font-black">Where SCOUT is working</h2>
              </div>
              <p className="hidden max-w-xl text-right text-sm text-slate-400 md:block">
                A market can span multiple municipalities. The city field stays literal; the market is the
                SingHUB operating geography.
              </p>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {markets.map((market) => {
                const stats = marketStats(leads, market.id);
                const lastRun = runs.find((run) => run.market_id === market.id);

                return (
                  <Link
                    key={market.id}
                    href={`/admin/scout/markets/${market.slug}`}
                    className="group rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-cyan-300/[0.05]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                          Priority {market.priority} · {labelize(market.stage)}
                        </p>
                        <h3 className="mt-2 text-3xl font-black group-hover:text-cyan-100">
                          {market.name}, {market.state_code}
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">{market.scope_label}</p>
                      </div>
                      <span className="rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-fuchsia-100">
                        {labelize(market.research_status)}
                      </span>
                    </div>

                    <p className="mt-5 text-sm leading-6 text-slate-300">
                      {market.objective ?? "No market objective set yet."}
                    </p>

                    <div className="mt-6 grid grid-cols-4 gap-2">
                      {[
                        ["Leads", stats.total],
                        ["Verified", stats.verified],
                        ["Review", stats.review],
                        ["Ready", stats.ready],
                      ].map(([label, value]) => (
                        <div key={String(label)} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                            {label}
                          </p>
                          <p className="mt-1 text-xl font-black text-white">{value}</p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-5 text-xs text-slate-500">
                      {lastRun
                        ? `Last run: ${labelize(lastRun.run_type)} · ${labelize(lastRun.status)}`
                        : "No recorded SCOUT run yet."}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mt-10 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-black">Recent venue intelligence</h2>
                <p className="mt-1 text-sm text-slate-400">Newest leads across every SCOUT market.</p>
              </div>
              <Link href="/admin/scout/leads" className="text-sm font-bold text-cyan-200 hover:text-white">
                View full queue →
              </Link>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  <tr className="border-b border-white/10">
                    <th className="py-3 pr-4">Lead</th>
                    <th className="py-3 pr-4">Market</th>
                    <th className="py-3 pr-4">Location</th>
                    <th className="py-3 pr-4">Schedule</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.slice(0, 20).map((lead) => (
                    <tr key={lead.id} className="border-b border-white/5 align-top text-slate-200">
                      <td className="py-4 pr-4 font-bold text-white">
                        <Link href={`/admin/scout/leads/${lead.id}`} className="hover:text-cyan-200">
                          {lead.lead_name}
                        </Link>
                      </td>
                      <td className="py-4 pr-4">{lead.market_id ? marketNames.get(lead.market_id) ?? "Unknown" : "Unassigned"}</td>
                      <td className="py-4 pr-4">{lead.neighborhood ?? lead.city ?? "Unknown"}</td>
                      <td className="py-4 pr-4">{lead.reported_day_time ?? "Unknown"}</td>
                      <td className="py-4 pr-4">{labelize(lead.scout_status)}</td>
                      <td className="py-4 pr-4 font-black">{lead.likelihood_score ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
