import Link from "next/link";
import { VenueLightUpBuilder } from "@/components/admin/VenueLightUpBuilder";
import { VenueBulkEditor } from "@/components/admin/VenueBulkEditor";
import { getPersistedVenueEnhancement } from "@/lib/venueEnhancements.server";
import { requireAdminAuthorization } from "@/lib/adminAuthorization";
import { SITE_WORDMARK_SRC } from "@/lib/siteWordmark";
import { getVenueListings } from "@/lib/venueData";
import type { VenueEnhancement } from "@/lib/venueEnhancements";

export const dynamic = "force-dynamic";
export const metadata = { title: "Venue Profiles + Intelligence | SingHUB Admin", description: "Manage venue presentation, discovery intelligence, hotel context, and Partner features.", robots: { index: false, follow: false } };

export default async function LightUpVenuesPage({ searchParams }: { searchParams: Promise<{ venue?: string }> }) {
  await requireAdminAuthorization();
  const venues = await getVenueListings();
  const venueOptions = venues.map(v => ({ slug: v.slug, name: v.venueName,
    neighborhood: v.neighborhood, city: v.city, address: v.address,
    profileTier: v.profileTier, isFeatured: v.isFeatured,
    featuredPriority: v.featuredPriority })).sort((a,b) => a.name.localeCompare(b.name));
  const params = await searchParams;
  const requestedSlug = typeof params.venue === "string" ? params.venue : "";
  const initialSlug = venueOptions.some(v => v.slug === requestedSlug)
    ? requestedSlug : venueOptions.some(v => v.slug === "barlando") ? "barlando" : venueOptions[0]?.slug;
  const initialVenue = venueOptions.find(v => v.slug === initialSlug);
  if (!initialSlug || !initialVenue) {
    return <main className="mx-auto max-w-6xl px-4 py-10 text-white">
      <h1 className="text-4xl font-black">Venue Profiles</h1>
      <p className="mt-4 text-slate-300">No venues are currently available in the canonical Venue Index.</p>
      <Link href="/admin" className="mt-5 block text-cyan-200">← Admin Tools</Link>
    </main>;
  }
  const saved = await getPersistedVenueEnhancement(initialSlug);
  const initialProfile: VenueEnhancement = saved || {
    enabled: false, featured: initialVenue.isFeatured,
    featuredPriority: initialVenue.featuredPriority,
    gallery: [], amenities: [], weeklySpecials: [], dailyDeals: [],
  };
  return <main className="mx-auto max-w-7xl px-4 py-10 text-white">
    <section className="max-w-4xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={SITE_WORDMARK_SRC} alt="SingHUB" width={400} height={171} className="h-auto w-44 object-contain object-left" />
      <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Venue partnerships</p>
      <h1 className="mt-2 text-4xl font-black md:text-6xl">Venue Profile + Intelligence</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
        Manage venue facts and editorial intelligence for discovery and hotel guest guides.
        Partner remains a separate switch for galleries, specials, deals, and expanded tools.
      </p>
      <nav className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
        <Link href="/admin" className="rounded-full border border-white/15 px-4 py-2 text-slate-200">← Admin Tools</Link>
        <Link href="/admin/venue-activity" className="rounded-full border border-cyan-300/30 px-4 py-2 text-cyan-200">Venue Activity →</Link>
        <a href="#bulk-editor" className="rounded-full border border-fuchsia-300/30 px-4 py-2 text-fuchsia-200">Bulk edits ↓</a>
      </nav>
    </section>
    <section className="mt-8">
      <VenueLightUpBuilder initialSlug={initialSlug} initialProfile={initialProfile} venues={venueOptions} />
    </section>
    <div id="bulk-editor">
      <VenueBulkEditor venues={venueOptions} />
    </div>
  </main>;
}
