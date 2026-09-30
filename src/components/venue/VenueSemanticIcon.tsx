type IconName =
  | "food"
  | "cocktail"
  | "beer"
  | "sun"
  | "groups"
  | "age21"
  | "allAges"
  | "parking"
  | "reservation"
  | "privateRoom"
  | "pool"
  | "games"
  | "dance"
  | "lateFood"
  | "bbq"
  | "jukebox"
  | "drinkSpecial"
  | "karaoke"
  | "trivia"
  | "football"
  | "supportive"
  | "singalong"
  | "sound"
  | "rotation"
  | "crowded"
  | "improved"
  | "firstTimer"
  | "energy";

const LABEL_ICON_MAP: Record<string, IconName> = {
  "Food available": "food",
  "Full bar": "cocktail",
  "Beer & wine": "beer",
  "Outdoor seating": "sun",
  "Good for groups": "groups",
  "21+": "age21",
  "All ages": "allAges",
  "Free parking": "parking",
  "Street parking": "parking",
  "Reservations available": "reservation",
  "Private rooms": "privateRoom",
  "Pool tables": "pool",
  "Pool table": "pool",
  "Bar games": "games",
  "Dance floor": "dance",
  "Patio": "sun",
  "Game night": "games",
  "Late night food": "lateFood",
  "BBQ": "bbq",
  "Jukebox": "jukebox",
  "Drink specials": "drinkSpecial",
  "Karaoke Mondays & Wednesdays": "karaoke",
  "Trivia Thursdays": "trivia",
  "Football on TV": "football",
};

const VIBE_ICON_MAP: Record<string, IconName> = {
  "singers-supportive": "supportive",
  "big-singalongs": "singalong",
  "sound-strong": "sound",
  "rotation-quick": "rotation",
  "crowded-room": "crowded",
  "setup-improved": "improved",
  "first-timers": "firstTimer",
  "energy-high": "energy",
};

export function venueFactIconName(label: string) {
  return LABEL_ICON_MAP[label];
}

export function venueVibeIconName(slug: string) {
  return VIBE_ICON_MAP[slug];
}

