/* eslint-disable @next/next/no-img-element */
import type {HotelPackage} from '@/lib/hotelPackage.server';
import './hotelCollateral.css';
import './hotelSalesSheet.css';
export function HotelSalesSheet({model,qr,draft}:{model:HotelPackage;qr:string;draft:boolean}){
 const {hotel,screenshot}=model;
 const crop=hotel.heroPlacement?.desktop;
 return <article data-print-sheet="" data-format="sales-sheet" className="hotel-collateral hotel-sales-sheet">
  <header className="sales-header"><div className="collateral-brand"><img src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB"/></div><p>Prepared for<br/><strong>{hotel.shortName}</strong></p></header>
  <section className="sales-hero">{hotel.heroImageUrl&&<img src={hotel.heroImageUrl} alt={hotel.heroAlt||hotel.name+' property photograph'} style={{objectPosition:crop?`${crop.x}% ${crop.y}%`:hotel.heroPosition||'center',transform:crop?`scale(${crop.zoom})`:undefined}}/>}<div><p>LOCAL KARAOKE. EASY GUEST HANDOFF.</p><h1>A great night out.<br/>One scan from your lobby.</h1></div></section>
  <p className="sales-intro">SingHUB helps guests find local karaoke through a guide built around your property. Scan, choose a room, and head out.</p>
  <section className="sales-guest"><div><p className="sales-label">WHAT GUESTS SEE</p><h2>Give them options.<br/>Let them find their mic.</h2><ul><li>Tonight and This Week</li><li>Nearby venues, schedules and hosts</li><li>Distances, directions and trip plans</li><li>Room details to choose their kind of night</li></ul></div><div className="sales-screen">{screenshot?<><img src={screenshot.url} alt={`Actual SingHUB Guest Guide for ${hotel.shortName}`}/><p>Actual guest page · captured {screenshot.capturedAt}</p></>:<p>Capture the real guest page before sharing this sales sheet.</p>}</div></section>
  <section className="sales-editions"><div><p className="sales-label">FREE</p><h2>SingHUB Guest Guide</h2><ul><li>SingHUB-branded guest experience</li><li>Unique hotel QR and physical collateral</li><li>Hotel-aware karaoke discovery</li><li>Local listings maintained by SingHUB</li></ul></div><div><p className="sales-label">CUSTOMIZED</p><h2>Hotel Concierge Edition</h2><ul><li>Your hotel’s logo, colors and imagery</li><li>Hotel-forward copy and collateral</li><li>Hotel-relative curation</li><li>“Powered by SingHUB”</li></ul></div></section>
  <section className="sales-placement"><h2>Place where guests already look.</h2><p>Front desk · 4 × 6 inch portrait desk insert · Elevator insert · Concierge handoff</p><p>No karaoke schedule editing for your staff. Your team shares the QR; SingHUB maintains the local information.</p></section>
  <section className="sales-contact"><div className="collateral-scan"><img src={qr} alt="Scan to see this property's SingHUB Guest Guide"/><div><strong>See your guest guide.</strong><p>No app download needed.</p></div></div><div><h2>Let’s set up your property.</h2><p><a href="mailto:hello@singhub.app">hello@singhub.app</a><br/><a href="https://singhub.app">singhub.app</a></p><p>Concierge Edition: contact for details.</p></div></section>
  <footer>{draft&&<b>INTERNAL PREVIEW · ASSET REVIEW REQUIRED</b>}{hotel.heroCredit?.status==='licensed'&&<small>Photo: {hotel.heroCredit.attribution} · <a href={hotel.heroCredit.sourceUrl}>Source</a> · {hotel.heroCredit.license} · cropped</small>}</footer>
 </article>;
}
