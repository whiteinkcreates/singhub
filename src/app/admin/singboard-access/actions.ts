"use server";

import { revalidatePath } from "next/cache";
import {
  createSingBoardAccessMember,
  rotateSingBoardAccessCode,
  setSingBoardAccessActive,
  type SingBoardPosterType,
} from "@/lib/singboard/repository";

function required(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();
  if (!value) throw new Error(`${key} is required.`);
  return value;
}

export async function createAccessMemberAction(formData: FormData) {
  const posterType = required(formData, "posterType") as SingBoardPosterType;
  if (!["venue", "kj", "admin"].includes(posterType)) throw new Error("Invalid access type.");
  await createSingBoardAccessMember({
    displayName: required(formData, "displayName"),
    posterType,
    accessCode: required(formData, "accessCode"),
    venueId: String(formData.get("venueId") || ""),
    hostId: String(formData.get("hostId") || ""),
  });
  revalidatePath("/admin/singboard-access");
}

export async function rotateAccessCodeAction(formData: FormData) {
  await rotateSingBoardAccessCode(required(formData, "memberId"), required(formData, "accessCode"));
  revalidatePath("/admin/singboard-access");
}

export async function setAccessActiveAction(formData: FormData) {
  await setSingBoardAccessActive(required(formData, "memberId"), String(formData.get("active")) === "true");
  revalidatePath("/admin/singboard-access");
}
