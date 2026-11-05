import { createSign } from "node:crypto";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

export type GoogleSheetRow = Record<string, string>;

export class GoogleSheetsConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleSheetsConfigurationError";
  }
}

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

async function requestAccessToken() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new GoogleSheetsConfigurationError(
      "Google Sheets credentials are not configured.",
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
  const signature = createSign("RSA-SHA256").update(unsignedToken).sign(privateKey).toString("base64url");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsignedToken}.${signature}`,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Google auth responded with ${response.status}`);
  }

  const tokenResponse = (await response.json()) as { access_token?: string };
  if (!tokenResponse.access_token) {
    throw new Error("Google auth response did not include an access token.");
  }

  return { token: tokenResponse.access_token, expiresAt: Date.now() + Math.max(0, Number((tokenResponse as { expires_in?: number }).expires_in ?? 3600) - 60) * 1000 };
}

// One token refresh per warm instance, including concurrent cold requests. Never
// include a credential or token in a persistent cache key or log.
let token: { token: string; expiresAt: number } | undefined;
let tokenRequest: ReturnType<typeof requestAccessToken> | undefined;
async function getAccessToken() {
  if (token && token.expiresAt > Date.now()) return token.token;
  tokenRequest ??= requestAccessToken().then(value => (token = value)).finally(() => { tokenRequest = undefined; });
  return (await tokenRequest).token;
}

const pending = new Map<string, Promise<GoogleSheetRow[]>>();
const retryAfter = new Map<string, number>();

export function getGoogleSheetRows(sheetId: string, sheetTab: string, columnRange = "A:AZ") {
  const key = JSON.stringify([sheetId, sheetTab, columnRange]);
  const existing = pending.get(key);
  if (existing) return existing;
  if ((retryAfter.get(key) ?? 0) > Date.now()) {
    return Promise.reject(new Error("Google Sheets reads temporarily paused after an upstream failure."));
  }
  const request = fetchGoogleSheetRows(sheetId, sheetTab, columnRange)
    .then(rows => { retryAfter.delete(key); return rows; })
    .catch(error => { retryAfter.set(key, Date.now() + 60_000); throw error; })
    .finally(() => { pending.delete(key); });
  pending.set(key, request);
  return request;
}

async function fetchGoogleSheetRows(sheetId: string, sheetTab: string, columnRange: string) {
  const accessToken = await getAccessToken();

  const range = encodeURIComponent(`'${sheetTab}'!${columnRange}`);
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(10_000),
    },
  );

  if (!response.ok) {
    if (response.status === 401) token = undefined;
    throw new Error(`Google Sheets API responded with ${response.status}`);
  }

  const sheetResponse = (await response.json()) as { values?: string[][] };
  return valuesToRows(sheetResponse.values || []);
}
