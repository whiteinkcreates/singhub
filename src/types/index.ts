export type ListingStatus = "verified" | "ai_scouted" | "claimed";

export type ProfileTier = "basic" | "premium";

export type VenueType = "live_bar" | "private_room" | "event_producer";

export type VenueListing = {
  id: string;
  venueName: string;
  slug: string;
  profileTier: ProfileTier;
  listingStatus: ListingStatus;
  venueType: VenueType;
  city: string;
  neighborhood: string;
  market: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  website?: string;
  instagram?: string;
  bannerImageUrl?: string;
  bannerImageAlt?: string;
  tickerText?: string;
  karaokeDay: string;
  startTime: string;
  endTime: string;
  hostName?: string;
  vibeTags: string[];
  description: string;
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
  isFeatured: boolean;
  featuredPriority?: number;
};

export type KaraokeEventListing = {
  eventId: string;
  venueId: string;
  venueName: string;
  venueSlug: string;
  karaokeDay: string;
  startTime: string;
  endTime: string;
  hostId?: string;
  hostName?: string;
  recurring: boolean;
  activeStatus: string;
  eventNotes?: string;
  eventConfidenceScore: number | null;
  reviewStatus?: string;
  generated: boolean;
  source1?: string;
  source2?: string;
  lastVerified?: string;
};

export type HostWeekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type HostGig = {
  venueName: string;
  time: string;
  neighborhood?: string;
  venueId?: string;
  raw: string;
};
