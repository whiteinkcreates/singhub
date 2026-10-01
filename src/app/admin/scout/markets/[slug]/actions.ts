"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAuthorization } from "@/lib/adminAuthorization";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length ? trimmed : null;
}

export async function updateScoutMarket(formData: FormData) {
  await requireAdminAuthorization();

  const slug = value(formData, "slug");
  if (!slug) throw new Error("Missing SCOUT market slug.");

  const supabase = await createClient();
  const payload = {
    stage: value(formData, "stage"),
    research_status: value(formData, "research_status"),
    priority: value(formData, "priority"),
    objective: value(formData, "objective"),
    launch_notes: value(formData, "launch_notes"),
    source_of_truth_notes: value(formData, "source_of_truth_notes"),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("scout_markets").update(payload).eq("slug", slug);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/scout");
  revalidatePath(`/admin/scout/markets/${slug}`);
  redirect(`/admin/scout/markets/${slug}?saved=1`);
}
