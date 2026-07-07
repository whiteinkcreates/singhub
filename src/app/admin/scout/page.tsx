import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

type ScoutLead = {
  id: string;
  lead_name: string;
  neighborhood: string | null;
  city: string | null;
  karaoke_evidence: string | null;
  reported_day_time: string | null;
  reported_host_kj: string | null;
  priority: string | null;
  scout_status: string | null;
  verification_status: string | null;
  likelihood_score: number | null;
  created_at: string | null;
};

const trackedStatuses = [
  "new_lead",
  "needs_call",
  "needs_dm",
  "confirmed_active",
  "ready_to_publish",
];

function labelize(value: string | null) {
  if (!value) return "Unsorted";

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function countStatus(leads: ScoutLead[], status: string) {
  return leads.filter((lead) => lead.scout_status === status).length;
}

export const metadata = {
  title: "Scout Dashboard | SingHUB Admin",
  description: "Internal SingHUB Scout dashboard for karaoke lead review.",
};

export default async function AdminScoutPage() {
  const supabase = createAdminClient();

  const { data: leads, error } = await supabase
    .from("scout_leads")
    .select(
      "id, lead_name, neighborhood, city, karaoke_evidence, reported_day_time, reported_host_kj, priority, scout_status, verification_status, likelihood_score, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(25);

  const scoutLeads = (leads ?? []) as ScoutLead[];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 text-white">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
            Internal SingHUB Scout
          </p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">Scout Dashboard</h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            Backstage command center for turning messy karaoke signals into verified
            venue and event entries.
          </p>
        </div>
        <Link
          href="/admin/scout/leads"
          className="rounded-full border border-fuchsia-300/50 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-fuchsia-100 transition hover:-translate-y-0.5 hover:bg-fuchsia-300/10"
        >
          Open Lead Queue
        </Link>
      </section>

      {error ? (
        <div className="mt-8 rounded-2xl border border-red-400/60 bg-red-950/40 p-5">
          <p className="font-bold text-red-200">Scout data error</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-red-100">{error.message}</pre>
        </div>
      ) : (
        <>
          <section className="mt-8 grid gap-4 md:grid-cols-5">
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">Total</p>
              <p className="mt-3 text-4xl font-black">{scoutLeads.length}</p>
            </div>
            {trackedStatuses.map((status) => (
              <div key={status} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                  {labelize(status)}
                </p>
                <p className="mt-3 text-4xl font-black">{countStatus(scoutLeads, status)}</p>
              </div>
            ))}
          </section>

          <section className="mt-8 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-black">Recent Scout Leads</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Latest 25 leads from the Supabase Scout queue.
                </p>
              </div>
              <Link href="/admin/scout/leads" className="text-sm font-bold text-cyan-200 hover:text-white">
                View all leads →
              </Link>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  <tr className="border-b border-white/10">
                    <th className="py-3 pr-4">Lead</th>
                    <th className="py-3 pr-4">Area</th>
                    <th className="py-3 pr-4">Evidence</th>
                    <th className="py-3 pr-4">Schedule</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {scoutLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-white/5 align-top text-slate-200">
                      <td className="py-4 pr-4 font-bold text-white">
                        <Link href={`/admin/scout/leads/${lead.id}`} className="hover:text-cyan-200">
                          {lead.lead_name}
                        </Link>
                      </td>
                      <td className="py-4 pr-4">{lead.neighborhood ?? lead.city ?? "Unknown"}</td>
                      <td className="max-w-md py-4 pr-4 text-slate-300">
                        {lead.karaoke_evidence ?? "No evidence note yet"}
                      </td>
                      <td className="py-4 pr-4">{lead.reported_day_time ?? "Unknown"}</td>
                      <td className="py-4 pr-4">{labelize(lead.scout_status)}</td>
                      <td className="py-4 pr-4 font-bold">{lead.priority ?? "C"}</td>
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
