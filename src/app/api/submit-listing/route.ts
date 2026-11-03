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

    // Send an owner notification only after the inbox webhook confirms persistence.
    {
      const apiKey=process.env.RESEND_API_KEY;
      const configuredRecipients=(process.env.SINGHUB_SUBMISSIONS_TO||"").split(",").map(value=>value.trim()).filter(Boolean);
      // Always include the operator inbox, even if the optional recipient setting is empty.
      const recipients=[...new Set([...configuredRecipients,"hello@singhub.app"])];
      const from=process.env.SINGHUB_SUBMISSIONS_FROM||"SingHUB Alerts <notifications@singhub.app>";
      if(apiKey){
        try{
          const sent=await fetch("https://api.resend.com/emails",{
            method:"POST",
            headers:{"Authorization":"Bearer "+apiKey,"Content-Type":"application/json"},
            body:JSON.stringify({
              from,to:recipients,
              subject: isActivityRequest
                ? "SingHUB: new Other activity request"
                : "SingHUB submission: " + (
                    enrichedPayload.submissionType === "founding_venue_inquiry" ? "Partner inquiry" :
                    enrichedPayload.submissionType === "claim_update" ? "Listing correction" :
                    "Venue listing"
                  ) + " | " + (cleanString(payload.venueName).slice(0,80) || "Unspecified venue"),
              text: isActivityRequest
                ? ["A visitor asked SingHUB to research an activity.","",cleanString(payload.notes),"","Reply contact: "+(cleanString(payload.submitterContact)||"Not provided"),"Source: "+cleanString(payload.sourceLink),"Next step: research venues, verify sources, and consider a new Backyard category."].join("\n")
                : [
                    "A new SingHUB submission was saved.",
                    "Type: " + cleanString(enrichedPayload.submissionType),
                    "Venue: " + (cleanString(payload.venueName) || "Not specified"),
                    "Name: " + (cleanString(payload.submitterName) || "Not provided"),
                    "Contact: " + (cleanString(payload.submitterContact) || cleanString(payload.venueContact) || "Not provided"),
                    "Host/KJ: " + (cleanString(payload.hostName) || "Not provided"),
                    "Days: " + (Array.isArray(payload.karaokeDays) ? payload.karaokeDays.map(cleanString).filter(Boolean).join(", ") : "Not provided"),
                    "Time: " + ([cleanString(payload.startTime),cleanString(payload.endTime)].filter(Boolean).join(" - ") || "Not provided"),
                    "Website: " + (cleanString(payload.venueWebsite) || "Not provided"),
                    "Instagram: " + (cleanString(payload.venueInstagram) || "Not provided"),
                    "Source: " + (cleanString(payload.sourceLink) || "Not provided"),
                    "",
                    "Details:",
                    cleanString(payload.notes).slice(0,3000) || "No notes. Review the inbox for the full submission.",
                    "",
                    "Submissions inbox: https://docs.google.com/spreadsheets/d/1xLKts71EXlI5u61z44NPkba_OBeAxH1aefLcQsVRYrc/edit#gid=300000004",
                  ].join("\n")
            })
          });
          if(!sent.ok){
            const failure=await sent.json().catch(()=>({})) as {name?:unknown;message?:unknown};
            const detail=typeof failure.message==="string"?failure.message.slice(0,500).replace(/re_[A-Za-z0-9_]+/g,"[redacted]").replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,"[email]"):"No provider error detail";
            console.error("Submission email notification failed",sent.status,typeof failure.name==="string"?failure.name:"unknown",detail);
          }
        }catch(error){console.error("Submission notification transport failed",error);}
      } else console.error("Submission notification lacks RESEND_API_KEY");
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
