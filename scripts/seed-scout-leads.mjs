import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
const seedSource = "SingHUB public venue seed";

function parseTsv(text) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split("\t");
  return lines.filter(Boolean).map((line) => {
    const values = line.split("\t");
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function clean(value) {
  if (!value || value === "TBD" || value === "—") return null;
  return value;
}

function priority(score) {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  return "D";
}

function scoutStatus(row, score) {
  if (row.listing_status === "verified") return "confirmed_active";
  if (score >= 80) return "ready_to_publish";
  if (score >= 60) return "needs_call";
  if (row.address === "TBD" || row.karaoke_day === "TBD") return "new_lead";
  return "needs_call";
}

function enrichmentStatus(row, score) {
  if (score >= 80 && clean(row.address)) return "ready_for_call";
  if (clean(row.address)) return "needs_enrichment";
  return "needs_cleanup";
}

function schedule(row) {
  const parts = [row.karaoke_day, row.start_time, row.end_time].map(clean).filter(Boolean);
  return parts.length ? parts.join(" | ") : "Unknown";
}

function salesAngle(score) {
  if (score >= 80) return "High-priority Scout lead. Verify the current karaoke schedule, then prepare for public listing or claim outreach.";
  if (score < 40) return "Low-confidence Scout lead. Confirm venue identity and karaoke schedule before any public exposure.";
  return "Verify karaoke schedule, then invite venue to claim or update its SingHUB listing.";
}

function googleSearchUrl(row) {
  const query = [row.venue_name, clean(row.address) ?? row.city ?? "San Diego", "karaoke"]
    .filter(Boolean)
    .join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function googleMapsUrl(row) {
  const query = [row.venue_name, clean(row.address) ?? row.city ?? "San Diego"]
    .filter(Boolean)
    .join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function callPriorityReason(row, score) {
  if (row.profile_tier === "premium") return "Premium prospect already flagged. Strong candidate for claim/update outreach and KJ traffic pitch.";
  if (score >= 80) return "Strong venue intelligence and karaoke signal. Worth verifying soon.";
  if (!clean(row.address)) return "Needs exact venue identity and address before outreach.";
  if (!clean(row.karaoke_day)) return "Venue exists, but karaoke schedule is unclear. Good verification call target.";
  return "Venue has enough basic information to justify a verification call.";
}

function adEventFit(row) {
  const tags = `${row.vibe_tags ?? ""} ${row.description ?? ""}`.toLowerCase();
  if (tags.includes("private") || tags.includes("room") || tags.includes("ktv")) return "Private-room venue. Potential fit for group nights, birthday traffic, and reserved karaoke discovery.";
  if (tags.includes("gaslamp") || tags.includes("downtown")) return "Downtown nightlife venue. Potential fit for local ads, event promos, and high-intent karaoke traffic.";
  if (tags.includes("food") || tags.includes("restaurant")) return "Food-forward venue. Potential fit for dinner-plus-karaoke discovery and local event promos.";
  return "Potential local venue partner. Enrich with audience, specials, and event fit before outreach.";
}

function kjTrafficAngle(row) {
  if (clean(row.host_name)) return `Known host/KJ clue: ${row.host_name}. Pitch SingHUB as a way to bring more singers to their night.`;
  return "No host/KJ confirmed yet. Ask venue who runs karaoke and whether the KJ wants traffic from SingHUB.";
}

const venuePath = path.join(process.cwd(), "public", "data", "venues.tsv");
const tsv = await readFile(venuePath, "utf8");
const venues = parseTsv(tsv);

const leads = venues.map((row) => {
  const score = Number.parseInt(row.confidence_score || "0", 10) || 0;
  return {
    lead_name: row.venue_name,
    canonical_guess: row.venue_name,
    lead_type: row.profile_tier === "premium" ? "premium_venue" : "venue",
    city: clean(row.city) ?? "San Diego",
    neighborhood: clean(row.neighborhood),
    address: clean(row.address),
    website: clean(row.website),
    instagram: clean(row.instagram),
    phone: null,
    venue_category: clean(row.vibe_tags),
    google_maps_url: googleMapsUrl(row),
    google_search_url: googleSearchUrl(row),
    karaoke_evidence: clean(row.description) ?? clean(row.confidence_notes),
    reported_day_time: schedule(row),
    reported_host_kj: clean(row.host_name),
    hours_summary: schedule(row),
    food_summary: clean(row.food_highlights),
    drink_summary: clean(row.drink_highlights),
    vibe_summary: clean(row.description) ?? clean(row.vibe_tags),
    parking_summary: clean(row.parking_info),
    age_policy: clean(row.age_policy),
    reservation_info: clean(row.reservation_link),
    cover_charge: clean(row.cover_charge),
    source_name: seedSource,
    source_url: "public/data/venues.tsv",
    source_date: clean(row.last_verified),
    likelihood_score: score,
    priority: priority(score),
    scout_status: scoutStatus(row, score),
    verification_status: row.listing_status === "verified" ? "verified" : "needs_review",
    enrichment_status: enrichmentStatus(row, score),
    sales_angle: salesAngle(score),
    call_priority_reason: callPriorityReason(row, score),
    ad_event_fit: adEventFit(row),
    kj_traffic_angle: kjTrafficAngle(row),
    public_listing_notes: clean(row.confidence_notes),
    notes: clean(row.confidence_notes),
    last_enriched_at: new Date().toISOString(),
    updated_by: "seed:scout",
  };
});

console.log(`Refreshing Scout leads from ${seedSource}...`);

const { error: deleteError } = await supabase.from("scout_leads").delete().eq("source_name", seedSource);
if (deleteError) {
  console.error("Delete failed:", deleteError.message);
  process.exit(1);
}

const { error: insertError } = await supabase.from("scout_leads").insert(leads);
if (insertError) {
  console.error("Insert failed:", insertError.message);
  process.exit(1);
}

console.log(`Seeded ${leads.length} Scout leads.`);
