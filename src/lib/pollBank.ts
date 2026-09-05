export type PollCategory = "songs" | "behavior" | "venue" | "product" | "etiquette" | "chaos";

export type PollQuestion = {
  slug: string;
  question: string;
  helper?: string;
  category: PollCategory;
  options: { id: string; label: string }[];
};

export const POLL_BANK: PollQuestion[] = [
  { slug: "best-singalong", question: "Best karaoke singalong?", helper: "Which song always gets the crowd going?", category: "songs", options: [
    { id: "mr-brightside", label: "Mr. Brightside" }, { id: "dont-stop-believin", label: "Don’t Stop Believin’" }, { id: "i-want-it-that-way", label: "I Want It That Way" }, { id: "before-he-cheats", label: "Before He Cheats" },
  ]},
  { slug: "venue-choice-driver", question: "What makes you choose one karaoke spot over another?", category: "venue", options: [
    { id: "fast-rotation", label: "Fast rotation" }, { id: "good-sound", label: "Good sound" }, { id: "cheap-drinks", label: "Cheap drinks" }, { id: "close-to-home", label: "Close to home" },
  ]},
  { slug: "travel-extra-15", question: "Would you travel 15 extra minutes for a better karaoke room?", category: "behavior", options: [
    { id: "absolutely", label: "Absolutely" }, { id: "maybe", label: "Maybe" }, { id: "nope", label: "Nope" },
  ]},
  { slug: "site-check-trigger", question: "What would make you check SingHUB before going out?", category: "product", options: [
    { id: "events", label: "Tonight’s events" }, { id: "crowd", label: "Crowd level" }, { id: "wait", label: "Wait time" }, { id: "specials", label: "Drink specials" },
  ]},
  { slug: "retire-this-song", question: "Which karaoke staple deserves retirement first?", category: "songs", options: [
    { id: "sweet-caroline", label: "Sweet Caroline" }, { id: "dont-stop-believin", label: "Don’t Stop Believin’" }, { id: "friends-low-places", label: "Friends in Low Places" }, { id: "livin-on-prayer", label: "Livin’ on a Prayer" },
  ]},
  { slug: "rotation-vs-specials", question: "Pick one: faster rotation or better drink specials?", category: "venue", options: [
    { id: "rotation", label: "Faster rotation" }, { id: "specials", label: "Better drink specials" },
  ]},
  { slug: "sound-vs-vibe", question: "What matters more: great sound or great room energy?", category: "venue", options: [
    { id: "sound", label: "Great sound" }, { id: "vibe", label: "Great room energy" }, { id: "both", label: "I refuse to choose" },
  ]},
  { slug: "solo-duet-group", question: "Your ideal karaoke move?", category: "behavior", options: [
    { id: "solo", label: "Solo" }, { id: "duet", label: "Duet" }, { id: "group", label: "Group chaos" }, { id: "spectator", label: "I’m watching first" },
  ]},
  { slug: "lyrics-fail", question: "Worst karaoke failure mode?", category: "chaos", options: [
    { id: "forget-lyrics", label: "Forget the lyrics" }, { id: "miss-key", label: "Wrong key" }, { id: "dead-crowd", label: "Dead crowd" }, { id: "too-long", label: "Song is way too long" },
  ]},
  { slug: "best-decade", question: "Best decade for karaoke songs?", category: "songs", options: [
    { id: "80s", label: "80s" }, { id: "90s", label: "90s" }, { id: "00s", label: "2000s" }, { id: "10s", label: "2010s" },
  ]},
  { slug: "host-matters", question: "How much does the KJ affect whether you come back?", category: "venue", options: [
    { id: "huge", label: "Huge factor" }, { id: "some", label: "Somewhat" }, { id: "little", label: "A little" }, { id: "none", label: "Not really" },
  ]},
  { slug: "karaoke-frequency", question: "How often do you actually do karaoke?", category: "behavior", options: [
    { id: "weekly", label: "Weekly or more" }, { id: "monthly", label: "A few times a month" }, { id: "occasionally", label: "Occasionally" }, { id: "rarely", label: "Rarely, but I’m curious" },
  ]},
  { slug: "planning-window", question: "When do you decide you’re going to karaoke?", category: "behavior", options: [
    { id: "same-day", label: "Same day" }, { id: "day-before", label: "A day or two before" }, { id: "week", label: "Earlier that week" }, { id: "spontaneous", label: "After I’m already out" },
  ]},
  { slug: "wait-time-tolerance", question: "How long is too long to wait for your next song?", category: "venue", options: [
    { id: "20", label: "20 minutes" }, { id: "40", label: "40 minutes" }, { id: "60", label: "About an hour" }, { id: "whatever", label: "I’m there for the night" },
  ]},
  { slug: "crowd-size", question: "Ideal karaoke crowd size?", category: "venue", options: [
    { id: "small", label: "Small and friendly" }, { id: "medium", label: "Busy but manageable" }, { id: "packed", label: "Packed and loud" }, { id: "depends", label: "Depends on the room" },
  ]},
  { slug: "new-singer", question: "A first-time singer gets up. What does the room owe them?", category: "etiquette", options: [
    { id: "cheer", label: "A loud cheer" }, { id: "attention", label: "Actual attention" }, { id: "nothing", label: "Nothing special" }, { id: "backup", label: "Backup vocals if needed" },
  ]},
  { slug: "repeat-song", question: "Same song twice in one night: acceptable?", category: "etiquette", options: [
    { id: "never", label: "Absolutely not" }, { id: "late", label: "Only much later" }, { id: "fine", label: "Sure, who cares?" },
  ]},
  { slug: "bar-singalong", question: "Should the whole bar sing along with the performer?", category: "etiquette", options: [
    { id: "yes", label: "Always" }, { id: "chorus", label: "Just the chorus" }, { id: "read-room", label: "Read the room" }, { id: "no", label: "Let them have the mic" },
  ]},
  { slug: "stage-or-floor", question: "Better karaoke setup?", category: "venue", options: [
    { id: "stage", label: "Real stage" }, { id: "floor", label: "Mic on the floor" }, { id: "booth", label: "Dedicated booth" }, { id: "no-care", label: "Doesn’t matter" },
  ]},
  { slug: "karaoke-start-time", question: "Ideal time for karaoke to start?", category: "venue", options: [
    { id: "7", label: "7 PM" }, { id: "8", label: "8 PM" }, { id: "9", label: "9 PM" }, { id: "10", label: "10 PM or later" },
  ]},
  { slug: "discover-new-venue", question: "Would karaoke make you try a bar you’ve never visited?", category: "behavior", options: [
    { id: "yes", label: "Absolutely" }, { id: "maybe", label: "If the night looks good" }, { id: "friends", label: "Only with friends" }, { id: "no", label: "Probably not" },
  ]},
  { slug: "deal-matters", question: "Would a karaoke-night-only special affect where you go?", category: "venue", options: [
    { id: "yes", label: "Definitely" }, { id: "some", label: "Maybe" }, { id: "no", label: "Not really" },
  ]},
  { slug: "checkin-benefit", question: "What would make you actually check in at a karaoke venue?", category: "product", options: [
    { id: "points", label: "Points or badges" }, { id: "crowd", label: "Help show crowd level" }, { id: "deals", label: "Venue perks" }, { id: "history", label: "Track my karaoke history" },
  ]},
  { slug: "live-crowd-data", question: "Which live venue signal would help most?", category: "product", options: [
    { id: "wait", label: "Estimated wait" }, { id: "crowd", label: "Crowd level" }, { id: "singers", label: "Singers in rotation" }, { id: "energy", label: "Room energy" },
  ]},
  { slug: "favorite-feature", question: "What should SingHUB get freakishly good at first?", category: "product", options: [
    { id: "accuracy", label: "Accurate schedules" }, { id: "tonight", label: "Best choice tonight" }, { id: "hosts", label: "KJ discovery" }, { id: "live", label: "Live crowd intel" },
  ]},
  { slug: "duet-partner", question: "Best duet energy?", category: "songs", options: [
    { id: "islands", label: "Islands in the Stream" }, { id: "shallow", label: "Shallow" }, { id: "paradise", label: "Paradise by the Dashboard Light" }, { id: "nothing", label: "Nothing’s Gonna Stop Us Now" },
  ]},
  { slug: "one-song-only", question: "You get one song tonight. What are you choosing for?", category: "behavior", options: [
    { id: "voice", label: "Show off my voice" }, { id: "crowd", label: "Win the crowd" }, { id: "fun", label: "Maximum fun" }, { id: "feelings", label: "Feel something dramatic" },
  ]},
  { slug: "karaoke-red-flag", question: "Biggest karaoke venue red flag?", category: "venue", options: [
    { id: "sound", label: "Bad sound" }, { id: "rotation", label: "Sketchy rotation" }, { id: "dead", label: "Dead room" }, { id: "host", label: "Disengaged host" },
  ]},
  { slug: "song-length", question: "What song length starts testing your patience?", category: "etiquette", options: [
    { id: "4", label: "Over 4 minutes" }, { id: "5", label: "Over 5 minutes" }, { id: "6", label: "Over 6 minutes" }, { id: "freebird", label: "Free Bird is a human right" },
  ]},
  { slug: "karaoke-alone", question: "Would you go to karaoke alone?", category: "behavior", options: [
    { id: "yes", label: "Yep" }, { id: "regular", label: "If I knew the room" }, { id: "maybe", label: "Maybe once" }, { id: "no", label: "Absolutely not" },
  ]},
  { slug: "private-vs-bar", question: "Pick your karaoke habitat.", category: "behavior", options: [
    { id: "bar", label: "Public bar stage" }, { id: "private", label: "Private room" }, { id: "live-band", label: "Live band karaoke" }, { id: "all", label: "Give me all of it" },
  ]},
];

function dateKeyInLosAngeles(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function dayNumber(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
}

export function getPollForDate(date = new Date()) {
  const key = dateKeyInLosAngeles(date);
  const index = ((dayNumber(key) % POLL_BANK.length) + POLL_BANK.length) % POLL_BANK.length;
  return POLL_BANK[index];
}

export function getPreviousPoll(date = new Date()) {
  const yesterday = new Date(date.getTime() - 86400000);
  return getPollForDate(yesterday);
}

export function getPollBySlug(slug: string) {
  return POLL_BANK.find((poll) => poll.slug === slug);
}
