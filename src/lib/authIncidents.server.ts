import "server-only";
import {createHmac} from "node:crypto";
import {createAdminClient} from "@/lib/supabase/admin";
import {notifySingHubOperator} from "@/lib/operationalAlerts.server";

export type AuthIncidentCode="exchange_failed"|"provider_link_error"|"otp_verify_failed"|"email_send_failed";
export type AuthIncidentSource="callback"|"client";
const allowed=new Set<AuthIncidentCode>(["exchange_failed","provider_link_error","otp_verify_failed","email_send_failed"]);

export async function recordAuthIncident(request:Request, source:AuthIncidentSource, code:AuthIncidentCode, pagePath="/account"){
  if(!allowed.has(code))return;
  // Only aggregate category, path and a rotating HMAC. Never retain raw IP, email, token or auth error text.
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!key){console.error("Auth diagnostics unavailable: service role missing");return;}
  const ip=(request.headers.get("x-forwarded-for")||request.headers.get("x-real-ip")||"not-provided").split(",")[0].trim();
  const date=new Date().toISOString().slice(0,10);
  const visitorKey=createHmac("sha256",key).update(date+"|"+ip).digest("hex");
  const path=pagePath.startsWith("/")&&!pagePath.startsWith("//")?pagePath.split("?")[0].slice(0,240):"/account";
  try{
    const db=createAdminClient();
    const last10=new Date(Date.now()-10*60*1000).toISOString();
    const {count:visitorCount,error:limitError}=await db.from("site_auth_incidents").select("id",{count:"exact",head:true})
      .eq("visitor_key",visitorKey).gte("created_at",last10);
    if(limitError)throw limitError;
    if((visitorCount||0)>=5)return;
    const {error}=await db.from("site_auth_incidents").insert({source,issue_code:code,page_path:path,visitor_key:visitorKey});
    if(error)throw error;
    const since=new Date(Date.now()-60*60*1000).toISOString();
    const {count,error:countError}=await db.from("site_auth_incidents").select("id",{count:"exact",head:true})
      .eq("issue_code",code).gte("created_at",since);
    if(countError)throw countError;
    // First occurrence alerts immediately; repeat at 10, 25, 50, then each 100.
    const n=count||0;
    if(n===1||n===10||n===25||n===50||(n>50&&n%100===0)){
      await notifySingHubOperator("SingHUB sign-in issue: "+code,
        "An authentication failure occurred on SingHUB.\n"+
        "Category: "+code+"\nSource: "+source+"\nPage: "+path+"\n"+
        "Events with this code in the last hour: "+n+"\n"+
        "No email addresses, sign-in links or private tokens were stored in diagnostics.\n"+
        "Review production logs and the site_auth_incidents table; follow up on /support reports.");
    }
  }catch(e){
    console.error("SingHUB auth incident recording failed",e instanceof Error?e.name:"unknown");
  }
}
