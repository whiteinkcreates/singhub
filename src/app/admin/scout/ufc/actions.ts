"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAuthorization } from "@/lib/adminAuthorization";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVenueListings } from "@/lib/venueData";
import { getSanDiegoPublicVenues } from "@/lib/sanDiegoMarket";

const CANDIDATE_STATUSES = new Set(["pending", "approved", "hold", "rejected"]);
const SCREENING_STATUSES = new Set(["pending", "approved", "rejected"]);

function read(form: FormData, name: string, max = 2000) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function checkUrl(value: string, officialUfcOnly = false) {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("A valid evidence URL is required."); }
  if (url.protocol !== "https:") throw new Error("Use an HTTPS evidence URL.");
  if (officialUfcOnly && !["ufc.com", "www.ufc.com", "paramountplus.com", "www.paramountplus.com"].includes(url.hostname.toLowerCase())) {
    throw new Error("Fight schedule requires an official UFC or Paramount URL.");
  }
  return url.href;
}
function checkDate(value: string) {
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(value) || Number.isNaN(new Date(value + "T12:00:00Z").getTime())) {
    throw new Error("Use a valid YYYY-MM-DD date.");
  }
  return value;
}
async function requireCanonicalSlug(slug: string | null) {
  if (!slug) throw new Error("Noncanonical UFC leads cannot be published to The Backyard.");
  const venues = getSanDiegoPublicVenues(await getVenueListings());
  if (!venues.some((venue) => venue.slug === slug)) throw new Error("The canonical venue is no longer public in San Diego.");
}
function done() {
  revalidatePath("/backyard");
  revalidatePath("/admin/scout/ufc");
  redirect("/admin/scout/ufc?saved=1");
}

export async function reviewUfcCandidate(form: FormData) {
  await requireAdminAuthorization();
  const key = read(form, "candidate_key", 80);
  const status = read(form, "review_status", 20);
  const publicEnabled = read(form, "public_enabled") === "on";
  if (!key || !CANDIDATE_STATUSES.has(status)) throw new Error("Invalid UFC candidate review.");
  const client = createAdminClient();
  const { data, error } = await client.from("backyard_ufc_candidates")
    .select("canonical_slug").eq("candidate_key", key).single();
  if (error || !data) throw new Error("Unknown UFC candidate.");
  if (publicEnabled) {
    if (status !== "approved") throw new Error("Publish only approved candidates.");
    await requireCanonicalSlug(data.canonical_slug);
  }
  const { error: saveError } = await client.from("backyard_ufc_candidates")
    .update({ review_status: status, public_enabled: publicEnabled, approved_at: status === "approved" ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
    .eq("candidate_key", key);
  if (saveError) throw new Error(saveError.message);
  // Disabling a venue also unpublishes any dated screenings linked to it.
  if (!publicEnabled) {
    const { error: screenError } = await client.from("backyard_ufc_screenings")
      .update({ public_enabled: false, updated_at: new Date().toISOString() }).eq("candidate_key", key);
    if (screenError) throw new Error(screenError.message);
  }
  done();
}

export async function saveUfcEvent(form: FormData) {
  await requireAdminAuthorization();
  const eventKey = read(form, "event_key", 120);
  const eventName = read(form, "event_name", 180);
  const date = checkDate(read(form, "event_date", 10));
  const time = read(form, "main_card_pt", 5);
  const officialUrl = checkUrl(read(form, "official_url"), true);
  if (!/^ufc-[a-z0-9-]+$/.test(eventKey) || !eventName) throw new Error("A stable UFC event key and event name are required.");
  if (time && !/^([01]\\d|2[0-3]):[0-5]\\d$/.test(time)) throw new Error("Use HH:MM Pacific time.");
  const { error } = await createAdminClient().from("backyard_ufc_events").upsert({
    event_key: eventKey, event_name: eventName, event_date: date,
    main_card_pt: time || null, official_url: officialUrl,
    verified_on: new Date().toISOString().slice(0, 10), active: true, updated_at: new Date().toISOString(),
  }, { onConflict: "event_key" });
  if (error) throw new Error(error.message);
  done();
}

export async function submitUfcScreening(form: FormData) {
  await requireAdminAuthorization();
  const candidateKey = read(form, "candidate_key", 80);
  const eventKey = read(form, "event_key", 120);
  const source = checkUrl(read(form, "source_url"));
  const sourceDate = checkDate(read(form, "source_date", 10));
  const notes = read(form, "notes", 600);
  if (!candidateKey || !eventKey) throw new Error("Choose a venue and an official UFC event.");
  const client = createAdminClient();
  const { data: candidate, error: candidateError } = await client.from("backyard_ufc_candidates")
    .select("candidate_key").eq("candidate_key", candidateKey).single();
  const { data: event, error: eventError } = await client.from("backyard_ufc_events")
    .select("event_key,event_date").eq("event_key", eventKey).single();
  if (candidateError || !candidate || eventError || !event) throw new Error("Unrecognized UFC venue or card.");
  if (sourceDate > event.event_date) throw new Error("The source cannot be dated after the fight.");
  const { error } = await client.from("backyard_ufc_screenings").upsert({
    candidate_key: candidateKey, event_key: eventKey, source_url: source,
    source_date: sourceDate, notes: notes || null,
    review_status: "pending", public_enabled: false, updated_at: new Date().toISOString(),
  }, { onConflict: "candidate_key,event_key" });
  if (error) throw new Error(error.message);
  done();
}

export async function reviewUfcScreening(form: FormData) {
  await requireAdminAuthorization();
  const id = read(form, "screening_id", 64);
  const status = read(form, "review_status", 20);
  const publicEnabled = read(form, "public_enabled") === "on";
  if (!id || !SCREENING_STATUSES.has(status)) throw new Error("Invalid screening review.");
  const client = createAdminClient();
  const { data: screening, error } = await client.from("backyard_ufc_screenings")
    .select("candidate_key,event_key,source_url").eq("id", id).single();
  if (error || !screening) throw new Error("Unknown UFC screening.");
  if (publicEnabled) {
    if (status !== "approved") throw new Error("Screening needs an explicit approval.");
    if (!screening.source_url) throw new Error("Screening needs fight-specific evidence.");
    const { data: candidate, error: candidateError } = await client.from("backyard_ufc_candidates")
      .select("canonical_slug,review_status,public_enabled").eq("candidate_key", screening.candidate_key).single();
    if (candidateError || !candidate || candidate.review_status !== "approved" || !candidate.public_enabled) {
      throw new Error("This venue is not approved for public UFC coverage.");
    }
    await requireCanonicalSlug(candidate.canonical_slug);
  }
  const { error: saveError } = await client.from("backyard_ufc_screenings")
    .update({ review_status: status, public_enabled: publicEnabled, updated_at: new Date().toISOString() }).eq("id", id);
  if (saveError) throw new Error(saveError.message);
  done();
}
