export type LocalSeoPage = {
  slug: string;
  path: string;
  title: string;
  metaTitle: string;
  description: string;
  eyebrow: string;
  headline: string;
  intro: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

export type DaySeoPage = {
  slug: string;
  day: string;
  title: string;
  metaTitle: string;
  description: string;
  intro: string;
  findHref: string;
};

export type NeighborhoodSeoPage = {
  slug: string;
  name: string;
  metaTitle: string;
  description: string;
  intro: string;
  vibe: string;
  bestFor: string[];
};

export type GuidePost = {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  category: string;
  socialHook: string;
  intro: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
  takeaway: string;
};

export const localSeoPages: LocalSeoPage[] = [
  {
    slug: "karaoke-near-me",
    path: "/karaoke-near-me",
    title: "Karaoke Near Me in San Diego",
    metaTitle: "Karaoke Near Me in San Diego | SingHUB",
    description:
      "Find karaoke near you in San Diego by day, neighborhood, venue, and vibe.",
    eyebrow: "Local Karaoke Finder",
    headline: "Karaoke near me, without the search spiral",
    intro:
      "SingHUB helps San Diego singers find live karaoke bars, private karaoke rooms, and host-led nights without digging through old flyers, dead calendars, and random social posts.",
    primaryCtaLabel: "Find Karaoke Tonight",
    primaryCtaHref: "/find-karaoke?day=tonight",
    secondaryCtaLabel: "Submit a Karaoke Night",
    secondaryCtaHref: "/submit-listing",
    sections: [
      {
        heading: "Built for how people actually search",
        body:
          "Most singers do not search for a brand first. They search for karaoke near me, karaoke tonight, karaoke bars near me, or a neighborhood they already know. This page gives that search intent a real home.",
      },
      {
        heading: "San Diego first",
        body:
          "SingHUB starts with San Diego because the local karaoke scene is scattered across bars, hosts, private rooms, and neighborhood regulars. The goal is simple: make the next room easier to find.",
      },
      {
        heading: "Hosts and venues matter",
        body:
          "If you host karaoke or run a bar with karaoke, SingHUB gives singers one place to discover your night and gives your weekly flyer somewhere more permanent to live.",
      },
    ],
    faqs: [
      {
        question: "How do I find karaoke near me in San Diego?",
        answer:
          "Use the SingHUB finder to browse by day, venue type, neighborhood, and distance. Start with tonight, then narrow by the kind of room you want.",
      },
      {
        question: "Does SingHUB include private karaoke rooms?",
        answer:
          "Yes. SingHUB tracks live bar karaoke, private rooms, and event-style karaoke nights where the details are available.",
      },
      {
        question: "Can a host or venue get listed?",
        answer:
          "Yes. Hosts and venues can submit a karaoke night with the venue, day, start time, neighborhood, and host information.",
      },
    ],
  },
  {
    slug: "san-diego-karaoke",
    path: "/san-diego-karaoke",
    title: "San Diego Karaoke Guide",
    metaTitle: "San Diego Karaoke Guide | SingHUB",
    description:
      "A local guide to San Diego karaoke nights, neighborhoods, hosts, bars, and private rooms.",
    eyebrow: "San Diego Karaoke",
    headline: "Where San Diego sings",
    intro:
      "San Diego karaoke is not one scene. It is North Park rooms, Hillcrest regulars, Pacific Beach chaos, Gaslamp birthdays, East County loyalists, and private rooms hiding in plain sight.",
    primaryCtaLabel: "Browse San Diego Karaoke",
    primaryCtaHref: "/find-karaoke",
    secondaryCtaLabel: "Explore Neighborhoods",
    secondaryCtaHref: "/neighborhoods",
    sections: [
      {
        heading: "A guide for singers, not just search engines",
        body:
          "This guide points singers toward the right kind of night: social rooms, big energy rooms, low-pressure rooms, and places where regulars keep the rotation alive.",
      },
      {
        heading: "Every night has a different job",
        body:
          "A Tuesday neighborhood room is not the same animal as a Saturday birthday takeover. SingHUB separates day, venue, and neighborhood so you can pick with a little more intelligence.",
      },
      {
        heading: "The scene gets stronger when the data gets cleaner",
        body:
          "The more hosts, venues, and singers tag or submit current details, the better the local index gets. This is the boring part that makes the fun part work.",
      },
    ],
    faqs: [
      {
        question: "What is the best karaoke neighborhood in San Diego?",
        answer:
          "It depends on the night. North Park, Hillcrest, Pacific Beach, Gaslamp, and East County each have different karaoke personalities.",
      },
      {
        question: "Is SingHUB only for San Diego?",
        answer:
          "San Diego is the launch market. The structure is built so the same local finder can expand city by city later.",
      },
      {
        question: "Can singers help improve the guide?",
        answer:
          "Yes. Tag SingHUB when you are out singing, send updated schedules, and submit missing karaoke nights.",
      },
    ],
  },
  {
    slug: "karaoke-tonight-san-diego",
    path: "/karaoke-tonight-san-diego",
    title: "Karaoke Tonight in San Diego",
    metaTitle: "Karaoke Tonight in San Diego | SingHUB",
    description:
      "Check what karaoke is happening tonight in San Diego and find a room before you leave the house.",
    eyebrow: "Tonight's Karaoke",
    headline: "Find karaoke tonight before you commit to pants",
    intro:
      "Looking for karaoke tonight in San Diego? Start here, then use the finder to filter by venue, neighborhood, and type of room.",
    primaryCtaLabel: "See Tonight's Karaoke",
    primaryCtaHref: "/find-karaoke?day=tonight",
    secondaryCtaLabel: "Follow Nightly Updates",
    secondaryCtaHref: "/guides/tonights-karaoke-lives-here",
    sections: [
      {
        heading: "Tonight is the core habit",
        body:
          "People rarely plan karaoke like a dentist appointment. They ask where karaoke is happening tonight, then decide if the room, drive, and start time make sense.",
      },
      {
        heading: "Use the finder, then check the room",
        body:
          "Schedules can change, especially with rotating hosts or special events. SingHUB gives you a starting point, and verified listings will get stronger as hosts and venues update the details.",
      },
      {
        heading: "Hosts can feed the signal",
        body:
          "Weekly flyers, schedule changes, and tagged posts help SingHUB keep tonight's karaoke useful instead of becoming another abandoned internet calendar.",
      },
    ],
    faqs: [
      {
        question: "How do I check karaoke tonight in San Diego?",
        answer:
          "Use the SingHUB finder and choose tonight. You can also browse day pages for recurring weekly karaoke nights.",
      },
      {
        question: "Are all karaoke nights verified?",
        answer:
          "Some listings are verified, some are claimed, and some are still being scouted. Use the trust filters when accuracy matters.",
      },
      {
        question: "How can a host get tonight's flyer featured?",
        answer:
          "Tag SingHUB or submit the event details with the day, time, venue, neighborhood, and host handle.",
      },
    ],
  },
];

export const daySeoPages: DaySeoPage[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
].map((day) => {
  const label = day.charAt(0).toUpperCase() + day.slice(1);
  return {
    slug: day,
    day: label,
    title: `${label} Karaoke in San Diego`,
    metaTitle: `${label} Karaoke in San Diego | SingHUB`,
    description: `Find ${label.toLowerCase()} karaoke nights in San Diego by venue, neighborhood, and vibe.`,
    intro: `${label} karaoke hits different depending on the room. Use SingHUB to find recurring San Diego karaoke nights and check the venue details before you roll out.`,
    findHref: `/find-karaoke?day=${label}`,
  };
});

export const neighborhoodSeoPages: NeighborhoodSeoPage[] = [
  {
    slug: "north-park",
    name: "North Park",
    metaTitle: "North Park Karaoke | SingHUB",
    description: "Find karaoke nights around North Park and nearby San Diego neighborhoods.",
    intro:
      "North Park karaoke tends to pull creative regulars, bar hoppers, and people who are very ready to make one song everyone else's problem.",
    vibe: "Big personality rooms, neighborhood energy, and strong regulars.",
    bestFor: ["creative crowds", "walkable bar nights", "room energy"],
  },
  {
    slug: "hillcrest",
    name: "Hillcrest",
    metaTitle: "Hillcrest Karaoke | SingHUB",
    description: "Find karaoke nights in Hillcrest, one of San Diego's most social karaoke areas.",
    intro:
      "Hillcrest karaoke is social, theatrical, and usually friendlier to singers who want the crowd involved.",
    vibe: "Crowd-friendly, expressive, and built for people who actually cheer.",
    bestFor: ["social singers", "duets", "first-timers with confidence"],
  },
  {
    slug: "pacific-beach",
    name: "Pacific Beach",
    metaTitle: "Pacific Beach Karaoke | SingHUB",
    description: "Find karaoke nights in Pacific Beach and beach-area San Diego bars.",
    intro:
      "Pacific Beach karaoke can go from casual to full chaos fast. Sometimes that is exactly the assignment.",
    vibe: "Beach bar energy, birthdays, groups, and chorus-level participation.",
    bestFor: ["groups", "high-energy songs", "late-night chaos"],
  },
  {
    slug: "gaslamp",
    name: "Gaslamp",
    metaTitle: "Gaslamp Karaoke | SingHUB",
    description: "Find karaoke in the Gaslamp and downtown San Diego nightlife areas.",
    intro:
      "Gaslamp karaoke is where locals, tourists, birthdays, and bachelor or bachelorette crews collide under one microphone.",
    vibe: "Downtown nightlife, tourist traffic, and big group momentum.",
    bestFor: ["birthdays", "tourists", "downtown nights"],
  },
  {
    slug: "east-county-la-mesa",
    name: "East County and La Mesa",
    metaTitle: "East County and La Mesa Karaoke | SingHUB",
    description: "Find karaoke nights around La Mesa and East County San Diego.",
    intro:
      "East County and La Mesa karaoke rooms can be underrated because the regulars do not need hype. They just show up and sing.",
    vibe: "Local regulars, loyal rooms, and less downtown nonsense.",
    bestFor: ["regular singers", "lower-pressure nights", "neighborhood bars"],
  },
  {
    slug: "ocean-beach",
    name: "Ocean Beach",
    metaTitle: "Ocean Beach Karaoke | SingHUB",
    description: "Find karaoke nights in Ocean Beach and nearby coastal San Diego bars.",
    intro:
      "Ocean Beach karaoke is beach-town weird in the best possible way. Expect personality, not polish.",
    vibe: "Laid-back coastal bars, local characters, and unpredictable song choices.",
    bestFor: ["casual singers", "dive bar energy", "weird good nights"],
  },
];

export const guidePosts: GuidePost[] = [
  {
    slug: "singhub-is-live",
    title: "SingHUB Is Live",
    metaTitle: "SingHUB Is Live | San Diego Karaoke Finder",
    description: "SingHUB is live as a San Diego karaoke finder for singers, hosts, and venues.",
    category: "Launch",
    socialHook: "San Diego karaoke just got easier.",
    intro:
      "SingHUB is live at singhub.app, built to help singers, hosts, and venues find each other faster.",
    sections: [
      {
        heading: "What it does",
        body:
          "SingHUB helps people find karaoke nights by day, venue, neighborhood, and vibe. It gives the scattered San Diego karaoke scene one searchable starting point.",
      },
      {
        heading: "Why it matters",
        body:
          "Karaoke discovery is still weirdly analog. People rely on flyers, old posts, text threads, and host memory. SingHUB turns that chaos into a local index.",
      },
      {
        heading: "How to help",
        body:
          "Hosts and venues can tag SingHUB or submit schedule details so singers can find the room faster.",
      },
    ],
    takeaway: "Start at singhub.app and help map San Diego karaoke.",
  },
  {
    slug: "what-is-singhub",
    title: "What Is SingHUB?",
    metaTitle: "What Is SingHUB? | Karaoke Discovery in San Diego",
    description: "A quick explanation of SingHUB and how it helps people find karaoke in San Diego.",
    category: "Launch",
    socialHook: "Less searching. More singing.",
    intro:
      "SingHUB is a karaoke discovery platform starting in San Diego, built around the question everyone actually asks: where is karaoke tonight?",
    sections: [
      {
        heading: "For singers",
        body:
          "Find live karaoke, private rooms, and recurring host-led nights without bouncing between ten social accounts.",
      },
      {
        heading: "For hosts",
        body:
          "Get your weekly karaoke night in front of people who are actively looking for somewhere to sing.",
      },
      {
        heading: "For venues",
        body:
          "Give karaoke nights a clearer path to discovery, especially on slower weeknights where the right crowd matters.",
      },
    ],
    takeaway: "SingHUB is the home base for San Diego karaoke discovery.",
  },
  {
    slug: "how-to-use-singhub",
    title: "How To Use SingHUB",
    metaTitle: "How To Use SingHUB | Find Karaoke in San Diego",
    description: "How to use SingHUB to find karaoke nights near you in San Diego.",
    category: "How To",
    socialHook: "Simple idea. Big upgrade.",
    intro:
      "Instead of digging through old flyers and random bar posts, SingHUB gives you one place to start.",
    sections: [
      {
        heading: "Pick the day",
        body:
          "Start with tonight or choose the day you want to go out. Karaoke is a recurring-night business, so day filtering matters.",
      },
      {
        heading: "Check the venue details",
        body:
          "Look for the venue, neighborhood, start time, host details, and listing status before you head over.",
      },
      {
        heading: "Submit what is missing",
        body:
          "If your favorite room is missing, submit the listing so the local index gets stronger.",
      },
    ],
    takeaway: "Go to SingHUB, pick your night, find the room, then sing the song.",
  },
  {
    slug: "tonights-karaoke-lives-here",
    title: "Tonight's Karaoke Lives Here",
    metaTitle: "Tonight's Karaoke in San Diego | SingHUB",
    description: "How SingHUB surfaces karaoke happening tonight in San Diego.",
    category: "Tonight",
    socialHook: "Check what is happening before you leave the house.",
    intro:
      "Every day, SingHUB points people toward what is happening tonight in the San Diego karaoke scene.",
    sections: [
      {
        heading: "The nightly habit",
        body:
          "Tonight is the behavior to build. People want the freshest answer when they are already deciding where to go.",
      },
      {
        heading: "Flyers still matter",
        body:
          "Hosts and venues can tag SingHUB in flyers or send weekly schedules so the nightly signal gets stronger.",
      },
      {
        heading: "Everyone wins",
        body:
          "Singers find rooms, hosts get discovered, and venues get more people through the door. The seven-minute ballad guy still loses. Fair is fair.",
      },
    ],
    takeaway: "Use SingHUB as the daily starting point for San Diego karaoke.",
  },
  {
    slug: "san-diego-karaoke-hosts-get-listed",
    title: "San Diego Karaoke Hosts: Get Listed",
    metaTitle: "San Diego Karaoke Hosts | Get Listed on SingHUB",
    description: "Karaoke hosts in San Diego can submit weekly nights to get listed on SingHUB.",
    category: "Hosts",
    socialHook: "Hosting karaoke in San Diego? Get found.",
    intro:
      "If you host karaoke in San Diego, SingHUB wants people to find your room.",
    sections: [
      {
        heading: "Send the basics",
        body:
          "Include venue, day, start time, neighborhood, host name, and your handle. The cleaner the info, the faster it becomes useful.",
      },
      {
        heading: "Tag the flyer",
        body:
          "Weekly flyers are great social fuel. Tagging SingHUB gives the event a better chance to be surfaced in roundups.",
      },
      {
        heading: "Protect the supply side",
        body:
          "Hosts are the heartbeat of the scene. SingHUB should make good hosts easier to discover, not bury them under generic nightlife noise.",
      },
    ],
    takeaway: "Hosts can submit a free listing and help build the San Diego karaoke map.",
  },
  {
    slug: "bars-with-karaoke-get-found",
    title: "Bars With Karaoke: Get Found",
    metaTitle: "Bars With Karaoke in San Diego | Get Listed on SingHUB",
    description: "San Diego bars with karaoke can get listed so singers can find their weekly nights.",
    category: "Venues",
    socialHook: "Karaoke brings people in, but people have to know it exists.",
    intro:
      "If your bar runs karaoke, SingHUB should know about it.",
    sections: [
      {
        heading: "Off-night discovery",
        body:
          "Karaoke can turn a slow night into a regular habit. The catch is people have to find it before they choose a different bar.",
      },
      {
        heading: "Free listing first",
        body:
          "Start with a basic listing: schedule, location, host, neighborhood, and a reliable source.",
      },
      {
        heading: "Better details create better traffic",
        body:
          "Food, parking, cover charge, age policy, and host details help people choose the right room.",
      },
    ],
    takeaway: "Venues can submit weekly karaoke details and get into the local finder.",
  },
  {
    slug: "karaoke-etiquette-dont-be-that-guy",
    title: "Karaoke Etiquette: Don't Be That Guy",
    metaTitle: "Karaoke Etiquette | SingHUB Guide",
    description: "Basic karaoke etiquette for singers who want to be invited back.",
    category: "Culture",
    socialHook: "Karaoke is chaos with rules.",
    intro:
      "Karaoke works because everyone agrees to a few invisible rules. Break all of them and congrats, you are the subplot.",
    sections: [
      {
        heading: "Respect the rotation",
        body:
          "The host is balancing slips, regulars, first-timers, duets, and crowd flow. Asking every six minutes does not make time move faster.",
      },
      {
        heading: "Do not steal the mic",
        body:
          "Jumping into someone's song uninvited is not confidence. It is audio trespassing.",
      },
      {
        heading: "Cheer for people",
        body:
          "First-timers are carrying a lot of nerves. Clap, cheer, and let the room feel safe enough for the next person to try.",
      },
    ],
    takeaway: "Tip your host, respect the room, and do not become karaoke homework.",
  },
  {
    slug: "first-time-singing-karaoke",
    title: "First Time Singing Karaoke? Start Here",
    metaTitle: "First Time Singing Karaoke | SingHUB Guide",
    description: "A first-timer karaoke guide for picking a song, handling nerves, and surviving the mic.",
    category: "Beginner Guide",
    socialHook: "Nobody starts as a karaoke legend.",
    intro:
      "Most people start by panic-singing the chorus and blacking out emotionally. Totally normal. Let us make that less weird.",
    sections: [
      {
        heading: "Pick a song you know",
        body:
          "This is not the night to discover the bridge has words. Choose something familiar enough that your brain has fewer chances to betray you.",
      },
      {
        heading: "Go earlier",
        body:
          "Earlier in the night usually means shorter waits, calmer rooms, and less pressure from a packed crowd.",
      },
      {
        heading: "Bring one hype friend",
        body:
          "You do not need an entourage. One supportive friend near the front can make the whole thing feel less like public combat.",
      },
    ],
    takeaway: "Pick the song, hold the mic close, and do not apologize before you start.",
  },
  {
    slug: "top-songs-to-open-a-karaoke-room",
    title: "Top Songs To Open A Karaoke Room",
    metaTitle: "Best Karaoke Opening Songs | SingHUB",
    description: "Song ideas that can warm up a karaoke room without killing the vibe.",
    category: "Songs",
    socialHook: "The opening song matters.",
    intro:
      "You are either warming the room up or making everyone suddenly very interested in the pool table.",
    sections: [
      {
        heading: "The room needs easy wins",
        body:
          "A strong opener is familiar, energetic, and not so precious that everyone has to sit silently and evaluate your theatre kid arc.",
      },
      {
        heading: "Examples that usually work",
        body:
          "High-recognition songs like dance-pop, pop-rock, Motown-adjacent singalongs, and early-2000s crowd favorites tend to get people engaged fast.",
      },
      {
        heading: "Save the deep cuts",
        body:
          "There is a time for the obscure song that means everything to you. The first 15 minutes of a quiet room is usually not that time.",
      },
    ],
    takeaway: "Open with something the room can catch, not something the room has to study.",
  },
  {
    slug: "karaoke-songs-that-wake-up-the-room",
    title: "Karaoke Songs That Wake Up The Room",
    metaTitle: "Karaoke Songs That Wake Up The Room | SingHUB",
    description: "Big energy karaoke song ideas for waking up the room.",
    category: "Songs",
    socialHook: "Some songs do not get performed. They get detonated.",
    intro:
      "Every room has a moment where it needs a jolt. Pick right and the whole place wakes up.",
    sections: [
      {
        heading: "Go recognizable",
        body:
          "A room explosion song has to land fast. The crowd should know what is happening before the first chorus arrives.",
      },
      {
        heading: "Keep the energy broad",
        body:
          "Pop, dance, rock, and hip-hop crossover songs usually work better than narrow flex picks when the goal is room lift.",
      },
      {
        heading: "Read the crowd",
        body:
          "The best song in the wrong room is still the wrong song. Watch what people are responding to before you choose the missile.",
      },
    ],
    takeaway: "Pick the song that wakes the room, not the song that proves your range to three people.",
  },
  {
    slug: "karaoke-songs-better-with-friends",
    title: "Karaoke Songs Better With Friends",
    metaTitle: "Group Karaoke Songs and Duets | SingHUB",
    description: "Duet and group karaoke song ideas for singers who need backup.",
    category: "Songs",
    socialHook: "Some songs require witnesses.",
    intro:
      "Not every karaoke song should be attempted alone. Some require backup singers and at least one friend making questionable choices.",
    sections: [
      {
        heading: "Use the group as a safety net",
        body:
          "Duets and group songs spread the pressure around. They are perfect when someone wants to sing but does not want the whole room staring at them alone.",
      },
      {
        heading: "Choose parts people know",
        body:
          "A good group song has obvious moments where people can jump in. If everyone needs a lyric assignment, you picked homework.",
      },
      {
        heading: "Do not trap strangers",
        body:
          "Inviting someone is fun. Dragging someone into a song they did not agree to is how you get karaoke side-eye.",
      },
    ],
    takeaway: "Friends can save the song. Just make sure they volunteered for the rescue mission.",
  },
  {
    slug: "where-san-diego-sings",
    title: "Where San Diego Sings",
    metaTitle: "Where San Diego Sings | Karaoke Neighborhood Guide",
    description: "A neighborhood-style guide to San Diego karaoke vibes.",
    category: "Neighborhoods",
    socialHook: "San Diego karaoke is not one scene.",
    intro:
      "San Diego karaoke is a bunch of rooms with totally different personalities. SingHUB is here to map the whole thing.",
    sections: [
      {
        heading: "North Park",
        body:
          "Big personality rooms, creative crowds, and people who understand the value of a dramatic chorus.",
      },
      {
        heading: "Hillcrest",
        body:
          "Social, theatrical, and crowd-friendly. A strong place for singers who want energy back from the room.",
      },
      {
        heading: "Pacific Beach, Gaslamp, and East County",
        body:
          "PB brings chaos, Gaslamp brings visitors and birthday energy, and East County brings underrated regulars who can actually sing.",
      },
    ],
    takeaway: "The right karaoke night depends on the neighborhood as much as the song.",
  },
  {
    slug: "what-kind-of-karaoke-person-are-you",
    title: "What Kind of Karaoke Person Are You?",
    metaTitle: "Types of Karaoke Singers | SingHUB",
    description: "A funny breakdown of common karaoke personalities.",
    category: "Culture",
    socialHook: "Everybody becomes a type once the mic comes out.",
    intro:
      "Every karaoke room has characters. You might be one. Be honest. The microphone already knows.",
    sections: [
      {
        heading: "The Regular",
        body:
          "Knows the host, respects the rotation, and somehow has the perfect song ready every time.",
      },
      {
        heading: "The Birthday Singer",
        body:
          "Has five friends, three sashes, and a song choice that may or may not survive the second verse.",
      },
      {
        heading: "The Secret Weapon",
        body:
          "Quiet at the table, dangerous on the mic. Never underestimate the person who says they do not really sing.",
      },
    ],
    takeaway: "Find your type, then find your room.",
  },
  {
    slug: "songs-that-are-longer-than-you-think",
    title: "Songs That Are Longer Than You Think",
    metaTitle: "Long Karaoke Songs To Use Carefully | SingHUB",
    description: "A practical warning about karaoke songs that can slow down the rotation.",
    category: "Songs",
    socialHook: "Great songs. Dangerous rotation choices.",
    intro:
      "Some songs feel legendary until everyone realizes they packed a sleeping bag for the third act.",
    sections: [
      {
        heading: "Length changes the room",
        body:
          "A long song is not automatically bad, but it does take up more rotation time and asks more patience from the crowd.",
      },
      {
        heading: "Earn the long pick",
        body:
          "If the room is packed or the host is moving fast, think twice before choosing a song with multiple emotional eras.",
      },
      {
        heading: "Know when to cut yourself off",
        body:
          "Sometimes the power move is choosing the shorter crowd-friendly option and living to sing again.",
      },
    ],
    takeaway: "Respect the rotation before you unleash the nine-minute journey.",
  },
  {
    slug: "karaoke-green-flags",
    title: "Karaoke Green Flags",
    metaTitle: "Karaoke Green Flags | SingHUB",
    description: "Good karaoke behavior that hosts, venues, and singers appreciate.",
    category: "Culture",
    socialHook: "Green flags make the room better.",
    intro:
      "Good karaoke people are not just good singers. They make the room easier to run and more fun to be in.",
    sections: [
      {
        heading: "They tip the KJ",
        body:
          "Hosts keep the night moving, manage the room, and deal with chaos. Respect the work.",
      },
      {
        heading: "They clap for strangers",
        body:
          "A supportive room makes better performances happen. The person clapping for a first-timer is doing community maintenance.",
      },
      {
        heading: "They tag the venue and host",
        body:
          "Tags help more people find the room next time. That is how the scene grows without everyone doing unpaid detective work.",
      },
    ],
    takeaway: "Be the singer who makes the room better, not heavier.",
  },
  {
    slug: "karaoke-red-flags",
    title: "Karaoke Red Flags",
    metaTitle: "Karaoke Red Flags | SingHUB",
    description: "Karaoke behavior that annoys hosts, singers, and everyone near the mic.",
    category: "Culture",
    socialHook: "Do not be the plot twist nobody asked for.",
    intro:
      "Every room has red flags. The goal is to spot them without becoming one.",
    sections: [
      {
        heading: "Can I go next?",
        body:
          "This sentence has haunted every karaoke host since the dawn of laminated songbooks.",
      },
      {
        heading: "Second mic crimes",
        body:
          "Grabbing a mic you were not invited to use is not backup vocals. It is a tiny coup.",
      },
      {
        heading: "Rotation complaints",
        body:
          "Bigger crowds mean longer waits. The host is not ignoring you. The room is simply full of other humans with dreams.",
      },
    ],
    takeaway: "Be cool, wait your turn, and nobody has to make a post about you.",
  },
  {
    slug: "karaoke-rotation-explained",
    title: "The Karaoke Rotation Explained",
    metaTitle: "How Karaoke Rotation Works | SingHUB",
    description: "A simple explanation of karaoke rotation and why singers wait between songs.",
    category: "How To",
    socialHook: "Why you are not up yet.",
    intro:
      "The karaoke rotation is not personal. It is just the room trying to be fair while everyone wants the mic.",
    sections: [
      {
        heading: "New singers join the cycle",
        body:
          "Most hosts add new singers after the current cycle, which means showing up later usually means waiting longer.",
      },
      {
        heading: "Duets still count",
        body:
          "A duet uses room time too. It may feel like teamwork, but the clock still has opinions.",
      },
      {
        heading: "Tip, be cool, enjoy the room",
        body:
          "The fastest way to make karaoke worse is to treat the host like a vending machine for your turn.",
      },
    ],
    takeaway: "The host is not ignoring you. The rotation is doing rotation things.",
  },
];

export function getLocalSeoPage(slug: string) {
  return localSeoPages.find((page) => page.slug === slug);
}

export function getDaySeoPage(slug: string) {
  return daySeoPages.find((page) => page.slug === slug);
}

export function getNeighborhoodSeoPage(slug: string) {
  return neighborhoodSeoPages.find((page) => page.slug === slug);
}

export function getGuidePost(slug: string) {
  return guidePosts.find((post) => post.slug === slug);
}
