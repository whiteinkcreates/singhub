import { NextResponse } from "next/server";

const RESEND_API_URL = "https://api.resend.com/emails";

const fieldLabels: Record<string, string> = {
  venueName: "Venue or karaoke night",
  neighborhood: "Neighborhood / city",
  address: "Address",
  karaokeDays: "Karaoke days",
  startTime: "Start time",
  endTime: "End time",
  hostName: "Host / KJ",
  sourceLink: "Source link",
  venueWebsite: "Venue website",
  venueInstagram: "Venue Instagram",
  venueContact: "Venue contact",
  submitterName: "Submitter name",
  submitterContact: "Submitter contact",
  notes: "Notes",
};

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatValue(value: unknown) {
  if (Array.isArray(value)) {
    const cleanedValues = value.map(cleanString).filter(Boolean);
    return cleanedValues.length > 0 ? cleanedValues.join(", ") : "Not provided";
  }

  const cleanedValue = cleanString(value);
  return cleanedValue || "Not provided";
}

function buildEmailHtml(payload: Record<string, unknown>) {
  const rows = Object.entries(fieldLabels)
    .map(([fieldName, label]) => {
      const value = formatValue(payload[fieldName]);
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#111827;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#111827;vertical-align:top;white-space:pre-wrap;">${escapeHtml(value)}</td>
        </tr>`;
    })
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;">
      <h1 style="margin:0 0 8px;font-size:24px;">New SingHUB listing/update</h1>
      <p style="margin:0 0 18px;color:#4b5563;">Someone submitted a karaoke venue/night tip for review.</p>
      <table style="border-collapse:collapse;width:100%;max-width:760px;border:1px solid #e5e7eb;">
        ${rows}
      </table>
    </div>`;
}

function buildEmailText(payload: Record<string, unknown>) {
  const rows = Object.entries(fieldLabels)
    .map(([fieldName, label]) => `${label}: ${formatValue(payload[fieldName])}`)
    .join("\n");

  return `New SingHUB listing/update\n\n${rows}`;
}

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const submissionsTo = process.env.SINGHUB_SUBMISSIONS_TO;
  const submissionsFrom = process.env.SINGHUB_SUBMISSIONS_FROM || "SingHUB <onboarding@resend.dev>";

  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid submission payload." }, { status: 400 });
  }

  if (cleanString(payload.companyWebsite)) {
    return NextResponse.json({ ok: true });
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

  if (!resendApiKey || !submissionsTo) {
    return NextResponse.json(
      {
        error:
          "Email is not configured yet. Add RESEND_API_KEY and SINGHUB_SUBMISSIONS_TO in your hosting environment.",
      },
      { status: 500 },
    );
  }

  const venueName = cleanString(payload.venueName) || "Karaoke tip";

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: submissionsFrom,
      to: [submissionsTo],
      subject: `SingHUB listing/update: ${venueName}`,
      html: buildEmailHtml(payload),
      text: buildEmailText(payload),
      reply_to: cleanString(payload.submitterContact) || undefined,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("SingHUB submission email failed", errorText);
    return NextResponse.json(
      { error: "The submission was received by the site, but the email could not be sent yet." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
