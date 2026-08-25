import "server-only";

import { createHash } from "node:crypto";

export async function uploadSingBoardImage(file: File) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("SingBOARD image uploads are not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "singhub/singboard";
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Cloudinary upload failed (${response.status}): ${details.slice(0, 300)}`);
  }

  const payload = (await response.json()) as { secure_url?: string; public_id?: string };
  if (!payload.secure_url) throw new Error("Cloudinary did not return an image URL.");

  return { imageUrl: payload.secure_url, publicId: payload.public_id };
}
