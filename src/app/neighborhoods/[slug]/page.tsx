import { notFound, permanentRedirect } from "next/navigation";
import { VenueDirectoryExperience } from "@/components/v2/VenueDirectoryExperience";
import { getDiscoveryData } from "@/lib/v2/data";
import { getHostMediaSettings } from "@/lib/hostMedia.server";
import { SITE_DISCOVERY_HERO_KEY } from "@/lib/hostMedia";
import { getNeighborhoodSeoPage } from "@/lib/seoContent";
const aliases: Record<string,string> = { gaslamp: "gaslamp-quarter", "east-county-la-mesa": "la-mesa" };
function slugify(value: string) { return value.toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }
type Props={params:Promise<{slug:string}>};
export const dynamic="force-dynamic";
export async function generateMetadata({params}:Props) {
 const {slug}=await params;
 const canonical=aliases[slug]||slug;
 const {rows}=await getDiscoveryData();
 const found=rows.find(row=>slugify(row.venue.neighborhood)===canonical);
 if(!found)return {};
 const editorial=getNeighborhoodSeoPage(canonical);
 return {title:editorial?.metaTitle||`${found.venue.neighborhood} Karaoke | SingHUB`,description:editorial?.description||`Find karaoke in ${found.venue.neighborhood}, San Diego.`,alternates:{canonical:`/neighborhoods/${canonical}`}};
}
export default async function NeighborhoodPage({params}:Props) {
 const {slug}=await params;
 if(aliases[slug])permanentRedirect(`/neighborhoods/${aliases[slug]}`);
 const [{rows},hero]=await Promise.all([getDiscoveryData(),getHostMediaSettings(SITE_DISCOVERY_HERO_KEY).catch(()=>null)]);
 const filtered=rows.filter(row=>slugify(row.venue.neighborhood)===slug);
 if(!filtered.length)notFound();
 return <VenueDirectoryExperience rows={filtered} heroUrl={hero?.heroUrl} heroAlt={hero?.heroAlt} heroPosition={hero?.heroPosition} heroPlacement={hero?.heroPlacement}/>;
}
