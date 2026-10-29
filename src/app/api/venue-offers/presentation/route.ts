import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {changeVenueOfferPresentation} from "@/lib/venueOffers.server";

export const dynamic = "force-dynamic";

export async function POST(request:Request){
 const origin=request.headers.get("origin");
 if(origin&&origin!==new URL(request.url).origin)
  return NextResponse.json({error:"Cross-site offer actions are not allowed."},{status:403});
 const token=request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
 if(!token)return NextResponse.json({error:"Sign in to present your offer."},{status:401});
 try{
  const client=createAdminClient();
  const {data,error}=await client.auth.getUser(token);
  if(error||!data.user?.email_confirmed_at)
   return NextResponse.json({error:"Your sign-in expired. Sign in again to open the offer."},{status:401});
  const raw=await request.text();
  if(raw.length>1024)return NextResponse.json({error:"Invalid offer request."},{status:400});
  let body:unknown;
  try{body=JSON.parse(raw);}catch{return NextResponse.json({error:"Invalid offer request."},{status:400});}
  if(!body||typeof body!=="object")
   return NextResponse.json({error:"Invalid offer request."},{status:400});
  const {venueSlug,action}=body as Record<string,unknown>;
  if(typeof venueSlug!=="string"||!(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(venueSlug))||!["open","close"].includes(String(action)))
   return NextResponse.json({error:"Valid venue and offer action required."},{status:400});
  const result=await changeVenueOfferPresentation({userId:data.user.id,venueSlug,action:action as "open"|"close"});
  if(!result.ok)return NextResponse.json({error:result.error},{status:result.status,headers:{"Cache-Control":"private, no-store"}});
  return NextResponse.json({offer:result.offer,recovered:result.recovered},{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){
  console.error("Offer presentation failed",error);
  return NextResponse.json({error:"Could not update this offer. Please try again."},{status:503,headers:{"Cache-Control":"private, no-store"}});
 }
}
