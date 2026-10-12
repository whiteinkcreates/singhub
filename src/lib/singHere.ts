import type { SingHereConfig } from "@/lib/venueEnhancements";

/**
 * SingHERE is a handoff, not a claim that SingHUB controls a KJ's rotation.
 * The configured venue method wins over legacy singerSignupUrl.
 * Native signup is deliberately NOT exposed until its queue/host workflow exists.
 */
export function verifiedSignupUrl(value?: string | null) {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

export function resolveSingHere({
  config,
  signupUrl,
  websiteUrl,
  privateRoom = false,
}: {
  config?: SingHereConfig;
  signupUrl?: string;
  websiteUrl?: string;
  privateRoom?: boolean;
}) {
  const mode = config?.mode === "instructions" || config?.mode === "external"
    ? config.mode
    : "default";
  const candidate = mode === "instructions"
    ? undefined
    : mode === "external"
      ? config?.url
      : privateRoom
        ? websiteUrl
        : config?.url || signupUrl;
  const url = verifiedSignupUrl(candidate);
  const instructions = config?.instructions?.trim() ||
    (privateRoom ? "Contact the venue to reserve a private karaoke room." : "Sign up with the KJ to get on the singing list.");
  const title = config?.title?.trim() || (privateRoom ? "Your own room. Your own mic." : "Ready to sing?");
  const linkLabel = config?.linkLabel?.trim() ||
    (privateRoom ? "Open venue website" : "Open online singer signup");
  return { mode, url, instructions, title, linkLabel, rotationPolicy: config?.rotationPolicy?.trim() || undefined };
}
