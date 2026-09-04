"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAuthorization } from "@/lib/adminAuthorization";
import {
  cloneGoLink,
  createGoLink,
  parseGoTags,
  setGoLinkStatus,
  updateGoLink,
  type GoLinkStatus,
} from "@/lib/goLinks/repository";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function required(formData: FormData, key: string) {
  const result = value(formData, key);
  if (!result) throw new Error(`${key} is required.`);
  return result;
}

function fields(formData: FormData) {
  return {
    name: required(formData, "name"),
    destination: required(formData, "destination"),
    linkType: value(formData, "linkType") || "other",
    campaign: value(formData, "campaign"),
    partner: value(formData, "partner"),
    channel: value(formData, "channel"),
    placement: value(formData, "placement"),
    tags: parseGoTags(value(formData, "tags")),
    notes: value(formData, "notes"),
  };
}

export async function createGoLinkAction(formData: FormData) {
  await requireAdminAuthorization();
  await createGoLink({ ...fields(formData), slug: required(formData, "slug") });
  revalidatePath("/admin/links");
}

export async function updateGoLinkAction(formData: FormData) {
  await requireAdminAuthorization();
  await updateGoLink(required(formData, "id"), fields(formData));
  revalidatePath("/admin/links");
}

export async function setGoLinkStatusAction(formData: FormData) {
  await requireAdminAuthorization();
  const status = required(formData, "status") as GoLinkStatus;
  if (!["active", "paused", "archived"].includes(status)) throw new Error("Invalid link status.");
  await setGoLinkStatus(required(formData, "id"), status);
  revalidatePath("/admin/links");
}

export async function cloneGoLinkAction(formData: FormData) {
  await requireAdminAuthorization();
  await cloneGoLink(required(formData, "id"), {
    name: required(formData, "name"),
    slug: required(formData, "slug"),
    channel: value(formData, "channel"),
    placement: value(formData, "placement"),
  });
  revalidatePath("/admin/links");
}
