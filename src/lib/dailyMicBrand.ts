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

export type NormalizedBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DailyMicTemplate = {
  label: string;
  kicker: string;
  visualDirection: string;
  masterPath: string;
  mode: "four-options" | "question-four-options" | "two-options" | "question-panel";
  questionBox?: NormalizedBox;
  optionBoxes?: NormalizedBox[];
  clearDynamicBoxes?: boolean;
};

const masterPath = (category: PollCategory) => `/api/daily-mic/template/${category}`;

export const DAILY_MIC_TEMPLATES: Record<PollCategory, DailyMicTemplate> = {
  "karaoke-court": {
    label: "Karaoke Court",
    kicker: "Karaoke law is now in session.",
    visualDirection: "Approved dive-bar courtroom master with the judge and four answer boxes.",
    masterPath: masterPath("karaoke-court"),
    mode: "question-four-options",
    questionBox: { x: 0.205, y: 0.565, width: 0.59, height: 0.075 },
    optionBoxes: [
      { x: 0.145, y: 0.655, width: 0.34, height: 0.075 },
      { x: 0.145, y: 0.742, width: 0.34, height: 0.075 },
      { x: 0.515, y: 0.655, width: 0.34, height: 0.075 },
      { x: 0.515, y: 0.742, width: 0.34, height: 0.075 },
    ],
  },
  "kill-one": {
    label: "Kill One",
    kicker: "One has to go.",
    visualDirection: "Approved anthropomorphic microphone in the guillotine master.",
    masterPath: masterPath("kill-one"),
    mode: "four-options",
    optionBoxes: [
      { x: 0.03, y: 0.345, width: 0.255, height: 0.135 },
      { x: 0.03, y: 0.49, width: 0.255, height: 0.135 },
      { x: 0.67, y: 0.345, width: 0.255, height: 0.135 },
      { x: 0.67, y: 0.49, width: 0.255, height: 0.135 },
    ],
  },
  "this-or-that": {
    label: "This / That",
    kicker: "Pick a side.",
    visualDirection: "Approved split lightning-bolt master with pink and blue choice fields.",
    masterPath: masterPath("this-or-that"),
    mode: "two-options",
    optionBoxes: [
      { x: 0.055, y: 0.625, width: 0.39, height: 0.205 },
      { x: 0.535, y: 0.625, width: 0.39, height: 0.205 },
    ],
  },
  "song-battle": {
    label: "Song Battle",
    kicker: "Two enter. One wins.",
    visualDirection: "Approved record-versus-cassette master. This exact artwork is the recurring Song Battle template.",
    masterPath: masterPath("song-battle"),
    mode: "two-options",
    optionBoxes: [
      { x: 0.035, y: 0.655, width: 0.43, height: 0.165 },
      { x: 0.515, y: 0.655, width: 0.43, height: 0.165 },
    ],
  },
  "would-you-rather": {
    label: "Would You Rather",
    kicker: "There is no good answer.",
    visualDirection: "Approved shrugging singer master. The two example choices are covered and replaced on export.",
    masterPath: masterPath("would-you-rather"),
    mode: "two-options",
    clearDynamicBoxes: true,
    optionBoxes: [
      { x: 0.055, y: 0.62, width: 0.405, height: 0.205 },
      { x: 0.535, y: 0.62, width: 0.405, height: 0.205 },
    ],
  },
  confessions: {
    label: "Confessions",
    kicker: "The booth is open.",
    visualDirection: "Approved confessional booth master with only a hand extending the microphone through the curtain.",
    masterPath: masterPath("confessions"),
    mode: "question-panel",
    questionBox: { x: 0.125, y: 0.635, width: 0.75, height: 0.18 },
  },
  "open-mic": {
    label: "Open Mic",
    kicker: "Your take goes here.",
    visualDirection: "Approved marquee Open Mic master with empty stage, mic stand, and one large response panel.",
    masterPath: masterPath("open-mic"),
    mode: "question-panel",
    questionBox: { x: 0.145, y: 0.64, width: 0.71, height: 0.145 },
  },
  "wild-card": {
    label: "Wild Card",
    kicker: "Anything goes.",
    visualDirection: "Approved Joker playing-card master with mirrored singing jokers, one inverted.",
    masterPath: masterPath("wild-card"),
    mode: "question-panel",
    questionBox: { x: 0.04, y: 0.705, width: 0.92, height: 0.165 },
  },
};
