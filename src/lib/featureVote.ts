export const CURRENT_FEATURE_POLL = {
  slug: "next-member-feature-2026-09",
  question: "What should SingHUB build next?",
  options: [
    {
      id: "saved-nights",
      title: "Saved Nights",
      description: "Favorite venues and build a personal karaoke hit list.",
      pedal: "A",
    },
    {
      id: "crowd-check-ins",
      title: "Crowd Check-Ins",
      description: "See which karaoke nights are active before leaving home.",
      pedal: "B",
    },
    {
      id: "schedule-alerts",
      title: "Schedule Alerts",
      description: "Know when a saved karaoke night changes or gets canceled.",
      pedal: "C",
    },
  ],
} as const;

export type FeatureOptionId = (typeof CURRENT_FEATURE_POLL.options)[number]["id"];

export type FeatureVoteApiResponse = {
  pollSlug: string;
  totalVotes: number;
  options: Array<{
    id: FeatureOptionId;
    title: string;
    votes: number;
    percentage: number;
  }>;
  user: {
    selectedOptionId: FeatureOptionId | null;
    productUpdatesOptIn: boolean;
  } | null;
};

export const FEATURE_OPTION_IDS = new Set<string>(
  CURRENT_FEATURE_POLL.options.map((option) => option.id),
);
