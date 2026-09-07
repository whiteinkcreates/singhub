import "server-only";

import { createHash } from "node:crypto";
import type { PollCategory } from "@/lib/pollBank";

const ALLOWED: PollCategory[] = [
  "karaoke-court",
  "kill-one",
  "this-or-that",
  "song-battle",
  "would-you-rather",
  "confessions",
  "open-mic",
  "wild-card",
];

export function isDailyMicCategory(value: string): value is PollCategory {
  return ALLOWED.includes(value as PollCategory);
}

export function dailyMicPublicId(category: PollCategory) {
  return `singhub/daily-mic/${category}`;
}

export function dailyMicDeliveryUrl(category: PollCategory) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) throw new Error("CLOUDINARY_CLOUD_NAME is not configured.");
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${dailyMicPublicId(category)}`;
}

export async function uploadDailyMicTemplate(file: File, category: PollCategory) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Daily Mic template uploads need CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
  }

  if (!file.type.startsWith("image/")) throw new Error("Template must be an image file.");
  if (file.size > 12 * 1024 * 1024) throw new Error("Template image must be under 12 MB.");

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = dailyMicPublicId(category);
  const overwrite = "true";
  const signatureBase = `overwrite=${overwrite}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(signatureBase).digest("hex");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("public_id", publicId);
  form.append("overwrite", overwrite);
  form.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Cloudinary upload failed (${response.status}): ${details.slice(0, 300)}`);
  }

  const payload = (await response.json()) as { secure_url?: string; public_id?: string; width?: number; height?: number };
  if (!payload.secure_url) throw new Error("Cloudinary did not return an image URL.");
  return {
    imageUrl: payload.secure_url,
    publicId: payload.public_id || publicId,
    width: payload.width,
    height: payload.height,
  };
}
