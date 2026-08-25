"use server";

import { revalidatePath } from "next/cache";
import { buildRoundupDraft, revalidateRoundupDraft } from "@/lib/roundups/builder";
import { lockRoundup, markRoundupRendered, markRoundupReviewed, saveDraft } from "@/lib/roundups/repository";
import type { RoundupDraft, RoundupVenueRow } from "@/lib/roundups/types";

function groupsFor(rows: RoundupVenueRow[]) {
  const groups = [];
  for (let index = 0; index < rows.length; index += 5) groups.push({ groupId: `venues-${String(groups.length + 1).padStart(2, "0")}`, venueEventIds: rows.slice(index, index + 5).map((row) => row.eventId) });
  return groups;
}
export async function saveRoundupDraftAction(formData: FormData) { const date=String(formData.get("date")||"");if(!date)throw new Error("Missing roundup date.");await saveDraft(await buildRoundupDraft(date));revalidatePath("/admin/roundups"); }
export async function saveEditedRoundupDraftAction(formData: FormData) { const raw=String(formData.get("draft")||"");if(!raw)throw new Error("Missing edited roundup draft.");const submitted=JSON.parse(raw) as RoundupDraft;const normalized:RoundupDraft={...submitted,state:"draft",rows:submitted.rows.map((row,index)=>({...row,number:index+1})),groups:groupsFor(submitted.rows)};await saveDraft(await revalidateRoundupDraft(normalized));revalidatePath("/admin/roundups"); }
export async function markRoundupReviewedAction(formData: FormData) { const date=String(formData.get("date")||"");if(!date)throw new Error("Missing roundup date.");await markRoundupReviewed(date);revalidatePath("/admin/roundups"); }
export async function lockRoundupAction(formData: FormData) { const date=String(formData.get("date")||"");if(!date)throw new Error("Missing roundup date.");await lockRoundup(date);revalidatePath("/admin/roundups"); }
export async function markRoundupRenderedAction(date: string) { if(!date)throw new Error("Missing roundup date.");await markRoundupRendered(date);revalidatePath("/admin/roundups"); }
