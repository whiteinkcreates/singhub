import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVenueListings } from "@/lib/venueData";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { isUuid } from "@/lib/achievements/auth.server";
import { SITE_WORDMARK_SRC } from "@/lib/siteWordmark";
import { CommunityNominationForm } from "@/components/achievements/CommunityNominationForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nominate a Singer | SingHUB", robots: {index:false,follow:false} };
export default async function NominateSingerPage({ params }: { params: Promise<{token:string}> }) {
  const {token} = await params;
  if (!isUuid(token)) notFound();
  const db = createAdminClient();
  const {data,error}=await db.from("singer_profiles")
    .select("karaoke_alias").eq("nomination_token",token).maybeSingle();
  if (error) throw error;
  const alias = data?.karaoke_alias?.trim();
  if (!alias) notFound();
  const venues = getPublicVenues(await getVenueListings())
    .map(venue=>({slug:venue.slug,name:venue.venueName,neighborhood:venue.neighborhood||venue.city}))
    .sort((a,b)=>a.name.localeCompare(b.name));
  return <main className="min-h-screen bg-[#070a13] px-4 py-10 text-white">
    <div className="mx-auto max-w-2xl">
      <Link href="/" className="inline-block" aria-label="SingHUB home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SITE_WORDMARK_SRC} alt="SingHUB" width={270} height={100} className="h-auto w-52 object-contain"/>
      </Link>
      <p className="mt-10 text-xs font-black uppercase tracking-[.23em] text-fuchsia-300">SingHUB community recognition</p>
      <h1 className="mt-3 text-4xl font-black">Nominate {alias}</h1>
      <p className="mt-3 text-base leading-7 text-slate-300">
        Did {alias} lead an unforgettable sing-along, or cheer everybody on from the audience?
        This is their personal nomination page. Show some love and help them earn a real SingHUB patch.
      </p>
      <CommunityNominationForm token={token} alias={alias} venues={venues}/>
      <Link href="/" className="mt-7 inline-block text-sm font-bold text-cyan-200">← Find more karaoke on SingHUB</Link>
    </div>
  </main>;
}
