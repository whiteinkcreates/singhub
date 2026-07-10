import { createSign } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type {
  HostGig,
  HostProfile,
  HostProfileCompletionLevel,
  HostWeekday,
} from "@/types";
import { parseTsv, type TsvRow } from "@/lib/tsv";

const FALLBACK_DATA_PATH = path.join(process.cwd(), "public", "data", "kj_profiles.tsv");
const DEFAULT_SHEET_ID = "1KVYTlrnMNk57zOdCFYq6o5BJEwIQfYXnrDs-90Z7Hw8";
const DEFAULT_SHEET_TAB = "KJ Profiles V1";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

export const HOST_WEEKDAYS: HostWeekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export type HostSourceRow = Record<string, string>;

function getOptionalValue(value: string | undefined) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function parseBoolean(value: string | undefined) {
  return /^(true|yes|1|featured)$/i.test(value?.trim() || "");
}

function parseList(value: string | undefined) {
  if (!value) return [];
  return value
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getCell(row: HostSourceRow, columnName: string) {
  return getOptionalValue(row[columnName]);
}

function normalizeStatus(value: string | undefined) {
  return value?.trim().toLowerCase() || "draft";
}

function isActiveStatus(value: string | undefined) {
  return normalizeStatus(value) === "active";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createSlug(value: string) {
  return slugify(value) || "host";
}

export function normalizeInstagramHandle(value: string | undefined) {
  const trimmedValue = getOptionalValue(value);
  if (!trimmedValue) return undefined;

  const withoutProtocol = trimmedValue.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  return withoutProtocol.replace(/^@/, "").replace(/\/.*$/, "").trim() || undefined;
}

function normalizeInstagramUrl(value: string | undefined) {
  const trimmedValue = getOptionalValue(value);
  if (!trimmedValue) return undefined;
  if (/^https?:\/\//i.test(trimmedValue)) return trimmedValue;

  const handle = normalizeInstagramHandle(trimmedValue);
  return handle ? `https://www.instagram.com/${handle}` : undefined;
}

function parseCsv(content: string): HostSourceRow[] {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += character;
  }

  if (cell || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  const headers = rows.shift()?.map((header) => header.trim()) ?? [];
  return rows
    .filter((values) => values.some((value) => value.trim()))
    .map((values) =>
      headers.reduce<HostSourceRow>((mappedRow, header, index) => {
        mappedRow[header] = values[index]?.trim() ?? "";
        return mappedRow;
      }, {}),
    );
}

function valuesToRows(values: string[][]): HostSourceRow[] {
  const [headers = [], ...rows] = values;
  return rows
    .filter((valuesRow) => valuesRow.some((value) => value.trim()))
    .map((valuesRow) =>
      headers.reduce<HostSourceRow>((mappedRow, header, index) => {
        mappedRow[header.trim()] = valuesRow[index]?.trim() ?? "";
        return mappedRow;
      }, {}),
    );
}

function hasExpectedHeaders(rows: HostSourceRow[]) {
  if (rows.length === 0) return false;
  const headers = Object.keys(rows[0]);
  return headers.includes("Status") && headers.some((header) => header.includes("KJ / Host"));
}

function normalizeFormDay(value: string | undefined): HostWeekday | undefined {
  if (!value) return undefined;
  const normalizedValue = value.trim().toLowerCase().replace(/\.$/, "");
  const dayAliases: Record<string, HostWeekday> = {
    mon: "Monday",
    monday: "Monday",
    tue: "Tuesday",
    tues: "Tuesday",
    tuesday: "Tuesday",
    wed: "Wednesday",
    weds: "Wednesday",
    wednesday: "Wednesday",
    thu: "Thursday",
    thur: "Thursday",
    thurs: "Thursday",
    thursday: "Thursday",
    fri: "Friday",
    friday: "Friday",
    sat: "Saturday",
    saturday: "Saturday",
    sun: "Sunday",
    sunday: "Sunday",
  };

  return dayAliases[normalizedValue];
}

export function parseDayGigs(dayCell: string | undefined): HostGig[] {
  if (!dayCell?.trim()) return [];

  return dayCell
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [venueName = "", time = "", neighborhood = "", venueId = ""] = line
        .split("|")
        .map((part) => part.trim());

      if (!venueName || !time) {
        console.warn("Malformed KJ schedule entry", { entry: line });
      }

      return {
        venueName,
        time,
        neighborhood: getOptionalValue(neighborhood),
        venueId: getOptionalValue(venueId),
        raw: line,
      };
    })
    .filter((gig) => gig.venueName || gig.time || gig.neighborhood);
}

export function parseHostSchedule(row: HostSourceRow) {
  return HOST_WEEKDAYS.reduce<Record<HostWeekday, HostGig[]>>((schedule, day) => {
    schedule[day] = parseDayGigs(row[day]);
    return schedule;
  }, {} as Record<HostWeekday, HostGig[]>);
}

export function getProfileCompletionLevel(host: Omit<HostProfile, "profileCompletionLevel">): HostProfileCompletionLevel {
  const weeklyGigs = HOST_WEEKDAYS.flatMap((day) => host.schedule[day]);
  const hasBasicProfile =
    isActiveStatus(host.status) &&
    Boolean(host.slug) &&
    Boolean(host.publicDisplayName) &&
    Boolean(host.instagramUrl || host.instagramHandle) &&
    weeklyGigs.some((gig) => gig.venueName && gig.time);

  if (!hasBasicProfile) return "incomplete";

  const hasEnhancedFields = Boolean(
    host.profileImageUrl ||
      host.logoUrl ||
      host.bio ||
      host.vibeTags.length > 0 ||
      host.primaryAreas.length > 0 ||
      host.tipLink ||
      host.bookingLink ||
      host.tiktokUrl ||
      host.websiteUrl ||
      host.privateEvents ||
      host.favoriteKaraokeSpots ||
      host.verificationStatus,
  );

  return hasEnhancedFields ? "enhanced" : "basic";
}

function rowToHost(row: HostSourceRow): HostProfile {
  const hostName = getCell(row, "KJ / Host Name") || getCell(row, "KJ / Host / Company Name") || "";
  const publicDisplayName = getCell(row, "Public Display Name") || hostName;
  const slug = getCell(row, "Slug") || createSlug(publicDisplayName || hostName);
  const instagramUrl = normalizeInstagramUrl(getCell(row, "Instagram URL") || getCell(row, "Instagram Handle"));
  const baseHost = {
    status: normalizeStatus(getCell(row, "Status")),
    hostId: getCell(row, "Host ID") || slug,
    slug,
    hostName,
    publicDisplayName,
    profileImageUrl: getCell(row, "Profile Image URL"),
    logoUrl: getCell(row, "Logo URL"),
    instagramUrl,
    instagramHandle: normalizeInstagramHandle(instagramUrl || getCell(row, "Instagram Handle")),
    tiktokUrl: getCell(row, "TikTok URL"),
    websiteUrl: getCell(row, "Website URL"),
    tipLink: getCell(row, "Tip Link"),
    bookingLink: getCell(row, "Booking Link"),
    bio: getCell(row, "Bio"),
    vibeTags: parseList(getCell(row, "Vibe Tags")),
    primaryAreas: parseList(getCell(row, "Primary Areas")),
    schedule: parseHostSchedule(row),
    privateEvents: getCell(row, "Private Events?"),
    featured: parseBoolean(getCell(row, "Featured?")),
    notes: getCell(row, "Notes"),
    lastUpdated: getCell(row, "Last Updated"),
    verificationStatus: getCell(row, "Verification Status"),
    source: getCell(row, "Source"),
    formResponseTimestamp: getCell(row, "Form Response Timestamp"),
    contactEmail: getCell(row, "Contact Email"),
    tagRepostPermission: getCell(row, "Tag/Repost Permission"),
    weeklyStatus: getCell(row, "Weekly Status"),
    favoriteKaraokeSpots: getCell(row, "Favorite Karaoke Spots"),
  } satisfies Omit<HostProfile, "profileCompletionLevel">;

  return {
    ...baseHost,
    profileCompletionLevel: getProfileCompletionLevel(baseHost),
  };
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

async function getServiceAccountRows(sheetId: string, sheetTab: string) {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const range = encodeURIComponent(`'${sheetTab}'!A:Z`);
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 900 },
    },
  );

  if (!response.ok) {
    throw new Error(`Google Sheets API responded with ${response.status}`);
  }

  const sheetResponse = (await response.json()) as { values?: string[][] };
  const rows = valuesToRows(sheetResponse.values || []);
  if (!hasExpectedHeaders(rows)) {
    throw new Error("KJ Profiles sheet did not include expected headers");
  }

  return rows;
}

