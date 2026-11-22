import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { safeNextPath } from "@/lib/authRedirect";
import { recordAuthIncident } from "@/lib/authIncidents.server";

export const dynamic = "force-dynamic";

// Only a deliberate POST consumes the one-time token. Email security scanners
// routinely GET links before the recipient sees them.
const tokenHashPattern = /^[a-f0-9]{32,128}$/i;
const securityHeaders = {
  "Cache-Control": "no-store, private",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char] || char);
}

function returnPath(raw: string | null, origin: string) {
  if (!raw || raw.length > 1500) return "/account#achievements";
  if (raw.startsWith("/")) return safeNextPath(raw, origin);
  try {
    const linked = new URL(raw);
    // Supabase's RedirectTo is our existing /auth/callback?next=...
    if (linked.origin === origin && linked.pathname === "/auth/callback") {
      return safeNextPath(linked.searchParams.get("next"), origin);
    }
  } catch { /* Bad or absent return URL: use account home. */ }
  return "/account#achievements";
}

function recoveryUrl(origin: string, next: string, errorCode: string) {
  const recovery = new URL("/account", origin);
  recovery.searchParams.set("signin", "1");
  recovery.searchParams.set("authError", errorCode);
  recovery.searchParams.set("next", next);
  return recovery;
}

export function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token_hash") || "";
  const type = url.searchParams.get("type");
  const next = returnPath(url.searchParams.get("next"), url.origin);
  if (!tokenHashPattern.test(token) || type !== "email") {
    return NextResponse.redirect(recoveryUrl(url.origin, next, "invalid_link"), { headers: securityHeaders });
  }

  // A GET never verifies a token, changes cookies, or creates an auth session.
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="no-referrer"><title>Finish signing in | SingHUB</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#101522;color:#fff;font-family:Arial,Helvetica,sans-serif;padding:24px}
main{max-width:440px;width:100%;background:#202738;border:1px solid #445068;border-radius:18px;padding:32px 26px;box-shadow:0 18px 55px #0005}
h1{font-size:1.65rem;line-height:1.2;margin:0 0 14px}p{line-height:1.55;color:#d5dbe7;margin:0 0 22px}
button{border:0;background:#f52c9c;color:white;font-weight:700;font-size:1.04rem;padding:15px 22px;border-radius:11px;width:100%;cursor:pointer}
button:focus-visible{outline:3px solid #5be9f2;outline-offset:3px}small{display:block;margin-top:20px;color:#aebbd0;line-height:1.5}a{color:#85e9ef}
</style></head>
<body><main><h1>One more tap and you're in.</h1>
<p>Confirm that you want to sign in to your My SingHUB account. This extra tap keeps email scanners from using your one-time link before you do.</p>
<form method="post" action="/auth/confirm">
<input type="hidden" name="token_hash" value="${escapeHtml(token)}">
<input type="hidden" name="next" value="${escapeHtml(next)}">
<button type="submit">Finish signing in</button>
</form>
<small>If this wasn't you, close this page. Need a new link? <a href="/account?signin=1">Return to sign in</a>.</small>
</main></body></html>`;
  return new Response(html, { status: 200, headers: { ...securityHeaders, "Content-Type": "text/html; charset=utf-8" } });
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) {
    return NextResponse.json({ error: "Cross-site verification not allowed." }, { status: 403, headers: securityHeaders });
  }
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.startsWith("application/x-www-form-urlencoded")) {
    return NextResponse.json({ error: "Invalid verification request." }, { status: 415, headers: securityHeaders });
  }
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 4000) {
    return NextResponse.json({ error: "Invalid verification request." }, { status: 413, headers: securityHeaders });
  }
  let form: FormData;
  try { form = await request.formData(); } catch {
    return NextResponse.json({ error: "Invalid verification request." }, { status: 400, headers: securityHeaders });
  }
  const token = form.get("token_hash");
  const rawNext = form.get("next");
  const next = returnPath(typeof rawNext === "string" ? rawNext : null, url.origin);
  if (typeof token !== "string" || !tokenHashPattern.test(token)) {
    return NextResponse.redirect(recoveryUrl(url.origin, next, "invalid_link"), { status: 303, headers: securityHeaders });
  }
  const destination = new URL(next, url.origin);
  let response = NextResponse.redirect(destination, { status: 303, headers: securityHeaders });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookies) {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.redirect(destination, { status: 303, headers: securityHeaders });
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    } },
  );

  const { error } = await supabase.auth.verifyOtp({ token_hash: token, type: "email" });
  if (error) {
    await recordAuthIncident(request, "callback", "otp_verify_failed");
    return NextResponse.redirect(recoveryUrl(url.origin, next, "verification_failed"), { status: 303, headers: securityHeaders });
  }
  return response;
}
