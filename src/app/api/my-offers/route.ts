import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {nightlifeDate} from "@/lib/tourStops";

export const dynamic="force-dynamic";
const privateHeaders={"Cache-Control":"private, no-store"};

export async function GET(request:Request){
 const bearer=request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
 if(!bearer)return NextResponse.json({error:"Sign in to see your SingHUB offers."},{status:401,headers:privateHeaders});
 try{
  const db=createAdminClient();
  const {data:auth,error:authError}=await db.auth.getUser(bearer);
  if(authError||!auth.user?.email_confirmed_at)
   return NextResponse.json({error:"Sign in to see your SingHUB offers."},{status:401,headers:privateHeaders});
  const date=nightlifeDate();
  const {data, error}=await db.from("venue_offer_unlocks")
   .select("venue_slug,nightlife_date,offer_title,presentation_mode,presentation_started_at,presented_at,redeemed_at")
   .eq("user_id",auth.user.id).eq("nightlife_date",date)
   .order("unlocked_at",{ascending:false}).limit(25);
  if(error)throw error;
  // Never send register codes or raw tokens in the My SingHUB offer listing.
  const offers=(data||[]).map(row=>({
   venueSlug:row.venue_slug,
   title:row.offer_title,
   presentationMode:row.presentation_mode==="one_time"?"one_time":"staff_code",
   presentationStartedAt:row.presentation_started_at,
   presentedAt:row.presented_at,
   redeemedAt:row.redeemed_at
  }));
  return NextResponse.json({offers,nightlifeDate:date},{headers:privateHeaders});
 }catch(error){
  console.error("My SingHUB offers lookup failed",error);
  return NextResponse.json({error:"Could not load your SingHUB offers."},{status:503,headers:privateHeaders});
 }
}
