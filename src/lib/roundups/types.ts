export type RoundupState = "draft" | "reviewed" | "locked" | "rendered";

export type RoundupValidationSeverity = "blocker" | "warning";

export type RoundupValidationCode =
  | "duplicate_event"
  | "wrong_weekday"
  | "non_san_diego_venue"
  | "conflicting_event_rows"
  | "stale_host_data"
  | "missing_neighborhood"
  | "missing_time"
  | "retired_host_reference"
  | "duplicate_numbering"
  | "omitted_venue";

export type RoundupValidationIssue = {
  code: RoundupValidationCode;
  severity: RoundupValidationSeverity;
  message: string;
  eventIds?: string[];
  venueIds?: string[];
  hostIds?: string[];
};

export type RoundupVenueRow = {
  number: number;
  eventId: string;
  venueId: string;
  venueSlug: string;
  venueName: string;
  city: string;
  neighborhood: string;
  karaokeDay: string;
  startTime: string;
  endTime?: string;
  hostId?: string;
  hostName?: string;
  lastVerified?: string;
};

export type RoundupSlideGroup = {
  groupId: string;
  venueEventIds: string[];
};

export type RoundupDraft = {
  date: string;
  weekday: string;
  state: "draft" | "reviewed";
  sourceLastSynced?: string;
  rows: RoundupVenueRow[];
  groups: RoundupSlideGroup[];
  validation: RoundupValidationIssue[];
  selectedMusicFactId?: string;
};

export type LockedRoundupPayload = {
  schemaVersion: 1;
  date: string;
  weekday: string;
  sourceLastSynced?: string;
  rows: RoundupVenueRow[];
  groups: RoundupSlideGroup[];
  selectedMusicFactId?: string;
};

export type RoundupRenderFormat = "story" | "feed";
