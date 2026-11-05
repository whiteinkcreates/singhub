import Link from "next/link";
import { getVenueListings } from "@/lib/venueData";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { VenueProfileExplorer } from "@/components/venue/VenueProfileExplorer";
import { HeroScrollCue } from "@/components/layout/HeroScrollCue";
import { PositionedImage } from "@/components/media/PositionedImage";
import { getHostMediaSettings } from "@/lib/hostMedia.server";
import { SITE_DISCOVERY_HERO_KEY, SITE_PARTNER_OFFERS_HERO_KEY } from "@/lib/hostMedia";
import "./premium.css";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "SingHUB for Venues | Free Listing vs. Partner",

  description: "Every venue can be found on SingHUB for free. Compare the free karaoke listing with SingHUB Partner's enhanced calendar, promotions, SingBOARD and real venue examples.",

  alternates: { canonical: "/venues/premium" },
};

const freeFeatures = [
  "A complete venue page with a hero image and Why Sing Here",
  "Verified karaoke nights, times and known KJs",
  "Address, directions, social links and searchable amenities",
  "SingHERE access to the venue or KJ signup process",
  "Normal discovery and community-submitted corrections",
];

const partnerFeatures = [
  "Everything in the free karaoke listing, including SingHERE",
  "Enhanced venue story, expanded photo gallery, room vibe and amenities",
  "Calendar for karaoke and additional venue events, when supplied and verified",
  "Food, drink, happy hour, specials and announcements on your venue profile",
  "Eligible events, flyers and promotions through SingBOARD",
  "Optional venue-controlled check-in offers after staff redemption testing",
  "Priority help with schedule, KJ, photo and information updates",
  "Direct feedback on venue promotional needs",
  "Engagement summaries as data becomes available and is validated",
];

const differences = [
  {title:"Venue hero, Why Sing Here and essential info", free:"Included", partner:"Included"},
  {title:"Karaoke schedule, KJ and SingHERE", free:"Included", partner:"Included"},
  {title:"Searchable amenities and directions", free:"Included", partner:"Included"},
  {title:"Expanded photo gallery and venue story", free:"Core profile", partner:"Enhanced presentation"},
  {title:"Additional events and fuller monthly calendar", free:"Regular karaoke schedule", partner:"Promotional event calendar"},
  {title:"SingBOARD flyers and venue announcements", free:"Community discovery", partner:"Partner promotions"},
  {title:"Specials, venue-led offers and promotion", free:"Core facts", partner:"Featured venue content"},
  {title:"Priority changes and engagement insights", free:"Standard corrections", partner:"Priority support; reporting as verified"},
];

const faqs = [
  {question:"What does $59 per month include?", answer:"Your enhanced profile and gallery, wider event calendar, specials, eligible SingBOARD posts, optional configured offers, priority updates and engagement insights where reporting is available and validated. The essential karaoke listing remains free."},
  {question:"Does a request start a subscription?", answer:"No. The inquiry is free and begins a personal review, not billing. We explain setup and terms before activating the $59/month standard Partner plan."},
  {question:"Do I have to discount drinks?", answer:"No. Offers are optional and controlled by the venue. Any offer requires agreed terms and an end-to-end staff redemption test."},
  {question:"Do I have to pay to be listed?", answer:"No. SingHUB keeps the useful karaoke information, a venue hero, Why Sing Here, amenities, and SingHERE available on the free listing. Partner adds promotional tools, not access to the microphone."},

  {question:"Can we see a real profile first?", answer:"Yes. Choose any enhanced or basic venue below and open its live public listing. Enhanced examples are not necessarily paid Partners."},
  {question:"How do we get started?", answer:"Review or correct your free listing first. If you want a richer presence, request a Partner conversation. Payment and recurring terms are presented separately for your approval."},

  {question:"Is more traffic or first place in search guaranteed?", answer:"No. Partner creates better ways to tell your story and promote your events. Placement opportunities and reporting depend on available SingHUB features; attendance and rankings are never guaranteed."},
];

