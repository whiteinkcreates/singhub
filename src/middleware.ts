import { NextRequest, NextResponse } from "next/server";

const ADMIN_REALM = "SingHUB Admin";

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

function parseBasicAuthHeader(headerValue: string | null) {
  if (!headerValue?.startsWith("Basic ")) {
    return null;
  }

  try {
    const decoded = atob(headerValue.slice("Basic ".length));
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex === -1) {
      return null;
    }

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

function isAuthorized(request: NextRequest) {
  const configuredUsername = process.env.SINGHUB_ADMIN_USER || "admin";
  const configuredPassword = process.env.SINGHUB_ADMIN_PASSWORD;

  if (!configuredPassword) {
    return process.env.NODE_ENV !== "production";
  }

  const credentials = parseBasicAuthHeader(request.headers.get("authorization"));

  return (
    credentials?.username === configuredUsername &&
    credentials.password === configuredPassword
  );
}

export function middleware(request: NextRequest) {
  const adminPasswordConfigured = Boolean(process.env.SINGHUB_ADMIN_PASSWORD);

  if (!adminPasswordConfigured && process.env.NODE_ENV === "production") {
    return adminDisabledResponse();
  }

  if (!isAuthorized(request)) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/scout/import/:path*"],
};
