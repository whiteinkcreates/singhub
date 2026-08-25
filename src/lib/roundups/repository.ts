import "server-only";

import { createHash } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import type { LockedRoundupPayload, RoundupDraft, RoundupState } from "@/lib/roundups/types";

export type PersistedRoundup = {
  id: string;
  roundupDate: string;
  weekday: string;
  state: RoundupState;
  sourceLastSynced?: string;
  draftPayload: RoundupDraft;
  lockedPayload?: LockedRoundupPayload;
  lockedHash?: string;
  lockedAt?: string;
  renderedAt?: string;
};

function normalizeRow(row: Record<string, unknown>): PersistedRoundup {
  return {
    id: String(row.id),
    roundupDate: String(row.roundup_date),
    weekday: String(row.weekday),
    state: row.state as RoundupState,
    sourceLastSynced: row.source_last_synced ? String(row.source_last_synced) : undefined,
    draftPayload: row.draft_payload as RoundupDraft,
    lockedPayload: row.locked_payload ? (row.locked_payload as LockedRoundupPayload) : undefined,
    lockedHash: row.locked_hash ? String(row.locked_hash) : undefined,
    lockedAt: row.locked_at ? String(row.locked_at) : undefined,
    renderedAt: row.rendered_at ? String(row.rendered_at) : undefined,
  };
}

async function nextVersionNumber(roundupId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("roundup_versions")
    .select("version_number")
    .eq("roundup_id", roundupId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data?.version_number || 0) + 1;
}

async function saveVersion(roundupId: string, state: RoundupState, payload: unknown, payloadHash?: string) {
  const supabase = createClient();
  const versionNumber = await nextVersionNumber(roundupId);
  const { error } = await supabase.from("roundup_versions").insert({
    roundup_id: roundupId,
    version_number: versionNumber,
    state,
    payload,
    payload_hash: payloadHash || null,
  });
  if (error) throw error;
}

export async function getRoundupByDate(date: string): Promise<PersistedRoundup | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("roundups")
    .select("*")
    .eq("roundup_date", date)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeRow(data as Record<string, unknown>) : null;
}

export async function saveDraft(draft: RoundupDraft): Promise<PersistedRoundup> {
  const existing = await getRoundupByDate(draft.date);
  if (existing && existing.state !== "draft") {
    throw new Error(`Cannot replace ${existing.state.toUpperCase()} roundup with a new draft.`);
  }

  const supabase = createClient();
  const payload = { ...draft, state: "draft" as const };
  const { data, error } = await supabase
    .from("roundups")
    .upsert(
      {
        roundup_date: draft.date,
        weekday: draft.weekday,
        state: "draft",
        source_last_synced: draft.sourceLastSynced || null,
        draft_payload: payload,
      },
      { onConflict: "roundup_date" },
    )
    .select("*")
    .single();

  if (error) throw error;
  const roundup = normalizeRow(data as Record<string, unknown>);
  await saveVersion(roundup.id, "draft", payload);
  return roundup;
}

export async function markRoundupReviewed(date: string): Promise<PersistedRoundup> {
  const existing = await getRoundupByDate(date);
  if (!existing) throw new Error("Save the draft before marking it reviewed.");
  if (existing.state !== "draft") throw new Error(`Roundup is already ${existing.state}.`);

  const blockers = existing.draftPayload.validation.filter((issue) => issue.severity === "blocker");
  if (blockers.length > 0) {
    throw new Error(`Resolve ${blockers.length} blocking validation issue${blockers.length === 1 ? "" : "s"} before review.`);
  }

  const reviewedPayload: RoundupDraft = { ...existing.draftPayload, state: "reviewed" };
  const supabase = createClient();
  const { data, error } = await supabase
    .from("roundups")
    .update({ state: "reviewed", draft_payload: reviewedPayload })
    .eq("id", existing.id)
    .select("*")
    .single();

  if (error) throw error;
  await saveVersion(existing.id, "reviewed", reviewedPayload);
  return normalizeRow(data as Record<string, unknown>);
}

function lockedPayloadFromDraft(draft: RoundupDraft): LockedRoundupPayload {
  return {
    schemaVersion: 1,
    date: draft.date,
    weekday: draft.weekday,
    sourceLastSynced: draft.sourceLastSynced,
    rows: draft.rows,
    groups: draft.groups,
    selectedMusicFactId: draft.selectedMusicFactId,
  };
}

export async function lockRoundup(date: string): Promise<PersistedRoundup> {
  const existing = await getRoundupByDate(date);
  if (!existing) throw new Error("No saved roundup found for this date.");
  if (existing.state !== "reviewed") throw new Error("Roundup must be REVIEWED before it can be LOCKED.");

  const lockedPayload = lockedPayloadFromDraft(existing.draftPayload);
  const canonicalJson = JSON.stringify(lockedPayload);
  const lockedHash = createHash("sha256").update(canonicalJson).digest("hex");
  const lockedAt = new Date().toISOString();

  const supabase = createClient();
  const { data, error } = await supabase
    .from("roundups")
    .update({
      state: "locked",
      locked_payload: lockedPayload,
      locked_hash: lockedHash,
      locked_at: lockedAt,
    })
    .eq("id", existing.id)
    .select("*")
    .single();

  if (error) throw error;
  await saveVersion(existing.id, "locked", lockedPayload, lockedHash);
  return normalizeRow(data as Record<string, unknown>);
}
