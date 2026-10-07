import type { HostOrganizationType, HostProfile, HostWeekday } from "@/types";
import { getSanDiegoNightlifeWeekday } from "@/lib/nightlifeTime";

export const HOST_WEEKDAYS: HostWeekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const HOST_CONFIRMED_STATUSES = new Set([
  "form_response",
  "direct_submission",
  "host_confirmed",
]);

export function isHostConfirmed(
  host: Pick<HostProfile, "verificationStatus" | "formResponseTimestamp">,
) {
  if (host.formResponseTimestamp) return true;
  const status = host.verificationStatus?.trim().toLowerCase();
  return Boolean(status && HOST_CONFIRMED_STATUSES.has(status));
}

export function getTodayInLosAngeles(): HostWeekday {
  return getSanDiegoNightlifeWeekday() as HostWeekday;
}


const ORGANIZATION_LABELS: Record<HostOrganizationType, string> = {
  kj_company: "KJ COMPANY",
  entertainment_company: "ENTERTAINMENT COMPANY",
  karaoke_team: "KARAOKE TEAM",
  entertainment_collective: "ENTERTAINMENT COLLECTIVE",
  live_band_producer: "LIVE BAND / PRODUCER",
  other: "ORGANIZATION",
};

export function getHostKindLabel(
  host: Pick<HostProfile, "entityType" | "organizationType">,
) {
  if (host.entityType !== "organization") return "HOST";
  return host.organizationType
    ? ORGANIZATION_LABELS[host.organizationType]
    : "ORGANIZATION";
}
