"use server";

import { revalidatePath } from "next/cache";
import { buildRoundupDraft } from "@/lib/roundups/builder";
import { lockRoundup, markRoundupReviewed, saveDraft } from "@/lib/roundups/repository";

export async function saveRoundupDraftAction(formData: FormData) {
  const date = String(formData.get("date") || "");
  if (!date) throw new Error("Missing roundup date.");
  const draft = await buildRoundupDraft(date);
  await saveDraft(draft);
  revalidatePath(`/admin/roundups?date=${date}`);
}

export async function markRoundupReviewedAction(formData: FormData) {
  const date = String(formData.get("date") || "");
  if (!date) throw new Error("Missing roundup date.");
  await markRoundupReviewed(date);
  revalidatePath(`/admin/roundups?date=${date}`);
}

export async function lockRoundupAction(formData: FormData) {
  const date = String(formData.get("date") || "");
  if (!date) throw new Error("Missing roundup date.");
  await lockRoundup(date);
  revalidatePath(`/admin/roundups?date=${date}`);
}
