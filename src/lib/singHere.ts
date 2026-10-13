import type { SingHereConfig } from "@/lib/venueEnhancements";

/** An external SingHERE action is always a handoff; SingHUB does not run the KJ queue. */
export function verifiedSignupUrl(value?: string | null): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    if (!["https:", "http:"].includes(url.protocol) || !url.hostname || url.username || url.password) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

/** Retains the existing (config, options) signature across all venue templates. */
export function resolveSingHere(
  config: SingHereConfig | undefined,
  options: { privateRoom?: boolean; externalSignupUrl?: string; venueWebsite?: string } = {},
) {
  const privateRoom = Boolean(options.privateRoom);
  const instructions = config?.instructions?.trim() ||
    (privateRoom ? "Contact the venue to book a private room." : "Sign up with the KJ to join the rotation.");
  const candidate = config?.mode === "instructions" ? undefined :
    config?.mode === "external" ? config.url :
    (privateRoom ? options.venueWebsite : options.externalSignupUrl);
  return {
    title: config?.title?.trim() || (privateRoom ? "Your own room. Your own mic." : "Ready to sing?"),
    instructions,
    url: verifiedSignupUrl(candidate),
    linkLabel: config?.linkLabel?.trim() || (privateRoom ? "Open venue website" : "Open singer signup"),
    rotationPolicy: config?.rotationPolicy?.trim() || undefined,
  };
}
