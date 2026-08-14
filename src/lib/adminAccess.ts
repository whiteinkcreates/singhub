export const ADMIN_REALM = "SingHUB Admin";

export function parseBasicAuthHeader(headerValue: string | null) {
  if (!headerValue?.startsWith("Basic ")) return null;

  try {
    const decoded = atob(headerValue.slice("Basic ".length));
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex === -1) return null;

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

export function isAdminAuthorizationHeaderValid(headerValue: string | null) {
  const configuredUsername = process.env.SINGHUB_ADMIN_USER || "admin";
  const configuredPassword = process.env.SINGHUB_ADMIN_PASSWORD;

  if (!configuredPassword) return process.env.NODE_ENV !== "production";

  const credentials = parseBasicAuthHeader(headerValue);
  return (
    credentials?.username === configuredUsername &&
    credentials.password === configuredPassword
  );
}
