import 'server-only';
import QRCode from 'qrcode';
import {hotelPackageScreenshot} from './hotelPackageScreenshots';
import {getHotelExperienceConfig} from './hotelExperiences';
import {getHotelMediaProfile} from './hotelProfiles.server';
import {getHotelGuide} from './hotelGuides';
import {applyHotelPhoto} from './hotelPhotoCandidates.server';
import {hotelPackageDestination,packageReadiness,HOTEL_PACKAGE_VERSION,type HotelPackageEdition,type HotelPackageFormat} from './hotelPackage';
export async function getHotelPackage(slug:string){
 const config=getHotelExperienceConfig(slug);if(!config)return null;
 const registered=getHotelGuide(config.hotelGuideSlug);if(!registered)return null;
 const {profile,readFailed}=await getHotelMediaProfile(config.hotelGuideSlug).then(profile=>({profile,readFailed:false})).catch(()=>({profile:null,readFailed:true}));
 const hotel=applyHotelPhoto(profile?{...registered,heroImageUrl:profile.heroImageUrl,heroAlt:profile.heroAlt,heroPosition:profile.heroPosition,heroPlacement:profile.heroPlacement}:registered);
 const screenshot=hotelPackageScreenshot(hotel.slug,hotel.heroImageUrl);
 const readiness=packageReadiness(hotel.heroImageUrl,config.brandLogoUrl,profile,hotel.heroCredit?.status==='licensed');
 return {hotel,config,profile,readFailed,screenshot,readiness:{...readiness,salesSheet:readiness.guest&&Boolean(screenshot)}};
}
export type HotelPackage=NonNullable<Awaited<ReturnType<typeof getHotelPackage>>>;
export async function hotelPackageQr(slug:string,edition:HotelPackageEdition,format:HotelPackageFormat){return QRCode.toDataURL(hotelPackageDestination(slug,edition,format),{errorCorrectionLevel:'M',margin:4,width:800});}
export function hotelPackageManifest(model:HotelPackage){return {
 templateVersion:HOTEL_PACKAGE_VERSION,hotel:{slug:model.hotel.slug,name:model.hotel.name,address:model.hotel.address,website:model.config.hotelSiteUrl},
 productionReady:model.readiness,review:model.profile?.packageReview||null,
 assets:[{role:'property-hero',url:model.hotel.heroImageUrl||null,source:model.profile?.imageSource||model.hotel.heroCredit?.sourceUrl||model.config.hotelSiteUrl,status:model.readiness.guest?'approved-or-licensed':'permission-unrecorded',rights:model.profile?.packageReview?.rightsNote||model.hotel.heroCredit||null,crop:model.hotel.heroPlacement||model.hotel.heroPosition||'center'},
 {role:'hotel-logo',url:model.config.brandLogoUrl||null,source:model.hotel.wordmarkSourceUrl||model.config.hotelSiteUrl,status:model.readiness.concierge?'reviewed':'permission-unrecorded'},
 {role:'guest-page-screenshot',url:model.screenshot?.url||null,source:model.screenshot?.source||null,capturedAt:model.screenshot?.capturedAt||null,status:model.screenshot?'actual-production-capture':'capture-required'},
 {role:'karaoke-stage',url:'/images/hotel-package/karaoke-stage.webp',source:'AI-generated SingHUB campaign artwork',status:'illustrative',note:'Generic stage illustration, not an actual hotel or venue.'},
 {role:'SingHUB-wordmark',url:'/images/singhub-v2/singhub-wordmark.png',source:'SingHUB supplied artwork',status:'official'}],
 theme:{primary:model.profile?.packageReview?.brandApproved?model.config.primaryColor:'#20D7FF',accent:model.profile?.packageReview?.brandApproved?model.config.accentColor:'#FF2AA3',status:model.profile?.packageReview?.brandApproved?'reviewed-custom-theme':'singhub-guest-default',note:model.profile?.packageReview?.brandApproved?'Hotel branding recorded as reviewed.':'Use the dark SingHUB Guest Experience until an approved hotel brand kit is recorded.'},
 outputs:[...(['guest','concierge'] as const).flatMap(edition=>(['elevator','desk-tent'] as const).map(format=>({edition,format,pageSize:format==='desk-tent'?'US Letter landscape 11 x 8.5 inches':'US Letter portrait 8.5 x 11 inches',finishedSize:format==='desk-tent'?'Two 4 x 6 inch portrait inserts':'8.5 x 11 inch elevator insert',destination:hotelPackageDestination(model.hotel.slug,edition,format),printPath:`/admin/hotels/${model.hotel.slug}/package/print?edition=${edition}&format=${format}&mode=${model.readiness[edition]?'production':'draft'}`}))),{edition:'guest',format:'sales-sheet',pageSize:'US Letter portrait 8.5 x 11 inches',destination:hotelPackageDestination(model.hotel.slug,'guest','sales-sheet'),printPath:`/admin/hotels/${model.hotel.slug}/package/print?edition=guest&format=sales-sheet&mode=${model.readiness.salesSheet?'production':'draft'}`}]
 };}
