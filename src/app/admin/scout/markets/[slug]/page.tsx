import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateScoutMarket } from "./actions";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ saved?: string }>;
};

type Market = {
  id: string;
  slug: string;
  name: string;
  anchor_city: string;
  state_code: string;
  country_code: string;
  scope_label: string | null;
  timezone: string | null;
  stage: string;
  research_status: string;
  priority: string;
  objective: string | null;
  launch_notes: string | null;
  source_of_truth_notes: string | null;
  updated_at: string;
};

type Lead = {
  id: string;
  lead_name: string;
  city: string | null;
  neighborhood: string | null;
  reported_day_time: string | null;
  reported_host_kj: string | null;
  likelihood_score: number | null;
  priority: string | null;
  scout_status: string | null;
  verification_status: string | null;
  source_name: string | null;
  created_at: string | null;
};

type Metric = {
  id: string;
  metric_key: string;
  metric_value: number | null;
  metric_text: string | null;
  unit: string | null;
  period_label: string | null;
  source_name: string | null;
  source_url: string | null;
  source_date: string | null;
  notes: string | null;
};

type ScoutRun = {
  id: string;
  run_type: string;
  status: string;
  agent_label: string | null;
  objective: string;
  started_at: string | null;
  completed_at: string | null;
  summary: string | null;
  sources_checked: number;
  leads_created: number;
  leads_updated: number;
  conflicts_found: number;
  created_at: string;
};

const stages = ["operating", "scouting", "watchlist", "launch_ready", "paused"];
const researchStatuses = ["not_started", "ready_to_scout", "researching", "needs_review", "operational", "complete", "paused"];
const priorities = ["A", "B", "C", "D"];

