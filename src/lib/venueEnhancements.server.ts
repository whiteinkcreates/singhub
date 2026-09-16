import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  getVenueEnhancement,
  getVenueEnhancementRecord,
  type VenueEnhancement,
} from "@/lib/venueEnhancements";

type EnhancementRow = {
  slug: string;
  profile: VenueEnhancement;
};

async function getSavedEnhancementRow(slug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("venue_enhancements")
    .select("slug,profile")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data as EnhancementRow | null;
}

export async function getPersistedVenueEnhancement(slug: string) {
  const fallback = getVenueEnhancement(slug);

  try {
    const row = await getSavedEnhancementRow(slug);
    if (row) return row.profile?.enabled ? row.profile : undefined;
    return fallback;
  } catch (error) {
    console.error("Venue enhancement read failed", error);
    return fallback;
  }
}

export async function getAdminVenueEnhancement(slug: string) {
  try {
    const row = await getSavedEnhancementRow(slug);
    if (row?.profile) return row.profile;
    return getVenueEnhancementRecord(slug);
  } catch (error) {
    console.error("Venue enhancement admin read failed", error);
    return getVenueEnhancementRecord(slug);
  }
}

export async function saveVenueEnhancement(slug: string, profile: VenueEnhancement) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("venue_enhancements").upsert({
    slug,
    profile,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
  return profile;
}
