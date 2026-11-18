import {NextResponse} from "next/server";
import {createHmac} from "node:crypto";
import {createAdminClient} from "@/lib/supabase/admin";
import {monthlyMic} from "@/lib/monthlymic";

export const runtime="nodejs";
const headers={"Cache-Control":"no-store"};

export async function POST(request:Request){
  const origin=request.headers.get("origin");
  if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:"Invalid origin."},{status:403,headers});
  if(Number(request.headers.get("content-length")||0)>8192)return NextResponse.json({error:"Message too large."},{status:413,headers});
  let data:Record<string,unknown>;
  try{
    const parsed:unknown=await request.json();
    if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new Error("Invalid JSON");
    data=parsed as Record<string,unknown>;
  }catch{return NextResponse.json({error:"Invalid request."},{status:400,headers});}

  if(data.website)return NextResponse.json({ok:true},{headers}); // bot honeypot
  const anonymous=data.anonymous===true;
  if(typeof data.anonymous!=="boolean")return NextResponse.json({error:"Choose named or anonymous."},{status:400,headers});
  const message=typeof data.message==="string"?data.message.trim():"";
  const displayName=!anonymous&&typeof data.name==="string"?data.name.trim():null;
  const replyEmail=!anonymous&&typeof data.email==="string"&&data.email.trim()?data.email.trim().toLowerCase():null;
  const rating=data.rating===null||data.rating===undefined||data.rating===""?null:data.rating;
  if(message.length<10||message.length>2000||
    (!anonymous&&(!displayName||displayName.length<2||displayName.length>100))||
    (replyEmail!==null&&(replyEmail.length>254||!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(replyEmail)))||
    (rating!==null&&(!Number.isInteger(rating)||typeof rating!=="number"||rating<1||rating>5))){
    return NextResponse.json({error:"Please check your message and optional details."},{status:400,headers});
  }
  try{
    const key=process.env.SINGHUB_ADMIN_PASSWORD||process.env.SUPABASE_SERVICE_ROLE_KEY;
    if(!key)throw new Error("Feedback rate limit not configured");
    const ip=(request.headers.get("x-vercel-forwarded-for")||request.headers.get("x-forwarded-for")||request.headers.get("x-real-ip")||"unknown").split(",")[0].trim().slice(0,80);
    const agent=(request.headers.get("user-agent")||"unknown").slice(0,160);
    const ipHash=createHmac("sha256",key).update(ip+"|"+agent).digest("hex");
    const db=createAdminClient();
    const since=new Date(Date.now()-3600000).toISOString();
    const {count,error:countError}=await db.from("monthlymic_feedback")
      .select("id",{count:"exact",head:true}).eq("ip_hash",ipHash).gte("created_at",since);
    if(countError)throw countError;
    if((count||0)>=8)return NextResponse.json({error:"Too many messages from this device. Please try later."},{status:429,headers});
    const {error}=await db.from("monthlymic_feedback").insert({
      event_id:monthlyMic.id,message,anonymous,display_name:displayName,
      reply_email:replyEmail,rating,ip_hash:ipHash
    });
    if(error)throw error;
    return NextResponse.json({ok:true},{headers});
  }catch(error){
    console.error("MonthlyMic feedback failed",error instanceof Error?error.message:"Unknown error");
    return NextResponse.json({error:"We couldn't save your note. Please try again."},{status:503,headers});
  }
}
