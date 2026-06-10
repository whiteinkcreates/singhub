import fs from "node:fs";
import path from "node:path";
import type {
  ScoutCandidate,
  ScoutConfidenceLevel,
  ScoutReviewStatus,
} from "@/types";
import { parseTsv, type TsvRow } from "@/lib/tsv";

const DATA_PATH = path.join(process.cwd(), "public", "data", "scout_candidates.tsv");

const REVIEW_STATUSES: ScoutReviewStatus[] = [
  "new",
  "needs_review",
  "needs_ig_review",
  "needs_call",
  "likely_active",
  "confirmed",
  "false_positive",
  "stale",
  "premium_prospect",
  "basic_listing_approved",
];

const CONFIDENCE_LEVELS: ScoutConfidenceLevel[] = ["low", "medium", "high", "verified"];

function parseBoolean(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

function parseNumber(value: string | undefined) {
  if (!value || !value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeReviewStatus(value: string | undefined): ScoutReviewStatus {
  if (REVIEW_STATUSES.includes(value as ScoutReviewStatus)) {
    return value as ScoutReviewStatus;
  }

  return "new";
}

function normalizeConfidenceLevel(value: string | undefined): ScoutConfidenceLevel {
  if (CONFIDENCE_LEVELS.includes(value as ScoutConfidenceLevel)) {
    return value as ScoutConfidenceLevel;
  }

  return "low";
}

function optional(value: string | undefined) {
  return value?.trim() || undefined;
}

function rowToScoutCandidate(row: TsvRow): ScoutCandidate {
  return {
    candidateId: row.candidate_id,
    venueName: row.venue_name,
    possibleCity: optional(row.possible_city),
    possibleNeighborhood: optional(row.possible_neighborhood),
    possibleAddress: optional(row.possible_address),
    claimedKaraokeDay: optional(row.claimed_karaoke_day),
    claimedKaraokeTime: optional(row.claimed_karaoke_time),
    hostKjName: optional(row.host_kj_name),
    sourceUrl: optional(row.source_url),
    sourceType: optional(row.source_type),
    evidenceSnippet: optional(row.evidence_snippet),
    confidenceScore: parseNumber(row.confidence_score),
    confidenceLevel: normalizeConfidenceLevel(row.confidence_level),
    reviewStatus: normalizeReviewStatus(row.review_status),
    scoutNotes: optional(row.scout_notes),
    duplicateOf: optional(row.duplicate_of),
    instagramHandle: optional(row.instagram_handle),
    facebookUrl: optional(row.facebook_url),
    venueWebsite: optional(row.venue_website),
    phone: optional(row.phone),
    email: optional(row.email),
    premiumProspect: parseBoolean(row.premium_prospect),
  };
}

export function getScoutCandidates(): ScoutCandidate[] {
  const content = fs.readFileSync(DATA_PATH, "utf8");
  return parseTsv(content).map(rowToScoutCandidate);
}

export function getScoutReviewStatuses() {
  return REVIEW_STATUSES;
}

export function getScoutConfidenceLevels() {
  return CONFIDENCE_LEVELS;
}
