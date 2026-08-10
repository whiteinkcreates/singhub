export const DEFAULT_SOURCE_SHEET_ID =
  "1E5RhaidevYFCQ90GAQdeQFwT55HlE-mSacM4pdir2Nc";

export const SOURCE_TABS = {
  venues: "Venues_Canonical",
  events: "Events_Canonical",
  hosts: "Hosts_Canonical",
} as const;

export function getSourceSheetId() {
  // Keep the same production override already used by the host loader.
  // Otherwise use the known canonical SingHUB Source of Truth workbook.
  return process.env.GOOGLE_SHEETS_ID || DEFAULT_SOURCE_SHEET_ID;
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
