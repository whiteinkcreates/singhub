import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { VIBE_CHECK_LOOKBACK_DAYS, VIBE_CHECK_TAGS } from "@/lib/vibeChecks";

export type SingersSaySummary = {
  totalResponses: number;
  tags: Array<{ slug: string; label: string; count: number; percentage: number }>;
};

function lookbackDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - VIBE_CHECK_LOOKBACK_DAYS);
  return date.toISOString().slice(0, 10);
}

export async function getSingersSaySummary(venueId: string): Promise<SingersSaySummary> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("vibe_check_responses")
      .select("id,vibe_check_response_tags(tag_slug)")
      .eq("venue_id", venueId)
      .gte("visited_on", lookbackDate());

    if (error) throw error;

    const rows = (data || []) as Array<{
      id: string;
      vibe_check_response_tags: Array<{ tag_slug: string }> | null;
    }>;
    const counts = new Map<string, number>();

    for (const row of rows) {
      for (const tag of row.vibe_check_response_tags || []) {
        counts.set(tag.tag_slug, (counts.get(tag.tag_slug) || 0) + 1);
      }
    }

    const totalResponses = rows.length;
    const tags = VIBE_CHECK_TAGS
      .map((tag) => {
        const count = counts.get(tag.slug) || 0;
        return {
          slug: tag.slug,
          label: tag.label,
          count,
          percentage: totalResponses ? Math.round((count / totalResponses) * 100) : 0,
        };
      })
      .filter((tag) => tag.count > 0)
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    return { totalResponses, tags };
  } catch (error) {
    console.error("Singers Say summary failed", error);
    return { totalResponses: 0, tags: [] };
  }
}
