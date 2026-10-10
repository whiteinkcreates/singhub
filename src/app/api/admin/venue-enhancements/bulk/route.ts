import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminAuthorization } from "@/lib/adminAuthorization";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVenueListings } from "@/lib/venueData";
import {
  getVenueProfileData, HOTEL_VIBE_OPTIONS, VENUE_FACT_OPTIONS,
  VENUE_STANDOUT_OPTIONS, type VenueEnhancement,
} from "@/lib/venueEnhancements";

export const dynamic = "force-dynamic";

type Field = "amenities" | "vibeTags" | "standoutFeatures";
type Operation = "add" | "remove";
type Payload = { slugs?: unknown; field?: unknown; operation?: unknown; value?: unknown };
type ProfileRow = { slug: string; profile: VenueEnhancement; updated_at: string };
const allowed: Record<Field, readonly string[]> = {
  amenities: VENUE_FACT_OPTIONS,
  vibeTags: HOTEL_VIBE_OPTIONS,
  standoutFeatures: VENUE_STANDOUT_OPTIONS,
};
const maxSelections = 40;

/**
 * Admin only: modify one selected list attribute, leaving every other field unchanged.
 * Writes are protected by the row updated_at value, so concurrent edits fail rather
 * than silently overwriting newer venue changes.
 *
 * This endpoint is deliberately NOT a Partner status or media mass editor.
 */
export async function POST(request: Request) {
  try {
    await requireAdminAuthorization();
    const body = await request.json() as Payload;
    const field: Field | null =
      body.field === "amenities" || body.field === "vibeTags" || body.field === "standoutFeatures"
        ? body.field : null;
    const operation: Operation | null =
      body.operation === "add" || body.operation === "remove" ? body.operation : null;
    const value = typeof body.value === "string" ? body.value : "";
    const slugs = Array.isArray(body.slugs) ? body.slugs : [];
    if (!field || !operation || !allowed[field].includes(value)
      || !slugs.length || slugs.length > maxSelections
      || slugs.some(slug => typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug))
      || new Set(slugs).size !== slugs.length) {
      return NextResponse.json({ error: "Invalid bulk edit. Choose 1–40 distinct venues and an allowed tag operation." }, { status: 400 });
    }
    const listed = await getVenueListings();
    const canonical = new Map(listed.map(venue => [venue.slug, venue]));
    if (slugs.some(slug => !canonical.has(slug))) {
      return NextResponse.json({ error: "One or more venues are not in the current canonical Venue Index." }, { status: 400 });
    }

    const db = createAdminClient();
    const existingResult = await db.from("venue_enhancements")
      .select("slug,profile,updated_at").in("slug", slugs);
    if (existingResult.error) throw existingResult.error;
    const existing = new Map(((existingResult.data || []) as ProfileRow[]).map(row => [row.slug, row]));
    const prepared: Array<{ slug: string; profile: VenueEnhancement; original: ProfileRow | undefined }> = [];
    const issues: Array<{ slug: string; reason: string }> = [];
    let unchanged = 0;
    for (const slug of slugs as string[]) {
      const venue = canonical.get(slug)!;
      const original = existing.get(slug);
      // Keep static enhanced defaults when a row has not yet been saved.
      const seed = getVenueProfileData(slug);
      const profile: VenueEnhancement = original?.profile ?? seed ?? {
        enabled: false, featured: venue.isFeatured,
        featuredPriority: venue.featuredPriority,
        gallery: [], amenities: [], weeklySpecials: [], dailyDeals: [],
      };
      const current = profile[field] ?? [];
      const updated = operation === "add"
        ? [...new Set([...current, value])]
        : current.filter(tag => tag !== value);
      const max = field === "vibeTags" ? 4 : field === "standoutFeatures" ? 3 : Infinity;
      if (updated.length > max) {
        issues.push({ slug, reason: field === "vibeTags"
          ? "Already has four vibe tags. Remove one before adding another."
          : "Already has three standout features. Remove one before adding another." });
        continue;
      }
      if (JSON.stringify(current) === JSON.stringify(updated)) { unchanged++; continue; }
      prepared.push({ slug, original, profile: { ...profile, [field]: updated } });
    }
    // Preflight all targets before writing to prevent predictable half-edits.
    if (issues.length) {
      return NextResponse.json({
        error: "No changes saved. One or more venues have reached their tag limit.",
        issues,
      }, { status: 409 });
    }
    let changed = 0;
    for (const { slug, profile, original } of prepared) {
      const timestamp = new Date().toISOString();
      if (original) {
        const result = await db.from("venue_enhancements")
          .update({ profile, updated_at: timestamp })
          .eq("slug", slug).eq("updated_at", original.updated_at)
          .select("slug");
        if (result.error || result.data?.length !== 1) {
          issues.push({ slug, reason: result.error?.message || "Venue was edited since this batch began. Refresh and retry." });
          continue;
        }
      } else {
        const result = await db.from("venue_enhancements")
          .insert({ slug, profile, updated_at: timestamp });
        if (result.error) {
          issues.push({ slug, reason: "Could not create profile. It may have been edited in another session." });
          continue;
        }
      }
      changed++;
      revalidatePath("/venues/" + slug);
    }
    if (changed) {
      revalidatePath("/find-karaoke");
      revalidatePath("/hotel");
      revalidatePath("/");
    }
    return NextResponse.json({
      changed, unchanged, attempted: slugs.length, issues,
      saved: issues.length === 0,
    }, { status: issues.length ? 207 : 200 });
  } catch (error) {
    console.error("Venue bulk update failed", error);
    return NextResponse.json({ error: "Venue bulk edit could not complete. Check the admin logs and retry carefully." }, { status: 500 });
  }
}
