import { NextResponse } from "next/server";
import {createHmac} from "node:crypto";
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
  const status=payload.status==="interested"?"interested":"going";
  const futureUpdates=payload.futureUpdates===true;
  const partySize=Number(payload.partySize);
  const availability=status==="interested"?"neither":"nov18";
  const shirtSize=payload.shirtSize??null;
  const source=typeof payload.source==="string"?payload.source.replace(/[^a-z0-9_-]/gi,"").slice(0,40):"direct";
  if (name.length<2||name.length>100||!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)||email.length>254||
      !Number.isInteger(partySize)||partySize<1||partySize>6||
      !(status==="interested"?futureUpdates:availability==="nov18")||!([null,"","S","M","L","XL","2XL","3XL"].includes(shirtSize as string|null))||typeof payload.futureUpdates!=="boolean"||typeof payload.photoPermission!=="boolean"||typeof payload.justDuet!=="boolean") {
    return NextResponse.json({error:"Please check your RSVP details."},{status:400,headers:noStore});
  }
  if (!monthlyMic.rsvpOpen) return NextResponse.json({error:"RSVPs are closed."},{status:403,headers:noStore});
  try {
    const db=createAdminClient();
    const forwarded=req.headers.get("x-vercel-forwarded-for")||req.headers.get("x-forwarded-for")||req.headers.get("x-real-ip");
    const ip=(forwarded||"unknown").split(",")[0].trim().slice(0,80);
    const secret=process.env.SINGHUB_ADMIN_PASSWORD||process.env.SUPABASE_SERVICE_ROLE_KEY;
    if(!secret)throw new Error("Rate limit key not configured");
    const fingerprint=createHmac("sha256",secret).update(ip).digest("hex");
    const since=new Date(Date.now()-60*60*1000).toISOString();
    const {count,error:limitError}=await db.from("monthlymic_rsvps").select("id",{count:"exact",head:true}).eq("ip_hash",fingerprint).gte("created_at",since);
    if(limitError)throw limitError;
    if((count||0)>=12)return NextResponse.json({error:"Too many registrations from this network. Please try later."},{status:429,headers:noStore});
    const {error}=await db.from("monthlymic_rsvps").insert({
      event_id:monthlyMic.id, full_name:name,email,status,party_size:partySize,
      just_duet:payload.justDuet,photo_permission:payload.photoPermission,availability,
      source,future_updates:futureUpdates,shirt_size:shirtSize||null,ip_hash:fingerprint,updated_at:new Date().toISOString()
    });
    if(error?.code==="23505")return NextResponse.json({ok:true,message:"Thanks! If your email was already registered, your original entry remains on file."},{headers:noStore});
    if(error) throw error;
    return NextResponse.json({ok:true,message:status==="going"?"Your November 18 RSVP is saved.":"You are signed up for future MonthlyMic announcements."},{headers:noStore});
  } catch(e) {
    console.error("MonthlyMic RSVP failed",e instanceof Error?e.message:"Unknown error");
    return NextResponse.json({error:"RSVP unavailable. Please try again later."},{status:503,headers:noStore});
  }
}
