import type { VenueProgramEvent } from "@/lib/venueEnhancements";

export type CalendarImportResult = { events: VenueProgramEvent[]; warnings: string[] };
const CATEGORIES = new Set(["karaoke", "live_music", "game", "community", "special"]);

function categoryFor(title: string): NonNullable<VenueProgramEvent["category"]> {
  if (/karaoke/i.test(title)) return "karaoke";
  if (/\b(bingo|game|trivia|tournament|disc golf)\b/i.test(title)) return "game";
  if (/\b(comedy|burlesque|drag|wrestling)\b/i.test(title)) return "community";
  if (/\b(band|live|rock|metal|blues|jam|concert|open mic)\b/i.test(title)) return "live_music";
  return "special";
}

function validDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const test = new Date(date + "T12:00:00Z");
  return !Number.isNaN(test.getTime()) && test.toISOString().slice(0, 10) === date;
}

function dedupe(events: VenueProgramEvent[], warnings: string[]) {
  const byKey = new Map<string, VenueProgramEvent>();
  for (const event of events) {
    if (!validDate(event.date) || !event.title.trim()) {
      warnings.push("Skipped an event with a missing title or invalid date.");
      continue;
    }
    const key = [event.date, event.title.trim().toLowerCase(), event.time || ""].join("|");
    byKey.set(key, event);
  }
  const unique = [...byKey.values()].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  if (unique.length > 180) warnings.push("Only the first 180 events are accepted per venue. Import fewer months at once.");
  return unique.slice(0, 180);
}

function csvRows(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", quoted = false;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '"') {
      if (quoted && input[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(field.trim()); field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && input[i + 1] === "\n") i++;
      row.push(field.trim()); field = "";
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else field += char;
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function parseCsv(input: string): CalendarImportResult {
  const warnings: string[] = [];
  const rows = csvRows(input.replace(/^\uFEFF/, ""));
  if (rows.length < 2) return { events: [], warnings: ["CSV needs a header and at least one dated event."] };
  const headers = rows[0].map(header => header.toLowerCase().replace(/[\s_-]/g, ""));
  const col = (...names: string[]) => headers.findIndex(header => names.includes(header));
  const dateIndex = col("date", "startdate");
  const titleIndex = col("title", "name", "summary", "event");
  if (dateIndex < 0 || titleIndex < 0) return { events: [], warnings: ["CSV requires date and title columns."] };
  const timeIndex = col("time", "starttime");
  const detailIndex = col("detail", "description", "details");
  const categoryIndex = col("category", "type");
  const sourceIndex = col("sourceurl", "url", "link", "eventurl");
  const events = rows.slice(1).map((row, index) => {
    const read = (i: number) => i >= 0 ? (row[i] || "").trim() : "";
    const category = read(categoryIndex);
    const sourceUrl = read(sourceIndex);
    if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) warnings.push("Row " + (index + 2) + ": invalid URL was omitted.");
    const title = read(titleIndex);
    return {
      date: read(dateIndex), title,
      time: read(timeIndex) || undefined,
      detail: read(detailIndex) || undefined,
      category: CATEGORIES.has(category) ? category as VenueProgramEvent["category"] : categoryFor(title),
      sourceUrl: /^https?:\/\//i.test(sourceUrl) ? sourceUrl : undefined,
    };
  });
  return { events: dedupe(events, warnings), warnings };
}

function unescapeIcs(value: string): string {
  return value.replace(/\\n/gi, " ").replace(/\\([,;\\])/g, "$1").trim();
}

function parseIcsDate(field: string): { date: string; time?: string } | null {
  const [, params, raw] = /^([^:]*):(.*)$/.exec(field) || [];
  if (!raw) return null;
  const value = raw.trim();
  if (!/^\d{8}/.test(value)) return null;
  const start = value.slice(0, 8);
  let date = start.slice(0, 4) + "-" + start.slice(4, 6) + "-" + start.slice(6, 8);
  let time: string | undefined;
  if (/T\d{4}/.test(value)) {
    if (value.endsWith("Z")) {
      const parsed = new Date(value.slice(0, 4) + "-" + value.slice(4, 6) + "-" + value.slice(6, 8) + "T" + value.slice(9, 11) + ":" + value.slice(11, 13) + ":" + (value.slice(13, 15) || "00") + "Z");
      if (Number.isNaN(parsed.getTime())) return null;
      const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit", hour: "numeric", minute: "2-digit", hour12: false,
      }).formatToParts(parsed).map(part => [part.type, part.value]));
      date = parts.year + "-" + parts.month + "-" + parts.day;
      const hour = Number(parts.hour) % 24;
      time = String(hour % 12 || 12) + ":" + parts.minute + (hour < 12 ? " AM" : " PM");
    } else {
      const hour = Number(value.slice(9, 11));
      const minute = value.slice(11, 13);
      time = String(hour % 12 || 12) + ":" + minute + (hour < 12 ? " AM" : " PM");
    }
  }
  if (params && /TZID=/i.test(params) && !/TZID=(?:America\/Los_Angeles|US\/Pacific)/i.test(params)) return null;
  return { date, time };
}

