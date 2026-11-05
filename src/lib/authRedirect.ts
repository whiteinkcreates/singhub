export function safeNextPath(value: string | null, origin: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) return "/account";
  try {
    const destination = new URL(value, origin);
    return destination.origin === origin ? destination.pathname + destination.search + destination.hash : "/account";
  } catch {
    return "/account";
  }
}

/**
 * The email link should return to the action the singer was taking.
 * A normal My SingHUB sign-in defaults to the achievements section.
 * Explicit venue, performance and host destinations always win.
 */
export function accountEmailReturnPath(pathname:string, search:string, hash:string, origin:string) {
  const params=new URLSearchParams(search);
  const slug=params.get("followHost");
  if(slug&&/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))return "/hosts/"+slug;
  const wanted=params.get("next");
  if(wanted)return safeNextPath(wanted,origin);
  if(pathname==="/account"&&!params.has("perform")&&!params.has("save"))return "/account#achievements";
  return safeNextPath(pathname+search+hash,origin);
}
