import Link from 'next/link';
import {hotelExperienceConfigs} from '@/lib/hotelExperiences';
import {resolveHotelPackageUrl} from '@/lib/hotelPackageIntake';
import {getHotelPackage} from '@/lib/hotelPackage.server';
import '../[slug]/package/package.css';
export const dynamic='force-dynamic';
export const metadata={title:'Hotel URL intake | SingHUB Admin',robots:{index:false,follow:false}};
export default async function HotelPackageIntake({searchParams}:{searchParams:Promise<{url?:string}>}){
 const {url}=await searchParams;const supplied=typeof url==='string'?url:'';
 const resolution=supplied?resolveHotelPackageUrl(supplied,hotelExperienceConfigs):null;
 const model=resolution?.status==='matched'?await getHotelPackage(resolution.slug):null;
 return <main className="hotel-package-admin"><Link href="/admin/hotels">← Hotel media</Link><p className="package-eyebrow">HOTEL URL INTAKE</p><h1>Start with the property URL.</h1><p>For registered launch hotels, SingHUB gathers the reviewed property record, saved media and package status. Confirm the property, then review assets and export.</p>
 <form method="get" className="package-review"><label htmlFor="hotel-source-url">Official hotel property URL</label><input id="hotel-source-url" name="url" type="url" required defaultValue={supplied} placeholder="https://www.ihg.com/holidayinnexpress/hotels/us/en/la-mesa/sanpd/hoteldetail" style={{display:'block',width:'100%',padding:12,margin:'12px 0',background:'#08131d',border:'1px solid #526378',color:'#fff'}}/><button type="submit">Find hotel package</button></form>
 {resolution?.status==='invalid'&&<p role="alert">Use a public HTTPS hotel property URL without embedded credentials or a custom port.</p>}
 {resolution?.status==='unmatched'&&<section className="package-review"><h2>Property review required</h2><p>This URL does not identify one registered hotel. Confirm its official property URL, name, address, coordinates and image sources before adding it to SingHUB. Nothing has been published or approved.</p></section>}
 {model&&<section className="package-review"><h2>{model.hotel.name}</h2><p>{model.hotel.address}</p><p>Coordinates: {model.hotel.latitude}, {model.hotel.longitude}</p><p>Property photo: {model.hotel.heroImageUrl?'Available for review':'Missing'}. Guest Guide asset approval: {model.readiness.guest?'ready':'pending'}. Concierge branding approval: {model.readiness.concierge?'ready':'pending'}.</p><p>Sales-sheet screenshot: {model.screenshot?'Real guest-page capture available':'Capture required'}.</p><p>Confirm this is the intended property before opening the package. Source availability does not establish permission.</p><div className="package-links"><Link href={`/admin/hotels/${model.hotel.slug}/package`}>Review assets and build package</Link><a href={model.config.hotelSiteUrl} target="_blank" rel="noreferrer">Official property source</a><Link href={`/hotelexperience/${model.hotel.slug}?edition=guest`} target="_blank">Preview Guest Guide</Link></div></section>}
 <section><h2>Registered launch properties</h2><p>Use the official property URL, including its property path. A chain’s generic homepage cannot identify a specific hotel.</p><div className="package-links">{hotelExperienceConfigs.filter(hotel=>hotel.hotelSiteUrl).map(hotel=><Link key={hotel.slug} href={'/admin/hotels/package-intake?url='+encodeURIComponent(hotel.hotelSiteUrl!)}>{hotel.slug.replace(/-/g,' ')}</Link>)}</div></section>
 </main>;
}
