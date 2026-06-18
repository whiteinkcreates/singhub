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

export type ScoutReviewStatus =
  | "new"
  | "needs_review"
  | "needs_ig_review"
  | "needs_call"
  | "likely_active"
  | "confirmed"
  | "false_positive"
  | "stale"
  | "premium_prospect"
  | "basic_listing_approved";

export type ScoutConfidenceLevel = "low" | "medium" | "high" | "verified";

export type ScoutCandidate = {
  candidateId: string;
  venueName: string;
  possibleCity?: string;
  possibleNeighborhood?: string;
  possibleAddress?: string;
  claimedKaraokeDay?: string;
  claimedKaraokeTime?: string;
  hostKjName?: string;
  sourceUrl?: string;
  sourceType?: string;
  evidenceSnippet?: string;
  confidenceScore: number | null;
  confidenceLevel: ScoutConfidenceLevel;
  reviewStatus: ScoutReviewStatus;
  scoutNotes?: string;
  duplicateOf?: string;
  instagramHandle?: string;
  facebookUrl?: string;
  venueWebsite?: string;
  phone?: string;
  email?: string;
  premiumProspect: boolean;
};
