import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
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
  if (!value || value === "TBD") return null;
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

function schedule(row) {
  const parts = [row.karaoke_day, row.start_time, row.end_time].map(clean).filter(Boolean);
  return parts.length ? parts.join(" | ") : "Unknown";
}

function salesAngle(score) {
  if (score >= 80) return "High-priority Scout lead. Verify the current karaoke schedule, then prepare for public listing or claim outreach.";
  if (score < 40) return "Low-confidence Scout lead. Confirm venue identity and karaoke schedule before any public exposure.";
  return "Verify karaoke schedule, then invite venue to claim or update its SingHUB listing.";
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
    karaoke_evidence: clean(row.description) ?? clean(row.confidence_notes),
    reported_day_time: schedule(row),
    reported_host_kj: clean(row.host_name),
    source_name: seedSource,
    source_url: "public/data/venues.tsv",
    source_date: clean(row.last_verified),
    likelihood_score: score,
    priority: priority(score),
    scout_status: scoutStatus(row, score),
    verification_status: row.listing_status === "verified" ? "verified" : "needs_review",
    sales_angle: salesAngle(score),
    notes: clean(row.confidence_notes),
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
