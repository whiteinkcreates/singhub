import QRCode from 'qrcode';
import {getHotelExperienceConfig} from '@/lib/hotelExperiences';
import {hotelPackageDestination,packageEdition,packageFormat} from '@/lib/hotelPackage';
export async function GET(request:Request,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const config=getHotelExperienceConfig(slug);if(!config)return new Response('Hotel not found',{status:404});
 const query=new URL(request.url).searchParams;
 const svg=await QRCode.toString(hotelPackageDestination(config.hotelGuideSlug,packageEdition(query.get('edition')||undefined),packageFormat(query.get('format')||undefined)),{type:'svg',margin:4,errorCorrectionLevel:'M'});
 return new Response(svg,{headers:{'Content-Type':'image/svg+xml','Cache-Control':'public, max-age=86400','Content-Disposition':`attachment; filename="${config.hotelGuideSlug}-${packageEdition(query.get('edition')||undefined)}-${packageFormat(query.get('format')||undefined)}-qr.svg"`}});
}
