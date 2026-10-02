import Link from "next/link";
import { getHotelGuidesByArea } from "@/lib/hotelGuides";

export const metadata = {
  title: "Hotel Guest Guides | SingHUB",
  description: "SingHUB hotel-aware karaoke guest guides.",
  robots: { index: false, follow: true },
};

function Group({
  eyebrow,
  title,
  hotels,
}: {
  eyebrow: string;
  title: string;
  hotels: ReturnType<typeof getHotelGuidesByArea>;
}) {
  return (
    <section className="hotel-index-group">
      <header className="hotel-index-group-head">
        <div>
          <p>{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <span>{hotels.length} {hotels.length === 1 ? "hotel" : "hotels"}</span>
      </header>
      <div className="hotel-index-list">
        {hotels.map((hotel) => (
          <Link key={hotel.slug} href={`/hotelexperience/${hotel.slug}`} target="_blank" rel="noopener noreferrer" className="hotel-index-row">
            <span>
              <strong>{hotel.name}</strong>
              <small>{hotel.address}</small>
            </span>
            <b aria-hidden="true">↗</b>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function HotelGuideIndexPage() {
  const downtown = getHotelGuidesByArea("downtown");
  const beach = getHotelGuidesByArea("beach");
  const laJolla = getHotelGuidesByArea("la-jolla");
  const laMesa = getHotelGuidesByArea("la-mesa");

  return (
    <div className="hotel-index-v2">
      <header className="hotel-index-appbar">
        <Link href="/" aria-label="SingHUB home">
          <img src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" />
        </Link>
        <nav aria-label="Primary">
          <Link href="/">Discover</Link>
          <Link href="/find-karaoke">Venues</Link>
          <Link href="/hosts">Hosts</Link>
          <Link className="active" href="/hotel">Hotels</Link>
          <Link href="/singboard">SingBOARD</Link>
        </nav>
        <Link className="hotel-index-account" href="/account">My SingHUB <i>◎</i></Link>
      </header>

      <main>
        <section className="hotel-index-hero" aria-labelledby="hotel-index-title">
          <img src="/images/singhub-v2/hotels-index-band-luggage-cart.jpg" alt="" aria-hidden="true" />
          <div className="hotel-index-hero-inner">
            <div className="hotel-index-hero-copy">
              <p className="hotel-index-eyebrow">SINGHUB HOTELS</p>
              <h1 id="hotel-index-title">Check in. Find your mic.</h1>
              <p className="hotel-index-deck">
                Hotel-aware karaoke guides built around where you are staying, so the city feels local before you leave the lobby.
              </p>
            </div>
          </div>
        </section>

        <section className="hotel-index-shell">
          <div className="hotel-index-intro">
            <div>
              <p className="hotel-index-eyebrow">LOCAL NIGHTLIFE, FROM YOUR LOBBY</p>
              <h2>Your stay is the starting point.</h2>
            </div>
            <p>
              Explore current SingHUB hotel experiences by neighborhood. Each guide organizes verified karaoke around the property with tonight, this week, walkable options, quick rides, and local standouts.
            </p>
          </div>

          <div className="hotel-index-groups">
            <Group eyebrow="CITY CENTER" title="Downtown / Gaslamp" hotels={downtown} />
            <Group eyebrow="COAST" title="Pacific Beach / Mission Beach" hotels={beach} />
            <Group eyebrow="COASTAL VILLAGE" title="La Jolla" hotels={laJolla} />
            <Group eyebrow="EAST COUNTY" title="La Mesa" hotels={laMesa} />
          </div>

          <p className="hotel-index-note">
            These hotel experiences are product previews unless a property is identified as a SingHUB partner.
          </p>
        </section>
      </main>

      <nav className="hotel-index-mobile-nav" aria-label="Mobile navigation">
        <Link href="/"><b>⌕</b>Discover</Link>
        <Link href="/find-karaoke"><b>●</b>Venues</Link>
        <Link href="/hosts"><b>♪</b>Hosts</Link>
        <Link className="active" href="/hotel"><b>▣</b>Hotels</Link>
        <Link href="/account"><b>◎</b>My SingHUB</Link>
      </nav>
    </div>
  );
}
