import "server-only";

// Uses the Resend account and inbox already configured for SingHUB submissions.
// Never pass one-time passwords, magic-link codes, or full authentication URLs.
export async function notifySingHubOperator(subject: string, content: string): Promise<boolean> {
  const key=process.env.RESEND_API_KEY;
  const from=process.env.SINGHUB_SUBMISSIONS_FROM||"SingHUB Alerts <notifications@singhub.app>";
  const to=[...new Set([...(process.env.SINGHUB_SUBMISSIONS_TO||"").split(",").map(email=>email.trim()).filter(Boolean),"hello@singhub.app"])];
  if(!key){
    console.error("SingHUB notification not configured", {subject:subject.slice(0,90)});
    return false;
  }
  try{
    const response=await fetch("https://api.resend.com/emails",{
      method:"POST",
      headers:{Authorization:"Bearer "+key,"Content-Type":"application/json"},
      body:JSON.stringify({
        from,
        to,
        subject:subject.slice(0,180),
        text:content.slice(0,4500),
      }),
      signal:AbortSignal.timeout(6000),
    });
    if(!response.ok){
      console.error("SingHUB operator notification failed",{status:response.status,subject:subject.slice(0,90)});
      return false;
    }
    return true;
  }catch{
    console.error("SingHUB operator notification transport failed",{subject:subject.slice(0,90)});
    return false;
  }
}
