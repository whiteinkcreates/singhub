"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAuthorization } from "@/lib/adminAuthorization";
import {
  createSingBoardAccessMember,
  linkSingBoardPosterToEmail,
  reviewSingBoardPost,
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
  await requireAdminAuthorization();
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
  await requireAdminAuthorization();
  await rotateSingBoardAccessCode(required(formData, "memberId"), required(formData, "accessCode"));
  revalidatePath("/admin/singboard-access");
}

export async function setAccessActiveAction(formData: FormData) {
  await requireAdminAuthorization();
  await setSingBoardAccessActive(required(formData, "memberId"), String(formData.get("active")) === "true");
  revalidatePath("/admin/singboard-access");
}

export async function linkPosterAccountAction(formData:FormData){
 await requireAdminAuthorization();
 const memberId=required(formData,"memberId");
 const email=required(formData,"email");
 await linkSingBoardPosterToEmail(memberId,email);
 revalidatePath("/admin/singboard-access");
}
export async function reviewPostAction(formData:FormData){
 await requireAdminAuthorization();
 const id=required(formData,"postId");
 const decision=required(formData,"decision");
 if(decision!=="verify"&&decision!=="unpublish")throw new Error("Invalid review decision.");
 await reviewSingBoardPost(id,decision);
 revalidatePath("/admin/singboard-access");
 revalidatePath("/singboard");
 revalidatePath("/venues/[slug]","page");
 revalidatePath("/hosts/[slug]","page");
}
