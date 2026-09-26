import Link from "next/link";
import { getHotelGuidesByArea } from "@/lib/hotelGuides";

export const metadata = {
  title: "Hotel Guest Guides | SingHUB",
  description: "Preview SingHUB hotel-aware karaoke guest guides.",
  robots: { index: false, follow: true },
};

function Group({
  title,
  hotels,
}: {
  title: string;
  hotels: ReturnType<typeof getHotelGuidesByArea>;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-black text-white">{title}</h2>
      <div className="mt-4 divide-y divide-white/10 border-y border-white/10">
        {hotels.map((hotel) => (
          <Link
            key={hotel.slug}
            href={`/hotel/${hotel.slug}`}
            className="flex items-center justify-between gap-4 py-4 text-slate-200 transition hover:text-fuchsia-200"
          >
            <span>
              <strong className="block text-base">{hotel.name}</strong>
              <span className="mt-1 block text-xs text-slate-500">{hotel.address}</span>
            </span>
            <span className="text-xl text-amber-300">›</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function HotelGuideIndexPage() {
  const downtown = getHotelGuidesByArea("downtown");
  const laJolla = getHotelGuidesByArea("la-jolla");
  const laMesa = getHotelGuidesByArea("la-mesa");

  return (
    <main className="min-h-screen bg-[#06101e] px-5 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">
          Hotel guest guide previews
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">
          Karaoke around your stay.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
          Preview hotel-aware SingHUB pages using current venue and event data. These pages are outreach demos and do not imply a hotel partnership.
        </p>

        <Group title="Downtown / Gaslamp" hotels={downtown} />
        <Group title="La Jolla" hotels={laJolla} />
        <Group title="La Mesa / East County" hotels={laMesa} />
      </div>
    </main>
  );
}
