import { createSign } from "node:crypto";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

async function getAccessToken() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY are required for canonical data sync.",
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      scope: SHEETS_SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }),
  ).toString("base64url");
  const unsignedToken = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256")
    .update(unsignedToken)
    .sign(privateKey)
    .toString("base64url");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsignedToken}.${signature}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google auth responded with ${response.status}.`);
  }

  const tokenResponse = await response.json();
  if (!tokenResponse.access_token) {
    throw new Error("Google auth response did not include an access token.");
  }

  return tokenResponse.access_token;
}

export async function fetchGoogleSheetRows(sheetId, sheetTab, columnRange = "A:AZ") {
  const accessToken = await getAccessToken();
  const range = encodeURIComponent(`'${sheetTab}'!${columnRange}`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`;
  let sheetResponse;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.ok) {
      sheetResponse = await response.json();
      break;
    }
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 4) {
      throw new Error(`Google Sheets API responded with ${response.status} for ${sheetTab} after ${attempt + 1} attempt(s).`);
    }
    const retryAfter = Number(response.headers.get("retry-after"));
    const backoffMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? Math.min(retryAfter * 1000, 30000)
      : Math.min(2000 * (2 ** attempt), 30000);
    console.warn(`Google Sheets ${sheetTab}: HTTP ${response.status}; retrying in ${Math.ceil(backoffMs / 1000)}s (attempt ${attempt + 1}/5).`);
    await new Promise(resolve => setTimeout(resolve, backoffMs));
  }
  if (!sheetResponse) throw new Error(`Google Sheets ${sheetTab} returned no data.`);
  const [headers = [], ...values] = sheetResponse.values || [];

  return values
    .filter((row) => row.some((value) => String(value).trim()))
    .map((row, index) => {
      const mapped = { __rowNumber: String(index + 2) };
      headers.forEach((header, columnIndex) => {
        const name = String(header).trim();
        if (name && mapped[name] === undefined) {
          mapped[name] = String(row[columnIndex] ?? "").trim();
        }
      });
      return mapped;
    });
}
