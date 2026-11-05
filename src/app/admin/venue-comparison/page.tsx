import { getVenueListings } from "@/lib/venueData";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { VenueSalesKit } from "@/components/admin/VenueSalesKit";

export const dynamic = "force-dynamic";
export const metadata = { title: "Venue Sales Kit | SingHUB Admin", robots: { index: false, follow: false } };

export default async function VenueSalesPage() {
  const venues = getPublicVenues(await getVenueListings())
    .filter(v => v.venueType === "live_bar")
    .sort((a,b) => a.venueName.localeCompare(b.venueName))
    .map(v => ({slug:v.slug, name:v.venueName, neighborhood:v.neighborhood, city:v.city, enhanced:v.profileTier === "premium"}));
  return <main className="mx-auto max-w-6xl px-4 py-12 text-white">
    <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-200">SingHUB / Venue Partnerships</p>
    <h1 className="mt-3 text-4xl font-black md:text-6xl">Venue Sales Kit</h1>
    <p className="mt-4 max-w-3xl text-slate-300">One place to select a real venue, share the For Venues page, prepare a personal message and track the steps of an in-person conversation. Replaces the old simulated sales comparison.</p>
    <VenueSalesKit venues={venues}/>
  </main>;
}