function labelize(value: string | null) {
  if (!value) return "Unsorted";
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function SelectField({
  label,
  name,
  value,
  options,
}: {
  label: string;
  name: string;
  value: string;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <select
        name={name}
        defaultValue={value}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labelize(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  name,
  value,
  rows = 4,
}: {
  label: string;
  name: string;
  value: string | null;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <textarea
        name={name}
        defaultValue={value ?? ""}
        rows={rows}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-300/60"
      />
    </label>
  );
}

function metricValue(metric: Metric) {
  if (metric.metric_text) return metric.metric_text;
  if (metric.metric_value === null) return "—";
  return [metric.metric_value.toLocaleString(), metric.unit].filter(Boolean).join(" ");
}

export default async function ScoutMarketPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};
  const supabase = createAdminClient();

  const { data: marketData, error: marketError } = await supabase
    .from("scout_markets")
    .select("*")
    .eq("slug", slug)
    .single();

  if (marketError || !marketData) notFound();
  const market = marketData as Market;

  const [leadsResult, metricsResult, runsResult] = await Promise.all([
    supabase
      .from("scout_leads")
      .select(
        "id, lead_name, city, neighborhood, reported_day_time, reported_host_kj, likelihood_score, priority, scout_status, verification_status, source_name, created_at",
      )
      .eq("market_id", market.id)
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(300),
    supabase
      .from("scout_market_metrics")
      .select("*")
      .eq("market_id", market.id)
      .order("source_date", { ascending: false, nullsFirst: false })
      .limit(100),
    supabase
      .from("scout_runs")
      .select("*")
      .eq("market_id", market.id)
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  const leads = (leadsResult.data ?? []) as Lead[];
  const metrics = (metricsResult.data ?? []) as Metric[];
  const runs = (runsResult.data ?? []) as ScoutRun[];
  const error = leadsResult.error ?? metricsResult.error ?? runsResult.error;

  const verified = leads.filter((lead) => lead.verification_status === "verified").length;
  const ready = leads.filter((lead) => lead.scout_status === "ready_to_publish").length;
  const needsReview = leads.filter((lead) => lead.verification_status !== "verified" && lead.verification_status !== "rejected").length;
  const averageScore = leads.length
    ? Math.round(leads.reduce((sum, lead) => sum + (lead.likelihood_score ?? 0), 0) / leads.length)
    : 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 text-white">
      <Link href="/admin/scout" className="text-sm font-bold text-cyan-200 hover:text-white">
        ← SCOUT Command Center
      </Link>

      {query.saved ? (
        <div className="mt-5 rounded-2xl border border-emerald-300/40 bg-emerald-300/10 p-4 text-sm font-bold text-emerald-100">
          Market settings saved.
        </div>
      ) : null}

      <section className="mt-6 rounded-[2rem] border border-cyan-300/20 bg-slate-950/80 p-6 md:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
              SCOUT Market · Priority {market.priority}
            </p>
            <h1 className="mt-3 text-4xl font-black md:text-6xl">
              {market.name}, {market.state_code}
            </h1>
            <p className="mt-2 text-slate-400">{market.scope_label}</p>
            <p className="mt-5 max-w-4xl text-base leading-7 text-slate-300">
              {market.objective ?? "No market objective set yet."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-fuchsia-100">
              {labelize(market.stage)}
            </span>
            <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-100">
              {labelize(market.research_status)}
            </span>
          </div>
        </div>
      </section>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-400/60 bg-red-950/40 p-5 text-red-100">
          {error.message}
        </div>
      ) : (
        <>
          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Leads", leads.length],
              ["Verified", verified],
              ["Needs review", needsReview],
              ["Ready", ready],
              ["Avg score", averageScore],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-black">{value}</p>
              </div>
            ))}
          </section>

          {market.slug === "phoenix" && leads.length === 0 ? (
            <section className="mt-6 rounded-3xl border border-fuchsia-300/30 bg-fuchsia-300/[0.07] p-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">First test mission</p>
              <h2 className="mt-2 text-2xl font-black">Phoenix is clean and ready to SCOUT.</h2>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
                The first Work run should build the candidate graph, identify KJ networks, map metro clusters,
                store sourced market metrics, and finish with unresolved conflicts clearly separated from verified facts.
                The operating contract is in <code className="text-cyan-200">docs/SCOUT_OPERATING_SYSTEM.md</code>.
              </p>
            </section>
          ) : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.75fr)]">
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Venue graph</p>
                  <h2 className="mt-2 text-2xl font-black">Current leads</h2>
                </div>
                <Link
                  href={`/admin/scout/leads?market=${market.slug}`}
                  className="text-sm font-bold text-cyan-200 hover:text-white"
                >
                  Open filtered queue →
                </Link>
              </div>

              {leads.length ? (
                <div className="mt-5 space-y-3">
                  {leads.slice(0, 20).map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/admin/scout/leads/${lead.id}`}
                      className="block rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition hover:border-cyan-300/40"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-white">{lead.lead_name}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {[lead.neighborhood, lead.city].filter(Boolean).join(" · ") || "Location needs review"}
                          </p>
                          <p className="mt-2 text-sm text-slate-300">
                            {lead.reported_day_time ?? "Schedule not yet captured"}
                            {lead.reported_host_kj ? ` · ${lead.reported_host_kj}` : ""}
                          </p>
                        </div>
                        <div className="text-right text-xs">
                          <p className="font-black text-cyan-200">{lead.priority ?? "C"} / {lead.likelihood_score ?? 0}</p>
                          <p className="mt-1 text-slate-500">{labelize(lead.verification_status)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-white/15 p-6 text-sm text-slate-400">
                  No venue leads yet. This is the correct starting state for a clean market test.
                </div>
              )}
            </div>

            <div className="space-y-6">
              <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">Hard data</p>
                <h2 className="mt-2 text-2xl font-black">Market metrics</h2>
                {metrics.length ? (
                  <div className="mt-4 space-y-3">
                    {metrics.map((metric) => (
                      <div key={metric.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                          {labelize(metric.metric_key)}
                        </p>
                        <p className="mt-1 text-xl font-black">{metricValue(metric)}</p>
                        <p className="mt-1 text-xs text-slate-500">{metric.period_label ?? metric.source_date ?? "No period"}</p>
                        {metric.source_url ? (
                          <a
                            href={metric.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-block text-xs font-bold text-cyan-200 hover:text-white"
                          >
                            {metric.source_name ?? "Source"} →
                          </a>
                        ) : (
                          <p className="mt-2 text-xs font-bold text-amber-200">Source URL missing</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    No market metrics stored yet. SCOUT should add only sourced facts, not vibes dressed up as numbers.
                  </p>
                )}
              </section>

              <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Research memory</p>
                <h2 className="mt-2 text-2xl font-black">SCOUT runs</h2>
                {runs.length ? (
                  <div className="mt-4 space-y-3">
                    {runs.slice(0, 8).map((run) => (
                      <div key={run.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-black">{labelize(run.run_type)}</p>
                          <p className="text-xs font-bold text-cyan-200">{labelize(run.status)}</p>
                        </div>
                        <p className="mt-2 text-sm text-slate-300">{run.objective}</p>
                        {run.summary ? <p className="mt-2 text-xs leading-5 text-slate-500">{run.summary}</p> : null}
                        <p className="mt-3 text-[11px] text-slate-600">
                          {run.sources_checked} sources · +{run.leads_created} leads · {run.leads_updated} updated · {run.conflicts_found} conflicts
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-400">No Work/research run has been recorded for this market yet.</p>
                )}
              </section>
            </div>
          </section>
        </>
      )}

      <form action={updateScoutMarket} className="mt-6 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
        <input type="hidden" name="slug" value={market.slug} />
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Market control</p>
            <h2 className="mt-2 text-2xl font-black">Operating settings</h2>
          </div>
          <p className="text-xs text-slate-500">
            Updated {new Date(market.updated_at).toLocaleDateString("en-US")}
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <SelectField label="Stage" name="stage" value={market.stage} options={stages} />
          <SelectField label="Research status" name="research_status" value={market.research_status} options={researchStatuses} />
          <SelectField label="Priority" name="priority" value={market.priority} options={priorities} />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <TextArea label="Objective" name="objective" value={market.objective} />
          <TextArea label="Launch notes" name="launch_notes" value={market.launch_notes} />
          <TextArea label="Source-of-truth notes" name="source_of_truth_notes" value={market.source_of_truth_notes} />
        </div>
        <button className="mt-5 rounded-full bg-fuchsia-400 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950 hover:bg-fuchsia-300">
          Save market
        </button>
      </form>
    </main>
  );
}
