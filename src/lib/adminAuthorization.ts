import { headers } from "next/headers";
import { isAdminAuthorizationHeaderValid } from "@/lib/adminAccess";

export async function requireAdminAuthorization() {
  const requestHeaders = await headers();
  if (!isAdminAuthorizationHeaderValid(requestHeaders.get("authorization"))) {
    throw new Error("Unauthorized admin request.");
  }
}
