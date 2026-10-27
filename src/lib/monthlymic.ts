// Publish a venue/date only after explicit venue and KJ confirmation.
export const monthlyMic = {
  id: "monthlymic-001",
  title: "SingHUB MonthlyMic #001",
  venue: "The Mesa" as string | null,
  date: "2026-11-18" as string | null,
  startTime: "6:30 PM" as string | null,
  neighborhood: "College Area, San Diego",
  heroUrl: "/images/og/singhub-og.png",
  gallery: [] as {url:string;alt:string;credit?:string}[],
  rsvpOpen: true,
  justDuet: true,
  shirtPrice: 25,
  shirtRegularPrice: 31
};
