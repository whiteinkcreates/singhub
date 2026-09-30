/* Shared literal hotel hero. Preserve the approved DOM and CSS. */
/* eslint-disable @next/next/no-img-element */
export function HotelHero({hotelName,hotelShortName,hotelArea,heroImageUrl,heroAlt,heroPosition}:{hotelName:string;hotelShortName:string;hotelArea:string;heroImageUrl?:string;heroAlt?:string;heroPosition?:string}) {
 return <section className="hero" aria-labelledby="hotel-name"><img className="hero-photo" src={heroImageUrl || undefined} alt={heroAlt || hotelName+' exterior'} style={heroPosition ? {objectPosition:heroPosition} : undefined} /><div className="hero-inner"><div className="hero-lockup"><div className="hotel-id"><div className="relationship-line"><img className="relationship-wordmark" src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" /><img className="hero-at" src="/images/singhub-v2/hotel-at-mark-transparent.png" alt="at" /></div><h1 id="hotel-name">{hotelShortName}</h1><p className="hero-meta">{hotelArea}</p></div></div></div></section>;
}
