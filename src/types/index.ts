export type ListingStatus = "verified" | "ai_scouted" | "claimed";

export type ProfileTier = "basic" | "premium";

export type VenueListing = {
  id: string;
  venueName: string;
  slug: string;
  profileTier: ProfileTier;
  listingStatus: ListingStatus;
  city: string;
  neighborhood: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  website?: string;
  instagram?: string;
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
};

export type KaraokeEventListing = {
  eventId: string;
  venueId: string;
  venueName: string;
  venueSlug: string;
  karaokeDay: string;
  startTime: string;
  endTime: string;
  hostName?: string;
  recurring: boolean;
  activeStatus: string;
  eventNotes?: string;
  eventConfidenceScore: number | null;
  reviewStatus?: string;
};
