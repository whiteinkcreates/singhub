import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { monthlyMic } from "@/lib/monthlymic";

export const runtime = "nodejs";
const noStore = {"Cache-Control":"no-store"};

export async function POST(req:Request) {
  let payload:Record<string,unknown>;
  try { payload = await req.json(); } catch { return NextResponse.json({error:"Invalid request."},{status:400,headers:noStore}); }
  if (payload.website) return NextResponse.json({ok:true},{headers:noStore}); // honeypot
  const name=typeof payload.name==="string"?payload.name.trim():"";
  const email=typeof payload.email==="string"?payload.email.trim().toLowerCase():"";
  const status=payload.status;
  const partySize=Number(payload.partySize);
  const source=typeof payload.source==="string"?payload.source.replace(/[^a-z0-9_-]/gi,"").slice(0,40):"direct";
  if (name.length<2||name.length>100||!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)||email.length>254||
      !["going","interested"].includes(String(status))||!Number.isInteger(partySize)||partySize<1||partySize>6||
      typeof payload.photoPermission!=="boolean"||typeof payload.justDuet!=="boolean") {
    return NextResponse.json({error:"Please check your RSVP details."},{status:400,headers:noStore});
  }
  if (!monthlyMic.rsvpOpen) return NextResponse.json({error:"RSVPs are closed."},{status:403,headers:noStore});
  try {
    const db=createAdminClient();
    const {error}=await db.from("monthlymic_rsvps").upsert({
      event_id:monthlyMic.id, full_name:name,email,status,party_size:partySize,
      just_duet:payload.justDuet,photo_permission:payload.photoPermission,
      source,updated_at:new Date().toISOString()
    },{onConflict:"event_id,email_normalized"});
    if(error) throw error;
    return NextResponse.json({ok:true,message:"Thanks! Your RSVP has been recorded."},{headers:noStore});
  } catch(e) {
    console.error("MonthlyMic RSVP failed",e instanceof Error?e.message:"Unknown error");
    return NextResponse.json({error:"RSVP unavailable. Please try again later."},{status:503,headers:noStore});
  }
}