function parseIcs(input: string): CalendarImportResult {
  const warnings: string[] = [];
  const text = input.replace(/\r\n?/g, "\n").replace(/\n[ \t]/g, "");
  const blocks = [...text.matchAll(/BEGIN:VEVENT\n([\s\S]*?)\nEND:VEVENT/g)];
  if (!blocks.length) return { events: [], warnings: ["No VEVENT entries found in this ICS file."] };
  const events: VenueProgramEvent[] = [];
  for (const block of blocks) {
    const lines = block[1].split("\n");
    const find = (name: string) => lines.find(line => line.toUpperCase().startsWith(name + ":") || line.toUpperCase().startsWith(name + ";"));
    if (find("RRULE")) {
      warnings.push("Recurring ICS rules are not expanded. Export individual dated occurrences or use CSV.");
      continue;
    }
    const start = find("DTSTART");
    const titleLine = find("SUMMARY");
    const title = titleLine?.slice(titleLine.indexOf(":") + 1);
    const parsed = start ? parseIcsDate(start) : null;
    if (!parsed || !title) { warnings.push("Skipped an ICS event with missing or unsupported date/title."); continue; }
    const descriptionLine = find("DESCRIPTION");
    const description = descriptionLine?.slice(descriptionLine.indexOf(":") + 1);
    const urlLine = find("URL");
    const url = urlLine?.slice(urlLine.indexOf(":") + 1);
    const normalizedTitle = unescapeIcs(title);
    events.push({
      ...parsed, title: normalizedTitle,
      detail: description ? unescapeIcs(description).slice(0, 240) : undefined,
      category: categoryFor(normalizedTitle),
      sourceUrl: url && /^https?:\/\//i.test(url) ? url : undefined,
    });
  }
  return { events: dedupe(events, warnings), warnings };
}

export function parseVenueCalendarImport(text: string, filename: string): CalendarImportResult {
  if (filename.toLowerCase().endsWith(".ics") || /^BEGIN:VCALENDAR/m.test(text)) return parseIcs(text);
  return parseCsv(text);
}

export function mergeVenueCalendarEvents(existing: VenueProgramEvent[], incoming: VenueProgramEvent[]): VenueProgramEvent[] {
  // Imported updates replace matching title/date/time, while manually created unrelated events survive.
  const events = [...existing];
  for (const next of incoming) {
    const index = events.findIndex(event => event.date === next.date && event.title.trim().toLowerCase() === next.title.trim().toLowerCase() && (event.time || "") === (next.time || ""));
    if (index >= 0) events[index] = { ...events[index], ...next };
    else events.push(next);
  }
  return events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title)).slice(0, 180);
}
