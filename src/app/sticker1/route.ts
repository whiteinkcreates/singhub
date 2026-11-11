import { NextResponse } from "next/server";

// Keep the printed sticker address stable and count visits in the existing /go/ registry.
export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/go/sticker1", request.url), 307);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
