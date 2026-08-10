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
  hostId?: string;
  hostName?: string;
  recurring: boolean;
  activeStatus: string;
  eventNotes?: string;
  eventConfidenceScore: number | null;
  reviewStatus?: string;
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

export type HostProfileCompletionLevel = "basic" | "enhanced" | "incomplete";

export type HostProfile = {
  status: string;
  hostId: string;
  slug: string;
  hostName: string;
  publicDisplayName: string;
  profileImageUrl?: string;
  logoUrl?: string;
  instagramUrl?: string;
  instagramHandle?: string;
  tiktokUrl?: string;
  websiteUrl?: string;
  tipLink?: string;
  bookingLink?: string;
  bio?: string;
  vibeTags: string[];
  primaryAreas: string[];
  schedule: Record<HostWeekday, HostGig[]>;
  privateEvents?: string;
  featured: boolean;
  notes?: string;
  lastUpdated?: string;
  verificationStatus?: string;
  source?: string;
  formResponseTimestamp?: string;
  contactEmail?: string;
  tagRepostPermission?: string;
  weeklyStatus?: string;
  favoriteKaraokeSpots?: string;
  profileCompletionLevel: HostProfileCompletionLevel;
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
