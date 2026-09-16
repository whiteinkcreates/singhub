import "server-only";

import { createHash } from "node:crypto";

export type VenueMediaAsset = {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  createdAt?: string;
};

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Venue media is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
  }

  return { cloudName, apiKey, apiSecret };
}

export function getVenueMediaAdminKey() {
  return process.env.VENUE_MEDIA_UPLOAD_KEY || process.env.DAILY_MIC_UPLOAD_KEY || "";
}

function sanitizeSlug(slug: string) {
  const normalized = slug.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
    throw new Error("Venue slug is invalid.");
  }
  return normalized;
}

function venueFolder(slug: string) {
  return `singhub/venues/${sanitizeSlug(slug)}`;
}

function uploadSignature(folder: string, timestamp: number, apiSecret: string) {
  return createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");
}

export async function uploadVenueMedia(file: File, slug: string) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const folder = venueFolder(slug);
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = uploadSignature(folder, timestamp, apiSecret);

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

  const payload = (await response.json()) as {
    public_id?: string;
    secure_url?: string;
    width?: number;
    height?: number;
    format?: string;
    created_at?: string;
  };

  if (!payload.public_id || !payload.secure_url) {
    throw new Error("Cloudinary did not return the uploaded image metadata.");
  }

  return {
    publicId: payload.public_id,
    url: payload.secure_url,
    width: payload.width || 0,
    height: payload.height || 0,
    format: payload.format || "",
    createdAt: payload.created_at,
  } satisfies VenueMediaAsset;
}

export async function listVenueMedia(slug: string) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const prefix = `${venueFolder(slug)}/`;
  const authorization = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const params = new URLSearchParams({
    type: "upload",
    prefix,
    max_results: "100",
    direction: "desc",
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?${params.toString()}`,
    {
      headers: { Authorization: `Basic ${authorization}` },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Cloudinary media lookup failed (${response.status}): ${details.slice(0, 300)}`);
  }

  const payload = (await response.json()) as {
    resources?: Array<{
      public_id?: string;
      secure_url?: string;
      width?: number;
      height?: number;
      format?: string;
      created_at?: string;
    }>;
  };

  return (payload.resources || [])
    .filter((asset) => Boolean(asset.public_id && asset.secure_url))
    .map((asset) => ({
      publicId: asset.public_id!,
      url: asset.secure_url!,
      width: asset.width || 0,
      height: asset.height || 0,
      format: asset.format || "",
      createdAt: asset.created_at,
    })) satisfies VenueMediaAsset[];
}
