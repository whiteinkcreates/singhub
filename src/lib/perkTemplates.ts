// Admin-only starting points; never enable an offer or enforce eligibility automatically.
export type PerkTemplate={name:string;category:"Mic"|"Venue";description:string;guidance:string;detail?:string;terms?:string};
export const PERK_TEMPLATES:readonly PerkTemplate[] = [
  {
    "name": "The 2 for 2",
    "category": "Mic",
    "description": "Sing two songs back-to-back on your second turn in the rotation.",
    "guidance": "Agree with the KJ first. Limit to light rotations and one per singer per night. Check-in does not verify rotation position.",
    "detail": "Sing two songs back-to-back on your second turn in the rotation.",
    "terms": "Subject to KJ approval and rotation size. One per singer per night."
  },
  {
    "name": "The Opening Act",
    "category": "Venue",
    "description": "Reward early arrival with a food or other venue perk before karaoke starts.",
    "guidance": "Specify qualifying purchase, reward and cutoff. Staff must verify time."
  },
  {
    "name": "Mic & a Bite",
    "category": "Venue",
    "description": "Offer a complimentary side or appetizer with a qualifying food purchase.",
    "guidance": "Specify eligible items, minimum purchase and exclusions."
  },
  {
    "name": "Bring the Band",
    "category": "Venue",
    "description": "Give groups a reward for a qualifying group purchase.",
    "guidance": "Specify group size, purchase threshold and per-group limit."
  },
  {
    "name": "The Encore",
    "category": "Venue",
    "description": "Reward an additional qualifying purchase during the same visit.",
    "guidance": "Specify qualifying purchases and reward. Staff verifies the additional purchase."
  },
  {
    "name": "The Comeback",
    "category": "Venue",
    "description": "Encourage a return visit on another designated night.",
    "guidance": "Specify return date or window and reward. Prior visits must be verified manually."
  },
  {
    "name": "Soundcheck",
    "category": "Mic",
    "description": "Offer a bonus song before the regular rotation begins, with KJ approval.",
    "guidance": "Agree with the KJ, specify time and capacity. Do not displace the regular rotation."
  },
  {
    "name": "Backstage Pass",
    "category": "Venue",
    "description": "Offer complimentary pool, darts or another venue amenity.",
    "guidance": "Specify amenity, qualifying purchase if any, and availability."
  },
  {
    "name": "First Mic",
    "category": "Venue",
    "description": "Welcome a first-time visitor with a venue-selected benefit.",
    "guidance": "Specify benefit and eligibility; first-time status requires manual verification."
  },
  {
    "name": "The Regular",
    "category": "Venue",
    "description": "Reward repeat qualifying visits.",
    "guidance": "Specify required visits and reward. Visit milestones require manual verification."
  },
  {
    "name": "Crew Pass",
    "category": "Venue",
    "description": "Offer reserved seating or a group experience.",
    "guidance": "Specify group size, availability, reservation process and any purchase requirement."
  },
  {
    "name": "SingHUB Special",
    "category": "Venue",
    "description": "Offer an exclusive menu item or combination available through SingHUB.",
    "guidance": "Specify items, price and eligible times."
  }
];
