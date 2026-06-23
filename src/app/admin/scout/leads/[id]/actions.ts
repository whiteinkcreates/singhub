"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length ? trimmed : null;
}

function intValue(formData: FormData, key: string) {
  const raw = value(formData, key);
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function updateScoutLead(formData: FormData) {
  const id = value(formData, "id");

  if (!id) {
    throw new Error("Missing Scout lead ID.");
  }

  const supabase = await createClient();

  const payload = {
    lead_name: value(formData, "lead_name"),
    canonical_guess: value(formData, "canonical_guess"),
    lead_type: value(formData, "lead_type"),
    city: value(formData, "city"),
    neighborhood: value(formData, "neighborhood"),
    address: value(formData, "address"),
    phone: value(formData, "phone"),
    website: value(formData, "website"),
    instagram: value(formData, "instagram"),
    venue_category: value(formData, "venue_category"),
    google_maps_url: value(formData, "google_maps_url"),
    google_search_url: value(formData, "google_search_url"),
    reported_day_time: value(formData, "reported_day_time"),
    reported_host_kj: value(formData, "reported_host_kj"),
    karaoke_evidence: value(formData, "karaoke_evidence"),
    hours_summary: value(formData, "hours_summary"),
    food_summary: value(formData, "food_summary"),
    drink_summary: value(formData, "drink_summary"),
    vibe_summary: value(formData, "vibe_summary"),
    parking_summary: value(formData, "parking_summary"),
    age_policy: value(formData, "age_policy"),
    reservation_info: value(formData, "reservation_info"),
    cover_charge: value(formData, "cover_charge"),
    contact_name: value(formData, "contact_name"),
    contact_role: value(formData, "contact_role"),
    contact_notes: value(formData, "contact_notes"),
    source_name: value(formData, "source_name"),
    source_url: value(formData, "source_url"),
    source_date: value(formData, "source_date"),
    likelihood_score: intValue(formData, "likelihood_score"),
    priority: value(formData, "priority"),
    scout_status: value(formData, "scout_status"),
    verification_status: value(formData, "verification_status"),
    enrichment_status: value(formData, "enrichment_status"),
    sales_angle: value(formData, "sales_angle"),
    call_priority_reason: value(formData, "call_priority_reason"),
    ad_event_fit: value(formData, "ad_event_fit"),
    kj_traffic_angle: value(formData, "kj_traffic_angle"),
    public_listing_notes: value(formData, "public_listing_notes"),
    duplicate_of: value(formData, "duplicate_of"),
    notes: value(formData, "notes"),
    last_enriched_at: new Date().toISOString(),
    updated_by: "SingHUB Scout Admin",
  };

  const { error } = await supabase.from("scout_leads").update(payload).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/scout");
  revalidatePath("/admin/scout/leads");
  revalidatePath(`/admin/scout/leads/${id}`);

  redirect(`/admin/scout/leads/${id}?saved=1`);
}

export async function quickUpdateScoutLead(formData: FormData) {
  const id = value(formData, "id");
  const scoutStatus = value(formData, "scout_status");

  if (!id || !scoutStatus) {
    throw new Error("Missing quick update fields.");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("scout_leads")
    .update({
      scout_status: scoutStatus,
      last_enriched_at: new Date().toISOString(),
      updated_by: "SingHUB Scout Admin",
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/scout");
  revalidatePath("/admin/scout/leads");
  revalidatePath(`/admin/scout/leads/${id}`);

  redirect(`/admin/scout/leads/${id}?saved=1`);
}
