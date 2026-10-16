/** Early opening claims are separate from today's open status and karaoke start times. */
export const earlyOpeningVenues = {
  "pal-joeys": {
    time: "6 AM",
    source: "https://paljoeys.net/location",
    evidence: "Venue's official site lists 6 AM daily."
  },
  "norms": {
    time: "6 AM",
    source: "https://www.sandiegoreader.com/places/norms-cocktails/",
    evidence: "Published listing lists 6 AM daily; reconfirm periodically."
  }
} as const;

export function getEarlyOpening(slug: string) {
  return earlyOpeningVenues[slug as keyof typeof earlyOpeningVenues];
}