async function getPublishedCsvRows(sheetId: string, sheetTab: string) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetTab)}`;
  const response = await fetch(url, { next: { revalidate: 900 } });
  if (!response.ok) {
    throw new Error(`Google Sheets CSV responded with ${response.status}`);
  }

  const rows = parseCsv(await response.text());
  if (!hasExpectedHeaders(rows)) {
    throw new Error("KJ Profiles sheet CSV did not include expected headers");
  }

  return rows;
}

async function getSheetRows() {
  const sheetId = process.env.GOOGLE_SHEETS_ID || DEFAULT_SHEET_ID;
  const sheetTab = process.env.GOOGLE_SHEET_KJ_PROFILES_TAB || DEFAULT_SHEET_TAB;

  try {
    const serviceAccountRows = await getServiceAccountRows(sheetId, sheetTab);
    if (serviceAccountRows) return serviceAccountRows;
  } catch (error) {
    console.error("Failed to fetch KJ profiles with Google service account", error);
  }

  try {
    return await getPublishedCsvRows(sheetId, sheetTab);
  } catch (error) {
    console.error("Failed to fetch published KJ profiles CSV", error);
    return null;
  }
}

function getFallbackRows() {
  if (!fs.existsSync(FALLBACK_DATA_PATH)) return [];
  const rows = parseTsv(fs.readFileSync(FALLBACK_DATA_PATH, "utf8"));
  return rows.map((row: TsvRow) => row as HostSourceRow);
}

export async function getHosts() {
  const sheetRows = await getSheetRows();
  const rows = sheetRows && sheetRows.length > 0 ? sheetRows : getFallbackRows();
  return rows.map(rowToHost).filter((host) => host.slug && host.publicDisplayName);
}

export async function getActiveHosts() {
  return (await getHosts()).filter((host) => isActiveStatus(host.status));
}

export async function getHostBySlug(slug: string) {
  return (await getActiveHosts()).find((host) => host.slug === slug);
}

export function getTodayInLosAngeles(): HostWeekday {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "America/Los_Angeles",
  }).format(new Date()) as HostWeekday;
}

export async function getHostsHostingToday() {
  const today = getTodayInLosAngeles();
  const hosts = await getActiveHosts();

  return hosts
    .flatMap((host) => host.schedule[today].map((gig) => ({ host, gig, day: today })))
    .filter(({ gig }) => Boolean(gig.venueName || gig.time));
}

export function normalizeRawFormSchedule(value: string | undefined) {
  if (!value?.trim()) return { days: {} as Partial<Record<HostWeekday, string[]>>, notes: [] as string[] };

  return value.split(/\r?\n/).reduce(
    (result, line) => {
      const [venueName, neighborhood, day, startTime, endTime] = line.split("/").map((part) => part.trim());
      const matchedDay = normalizeFormDay(day);

      if (!venueName || !matchedDay || !startTime) {
        result.notes.push(`Needs Confirmation: ${line}`);
        return result;
      }

      const time = endTime ? `${startTime} - ${endTime}` : startTime;
      const venueId = createSlug(venueName);
      result.days[matchedDay] = [
        ...(result.days[matchedDay] || []),
        `${venueName} | ${time} | ${neighborhood || ""} | ${venueId}`,
      ];
      return result;
    },
    { days: {} as Partial<Record<HostWeekday, string[]>>, notes: [] as string[] },
  );
}
