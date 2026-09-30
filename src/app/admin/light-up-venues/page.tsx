import { VenueLightUpBuilder } from "@/components/admin/VenueLightUpBuilder";
import { getPersistedVenueEnhancement } from "@/lib/venueEnhancements.server";
import { SITE_WORDMARK_SRC } from "@/lib/siteWordmark";
import { getVenueListings } from "@/lib/venueData";

export const dynamic = "force-dynamic";
export const metadata = { title: "Venue Partners | SingHUB Admin", description: "Manage base venue presentation and SingHUB Partner features.", robots: { index: false, follow: false } };

export default async function LightUpVenuesPage() {
  const [barlando,venues]=await Promise.all([getPersistedVenueEnhancement("barlando"),getVenueListings()]);
  if(!barlando) throw new Error("BarLando seed profile is missing.");
  const venueOptions=venues.map(v=>({slug:v.slug,name:v.venueName,neighborhood:v.neighborhood,city:v.city,address:v.address,profileTier:v.profileTier,isFeatured:v.isFeatured,featuredPriority:v.featuredPriority})).sort((a,b)=>a.name.localeCompare(b.name));
  return <main className="mx-auto max-w-7xl px-4 py-10 text-white">
    <section className="max-w-4xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}<img src={SITE_WORDMARK_SRC} alt="SingHUB" width={400} height={171} className="h-auto w-44 object-contain object-left"/>
      <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Venue partnerships</p>
      <h1 className="mt-2 text-4xl font-black md:text-6xl">Venue Profile + Partner Controls</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">Every venue gets a complete base profile with a hero image and Why Sing Here. Turn Partner on only for promotional modules such as galleries, specials, deals and expanded venue tools.</p>
    </section>
    <section className="mt-8"><VenueLightUpBuilder initialSlug="barlando" initialProfile={barlando} venues={venueOptions}/></section>
  </main>;
}
