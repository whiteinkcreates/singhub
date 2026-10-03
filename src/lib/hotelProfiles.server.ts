import "server-only";
import { applyHotelPhoto } from "./hotelPhotoCandidates.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getHotelGuide } from "@/lib/hotelGuides";
import { parseHotelMediaProfile, type HotelMediaProfile } from "@/lib/hotelProfiles";
export async function getHotelMediaProfile(slug: string): Promise<HotelMediaProfile | null> {
  const { data, error } = await createAdminClient().from("hotel_profiles").select("media").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Hotel media could not be loaded: ${error.message}`);
  return data ? parseHotelMediaProfile(data.media) : null;
}
export async function getHotelGuideWithMedia(slug: string, demo = false) {
  const hotel = getHotelGuide(slug);
  if (!hotel) return null;
  try {
    const media = await getHotelMediaProfile(slug);
    return applyHotelPhoto(media ? { ...hotel, heroImageUrl: media.heroImageUrl, heroAlt: media.heroAlt, heroPosition: media.heroPosition, heroPlacement: media.heroPlacement } : hotel, demo);
  } catch (error) {
    console.error("Hotel media read failed; using registered guide", error);
    return applyHotelPhoto(hotel, demo);
  }
}
export async function saveHotelMediaProfile(slug: string, media: HotelMediaProfile) {
  const { error } = await createAdminClient().from("hotel_profiles").upsert({ slug, media, updated_at: new Date().toISOString() });
  if (error) throw new Error(`Hotel media was not saved: ${error.message}`);
}
