/** SingHUB founding eight. This is the sole UI/rules catalog; the SQL award trigger
 * in supabase/achievements-founding-eight.sql uses the same keys and thresholds.
 * Changing a rule requires updating both and adding a regression test.
 */
export type AchievementKey =
  | "first_gig" | "building_a_setlist" | "born_performer"
  | "mic_crawl" | "mix_it_up" | "the_traveller"
  | "sing_along_superstar" | "cheer_captain";
export type AchievementCategory = "performance" | "exploration" | "community";
export type AchievementDefinition = {
  key: AchievementKey;
  name: string;
  category: AchievementCategory;
  kind: "automatic" | "nominated";
  description: string;
  levelOne: string;
  levelTwo?: string;
  evidence: string;
};

export const FOUNDING_ACHIEVEMENTS: readonly AchievementDefinition[] = [
  {
    key: "first_gig", name: "First Gig", category: "performance", kind: "automatic",
    description: "The first song that starts your SingHUB story.",
    levelOne: "1 logged performance", evidence: "Singer-reported performance",
  },
  {
    key: "building_a_setlist", name: "Building a Setlist", category: "performance", kind: "automatic",
    description: "Keep the songs coming.",
    levelOne: "10 logged performances", levelTwo: "20 logged performances",
    evidence: "Singer-reported performances",
  },
  {
    key: "born_performer", name: "Born Performer", category: "performance", kind: "automatic",
    description: "A singer who keeps returning to the mic.",
    levelOne: "25 logged performances", levelTwo: "100 logged performances",
    evidence: "Singer-reported performances",
  },
  {
    key: "mic_crawl", name: "Mic Crawl", category: "exploration", kind: "automatic",
    description: "Find new stages all over town.",
    levelOne: "5 different karaoke venues with collected Tour Stops",
    levelTwo: "10 different karaoke venues with collected Tour Stops",
    evidence: "Confirmed Tour Stops; may be location-matched or self-reported",
  },
  {
    key: "mix_it_up", name: "Mix It Up", category: "performance", kind: "automatic",
    description: "Perform somewhere new.",
    levelOne: "Logged performances at 3 different venues",
    levelTwo: "Logged performances at 7 different venues",
    evidence: "Singer-reported performances by venue",
  },
  {
    key: "the_traveller", name: "The Traveller", category: "exploration", kind: "automatic",
    description: "An ambitious one-night karaoke crawl.",
    levelOne: "3 different Tour Stop venues in one nightlife night",
    levelTwo: "5 different Tour Stop venues in one nightlife night",
    evidence: "Confirmed Tour Stops on one SingHUB nightlife date (4 AM rollover)",
  },
  {
    key: "sing_along_superstar", name: "Sing-Along Superstar", category: "community", kind: "nominated",
    description: "A sing-along that brought the room together.",
    levelOne: "3 independent nominations for the same karaoke night; admin review",
    evidence: "Signed-in community nominations; KJ participation optional",
  },
  {
    key: "cheer_captain", name: "Cheer Captain", category: "community", kind: "nominated",
    description: "The audience member who makes every performer feel like a star.",
    levelOne: "3 independent nominations for the same karaoke night; admin review",
    evidence: "Singer, audience, or KJ nominations; KJ confirmation not required",
  },
] as const;

export const ACHIEVEMENT_BY_KEY = Object.fromEntries(
  FOUNDING_ACHIEVEMENTS.map(item => [item.key, item]),
) as Record<AchievementKey, AchievementDefinition>;

export function isNominationBadge(value: unknown): value is "sing_along_superstar" | "cheer_captain" {
  return value === "sing_along_superstar" || value === "cheer_captain";
}
export function isAchievementKey(value: unknown): value is AchievementKey {
  return typeof value === "string" && Object.hasOwn(ACHIEVEMENT_BY_KEY, value);
}
