import type { PollCategory } from "@/lib/pollBank";

export const DAILY_MIC_BRAND = {
  wordmark: "/images/header-singhub-logo.png",
  wordmarkAlt: "SingHUB",
  pink: "#ff2aa3",
  purple: "#8b5cf6",
  cyan: "#22d3ee",
  ink: "#09090b",
  paper: "#f4efe6",
  voteUrl: "https://singhub.app/vote",
  rules: {
    maxFonts: 2,
    useOfficialWordmarkOnly: true,
    noRetypedLogo: true,
    noBrushStrokeTypography: true,
    noFakeNeonWordmark: true,
    noGeneratedBrandMarks: true,
  },
} as const;

export type DailyMicTemplate = {
  label: string;
  kicker: string;
  visualDirection: string;
};

export const DAILY_MIC_TEMPLATES: Record<PollCategory, DailyMicTemplate> = {
  "karaoke-court": {
    label: "Karaoke Court",
    kicker: "Karaoke law is now in session.",
    visualDirection: "Dive-bar courtroom. Dark wood, battered bench, gavel, practical neon. No faux painted lettering.",
  },
  "kill-one": {
    label: "Kill One",
    kicker: "One has to go.",
    visualDirection: "Anthropomorphic microphone awaiting a guillotine blade in a grimy karaoke bar. Dark comedy, no gore.",
  },
  "this-or-that": {
    label: "This / That",
    kicker: "Pick a side.",
    visualDirection: "Two clean opposing fields split by one large lightning bolt. Strong symmetry and minimal clutter.",
  },
  "song-battle": {
    label: "Song Battle",
    kicker: "Two enter. One wins.",
    visualDirection: "Anthropomorphic record versus cassette or CD, squared off with ridiculous prop weapons. Graphic-comic realism.",
  },
  "would-you-rather": {
    label: "Would You Rather",
    kicker: "There is no good answer.",
    visualDirection: "One exaggerated shrugging character centered between two options. Clean split composition.",
  },
  confessions: {
    label: "Confessions",
    kicker: "The booth is open.",
    visualDirection: "Playful karaoke confessional booth, secularized and clearly comedic. Warm wood, curtain, microphone silhouette.",
  },
  "open-mic": {
    label: "Open Mic",
    kicker: "Your take goes here.",
    visualDirection: "Empty dive-bar mic stand under one practical spotlight. Space for write-in question. No decorative brush textures.",
  },
  "wild-card": {
    label: "Wild Card",
    kicker: "Anything goes.",
    visualDirection: "Playing card with mirrored joker holding a microphone at opposing corners, one inverted. Crisp card-print treatment.",
  },
};
