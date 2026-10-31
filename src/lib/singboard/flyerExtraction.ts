export type FlyerFields = {
  title: string;
  venueName: string;
  neighborhood: string;
  eventDates: string[];
  startTime: string;
  hostName: string;
  detail: string;
  linkUrl: string;
};

function text(value: unknown, max = 250): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T12:00:00Z");
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

/** Normalize untrusted vision output; never invent dates or canonical identities. */
export function normalizeFlyerFields(value: unknown): FlyerFields {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    title: text(raw.title, 160),
    venueName: text(raw.venueName, 140),
    neighborhood: text(raw.neighborhood, 100),
    eventDates: Array.isArray(raw.eventDates) ? [...new Set(raw.eventDates.filter(validDate))].slice(0, 8) : [],
    startTime: text(raw.startTime, 80),
    hostName: text(raw.hostName, 140),
    detail: text(raw.detail, 600),
    linkUrl: (() => {
      const candidate = text(raw.linkUrl, 400);
      if (!candidate) return "";
      try { const url = new URL(candidate); return ["http:", "https:"].includes(url.protocol) ? url.toString() : ""; }
      catch { return ""; }
    })(),
  };
}

export function normalizeIdentity(value: string): string {
  return value.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

export function uniqueIdentityMatch<T>(source: string, candidates: T[], labels: (candidate: T) => string[]): T | undefined {
  const key = normalizeIdentity(source);
  if (!key) return;
  const matches = candidates.filter(candidate => labels(candidate).some(label => normalizeIdentity(label) === key));
  return matches.length === 1 ? matches[0] : undefined;
}
