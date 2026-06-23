import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { quickUpdateScoutLead, updateScoutLead } from "./actions";

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
  venue_category: string | null;
  google_maps_url: string | null;
  google_search_url: string | null;
  hours_summary: string | null;
  food_summary: string | null;
  drink_summary: string | null;
  vibe_summary: string | null;
  parking_summary: string | null;
  age_policy: string | null;
  reservation_info: string | null;
  cover_charge: string | null;
  contact_name: string | null;
  contact_role: string | null;
  contact_notes: string | null;
  call_priority_reason: string | null;
  enrichment_status: string | null;
  last_enriched_at: string | null;
  ad_event_fit: string | null;
  kj_traffic_angle: string | null;
  public_listing_notes: string | null;
  duplicate_of: string | null;
  updated_by: string | null;
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string }>;
};

const scoutStatuses = [
  "new_lead",
  "needs_call",
  "needs_dm",
  "confirmed_active",
  "confirmed_inactive",
  "duplicate",
  "ready_to_publish",
];

const verificationStatuses = ["needs_review", "uncalled", "called", "dm_sent", "verified", "rejected"];
const priorities = ["A", "B", "C", "D"];
const enrichmentStatuses = ["needs_enrichment", "in_progress", "enriched", "needs_cleanup", "ready_for_call"];

