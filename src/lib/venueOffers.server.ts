import "server-only";

import { createHash, randomBytes, randomInt } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPersistedVenueEnhancement } from "@/lib/venueEnhancements.server";
import { nightlifeDate } from "@/lib/tourStops";

export type VenueOfferUnlock = {
  id: string;
  user_id: string;
  visit_id: string;
  venue_id: string;
  venue_slug: string;
  nightlife_date: string;
  offer_title: string;
  offer_detail: string | null;
  offer_terms: string | null;
  redemption_code: string;
  unlocked_at: string;
  redeemed_at: string | null;
};

export type PublicVenueOfferUnlock = {
  title: string;
  detail?: string;
  terms?: string;
  code: string;
  redeemedAt?: string;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function publicUnlock(row: VenueOfferUnlock): PublicVenueOfferUnlock {
  return {
    title: row.offer_title,
    detail: row.offer_detail || undefined,
    terms: row.offer_terms || undefined,
    code: row.redemption_code,
    redeemedAt: row.redeemed_at || undefined,
  };
}

export async function getActiveVenueOffer(slug: string, weekday: string) {
  const profile = await getPersistedVenueEnhancement(slug);
  const offer = profile?.singhubOffer;
  if (!profile?.enabled || !offer?.enabled || !offer.title?.trim()) return undefined;
  if (offer.days?.length && !offer.days.some((day) => day.toLowerCase() === weekday.toLowerCase())) return undefined;
  return {
    title: offer.title.trim(),
    detail: offer.detail?.trim() || undefined,
    terms: offer.terms?.trim() || undefined,
  };
}

export async function getVenueOfferUnlock(userId: string, venueId: string, nightlifeDate: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("venue_offer_unlocks")
    .select("*")
    .eq("user_id", userId)
    .eq("venue_id", venueId)
    .eq("nightlife_date", nightlifeDate)
    .maybeSingle();
  if (error) throw error;
  return data ? publicUnlock(data as VenueOfferUnlock) : undefined;
}

export async function unlockVenueOffer(input: {
  userId: string;
  visitId: string;
  venueId: string;
  venueSlug: string;
  nightlifeDate: string;
  weekday: string;
}) {
  const existing = await getVenueOfferUnlock(input.userId, input.venueId, input.nightlifeDate);
  if (existing) return existing;

  const offer = await getActiveVenueOffer(input.venueSlug, input.weekday);
  if (!offer) return undefined;

  const supabase = createAdminClient();
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const code = String(randomInt(100000, 1000000));
    const { data, error } = await supabase
      .from("venue_offer_unlocks")
      .insert({
        user_id: input.userId,
        visit_id: input.visitId,
        venue_id: input.venueId,
        venue_slug: input.venueSlug,
        nightlife_date: input.nightlifeDate,
        offer_title: offer.title,
        offer_detail: offer.detail,
        offer_terms: offer.terms,
        redemption_code: code,
      })
      .select("*")
      .single();

    if (!error && data) return publicUnlock(data as VenueOfferUnlock);
    if (error?.code === "23505") {
      const raced = await getVenueOfferUnlock(input.userId, input.venueId, input.nightlifeDate);
      if (raced) return raced;
      continue;
    }
    if (error) throw error;
  }
  throw new Error("Could not create a unique SingHUB Offer code.");
}

export async function rotateVenueRegisterKey(venueSlug: string) {
  const rawKey = randomBytes(24).toString("base64url");
  const supabase = createAdminClient();
  const { error } = await supabase.from("venue_offer_registers").upsert({
    venue_slug: venueSlug,
    token_hash: hashToken(rawKey),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return rawKey;
}

export async function redeemVenueOffer(input: { venueSlug: string; registerKey: string; code: string }) {
  const supabase = createAdminClient();
  const { data: register, error: registerError } = await supabase
    .from("venue_offer_registers")
    .select("token_hash")
    .eq("venue_slug", input.venueSlug)
    .maybeSingle();
  if (registerError) throw registerError;
  if (!register?.token_hash || register.token_hash !== hashToken(input.registerKey)) {
    return { ok: false as const, status: 401, error: "Register key is invalid." };
  }

  const { data: unlock, error: unlockError } = await supabase
    .from("venue_offer_unlocks")
    .select("*")
    .eq("venue_slug", input.venueSlug)
    .eq("nightlife_date", nightlifeDate())
    .eq("redemption_code", input.code.trim())
    .maybeSingle();
  if (unlockError) throw unlockError;
  if (!unlock) return { ok: false as const, status: 404, error: "Offer code was not found." };

  const row = unlock as VenueOfferUnlock;
  if (row.redeemed_at) return { ok: true as const, alreadyRedeemed: true, unlock: publicUnlock(row) };

  const redeemedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("venue_offer_unlocks")
    .update({ redeemed_at: redeemedAt })
    .eq("id", row.id)
    .select("*")
    .single();
  if (error) throw error;
  return { ok: true as const, alreadyRedeemed: false, unlock: publicUnlock(data as VenueOfferUnlock) };
}
