import sourceConfig from "../../config/data-sources.json";

export const DEFAULT_SOURCE_SHEET_ID = sourceConfig.defaultSourceSheetId;

export const SOURCE_TABS = {
  venues: sourceConfig.tabs.venues,
  events: sourceConfig.tabs.events,
  hosts: sourceConfig.tabs.hosts,
} as const;

export function getSourceSheetId() {
  // Keep the same production override already used by the host loader.
  // Otherwise use the known canonical SingHUB Source of Truth workbook.
  return (
    process.env.GOOGLE_SHEETS_ID ||
    process.env.SINGHUB_SHEET_ID ||
    DEFAULT_SOURCE_SHEET_ID
  );
}

export function getSourceTab(
  kind: keyof typeof SOURCE_TABS,
  ...envNames: string[]
) {
  for (const envName of envNames) {
    const value = process.env[envName];
    if (value) return value;
  }

  return SOURCE_TABS[kind];
}
