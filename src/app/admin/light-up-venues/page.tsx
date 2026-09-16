import Image from "next/image";
import { VenueLightUpBuilder } from "@/components/admin/VenueLightUpBuilder";
import { getPersistedVenueEnhancement } from "@/lib/venueEnhancements.server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Light Up Venues | SingHUB Admin",
  description: "Build structured SingHUB enhanced venue profiles.",
  robots: { index: false, follow: false },
};

export default async function LightUpVenuesPage() {
  const barlando = await getPersistedVenueEnhancement("barlando");

  if (!barlando) {
    throw new Error("BarLando seed profile is missing.");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 text-white">
      <section className="max-w-4xl">
        <Image
          src="/images/header-singhub-logo.png"
          alt="SingHUB"
          width={2400}
          height={600}
          className="h-auto w-44 object-contain object-left"
          priority
        />
        <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Venue partnerships</p>
        <h1 className="mt-2 text-4xl font-black md:text-6xl">Light Up a Venue</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          Build and save the content that turns an indexed venue into a richer SingHUB profile. Media lives in Cloudinary, venue facts are explicitly selected here, and singer feedback stays separate.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-slate-300">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">Hero + gallery</span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">Weekly specials</span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">Daily deals</span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">Good to Know</span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">Menu + phone</span>
        </div>
      </section>

      <section className="mt-8">
        <VenueLightUpBuilder initialSlug="barlando" initialProfile={barlando} />
      </section>
    </main>
  );
}
