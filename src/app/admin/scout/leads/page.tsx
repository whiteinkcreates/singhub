import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type ScoutLead = {
  id: string;
  lead_name: string;
  canonical_guess: string | null;
  lead_type: string | null;
  city: string | null;
  neighborhood: string | null;
  address: string | null;
  karaoke_evidence: string | null;
  reported_day_time: string | null;
  reported_host_kj: string | null;
  source_name: string | null;
  likelihood_score: number | null;
  priority: string | null;
  scout_status: string | null;
  verification_status: string | null;
  created_at: string | null;
};

function labelize(value: string | null) {
  if (!value) return "Unsorted";

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const metadata = {
  title: "Scout Lead Queue | SingHUB Admin",
  description: "Internal SingHUB Scout lead review queue.",
};

export default async function ScoutLeadsPage() {
  const supabase = await createClient();

  const { data: leads, error } = await supabase
    .from("scout_leads")
    .select(
      "id, lead_name, canonical_guess, lead_type, city, neighborhood, address, karaoke_evidence, reported_day_time, reported_host_kj, source_name, likelihood_score, priority, scout_status, verification_status, created_at"
    )
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(200);

  const scoutLeads = (leads ?? []) as ScoutLead[];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 text-white">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-fuchsia-300">
            Scout Queue
          </p>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">Karaoke Lead Queue</h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            Review likely karaoke venues, stale clues, host mentions, and hidden gems before they reach the public Venue Index.
          </p>
        </div>
        <Link href="/admin/scout" className="text-sm font-bold text-cyan-200 hover:text-white">
          ← Dashboard
        </Link>
      </div>

      {error ? (
        <div className="mt-8 rounded-2xl border border-red-400/60 bg-red-950/40 p-5">
          <p className="font-bold text-red-200">Lead queue error</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-red-100">{error.message}</pre>
        </div>
      ) : (
        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-4 py-4">Lead</th>
                  <th className="px-4 py-4">Location</th>
                  <th className="px-4 py-4">Evidence</th>
                  <th className="px-4 py-4">Schedule / KJ</th>
                  <th className="px-4 py-4">Source</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Score</th>
                </tr>
              </thead>
              <tbody>
                {scoutLeads.map((lead) => (
                  <tr key={lead.id} className="border-t border-white/5 align-top">
                    <td className="px-4 py-4">
                      <Link href={`/admin/scout/leads/${lead.id}`} className="font-black text-white hover:text-cyan-200">
                        {lead.lead_name}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">{lead.lead_type ?? "venue"}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      <p>{lead.neighborhood ?? lead.city ?? "Unknown"}</p>
                      <p className="mt-1 text-xs text-slate-500">{lead.address ?? "No address"}</p>
                    </td>
                    <td className="max-w-md px-4 py-4 text-slate-300">
                      {lead.karaoke_evidence ?? "No evidence note yet"}
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      <p>{lead.reported_day_time ?? "Unknown"}</p>
                      <p className="mt-1 text-xs text-slate-500">{lead.reported_host_kj ?? "No host/KJ"}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{lead.source_name ?? "Unknown"}</td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-cyan-100">{labelize(lead.scout_status)}</p>
                      <p className="mt-1 text-xs text-slate-500">{labelize(lead.verification_status)}</p>
                    </td>
                    <td className="px-4 py-4 font-black text-white">
                      {lead.priority ?? "C"} / {lead.likelihood_score ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
