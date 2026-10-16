import "server-only";
import { getHostMediaSettings } from "@/lib/hostMedia.server";
import { SITE_DISCOVERY_HERO_KEY, type HostMediaSettings } from "@/lib/hostMedia";

/** A page hero can override the Discovery photo without creating an uneditable hard-coded image. */
export async function getPublicIndexHero(siteKey: string): Promise<HostMediaSettings | null> {
  const [specific, discovery] = await Promise.all([
    getHostMediaSettings(siteKey).catch(() => null),
    getHostMediaSettings(SITE_DISCOVERY_HERO_KEY).catch(() => null),
  ]);
  return specific?.heroUrl ? specific : discovery?.heroUrl ? discovery : null;
}
