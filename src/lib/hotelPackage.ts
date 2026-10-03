import type {HotelMediaProfile} from './hotelProfiles';
export type HotelPackageEdition='guest'|'concierge';
export type HotelPackageFormat='elevator'|'desk-tent';
export const HOTEL_PACKAGE_VERSION='1.1';
export function packageEdition(value?:string):HotelPackageEdition{return value==='guest'?'guest':'concierge';}
export function packageFormat(value?:string):HotelPackageFormat{return value==='desk-tent'?'desk-tent':'elevator';}
export function hotelPackageDestination(slug:string,edition:HotelPackageEdition,format:HotelPackageFormat){
 const url=new URL('/hotelexperience/'+encodeURIComponent(slug),'https://singhub.app');
 url.searchParams.set('edition',edition);url.searchParams.set('placement',format);
 url.searchParams.set('utm_source',slug);url.searchParams.set('utm_medium','qr');url.searchParams.set('utm_campaign','hotel-'+edition);
 return url.toString();
}
export function packageReadiness(heroImageUrl:string|undefined,brandLogoUrl:string|undefined,profile:HotelMediaProfile|null,licensed=false){
 const review=profile?.packageReview;
 const heroReady=Boolean(heroImageUrl&&(licensed||(review?.heroApproved&&review.heroImageUrl===heroImageUrl&&review.rightsNote.trim())));
 const brandReady=Boolean(review?.brandApproved&&review.brandLogoUrl===(brandLogoUrl||'')&&review.brandNote.trim());
 return {guest:heroReady,concierge:heroReady&&brandReady};
}
