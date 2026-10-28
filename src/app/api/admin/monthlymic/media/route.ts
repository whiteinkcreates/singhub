import {NextResponse} from "next/server";
import {requireAdminAuthorization} from "@/lib/adminAuthorization";
import {createAdminClient} from "@/lib/supabase/admin";
import {monthlyMic} from "@/lib/monthlymic";
import {uploadVenueMedia} from "@/lib/venueMediaCloudinary";
export const runtime="nodejs";
export async function GET(){await requireAdminAuthorization();const {data,error}=await createAdminClient().from("monthlymic_media").select("*").eq("event_id",monthlyMic.id).order("created_at",{ascending:false});return error?NextResponse.json({error:"Could not load media"},{status:503}):NextResponse.json({items:data||[]});}
export async function POST(request:Request){
 await requireAdminAuthorization();const origin=request.headers.get("origin");if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:"Invalid origin"},{status:403});
 const form=await request.formData();const file=form.get("file");
 if(!(file instanceof File)||!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>12*1024*1024||file.size===0)return NextResponse.json({error:"Choose an image under 12 MB"},{status:400});
 try{const asset=await uploadVenueMedia(file,"monthlymic-001");const {error}=await createAdminClient().from("monthlymic_media").insert({event_id:monthlyMic.id,image_url:asset.url,public_id:asset.publicId,alt_text:String(form.get("alt")||"The Mesa, MonthlyMic #001").slice(0,200),status:"approved",usage_consent:true,sort_order:Number(form.get("order")||100)});if(error)throw error;return NextResponse.json({ok:true});}catch{return NextResponse.json({error:"Upload failed"},{status:503});}
}
export async function PATCH(request:Request){
 await requireAdminAuthorization();const origin=request.headers.get("origin");if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:"Invalid origin"},{status:403});
 const body=await request.json();if(typeof body.id!=="string"||!["approved","pending","rejected"].includes(body.status))return NextResponse.json({error:"Invalid request"},{status:400});
 const {error}=await createAdminClient().from("monthlymic_media").update({status:body.status}).eq("event_id",monthlyMic.id).eq("id",body.id);
 return error?NextResponse.json({error:"Could not update photo"},{status:503}):NextResponse.json({ok:true});
}
