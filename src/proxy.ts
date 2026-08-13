import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_REALM,
  isAdminAuthorizationHeaderValid,
} from "@/lib/adminAccess";

function unauthorizedResponse() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${ADMIN_REALM}", charset="UTF-8"`,
    },
  });
}

function adminDisabledResponse() {
  return new NextResponse("Not found.", { status: 404 });
}

export function proxy(request: NextRequest) {
  const adminPasswordConfigured = Boolean(process.env.SINGHUB_ADMIN_PASSWORD);

  if (!adminPasswordConfigured && process.env.NODE_ENV === "production") {
    return adminDisabledResponse();
  }

  if (!isAdminAuthorizationHeaderValid(request.headers.get("authorization"))) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/scout/import/:path*"],
};
