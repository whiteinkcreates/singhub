import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  getVenueEnhancement,
  type VenueEnhancement,
} from "@/lib/venueEnhancements";

type EnhancementRow = {
  slug: string;
  profile: VenueEnhancement;
};

export async function getPersistedVenueEnhancement(slug: string) {
  const fallback = getVenueEnhancement(slug);

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("venue_enhancements")
      .select("slug,profile")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    const row = data as EnhancementRow | null;
    return row?.profile?.enabled ? row.profile : fallback;
  } catch (error) {
    console.error("Venue enhancement read failed", error);
    return fallback;
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