export default async function PremiumVenuePage({ searchParams }: { searchParams: Promise<{ venue?: string | string[] }> }) {
  const params = await searchParams;
  const requestedVenue = typeof params.venue === "string" ? params.venue : Array.isArray(params.venue) ? params.venue[0] : undefined;
  const [configured, discovery] = await Promise.all([
    getHostMediaSettings(SITE_PARTNER_OFFERS_HERO_KEY).catch(() => null),
    getHostMediaSettings(SITE_DISCOVERY_HERO_KEY).catch(() => null),
  ]);
  const publicVenues = getPublicVenues(await getVenueListings()).filter(v => v.venueType === "live_bar").sort((a,b) => a.venueName.localeCompare(b.venueName)).map(v => ({ slug:v.slug, name:v.venueName, neighborhood:v.neighborhood, city:v.city, enhanced:v.profileTier === "premium" }));
  const hero = configured?.heroUrl ? configured : discovery?.heroUrl ? discovery : null;

  return (
    <main data-scroll-page="venue-offers" className="v2-venue-offers">
      <section data-page-hero="" className="venue-offers-hero" aria-labelledby="venue-offers-title">
        <PositionedImage
          className="venue-offers-photo"
          src={hero?.heroUrl || "/images/singhub-v2/singhub-city-discovery.webp"}
          alt={hero?.heroAlt || "The San Diego nightlife scene"}
          placement={hero?.heroPlacement}
          position={hero?.heroPosition}
        />
        <div className="venue-offers-photo-shade" aria-hidden="true" />
        <div data-hero-copy="" className="venue-offers-hero-copy">
          <p className="venue-offers-eyebrow">SINGHUB FOR VENUES</p>
          <h1 id="venue-offers-title">Your place has a personality. <span>Let people find it.</span></h1>
          <p>Your karaoke nights should be easy to find. Your food, events, specials and atmosphere deserve attention too. See what your venue already has and what a partnership could add.</p>
          <div className="venue-offers-hero-actions">
            <a href="#real-profiles" className="venue-offers-primary">See live profiles <span aria-hidden="true">↓</span></a>
            <Link href={requestedVenue ? `/claim-listing?premium=true&venue=${encodeURIComponent(requestedVenue)}` : "/claim-listing?premium=true"} className="venue-offers-secondary">Tell us about your place ↗</Link>
          </div>
        </div>
        <HeroScrollCue />
      </section>

      <div data-page-surface="" className="venue-offers-sheet">
        <section className="venue-offers-intro" aria-labelledby="difference-heading">
          <p className="venue-offers-eyebrow">GOOD FOR SINGERS. BETTER FOR YOUR VENUE.</p>
          <h2 id="difference-heading">A good listing starts the story. <span>A Partner profile tells more of it.</span></h2>
          <p>We keep the essentials free because accurate karaoke information helps everyone. Partner gives your team room to show the experience, highlight what happens beyond karaoke and keep the good stuff from getting buried.</p>
        </section>

        <section id="real-profiles" className="venue-offers-compare" aria-labelledby="real-profile-heading">
          <p className="venue-offers-eyebrow">EXPLORE REAL VENUES</p>
          <h2 id="real-profile-heading">See real venues. Get a feel for the difference.</h2>
          <p className="mb-5 max-w-3xl text-slate-300">Start with your venue or explore a few others. These are live listings, not mockups. Enhanced examples do not necessarily mean paid partnerships.</p>
          <VenueProfileExplorer venues={publicVenues} initialSlug={requestedVenue} />
        </section>

        <section className="venue-offers-journey" aria-labelledby="partner-process-heading">
          <p className="venue-offers-eyebrow">NO BIG PITCH. JUST A BETTER WAY TO SHOW UP.</p>
          <h2 id="partner-process-heading">Here&apos;s how we work together.</h2>
          <div className="venue-offers-journey-grid">
            <article><span>01</span><h3>Take a look</h3><p>Find your listing and let us know if something needs correcting. That&apos;s free, whether you partner or not.</p></article>
            <article><span>02</span><h3>Show us your place</h3><p>Tell us about your nights, your crowd and what makes the room worth visiting. Photos and flyers can come later.</p></article>
            <article><span>03</span><h3>Decide what fits</h3><p>We&apos;ll show you the options. If you want to partner, you review the details before any payment.</p></article>
          </div>
          <div className="venue-offers-gentle-cta"><div><strong>Know what you want to improve?</strong><p>Send us a few details and we&apos;ll take it from there.</p></div><Link href="/claim-listing?premium=true" className="venue-offers-button venue-offers-solid">Start a conversation ↗</Link></div>
        </section>
        <section id="venue-plans" className="venue-offers-plans" aria-label="Venue offers">
          <article className="venue-offers-plan venue-offers-free">
            <p className="venue-offers-plan-kicker">01 / EVERY VENUE</p>
            <h3>Free Listing</h3>
            <p className="venue-offers-price">$0 <span>/ always</span></p>
            <p className="venue-offers-plan-lede">A useful, complete karaoke presence. No paywall on essential venue information.</p>
            <ul>{freeFeatures.map(feature => <li key={feature}>{feature}</li>)}</ul>
            <Link className="venue-offers-button venue-offers-outline" href="/claim-listing">Claim or update your listing ↗</Link>
          </article>

          <article className="venue-offers-plan venue-offers-partner">
            <div className="venue-offers-partner-top">
              <p className="venue-offers-plan-kicker">02 / MORE THAN THE MIC</p>
              <span className="venue-offers-partner-marker">SINGHUB PARTNER</span>
            </div>
            <h3>SingHUB Partner</h3>
            <p className="venue-offers-price">$59 <span>/ month, standard rate</span></p>
            <p className="venue-offers-plan-lede">A promotional home for the whole venue, from your karaoke night to the other reasons people keep coming back.</p>
            <ul>{partnerFeatures.map(feature => <li key={feature}>{feature}</li>)}</ul>

            <div className="venue-offers-founding"><p className="venue-offers-eyebrow">EARLY COLLABORATORS</p><p>Some venues are helping us test profile content and offers before making a commercial decision. Founding arrangements are discussed privately, never implied by an enhanced example.</p></div>
            <Link className="venue-offers-button venue-offers-solid" href="/claim-listing?premium=true">Request a Partner review ↗</Link>

          </article>
        </section>

        <section className="venue-offers-compare" aria-labelledby="venue-compare-title">
          <p className="venue-offers-eyebrow">THE DETAILS, IF YOU WANT THEM</p>
          <h2 id="venue-compare-title">What comes with a partnership?</h2>
          <div className="venue-offers-comparison" role="table" aria-label="Free and Partner venue feature comparison">
            <div className="venue-offers-compare-row venue-offers-compare-head" role="row"><span role="columnheader">Capability</span><span role="columnheader">Free listing</span><span role="columnheader">Partner</span></div>
            {differences.map(row => <div className="venue-offers-compare-row" role="row" key={row.title}><strong role="cell">{row.title}</strong><span role="cell" data-plan="Free">{row.free}</span><span role="cell" data-plan="Partner">{row.partner}</span></div>)}
          </div>
        </section>

        <section className="venue-offers-how" aria-labelledby="venue-how-heading">
          <p className="venue-offers-eyebrow">THE VALUE TO YOUR TEAM</p>
          <h2 id="venue-how-heading">One place to show what&apos;s happening.</h2>
          <div className="venue-offers-story-grid">
            <article><span>01</span><h3>Keep karaoke easy to find</h3><p>Confirmed nights, hosts and SingHERE stay useful whether your venue is free or Partner.</p></article>
            <article><span>02</span><h3>Bring the whole calendar</h3><p>Partners can present more of the venue&apos;s events, ongoing specials and announcements in a richer monthly experience.</p></article>
            <article><span>03</span><h3>Give promotions somewhere to live</h3><p>Qualifying posts can reach SingBOARD and your enhanced profile, not just vanish after a story expires.</p></article>
          </div>
          <p className="venue-offers-qualification">Event publishing, promotional opportunities, Partner Offers and engagement reporting are subject to feature availability and verification. SingHUB does not promise attendance or specific search rankings.</p>
        </section>

        <section className="venue-offers-faq" aria-labelledby="venue-questions-title">
          <p className="venue-offers-eyebrow">GOOD QUESTIONS</p>
          <h2 id="venue-questions-title">Before you put us on the calendar.</h2>
          <div className="venue-offers-faq-grid">{faqs.map(faq => <article key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p></article>)}</div>
        </section>

        <section className="venue-offers-end" aria-labelledby="venue-offers-end-title">
          <p className="venue-offers-eyebrow">WE&apos;D LOVE TO HEAR ABOUT YOUR ROOM</p>
          <h2 id="venue-offers-end-title">Show us what makes your place <span>your place.</span></h2>
          <p>You don&apos;t need perfect photos, a marketing plan or an afternoon of paperwork. A few details will get the conversation started. We can handle the rest together.</p>
          <div className="venue-offers-end-actions">
            <Link href="/claim-listing?premium=true" className="venue-offers-button venue-offers-solid">Tell us about your venue ↗</Link>
            <Link href={requestedVenue ? `/claim-listing?venue=${encodeURIComponent(requestedVenue)}` : "/claim-listing"} className="venue-offers-button venue-offers-outline">Update a free listing ↗</Link>
          </div>
          <p className="mt-5 text-sm text-slate-300">We review Partner terms with you before enrollment or billing. Read our <Link className="underline" href="/privacy">Privacy Policy</Link>. Payment is never required to request a listing correction.</p>
        </section>
      </div>
    </main>
  );
}
