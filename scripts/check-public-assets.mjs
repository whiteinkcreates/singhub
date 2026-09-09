import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(process.cwd(), "public");
const MAX_BYTES = 750 * 1024;
const ALLOWED = new Set([
  // Install/browser assets need to remain local for reliable PWA metadata.
  "icon.png",
  "apple-icon.png",
  // Existing core brand assets stay local for now. Heavy venue, host, event,
  // social, and generated media belongs in Cloudinary.
  "images/header-singhub-logo.png",
  "images/singhub-mark.png",
]);
const MEDIA_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".mp4", ".mov", ".webm"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

const oversized = [];
for (const file of await walk(ROOT)) {
  const ext = path.extname(file).toLowerCase();
  if (!MEDIA_EXTENSIONS.has(ext)) continue;
  const relative = path.relative(ROOT, file).replaceAll(path.sep, "/");
  if (ALLOWED.has(relative)) continue;
  const info = await stat(file);
  if (info.size > MAX_BYTES) oversized.push({ relative, size: info.size });
}

if (oversized.length) {
  console.error("Oversized media found in public/. Put heavy venue, host, event, social, and generated media in Cloudinary instead:\n");
  for (const item of oversized) console.error(`- ${item.relative}: ${(item.size / 1024 / 1024).toFixed(2)} MB`);
  process.exit(1);
}

console.log("Public asset check passed. Heavy media stays out of Vercel deployments.");
