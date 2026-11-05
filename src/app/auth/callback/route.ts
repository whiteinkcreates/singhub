import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { safeNextPath } from "@/lib/authRedirect";
import { recordAuthIncident } from "@/lib/authIncidents.server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"), requestUrl.origin);
  const destination = new URL(next, requestUrl.origin);

  if (!code) {
    const providerError = requestUrl.searchParams.has("error") || requestUrl.searchParams.has("error_code");
    if (providerError) await recordAuthIncident(request, "callback", "provider_link_error");
    const recovery = new URL("/account", requestUrl.origin);
    recovery.searchParams.set("signin", "1");
    recovery.searchParams.set("authError", providerError ? "provider_link_error" : "missing_code");
    recovery.searchParams.set("next", next);
    return NextResponse.redirect(recovery);
  }

  let response = NextResponse.redirect(destination);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.redirect(destination);
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    await recordAuthIncident(request, "callback", "exchange_failed");
    const recovery = new URL("/account", requestUrl.origin);
    recovery.searchParams.set("signin", "1");
    recovery.searchParams.set("authError", "session_exchange_failed");
    recovery.searchParams.set("next", next);
    return NextResponse.redirect(recovery);
  }

  return response;
}
