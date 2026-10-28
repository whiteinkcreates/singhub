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
 try{const asset=await uploadVenueMedia(file,"monthlymic-001");const {error}=await createAdminClient().from("monthlymic_media").insert({event_id:monthlyMic.id,image_url:asset.url,public_id:asset.publicId,alt_text:String(form.get("alt")||"The Mesa, MonthlyMic #001").slice(0,200),caption:String(form.get("caption")||"").slice(0,300),subject_tags:String(form.get("subjects")||"").slice(0,300),venue_tag:String(form.get("venue")||"").slice(0,120),status:"approved",usage_consent:true,sort_order:Number(form.get("order")||100)});if(error)throw error;return NextResponse.json({ok:true});}catch{return NextResponse.json({error:"Upload failed"},{status:503});}
}
export async function PATCH(request:Request){
 await requireAdminAuthorization();const origin=request.headers.get("origin");if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:"Invalid origin"},{status:403});
 const body=await request.json();if(typeof body.id!=="string"|| (body.status!==undefined&&!["approved","pending","rejected"].includes(body.status)))return NextResponse.json({error:"Invalid request"},{status:400});
 const updates:Record<string,string>={};if(body.status!==undefined)updates.status=body.status;for(const [key,max] of [["caption",300],["subject_tags",300],["venue_tag",120],["alt_text",200]] as const){if(body[key]!==undefined){if(typeof body[key]!=="string")return NextResponse.json({error:"Invalid metadata"},{status:400});updates[key]=body[key].trim().slice(0,max);}}if(!Object.keys(updates).length)return NextResponse.json({error:"No changes"},{status:400});
 const {error}=await createAdminClient().from("monthlymic_media").update(updates).eq("event_id",monthlyMic.id).eq("id",body.id);
 return error?NextResponse.json({error:"Could not update photo"},{status:503}):NextResponse.json({ok:true});
}
