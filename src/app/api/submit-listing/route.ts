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

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Invalid submission payload." }, { status: 400 });
  }

  if (cleanString(payload.companyWebsite)) {
    return NextResponse.json({ ok: true });
  }

  const submissionType=cleanString(payload.submissionType) || inferSubmissionType(payload);
  if(["support_request","venue_claim_request","claim_update","venue_partner_inquiry","karaoke_event_inquiry","kj_booking_optin"].includes(submissionType)){
    const origin=request.headers.get("origin");
    if(origin&&origin!==new URL(request.url).origin)
      return NextResponse.json({error:"Cross-site submissions are not allowed."},{status:403});
  }
  const isActivityRequest=submissionType==="activity_search_request";
  const isSupportRequest=submissionType==="support_request";
  const isClaimRequest=submissionType==="venue_claim_request"||submissionType==="claim_update";
  const isPartnerInquiry=submissionType==="venue_partner_inquiry";
  const isEventRequest=submissionType==="karaoke_event_inquiry";
  const isKjBookingOptin=submissionType==="kj_booking_optin";
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
  if(isEventRequest||isKjBookingOptin){
    const email=cleanString(payload.submitterContact);
    const name=cleanString(payload.submitterName);
    const notes=cleanString(payload.notes);
    if(name.length<2||name.length>100||email.length>200||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||
       notes.length>1200||payload.contactConsent!==true){
      return NextResponse.json({error:"Please check your contact details and consent."},{status:400});
    }
    if(isEventRequest){
      const validOccasions=["Holiday party","Company / team outing","Birthday / celebration","Bachelorette / bachelor","Friends / social group","Something else"];
      const validService=["venue","kj","both"],validSizes=["2–10","11–20","21–50","51–100","100+"];
      const validAreas=["Anywhere in San Diego County","Downtown / Gaslamp","Central San Diego","La Mesa / East County","Coastal San Diego","North County","South Bay"];
      const validBudgets=["Not sure yet","Under $500","$500–$1,000","$1,000–$2,500","$2,500–$5,000","$5,000+"];
      const validNeeds=["Room / reserved tables","Food or catering","Drink packages","Private singing time","Karaoke equipment","Accessibility","Custom event shirts"];
      const day=cleanString(payload.preferredDate);
      const validDay=!day||(/^\d{4}-\d{2}-\d{2}$/.test(day)&&!Number.isNaN(Date.parse(day))&&day>=new Date(Date.now()-86400000).toISOString().slice(0,10));
      if(!validOccasions.includes(cleanString(payload.eventType))||
         !validService.includes(cleanString(payload.bookingNeed))||
         !validSizes.includes(cleanString(payload.groupSize))||
         !validAreas.includes(cleanString(payload.neighborhood))||
         !validBudgets.includes(cleanString(payload.budget))||
         !validDay||(!day&&payload.dateFlexible!==true)||
         cleanString(payload.areaNotes).length>160||cleanString(payload.companyName).length>120||
         cleanString(payload.phone).length>40||cleanString(payload.timePreference).length>60||
         !Array.isArray(payload.requirements)||payload.requirements.length>7||
         !payload.requirements.every((need:unknown)=>typeof need==="string"&&validNeeds.includes(need))){
        return NextResponse.json({error:"Please check your event rider details."},{status:400});
      }
    }else{
      const validEquipment=["Full karaoke, microphones, speakers and screen","Karaoke system and microphones, venue provides sound","Host only, venue provides equipment","Custom / depends on event"];
      if(cleanString(payload.hostName).length<2||cleanString(payload.hostName).length>120||
         cleanString(payload.neighborhood).length<2||cleanString(payload.neighborhood).length>160||
         cleanString(payload.bookingRate).length<2||cleanString(payload.bookingRate).length>100||
         !validEquipment.includes(cleanString(payload.equipment))||
         cleanString(payload.bookingUrl).length>300||cleanString(payload.phone).length>40)
        return NextResponse.json({error:"Please check your KJ booking details."},{status:400});
    }
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

  const bookingSummary=isEventRequest ? [
    "Karaoke event inquiry",
    "Occasion: "+cleanString(payload.eventType),
    "Looking for: "+cleanString(payload.bookingNeed),
    "Estimated guests: "+cleanString(payload.groupSize),
    "Area: "+cleanString(payload.neighborhood),
    "Specific location: "+cleanString(payload.areaNotes),
    "Requested date: "+(cleanString(payload.preferredDate)||"Not selected"),
    "Date flexible: "+(payload.dateFlexible===true?"Yes":"No"),
    "Time preference: "+cleanString(payload.timePreference),
    "Total budget: "+cleanString(payload.budget),
    "Requested extras: "+(Array.isArray(payload.requirements)?payload.requirements.join(", "):""),
    "Organization: "+cleanString(payload.companyName),
    "Phone: "+cleanString(payload.phone),
    "Notes: "+cleanString(payload.notes),
    "Inquiry only; availability, contracts and payment handled by providers."
  ].join("\n"):isKjBookingOptin?[
    "KJ booking network interest",
    "KJ name: "+cleanString(payload.hostName),
    "Service area: "+cleanString(payload.neighborhood),
    "Typical rate: "+cleanString(payload.bookingRate),
    "Equipment: "+cleanString(payload.equipment),
    "Booking site: "+cleanString(payload.bookingUrl),
    "Phone: "+cleanString(payload.phone),
    "Notes: "+cleanString(payload.notes),
    "Interest only; do not publish rates or contact details without approval."
  ].join("\n"):"";
  const enrichedPayload = {
    ...payload,
    notes:bookingSummary||cleanString(payload.notes),
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

    // Preserve main's notifications for every saved submission, including legacy
    // listings, while adding the new support and claim categories.
    {
      const label = isEventRequest ? "event planning inquiry" : isKjBookingOptin ? "KJ booking opt-in" : isSupportRequest ? "support: " + (cleanString(payload.supportCategory) === "sign_in" ? "sign-in problem" : "new problem report")
        : isPartnerInquiry || submissionType === "founding_venue_inquiry" ? "Partner inquiry"
        : submissionType === "venue_claim_request" ? "venue claim requires verification"
        : isClaimRequest ? "Listing correction"
        : isActivityRequest ? "new Other activity request" : "Venue listing";
      await notifySingHubOperator("SingHUB " + label, [
        "A new SingHUB submission was saved.",
        "Type: " + submissionType,
        "Venue: " + (cleanString(payload.venueName) || "Not specified"),
        "Name: " + (cleanString(payload.submitterName) || "Not provided"),
        "Contact: " + (cleanString(payload.submitterContact) || cleanString(payload.venueContact) || "Not provided"),
        "Host/KJ: " + (cleanString(payload.hostName) || "Not provided"),
        "Days: " + (Array.isArray(payload.karaokeDays) ? payload.karaokeDays.map(cleanString).filter(Boolean).join(", ") : "Not provided"),
        "Time: " + ([cleanString(payload.startTime), cleanString(payload.endTime)].filter(Boolean).join(" - ") || "Not provided"),
        "Website: " + (cleanString(payload.venueWebsite) || "Not provided"),
        "Instagram: " + (cleanString(payload.venueInstagram) || "Not provided"),
        "Source: " + (cleanString(payload.sourceLink) || "Not provided"),
        "Details:", (bookingSummary||cleanString(payload.notes)).slice(0, 3000) || "Review the inbox for details.",
        "Review before modifying public data or granting venue authority.",
      ].join("\n"));

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
