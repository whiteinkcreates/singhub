export const MAX_VIBE_SELECTIONS = 4;
export const VIBE_CHECK_LOOKBACK_DAYS = 120;

export const VIBE_CHECK_TAGS = [
  {
    slug: "supportive-crowd",
    label: "Supportive crowd",
    description: "People cheer singers on, rough edges and all.",
    category: "crowd",
  },
  {
    slug: "big-singalongs",
    label: "Big singalongs",
    description: "The room regularly joins the chorus.",
    category: "crowd",
  },
  {
    slug: "room-listens",
    label: "People actually listen",
    description: "Performers get the room instead of background chatter.",
    category: "crowd",
  },
  {
    slug: "first-timer-friendly",
    label: "First-timer friendly",
    description: "A forgiving room for getting over the first-song nerves.",
    category: "crowd",
  },
  {
    slug: "serious-singers",
    label: "Serious singers",
    description: "Expect confident regulars and some real vocal firepower.",
    category: "crowd",
  },
  {
    slug: "regulars-room",
    label: "Regulars’ room",
    description: "A familiar local crowd that knows each other.",
    category: "crowd",
  },
  {
    slug: "high-energy",
    label: "High energy",
    description: "Loud, lively, and moving fast.",
    category: "energy",
  },
  {
    slug: "laid-back",
    label: "Laid-back",
    description: "Easygoing enough to settle in and try something.",
    category: "energy",
  },
  {
    slug: "party-crowd",
    label: "Party crowd",
    description: "Karaoke is part of a bigger night out.",
    category: "energy",
  },
  {
    slug: "strong-sound",
    label: "Strong sound",
    description: "The mic, mix, and room make singers sound good.",
    category: "show",
  },
  {
    slug: "quick-rotation",
    label: "Quick rotation",
    description: "The list moves and singers get back up sooner.",
    category: "show",
  },
  {
    slug: "long-wait",
    label: "Long wait",
    description: "Bring patience because the singer list gets deep.",
    category: "show",
  },
] as const;

export type VibeTagSlug = (typeof VIBE_CHECK_TAGS)[number]["slug"];

export type VibeCheckTagResult = {
  slug: VibeTagSlug;
  label: string;
  count: number;
  percentage: number;
};

export type VibeCheckResults = {
  totalResponses: number;
  lookbackDays: number;
  lastUpdatedAt: string | null;
  tags: VibeCheckTagResult[];
};

export type VibeCheckUserState = {
  selectedTagSlugs: VibeTagSlug[];
  visitedOn: string | null;
  productUpdatesOptIn: boolean;
};

export type VibeCheckApiResponse = {
  results: VibeCheckResults;
  user: VibeCheckUserState | null;
};

export const VIBE_TAG_SLUGS = new Set<string>(
  VIBE_CHECK_TAGS.map((tag) => tag.slug),
);
