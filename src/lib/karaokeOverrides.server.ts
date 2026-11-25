import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { KaraokeEventOverride } from "@/types";

export const KARAOKE_OVERRIDES_CACHE_TAG = "singhub-karaoke-overrides";
export const DISCOVERY_OVERRIDES_CACHE_TAG = "singhub-discovery-events";

type OverrideRow = {
  event_id: string; venue_slug: string; nightlife_date: string;
  status: KaraokeEventOverride["status"]; start_time: string | null; end_time: string | null;
  host_id: string | null; host_name: string | null; note: string | null;
};
export function publicOverride(row: OverrideRow): KaraokeEventOverride {
  return {
    eventId: row.event_id, venueSlug: row.venue_slug, nightlifeDate: row.nightlife_date,
    status: row.status,
    startTime: row.start_time || undefined, endTime: row.end_time || undefined,
    hostId: row.host_id || undefined, hostName: row.host_name || undefined,
    note: row.note || undefined,
  };
}

// Server-side only. The service key and unpublished notes never reach the browser as credentials.
// The bounded date range prevents old corrections being projected indefinitely.
export const getPublishedKaraokeOverrides = unstable_cache(async (): Promise<KaraokeEventOverride[]> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  const now = new Date();
  const start = new Date(now.getTime() - 14 * 86400000).toISOString().slice(0, 10);
  const end = new Date(now.getTime() + 400 * 86400000).toISOString().slice(0, 10);
  try {
    const { data, error } = await createAdminClient().from("karaoke_event_overrides")
      .select("event_id,venue_slug,nightlife_date,status,start_time,end_time,host_id,host_name,note")
      .gte("nightlife_date", start).lte("nightlife_date", end).order("nightlife_date", { ascending: true }).limit(1000);
    if (error) throw error;
    return (data || []).map(row => publicOverride(row as OverrideRow));
  } catch (error) {
    console.error("SingHUB dated karaoke overrides unavailable", error);
    // A database outage must not mutate the immutable canonical recurring rows.
    return [];
  }
}, ["singhub-karaoke-date-overrides-v1"], { tags: [KARAOKE_OVERRIDES_CACHE_TAG], revalidate: 300 });
