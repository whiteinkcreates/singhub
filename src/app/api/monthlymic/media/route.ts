import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {monthlyMic} from "@/lib/monthlymic";
import {uploadVenueMedia} from "@/lib/venueMediaCloudinary";
export const runtime="nodejs";
export async function GET(){
 const {data,error}=await createAdminClient().from("monthlymic_media").select("id,image_url,alt_text,credit").eq("event_id",monthlyMic.id).eq("status","approved").order("sort_order",{ascending:true}).order("created_at",{ascending:true}).limit(60);
 if(error)return NextResponse.json({error:"Gallery unavailable"},{status:503});
 return NextResponse.json({photos:data||[]},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(request:Request){
 const origin=request.headers.get("origin");if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:"Invalid origin"},{status:403});
 if(new Date()<new Date("2026-11-19T00:00:00-08:00"))return NextResponse.json({error:"Photo submissions open after the meetup."},{status:403});
 const data=await request.formData();
 if(data.get("website"))return NextResponse.json({ok:true});
 const file=data.get("file"),consent=data.get("consent")==="yes";
 const name=String(data.get("name")||"").trim().slice(0,100);
 const email=String(data.get("email")||"").trim().toLowerCase().slice(0,254);
 if(!consent||!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return NextResponse.json({error:"Name, email, and photo permission are required."},{status:400});
 if(!(file instanceof File)||!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>8*1024*1024||file.size===0)return NextResponse.json({error:"Upload a JPG, PNG or WebP under 8 MB."},{status:400});
 try{
  const asset=await uploadVenueMedia(file,"monthlymic-001");
  const {error}=await createAdminClient().from("monthlymic_media").insert({event_id:monthlyMic.id,image_url:asset.url,public_id:asset.publicId,alt_text:"Photo from MonthlyMic #001 at The Mesa",contributor_name:name,contributor_email:email,usage_consent:true,status:"pending"});
  if(error)throw error;
  return NextResponse.json({ok:true,message:"Thank you! Your photo has been submitted for review."});
 }catch{ return NextResponse.json({error:"Photo submission failed. Please try again."},{status:503});}
}
