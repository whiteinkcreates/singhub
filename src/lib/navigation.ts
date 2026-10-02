export function isExternalWebUrl(href: string, origin: string): boolean {
  try {
    const url = new URL(href, origin);
    return (url.protocol === "https:" || url.protocol === "http:") && url.origin !== origin;
  } catch { return false; }
}
