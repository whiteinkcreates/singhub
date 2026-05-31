export type ListingStatus = "verified" | "ai_scouted" | "claimed";

export type ProfileTier = "basic" | "premium";

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type Venue = {
  id: string;
  name: string;
  slug: string;
  profileTier: ProfileTier;
  listingStatus: ListingStatus;
  city: string;
  neighborhood: string;
  address: string;
  website?: string;
  instagram?: string;
  description: string;
  heroImage?: string;
  logo?: string;
  vibeTags: string[];
  specials?: string;
  happyHour?: string;
  foodHighlights?: string;
  drinkHighlights?: string;
  parkingInfo?: string;
  agePolicy?: string;
  accessibilityNotes?: string;
  coverCharge?: string;
  reservationLink?: string;
  bookingContact?: string;
  isFeatured?: boolean;
};

export type Host = {
  id: string;
  name: string;
  stageName?: string;
  instagram?: string;
  website?: string;
  tipUrl?: string;
  verified: boolean;
};

export type KaraokeEvent = {
  id: string;
  venueId: string;
  hostId?: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  recurring: boolean;
  notes?: string;
  activeStatus: "active" | "inactive";
};