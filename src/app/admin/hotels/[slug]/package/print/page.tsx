import {notFound} from 'next/navigation';
import {getHotelPackage,hotelPackageQr} from '@/lib/hotelPackage.server';
import {packageEdition,packageFormat} from '@/lib/hotelPackage';
import {HotelCollateral} from '@/components/hotel/package/HotelCollateral';
import {HotelSalesSheet} from '@/components/hotel/package/HotelSalesSheet';
import {PrintToolbar} from '@/components/hotel/package/PrintToolbar';
export const dynamic='force-dynamic';
export const metadata={title:'Hotel collateral | SingHUB',robots:{index:false,follow:false}};
export default async function HotelPrint({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{edition?:string;format?:string;mode?:string;embed?:string}>}){
 const [{slug},query]=await Promise.all([params,searchParams]);const model=await getHotelPackage(slug);if(!model)notFound();
 const edition=packageEdition(query.edition),format=packageFormat(query.format),draft=query.mode!=='production';
 if(!draft&&!(format==='sales-sheet'?model.readiness.salesSheet:model.readiness[edition]))notFound();
 const qr=await hotelPackageQr(model.hotel.slug,edition,format);
 return <>{query.embed!=="1"&&<PrintToolbar/>}{format==='sales-sheet'?<HotelSalesSheet model={model} qr={qr} draft={draft}/>:<HotelCollateral model={model} edition={edition} format={format} qr={qr} draft={draft}/>}</>;
}
