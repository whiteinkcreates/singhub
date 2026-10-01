import { HotelExperiencePageContent } from "@/components/hotel/HotelExperiencePageContent";
import { requireAdminAuthorization } from "@/lib/adminAuthorization";
import { HotelGuidePageContent } from "@/components/hotel/HotelGuidePageContent";
export const dynamic = "force-dynamic";
export const metadata = { title: "Internal hotel demo | SingHUB", robots: { index: false, follow: false } };
export default async function HotelDemo({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ template?: string }> }) {
 await requireAdminAuthorization();
 const { slug } = await params;
 const { template } = await searchParams;
 return <><div style={{background:"#07111b",color:"#fff",padding:"12px 20px",fontSize:14}}>Internal example / test · Photo permissions must be confirmed before public use.</div>{template === "classic" ? <HotelGuidePageContent slug={slug} demo /> : <HotelExperiencePageContent slug={slug} demo />}</>;
}
