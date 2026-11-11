import type { VenueListing } from "@/types";

export type VenueVisit = {
  by: string;
  visitedAt: string;
  note?: string;
};

export type VenueSalute = {
  label: string;
  note?: string;
  eventLabel?: string;
};

export type VenueSignalData = {
  visit?: VenueVisit;
  salute?: VenueSalute;
  singersSay?: string;
  madHatterSays?: { note: string; observedAt?: string };
};

const venueSignalsBySlug: Record<string, VenueSignalData> = {
  regal: {
    visit: { by: "MadHatter", visitedAt: "October 2026" },
    madHatterSays: {
      observedAt: "October 2026",
      note: "The pool table sits right in the middle of the action at The Regal, so unless you’ve claimed one of the few tables, you’re probably going to bump into somebody. Plenty of locals are happy to strike up a conversation, even if it starts with an ‘excuse me.’ The trickier part can be figuring out where you stand in the karaoke rotation. Updates aren’t always easy to come by, so don’t be shy about checking in with the host.",
    },
  },
  "cordova-bar": {
    visit: {
      by: "MadHatter",
      visitedAt: "July 2026",
      note: "Firsthand SingHUB visit documented during a Tuesday karaoke night.",
    },
    singersSay:
      "Welcoming crowd, strong sound, LED-lit room, Karafun QR sign-up, and useful parking across or down the street. Rotation can build later in the night.",
  },
  "redwing-bar-grill": {
    visit: {
      by: "MadHatter",
      visitedAt: "July 2026",
      note: "MadHatter has sung here recently.",
    },
    singersSay:
      "A North Park karaoke staple with regular singers, a lively room, and the kind of crowd that rewards committing to the song.",
  },
  "whiskey-girl": {
    salute: {
      label: "Live Band Karaoke",
      eventLabel: "Thursday night",
      note: "Awarded for giving singers the full live-band experience instead of a standard backing track.",
    },
  },
};

export function getVenueSignalData(venueOrSlug: VenueListing | string): VenueSignalData {
  const slug = typeof venueOrSlug === "string" ? venueOrSlug : venueOrSlug.slug;
  return venueSignalsBySlug[slug] ?? {};
}

export function isRadarVenue(venue: VenueListing) {
  return venue.listingStatus === "ai_scouted";
}

export function isVerifiedKaraokeVenue(venue: VenueListing) {
  return venue.listingStatus === "verified";
}

export function hasRecentSingHUBVisit(venue: VenueListing) {
  return Boolean(getVenueSignalData(venue).visit);
}

export function hasSingHUBSalute(venue: VenueListing) {
  return Boolean(getVenueSignalData(venue).salute);
}
