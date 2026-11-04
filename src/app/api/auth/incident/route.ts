import {NextResponse} from "next/server";
import {recordAuthIncident,type AuthIncidentCode} from "@/lib/authIncidents.server";

const allowed=new Set<AuthIncidentCode>(["otp_verify_failed","email_send_failed"]);
export async function POST(request:Request){
  const origin=request.headers.get("origin");
  if(origin!==new URL(request.url).origin)
    return NextResponse.json({error:"Cross-site diagnostics not allowed."},{status:403});
  const raw=await request.text();
  if(raw.length>300)return NextResponse.json({error:"Invalid event."},{status:400});
  let parsed:unknown;
  try{parsed=JSON.parse(raw);}catch{return NextResponse.json({error:"Invalid event."},{status:400});}
  if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))
    return NextResponse.json({error:"Invalid event."},{status:400});
  const input=parsed as Record<string,unknown>;
  if(Object.keys(input).some(k=>k!=="code")||typeof input.code!=="string"||!allowed.has(input.code as AuthIncidentCode))
    return NextResponse.json({error:"Invalid event."},{status:400});
  await recordAuthIncident(request,"client",input.code as AuthIncidentCode);
  return new Response(null,{status:204,headers:{"Cache-Control":"no-store"}});
}
