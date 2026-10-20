import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type UfcCandidate = {
  candidate_key: string;
  venue_name: string;
  address: string;
  canonical_slug: string | null;
  evidence_tier: string;
  source_url: string;
  source_date: string;
  locator_snapshot: boolean;
  karaoke_evidence: string | null;
  research_notes: string | null;
  review_status: "pending" | "approved" | "hold" | "rejected";
  public_enabled: boolean;
};

export type UfcEvent = {
  event_key: string;
  event_name: string;
  event_date: string;
  main_card_pt: string | null;
  official_url: string;
  verified_on: string;
  active: boolean;
};

export type UfcScreening = {
  id: string;
  candidate_key: string;
  event_key: string;
  source_url: string;
  source_date: string;
  notes: string | null;
  review_status: "pending" | "approved" | "rejected";
  public_enabled: boolean;
};

export type UfcBackyardFeed = {
  venues: UfcCandidate[];
  events: UfcEvent[];
  screenings: UfcScreening[];
};

/** Server-side San Diego date prevents UTC midnight from hiding tonight's card. */
export function getPacificDate() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((p) => p.type === type)?.value || "";
  return [part("year"), part("month"), part("day")].join("-");
}

/** These tables have RLS enabled and are accessible only using the server-side service role.
 * The public feed never returns unapproved venues or event-specific claims.
 */
export async function getBackyardUfcFeed(): Promise<UfcBackyardFeed> {
  const client = createAdminClient();
  const [venueResult, eventResult] = await Promise.all([
    client.from("backyard_ufc_candidates")
      .select("candidate_key,venue_name,address,canonical_slug,evidence_tier,source_url,source_date,locator_snapshot,karaoke_evidence,research_notes,review_status,public_enabled")
      .eq("review_status", "approved").eq("public_enabled", true).not("canonical_slug", "is", null)
      .order("venue_name", { ascending: true }),
    client.from("backyard_ufc_events")
      .select("event_key,event_name,event_date,main_card_pt,official_url,verified_on,active")
      .eq("active", true).gte("event_date", getPacificDate())
      .order("event_date", { ascending: true }).limit(12),
  ]);
  if (venueResult.error) throw new Error("UFC venue feed: " + venueResult.error.message);
  if (eventResult.error) throw new Error("UFC event feed: " + eventResult.error.message);
  const venues = (venueResult.data || []) as UfcCandidate[];
  const events = (eventResult.data || []) as UfcEvent[];
  if (!events.length || !venues.length) return { venues, events, screenings: [] };
  const { data, error } = await client.from("backyard_ufc_screenings")
    .select("id,candidate_key,event_key,source_url,source_date,notes,review_status,public_enabled")
    .eq("review_status", "approved").eq("public_enabled", true)
    .in("event_key", events.map((event) => event.event_key));
  if (error) throw new Error("UFC screening feed: " + error.message);
  const allowed = new Set(venues.map((venue) => venue.candidate_key));
  const screenings = ((data || []) as UfcScreening[]).filter((screening) => allowed.has(screening.candidate_key));
  return { venues, events, screenings };
}

export function formatPacificUfcTime(time: string | null) {
  if (!time) return "Time TBA";
  const parts = time.split(":").map(Number);
  const hour = parts[0];
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return "Time TBA";
  const minute = Number.isInteger(parts[1]) ? parts[1] : 0;
  const twelve = hour % 12 || 12;
  return twelve + ":" + String(minute).padStart(2, "0") + (hour >= 12 ? " PM PT" : " AM PT");
}