function labelize(value: string | null) {
  if (!value) return "Unsorted";

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function Field({
  label,
  name,
  value,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  value: string | number | null;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={value ?? ""}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  value,
  placeholder,
  rows = 4,
}: {
  label: string;
  name: string;
  value: string | null;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <textarea
        name={name}
        defaultValue={value ?? ""}
        placeholder={placeholder}
        rows={rows}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-cyan-300/60"
      />
    </label>
  );
}

function SelectField({ label, name, value, options }: { label: string; name: string; value: string | null; options: string[] }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <select
        name={name}
        defaultValue={value ?? options[0]}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60"
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

function LinkButton({ href, label }: { href: string | null; label: string }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-full border border-cyan-300/50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/10"
    >
      {label}
    </a>
  );
}

export default async function ScoutLeadDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const supabase = await createClient();

  const { data, error } = await supabase.from("scout_leads").select("*").eq("id", id).single();

  if (error || !data) {
    notFound();
  }

  const lead = data as ScoutLead;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-white">
      <Link href="/admin/scout/leads" className="text-sm font-bold text-cyan-200 hover:text-white">
        ← Back to Lead Queue
      </Link>

      {query.saved ? (
        <div className="mt-5 rounded-2xl border border-emerald-300/40 bg-emerald-300/10 p-4 text-sm font-bold text-emerald-100">
          Scout lead saved.
        </div>
      ) : null}

      <section className="mt-6 rounded-3xl border border-cyan-300/20 bg-slate-950/80 p-6 shadow-xl shadow-cyan-950/30 md:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Scout Venue Intelligence</p>
        <h1 className="mt-3 text-4xl font-black md:text-5xl">{lead.lead_name}</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          {lead.call_priority_reason ?? lead.karaoke_evidence ?? "Add the reason this venue matters to SingHUB."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
          <span className="rounded-full border border-fuchsia-300/40 bg-fuchsia-300/10 px-4 py-2 text-fuchsia-100">
            Priority {lead.priority ?? "C"}
          </span>
          <span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 text-cyan-100">
            {labelize(lead.scout_status)}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200">
            {labelize(lead.enrichment_status)}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200">
            Score {lead.likelihood_score ?? 0}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton href={lead.website} label="Website" />
          <LinkButton href={lead.instagram} label="Instagram" />
          <LinkButton href={lead.google_maps_url} label="Google Maps" />
          <LinkButton href={lead.google_search_url} label="Google Search" />
          <LinkButton href={lead.source_url} label="Source" />
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
        <h2 className="text-xl font-black">Quick status move</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {scoutStatuses.map((status) => (
            <form key={status} action={quickUpdateScoutLead}>
              <input type="hidden" name="id" value={lead.id} />
              <input type="hidden" name="scout_status" value={status} />
              <button className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-200 transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:text-white">
                {labelize(status)}
              </button>
            </form>
          ))}
        </div>
      </section>

      <form action={updateScoutLead} className="mt-6 space-y-6">
        <input type="hidden" name="id" value={lead.id} />

        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <h2 className="text-xl font-black">Core venue info</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Venue name" name="lead_name" value={lead.lead_name} />
            <Field label="Canonical guess" name="canonical_guess" value={lead.canonical_guess} />
            <Field label="Venue type" name="lead_type" value={lead.lead_type} />
            <Field label="Venue category" name="venue_category" value={lead.venue_category} placeholder="Dive bar, karaoke room, restaurant, arcade, hotel bar..." />
            <Field label="City" name="city" value={lead.city} />
            <Field label="Neighborhood" name="neighborhood" value={lead.neighborhood} />
            <Field label="Address" name="address" value={lead.address} />
            <Field label="Phone" name="phone" value={lead.phone} />
            <Field label="Website" name="website" value={lead.website} />
            <Field label="Instagram" name="instagram" value={lead.instagram} />
            <Field label="Google Maps URL" name="google_maps_url" value={lead.google_maps_url} />
            <Field label="Google Search URL" name="google_search_url" value={lead.google_search_url} />
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <h2 className="text-xl font-black">Karaoke lead signal</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Reported schedule" name="reported_day_time" value={lead.reported_day_time} />
            <Field label="Reported host / KJ" name="reported_host_kj" value={lead.reported_host_kj} />
          </div>
          <div className="mt-4">
            <TextArea label="Karaoke evidence / clue" name="karaoke_evidence" value={lead.karaoke_evidence} />
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <h2 className="text-xl font-black">Venue intelligence</h2>
          <p className="mt-2 text-sm text-slate-400">
            This is the non-karaoke data that makes the venue useful for sales calls, ads, events, and public listing quality.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TextArea label="Hours summary" name="hours_summary" value={lead.hours_summary} rows={3} />
            <TextArea label="Food summary" name="food_summary" value={lead.food_summary} rows={3} />
            <TextArea label="Drink summary" name="drink_summary" value={lead.drink_summary} rows={3} />
            <TextArea label="Vibe summary" name="vibe_summary" value={lead.vibe_summary} rows={3} />
            <TextArea label="Parking summary" name="parking_summary" value={lead.parking_summary} rows={3} />
            <TextArea label="Reservation info" name="reservation_info" value={lead.reservation_info} rows={3} />
            <Field label="Age policy" name="age_policy" value={lead.age_policy} />
            <Field label="Cover charge" name="cover_charge" value={lead.cover_charge} />
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <h2 className="text-xl font-black">Revenue and outreach angle</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TextArea label="Sales angle" name="sales_angle" value={lead.sales_angle} />
            <TextArea label="Call priority reason" name="call_priority_reason" value={lead.call_priority_reason} />
            <TextArea label="Local ad / event fit" name="ad_event_fit" value={lead.ad_event_fit} />
            <TextArea label="KJ traffic angle" name="kj_traffic_angle" value={lead.kj_traffic_angle} />
            <Field label="Contact name" name="contact_name" value={lead.contact_name} />
            <Field label="Contact role" name="contact_role" value={lead.contact_role} />
            <TextArea label="Contact notes" name="contact_notes" value={lead.contact_notes} />
            <TextArea label="Public listing notes" name="public_listing_notes" value={lead.public_listing_notes} />
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <h2 className="text-xl font-black">Scout workflow</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <SelectField label="Priority" name="priority" value={lead.priority} options={priorities} />
            <SelectField label="Scout status" name="scout_status" value={lead.scout_status} options={scoutStatuses} />
            <SelectField label="Verification status" name="verification_status" value={lead.verification_status} options={verificationStatuses} />
            <SelectField label="Enrichment status" name="enrichment_status" value={lead.enrichment_status} options={enrichmentStatuses} />
            <Field label="Likelihood score" name="likelihood_score" value={lead.likelihood_score} type="number" />
            <Field label="Duplicate of" name="duplicate_of" value={lead.duplicate_of} />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Source name" name="source_name" value={lead.source_name} />
            <Field label="Source URL" name="source_url" value={lead.source_url} />
            <Field label="Source date" name="source_date" value={lead.source_date} />
            <Field label="Last enriched" name="last_enriched_at_display" value={lead.last_enriched_at} />
          </div>
          <div className="mt-4">
            <TextArea label="Internal Scout notes" name="notes" value={lead.notes} rows={5} />
          </div>
        </section>

        <div className="sticky bottom-4 z-10 rounded-3xl border border-fuchsia-300/30 bg-slate-950/95 p-4 shadow-2xl shadow-fuchsia-950/40 backdrop-blur">
          <button className="w-full rounded-full bg-fuchsia-400 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition hover:-translate-y-0.5 hover:bg-fuchsia-300 md:w-auto">
            Save Scout Lead
          </button>
        </div>
      </form>
    </main>
  );
}
