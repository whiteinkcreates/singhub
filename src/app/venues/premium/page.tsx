import Link from "next/link";
import { HeroScrollCue } from "@/components/layout/HeroScrollCue";
import { PositionedImage } from "@/components/media/PositionedImage";
import { getHostMediaSettings } from "@/lib/hostMedia.server";
import { SITE_DISCOVERY_HERO_KEY, SITE_PARTNER_OFFERS_HERO_KEY } from "@/lib/hostMedia";
import "./premium.css";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "SingHUB for Venues | Free Listing vs. Partner",
  description: "Every venue can be found on SingHUB for free. Compare the free karaoke listing with SingHUB Partner's enhanced calendar, promotions, SingBOARD and founding offer.",
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
  "Everything in the free listing",
  "Richer venue story, gallery and promotional details",
  "Fuller event calendar for karaoke and other venue happenings",
  "Qualifying event flyers and promotions through SingBOARD",
  "Food, drink, happy hour and venue special highlights",
  "Optional venue-controlled Partner Offers",
  "Priority information updates and available engagement insights",
];

const differences = [
  {title:"Venue hero, Why Sing Here and essential info", free:"Included", partner:"Included"},
  {title:"Karaoke schedule, KJ and SingHERE", free:"Included", partner:"Included"},
  {title:"Searchable amenities and directions", free:"Included", partner:"Included"},
  {title:"Expanded photo gallery and venue story", free:"Core profile", partner:"Enhanced presentation"},
  {title:"Additional events and fuller monthly calendar", free:"Regular karaoke schedule", partner:"Promotional event calendar"},
  {title:"SingBOARD flyers and venue announcements", free:"Community discovery", partner:"Partner promotions"},
  {title:"Specials, venue-led offers and promotion", free:"Core facts", partner:"Featured venue content"},
  {title:"Priority changes and engagement insights", free:"Standard corrections", partner:"Priority support and available reporting"},
];

const faqs = [
  {question:"Do I have to pay to be listed?", answer:"No. SingHUB keeps the useful karaoke information, a venue hero, Why Sing Here, amenities, and SingHERE available on the free listing. Partner adds promotional tools, not access to the microphone."},
  {question:"Is Founding Venue a separate product?", answer:"No. Founding Venue is a discounted 90-day introduction to SingHUB Partner. It comes with the same Partner experience and a preferred optional continuation rate."},
  {question:"Does the pilot automatically renew?", answer:"No. The $149 covers the 90-day Founding Venue Pilot. At the end, you can stop or explicitly choose to continue for $49 per month at the founding rate while participating."},
  {question:"Is more traffic or first place in search guaranteed?", answer:"No. Partner creates better ways to tell your story and promote your events. Placement opportunities and reporting depend on available SingHUB features; attendance and rankings are never guaranteed."},
];

export default async function PremiumVenuePage() {
  const [configured, discovery] = await Promise.all([
    getHostMediaSettings(SITE_PARTNER_OFFERS_HERO_KEY).catch(() => null),
    getHostMediaSettings(SITE_DISCOVERY_HERO_KEY).catch(() => null),
  ]);
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
          <h1 id="venue-offers-title">Your karaoke night. <span>More ways to be found.</span></h1>
          <p>Every karaoke venue deserves a useful free listing. SingHUB Partner adds the tools to promote everything that makes people choose your room.</p>
          <div className="venue-offers-hero-actions">
            <a href="#venue-plans" className="venue-offers-primary">Compare your options <span aria-hidden="true">↓</span></a>
            <Link href="/find-karaoke" className="venue-offers-secondary">Explore SingHUB ↗</Link>
          </div>
        </div>
        <HeroScrollCue />
      </section>

      <div data-page-surface="" className="venue-offers-sheet">
        <section className="venue-offers-intro" aria-labelledby="difference-heading">
          <p className="venue-offers-eyebrow">TWO LEVELS. ONE COMMUNITY.</p>
          <h2 id="difference-heading">Being listed is free. <span>Being a Partner does more.</span></h2>
          <p>Free gets the essentials right so singers can find you, know what to expect and sign up. Partner gives you a bigger stage for your calendar, specials, announcements and what makes your venue worth a visit.</p>
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
            <div className="venue-offers-founding">
              <p className="venue-offers-eyebrow">FOUNDING VENUE OFFER</p>
              <p className="venue-offers-founding-price">$149 <span>total for your first 90 days</span></p>
              <p>Afterward, choose whether to continue at <strong>$49/month</strong> while your founding membership stays active. <strong>No automatic renewal.</strong></p>
            </div>
            <Link className="venue-offers-button venue-offers-solid" href="/claim-listing?premium=true">Request a Partner review ↗</Link>
          </article>
        </section>

        <section className="venue-offers-compare" aria-labelledby="venue-compare-title">
          <p className="venue-offers-eyebrow">THE DIFFERENCE, FEATURE BY FEATURE</p>
          <h2 id="venue-compare-title">What changes when you partner?</h2>
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
          <p className="venue-offers-eyebrow">LET&apos;S TALK KARAOKE</p>
          <h2 id="venue-offers-end-title">Your venue already has a story. <span>Let more singers find it.</span></h2>
          <p>Whether you just need your free details corrected or want to explore being a Partner, the first move is a conversation. No checkout required.</p>
          <div className="venue-offers-end-actions">
            <Link href="/claim-listing?premium=true" className="venue-offers-button venue-offers-solid">Ask about Partner ↗</Link>
            <Link href="/claim-listing" className="venue-offers-button venue-offers-outline">Update a free listing ↗</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
