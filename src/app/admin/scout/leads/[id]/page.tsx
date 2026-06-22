import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ScoutLead = {
  id: string;
  lead_name: string;
  canonical_guess: string | null;
  lead_type: string | null;
  city: string | null;
  neighborhood: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  karaoke_evidence: string | null;
  reported_day_time: string | null;
  reported_host_kj: string | null;
  source_name: string | null;
  source_url: string | null;
  source_date: string | null;
  likelihood_score: number | null;
  priority: string | null;
  scout_status: string | null;
  verification_status: string | null;
  sales_angle: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

function labelize(value: string | null) {
  if (!value) return "Unsorted";

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function DetailRow({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-200">{value ?? "Not captured yet"}</p>
    </div>
  );
}

export default async function ScoutLeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("scout_leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const lead = data as ScoutLead;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-white">
      <Link href="/admin/scout/leads" className="text-sm font-bold text-cyan-200 hover:text-white">
        ← Back to Lead Queue
      </Link>

      <section className="mt-6 rounded-3xl border border-cyan-300/20 bg-slate-950/80 p-6 shadow-xl shadow-cyan-950/30 md:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
          Scout Lead
        </p>
        <h1 className="mt-3 text-4xl font-black md:text-5xl">{lead.lead_name}</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          {lead.karaoke_evidence ?? "No evidence note captured yet."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
          <span className="rounded-full border border-fuchsia-300/40 bg-fuchsia-300/10 px-4 py-2 text-fuchsia-100">
            Priority {lead.priority ?? "C"}
          </span>
          <span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 text-cyan-100">
            {labelize(lead.scout_status)}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200">
            Score {lead.likelihood_score ?? 0}
          </span>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <DetailRow label="Neighborhood" value={lead.neighborhood ?? lead.city} />
        <DetailRow label="Address" value={lead.address} />
        <DetailRow label="Reported schedule" value={lead.reported_day_time} />
        <DetailRow label="Reported host / KJ" value={lead.reported_host_kj} />
        <DetailRow label="Phone" value={lead.phone} />
        <DetailRow label="Website" value={lead.website} />
        <DetailRow label="Instagram" value={lead.instagram} />
        <DetailRow label="Source" value={lead.source_name} />
        <DetailRow label="Source date" value={lead.source_date} />
        <DetailRow label="Verification status" value={labelize(lead.verification_status)} />
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <h2 className="text-xl font-black">Sales angle</h2>
          <p className="mt-3 leading-7 text-slate-300">
            {lead.sales_angle ?? "No sales angle captured yet."}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <h2 className="text-xl font-black">Scout notes</h2>
          <p className="mt-3 leading-7 text-slate-300">{lead.notes ?? "No notes yet."}</p>
        </div>
      </section>
    </main>
  );
}
