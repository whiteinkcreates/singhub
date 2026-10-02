export function safeNextPath(value: string | null, origin: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) return "/account";
  try {
    const destination = new URL(value, origin);
    return destination.origin === origin ? destination.pathname + destination.search + destination.hash : "/account";
  } catch {
    return "/account";
  }
}
