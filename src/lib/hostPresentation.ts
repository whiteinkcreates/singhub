import type { HostProfile, HostWeekday } from "@/types";
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
