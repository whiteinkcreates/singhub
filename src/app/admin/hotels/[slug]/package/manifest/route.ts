import {getHotelPackage,hotelPackageManifest} from '@/lib/hotelPackage.server';
export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const model=await getHotelPackage(slug);if(!model)return new Response('Hotel not found',{status:404});
 return Response.json(hotelPackageManifest(model),{headers:{'Content-Disposition':`attachment; filename="${model.hotel.slug}-asset-manifest.json"`,'Cache-Control':'private, no-store'}});
}
