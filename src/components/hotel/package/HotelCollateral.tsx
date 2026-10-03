/* eslint-disable @next/next/no-img-element */
import type {CSSProperties} from 'react';
import type {HotelPackage} from '@/lib/hotelPackage.server';
import type {HotelPackageEdition,HotelPackageFormat} from '@/lib/hotelPackage';
import './hotelCollateral.css';
import '../hotelStage.css';
export function HotelCollateral({model,edition,format,qr,draft}:{model:HotelPackage;edition:HotelPackageEdition;format:HotelPackageFormat;qr:string;draft:boolean}){
 const {hotel,config}=model;const concierge=edition==='concierge';
 const crop=hotel.heroPlacement?.desktop;
 const imageStyle={objectPosition:crop?`${crop.x}% ${crop.y}%`:hotel.heroPosition||'center',transform:crop?`scale(${crop.zoom})`:undefined};
 const brand=<div className="collateral-brand">{concierge&&config.brandLogoUrl?<img src={config.brandLogoUrl} alt={hotel.shortName} />:<img src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" />}</div>;
 const photo=<div className="collateral-photo">{hotel.heroImageUrl?<img src={hotel.heroImageUrl} alt={hotel.heroAlt||hotel.name+' property photograph'} style={imageStyle} />:<div className="collateral-missing">Property photo required before production</div>}</div>;
 const stage=<img className="collateral-stage-image hotel-stage-watermark" src="/images/hotel-package/karaoke-stage.webp" alt="Illustrative microphone on a karaoke stage"/>;
 const scan=<div className="collateral-scan"><img src={qr} alt="Scan to open this hotel's karaoke guide" /><div><strong>Scan. Find your mic.</strong><p>No app download needed.</p><span>singhub.app</span></div></div>;
 const footer=<footer>{concierge&&<><span>Powered by</span><img src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" /></>}{draft&&<b>INTERNAL PREVIEW · ASSET REVIEW REQUIRED</b>}{hotel.heroCredit?.status==='licensed'&&<small>Photo: {hotel.heroCredit.attribution} · <a href={hotel.heroCredit.sourceUrl}>Source</a> · <a href={hotel.heroCredit.licenseUrl}>{hotel.heroCredit.license}</a> · cropped</small>}</footer>;
 const face=()=> <section className="tent-face" data-desk-face=""><header>{brand}</header><p className="collateral-property">For guests of {hotel.shortName}</p>{photo}<div className="tent-stage">{stage}<div className="tent-copy"><p className="collateral-eyebrow">Karaoke tonight</p><h1>Your night.<br/>Your mic.</h1><p>Find local venues, schedules<br/>and directions.</p>{scan}</div></div>{footer}</section>;
 return <article data-print-sheet="" data-format={format} data-edition={edition} className={'hotel-collateral '+format} style={{'--hotel-ink':concierge?config.primaryColor:'#121826','--hotel-accent':concierge?config.accentColor:'#007b92'} as CSSProperties}>
 {format==='desk-tent'?<div className="tent-sheet">{face()}{face()}</div>:<><header>{brand}<p className="collateral-property">For guests of<br/><strong>{hotel.shortName}</strong></p></header>{photo}<section className="elevator-copy">{stage}<div className="elevator-content"><p className="collateral-eyebrow">{concierge?'Your hotel. Your local karaoke guide.':'SingHUB Guest Guide'}</p><h1>You found your room.<br/>Now find your mic.</h1><p>Explore karaoke tonight and this week, organized around where you’re staying.</p><div className="collateral-benefits"><span>Nearby venues</span><span>Schedules & hosts</span><span>Directions & trip plans</span></div>{scan}</div></section>{footer}</>}
 </article>;
}
