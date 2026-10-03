export type HotelPackageScreenshot={url:string;source:string;capturedAt:string;heroImageUrl:string};
const screenshots:Record<string,HotelPackageScreenshot>={
 'holiday-inn-express-la-mesa':{
  url:'/images/hotel-package/hie-guest-guide-live.webp',
  source:'https://singhub.app/hotelexperience/holiday-inn-express-la-mesa?edition=guest',
  capturedAt:'2026-10-03',
  heroImageUrl:'https://digital.ihg.com/is/image/ihg/holiday-inn-express-la-mesa-8924019411-4x3',
 }
};
export function hotelPackageScreenshot(slug:string,heroImageUrl?:string){const screenshot=screenshots[slug];return screenshot?.heroImageUrl===heroImageUrl?screenshot:null;}
