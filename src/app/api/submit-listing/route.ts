import { NextResponse } from "next/server";

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function inferSubmissionType(payload: Record<string, unknown>) {
  const notes = cleanString(payload.notes).toLowerCase();

  if (notes.includes("claim/update request")) {
    return "claim_update";
  }

  return "listing_update";
}

export async function POST(request: Request) {
  const submissionsWebhookUrl = process.env.SINGHUB_SUBMISSIONS_WEBHOOK_URL;
  const submissionsWebhookSecret = process.env.SINGHUB_SUBMISSIONS_WEBHOOK_SECRET;

  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid submission payload." }, { status: 400 });
  }

  if (cleanString(payload.companyWebsite)) {
    return NextResponse.json({ ok: true });
  }

  const isActivityRequest=cleanString(payload.submissionType)==="activity_search_request";
  if(isActivityRequest){
    const notes=cleanString(payload.notes);
    const email=cleanString(payload.submitterContact);
    if(notes.length<15||notes.length>1000||email.length>200||(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))
      return NextResponse.json({error:"Enter a short request and a valid optional email address."},{status:400});
  }
  const usefulValues = [
    cleanString(payload.venueName),
    cleanString(payload.sourceLink),
    cleanString(payload.venueWebsite),
    cleanString(payload.venueInstagram),
    cleanString(payload.hostName),
    cleanString(payload.notes),
    ...(Array.isArray(payload.karaokeDays) ? payload.karaokeDays.map(cleanString) : []),
  ].filter(Boolean);

  if (usefulValues.length === 0) {
    return NextResponse.json(
      { error: "Send at least one clue: venue name, host name, link, IG, day, or a quick note." },
      { status: 400 },
    );
  }

  if (!submissionsWebhookUrl || !submissionsWebhookSecret) {
    return NextResponse.json(
      { error: "Submission inbox is not configured yet. Please DM @SingHubSD while we fix submissions." },
      { status: 500 },
    );
  }

  const enrichedPayload = {
    ...payload,
    submissionType: cleanString(payload.submissionType) || inferSubmissionType(payload),
    userAgent: request.headers.get("user-agent") || "",
    sourcePath: request.headers.get("referer") || "",
  };

  try {
    const response = await fetch(submissionsWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: submissionsWebhookSecret,
        payload: enrichedPayload,
      }),
    });

    const responseText = await response.text();

    let result: { ok?: boolean; error?: string } = {};

    try {
      result = JSON.parse(responseText) as { ok?: boolean; error?: string };
    } catch {
      result = {};
    }

    if (!response.ok || result.ok === false) {
      console.error("SingHUB submission inbox failed", response.status, responseText);
      return NextResponse.json(
        { error: "Submission could not be saved yet. Please DM @SingHubSD while we fix submissions." },
        { status: 502 },
      );
    }

    if(isActivityRequest) {
      const apiKey=process.env.RESEND_API_KEY;
      const to=process.env.SINGHUB_SUBMISSIONS_TO;
      const from=process.env.SINGHUB_SUBMISSIONS_FROM;
      if(apiKey&&to&&from){
        try{
          const sent=await fetch("https://api.resend.com/emails",{
            method:"POST",
            headers:{"Authorization":"Bearer "+apiKey,"Content-Type":"application/json"},
            body:JSON.stringify({
              from,to:to.split(",").map(value=>value.trim()).filter(Boolean),
              subject:"SingHUB: new Other activity request",
              text:["A visitor asked SingHUB to research an activity.","",cleanString(payload.notes),"","Reply contact: "+(cleanString(payload.submitterContact)||"Not provided"),"Source: "+cleanString(payload.sourceLink),"Next step: research venues, verify sources, and consider a new Backyard category."].join("\n")
            })
          });
          if(!sent.ok)console.error("Activity request email notification failed",sent.status);
        }catch(error){console.error("Activity request notification transport failed",error);}
      } else console.error("Activity request notification lacks email configuration");
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("SingHUB submission webhook failed", error);
    return NextResponse.json(
      { error: "Submission could not be saved yet. Please DM @SingHubSD while we fix submissions." },
      { status: 502 },
    );
  }
}
