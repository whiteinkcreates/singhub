#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fetchGoogleSheetRows } from "./google-sheets-api.mjs";

const ROOT = process.cwd();
const SOURCE_CONFIG = JSON.parse(
  fs.readFileSync(path.join(ROOT, "config", "data-sources.json"), "utf8"),
);
const SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_ID ||
  process.env.SINGHUB_SHEET_ID ||
  SOURCE_CONFIG.defaultSourceSheetId;
const EVENTS_SHEET =
  process.env.GOOGLE_SHEET_EVENTS_TAB ||
  process.env.SINGHUB_EVENTS_SHEET ||
  SOURCE_CONFIG.tabs.events;
const MARKET_TIME_ZONE = "America/Los_Angeles";

function clean(value) {
  return String(value ?? "").trim();
}

function key(value) {
  return clean(value).toLowerCase();
}

function truthy(value) {
  return /^(true|yes|1)$/i.test(clean(value));
}

function localTodayIso() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MARKET_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function normalizeIsoDate(year, month, day) {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const MONTHS = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

function dateFromIsoText(text) {
  const match = clean(text).match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  return match ? normalizeIsoDate(match[1], match[2], match[3]) : null;
}

function dateFromNamedMonthText(text, fallbackYear = null) {
  const match = clean(text).match(
    /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{1,2})(?:,?\s+(20\d{2}))?\b/i,
  );
  if (!match) return null;
  const month = MONTHS[match[1].toLowerCase().replace(/\.$/, "")];
  const year = match[3] || fallbackYear;
  return month && year ? normalizeIsoDate(year, month, match[2]) : null;
}

function datedEventDate(row, todayIso) {
  const recurrence = key(row.recurring);
  const isDatedClass =
    recurrence.includes("one-time") ||
    recurrence.includes("date-specific") ||
    recurrence.includes("single event");
  if (!isDatedClass) return null;

  const currentYear = todayIso.slice(0, 4);
  const highConfidenceFields = [row.event_id, row.karaoke_day, row.event_notes, row.public_notes];
  for (const value of highConfidenceFields) {
    const iso = dateFromIsoText(value);
    if (iso) return iso;
  }
  for (const value of [row.karaoke_day, row.event_notes, row.public_notes]) {
    const named = dateFromNamedMonthText(value, currentYear);
    if (named) return named;
  }
  return null;
}

async function main() {
  const rows = await fetchGoogleSheetRows(SPREADSHEET_ID, EVENTS_SHEET, "A:AZ");
  const today = localTodayIso();
  const expiredPublicDatedEvents = [];

  for (const row of rows) {
    if (!truthy(row.app_visible)) continue;
    if (key(row.active_status) !== "active") continue;
    if (clean(row.archive_reason) || clean(row.duplicate_of)) continue;

    const eventDate = datedEventDate(row, today);
    if (!eventDate || eventDate >= today) continue;

    expiredPublicDatedEvents.push({
      row: row.__rowNumber,
      eventId: clean(row.event_id),
      venue: clean(row.venue_name),
      eventDate,
      recurrence: clean(row.recurring),
    });
  }

  console.log(`Canonical freshness check (${MARKET_TIME_ZONE})`);
  console.log(`Today: ${today}`);
  console.log(`Scanned canonical event rows: ${rows.length}`);

  if (expiredPublicDatedEvents.length) {
    console.error("\nFAIL: expired dated/date-specific events are still public:");
    for (const event of expiredPublicDatedEvents) {
      console.error(
        `- row ${event.row}: ${event.eventId} | ${event.venue} | ${event.eventDate} | ${event.recurrence}`,
      );
    }
    console.error(
      "\nArchive or hide the expired event. If it became recurring, create/promote a separate recurring canonical row instead of leaving the dated row public.",
    );
    process.exitCode = 1;
    return;
  }

  console.log("PASS: no expired dated/date-specific events are publicly active.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
