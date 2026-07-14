import { createSign } from "node:crypto";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

export type GoogleSheetRow = Record<string, string>;

function valuesToRows(values: string[][]): GoogleSheetRow[] {
  const [headers = [], ...rows] = values;

  return rows
    .filter((valuesRow) => valuesRow.some((value) => value.trim()))
    .map((valuesRow) =>
      headers.reduce<GoogleSheetRow>((mappedRow, header, index) => {
        mappedRow[header.trim()] = valuesRow[index]?.trim() ?? "";
        return mappedRow;
      }, {}),
    );
}

async function getAccessToken() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) return null;

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
  const signature = createSign("RSA-SHA256").update(unsignedToken).sign(privateKey).toString("base64url");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsignedToken}.${signature}`,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Google auth responded with ${response.status}`);
  }

  const tokenResponse = (await response.json()) as { access_token?: string };
  return tokenResponse.access_token || null;
}

export async function getGoogleSheetRows(sheetId: string, sheetTab: string, columnRange = "A:AZ") {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const range = encodeURIComponent(`'${sheetTab}'!${columnRange}`);
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 300 },
    },
  );

  if (!response.ok) {
    throw new Error(`Google Sheets API responded with ${response.status}`);
  }

  const sheetResponse = (await response.json()) as { values?: string[][] };
  return valuesToRows(sheetResponse.values || []);
}
