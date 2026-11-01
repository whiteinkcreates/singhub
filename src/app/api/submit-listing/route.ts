import { NextResponse } from "next/server";
import { notifySingHubOperator } from "@/lib/operationalAlerts.server";

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

  const submissionType=cleanString(payload.submissionType) || inferSubmissionType(payload);
  const isActivityRequest=submissionType==="activity_search_request";
  const isSupportRequest=submissionType==="support_request";
  const isClaimRequest=submissionType==="venue_claim_request"||submissionType==="claim_update";
  const isPartnerInquiry=submissionType==="venue_partner_inquiry";
  if(isSupportRequest||isClaimRequest||isPartnerInquiry){
    const email=cleanString(payload.submitterContact);
    const notes=cleanString(payload.notes);
    const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(notes.length<15||notes.length>2500||email.length>200||
      (email&&!validEmail.test(email))||
      (!email&&!isSupportRequest)||
      (isSupportRequest&&!["sign_in","check_in_offer","listing","other"].includes(cleanString(payload.supportCategory)))||
      ((isClaimRequest||isPartnerInquiry)&&!cleanString(payload.venueName)))
      return NextResponse.json({error:"Please check the details and contact information before sending."},{status:400});
  }
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
    submissionType,
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

    // Always record requests in the submission inbox first. Notify operator only after successful storage.
    if(isActivityRequest||isSupportRequest||isClaimRequest||isPartnerInquiry){
      const subject=isSupportRequest
        ? "SingHUB support: "+(cleanString(payload.supportCategory)==="sign_in"?"sign-in problem":"new problem report")
        : isPartnerInquiry?"SingHUB: new $59 Partner inquiry"
        : isClaimRequest?(submissionType==="venue_claim_request"?"SingHUB: venue claim requires verification":"SingHUB: venue correction")
        :"SingHUB: new Other activity request";
      const text=[
        "Type: "+submissionType,
        "Venue: "+(cleanString(payload.venueName)||"Not provided"),
        "Name: "+(cleanString(payload.submitterName)||"Not provided"),
        "Reply contact: "+(cleanString(payload.submitterContact)||"Not provided"),
        "Source: "+cleanString(payload.sourceLink),
        "Details:\n"+cleanString(payload.notes),
        "",
        "Submitted to the SingHUB intake queue. Review before modifying public data or granting venue authority.",
      ].join("\n");
      await notifySingHubOperator(subject,text);
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