export function VenueSemanticIcon({
  name,
  className = "h-4 w-4",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      {name === "food" && <><path {...common} d="M5 3v8M8 3v8M5 7h3M6.5 11v10M16 3v18M16 3c3 2 3 7 0 9" /></>}
      {name === "cocktail" && <><path {...common} d="M4 4h16l-6 7v7M10 21h8M9 11h6" /></>}
      {name === "beer" && <><path {...common} d="M6 5h9v14H6zM15 8h2.5a2.5 2.5 0 0 1 0 5H15M8 3h5M9 8v7" /></>}
      {name === "sun" && <><circle {...common} cx="12" cy="12" r="3.5" /><path {...common} d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" /></>}
      {name === "groups" && <><circle {...common} cx="9" cy="8" r="3" /><circle {...common} cx="16.5" cy="9" r="2.5" /><path {...common} d="M3.5 19c.7-4 3-6 5.5-6s4.8 2 5.5 6M14 14c2.7-.2 4.9 1.6 5.5 5" /></>}
      {name === "age21" && <><circle {...common} cx="12" cy="12" r="9" /><path {...common} d="M7.5 10c.3-1.7 1.4-2.7 3-2.7 1.8 0 3 1 3 2.5 0 1.3-.8 2-2.2 2.9L8 15h6M17 8v7M15.5 10h3" /></>}
      {name === "allAges" && <><circle {...common} cx="8" cy="8" r="2.5" /><circle {...common} cx="16" cy="8" r="2.5" /><path {...common} d="M3.5 19c.5-3.5 2.3-5.5 4.5-5.5s4 2 4.5 5.5M11.5 19c.5-3.5 2.3-5.5 4.5-5.5s4 2 4.5 5.5" /></>}
      {name === "parking" && <><rect {...common} x="5" y="3" width="14" height="18" rx="2" /><path {...common} d="M9 17V7h3.5a3 3 0 0 1 0 6H9" /></>}
      {name === "reservation" && <><rect {...common} x="4" y="5" width="16" height="15" rx="2" /><path {...common} d="M8 3v4M16 3v4M7 11h10M9 15l2 2 4-4" /></>}
      {name === "privateRoom" && <><path {...common} d="M4 21V5l8-2 8 2v16M9 21V9h6v12M12 14h.01" /></>}
      {name === "pool" && <><circle {...common} cx="8" cy="8" r="4" /><circle {...common} cx="16" cy="16" r="4" /><path {...common} d="M10.8 10.8l2.4 2.4M18.5 5.5l-13 13" /></>}
      {name === "games" && <><path {...common} d="M7 9h10l3 8a2 2 0 0 1-3.2 2.2L14 17h-4l-2.8 2.2A2 2 0 0 1 4 17l3-8zM9 12v4M7 14h4M16 13h.01M18 15h.01" /></>}
      {name === "dance" && <><path {...common} d="M13 4v11.5a3 3 0 1 1-2-2.8V7l7-2v8.5a3 3 0 1 1-2-2.8V3z" /></>}
      {name === "lateFood" && <><path {...common} d="M18 16.5A7 7 0 0 1 8.5 7 7.5 7.5 0 1 0 18 16.5zM4 19h16" /></>}
      {name === "bbq" && <><path {...common} d="M5 10h14M7 10a5 5 0 0 0 10 0M9 15l-2 6M15 15l2 6M8 6c0-1.3 1-2 1-3M12 6c0-1.3 1-2 1-3M16 6c0-1.3 1-2 1-3" /></>}
      {name === "jukebox" && <><path {...common} d="M6 21V9a6 6 0 0 1 12 0v12z" /><circle {...common} cx="12" cy="9" r="3" /><path {...common} d="M9 15h6M9 18h2M13 18h2" /></>}
      {name === "drinkSpecial" && <><path {...common} d="M5 4h10l-4 7v8M8 21h6M15 7h4M17 5v4" /></>}
      {name === "karaoke" && <><path {...common} d="M9 14l-4 4M11 12l-5 5M14 3a5 5 0 1 1-7 7l4-4a5 5 0 0 1 7 7l-4 4M13 7l4 4" /></>}
      {name === "trivia" && <><circle {...common} cx="12" cy="12" r="9" /><path {...common} d="M9.5 9a2.7 2.7 0 1 1 4.3 2.2c-1.2.8-1.8 1.3-1.8 2.8M12 17h.01" /></>}
      {name === "football" && <><path {...common} d="M4 14c3-6 8-9 16-8-1 8-4 13-10 16-4-1-6-4-6-8zM9 14l6-4M10.5 11.5l2 2M12.5 9.5l2 2" /></>}
      {name === "supportive" && <><path {...common} d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.7-7 10-7 10zM8 16l2-2 2 2 4-4" /></>}
      {name === "singalong" && <><path {...common} d="M6 18a3 3 0 1 1 2-2.8V7l9-2v8.2a3 3 0 1 1 2-2.8V3L8 5.5" /></>}
      {name === "sound" && <><path {...common} d="M4 10h4l5-4v12l-5-4H4zM16 9c1 1 1 5 0 6M19 7c2 2 2 8 0 10" /></>}
      {name === "rotation" && <><path {...common} d="M7 7h9l-2.5-2.5M17 17H8l2.5 2.5M18 7a7 7 0 0 1 1 9M6 17a7 7 0 0 1-1-9" /></>}
      {name === "crowded" && <><circle {...common} cx="12" cy="7" r="2.5" /><circle {...common} cx="6.5" cy="9" r="2" /><circle {...common} cx="17.5" cy="9" r="2" /><path {...common} d="M7 19c.3-4 2-6 5-6s4.7 2 5 6M2.5 18c.2-3 1.5-4.5 3.5-4.5M21.5 18c-.2-3-1.5-4.5-3.5-4.5" /></>}
      {name === "improved" && <><path {...common} d="M5 16l4-4 3 3 7-8M14 7h5v5" /></>}
      {name === "firstTimer" && <><path {...common} d="M12 3l2.2 4.6L19 8.3l-3.5 3.4.8 4.8L12 14.2 7.7 16.5l.8-4.8L5 8.3l4.8-.7zM5 21h14" /></>}
      {name === "energy" && <path {...common} d="M13 2L5 13h6l-1 9 8-11h-6z" />}
    </svg>
  );
}
