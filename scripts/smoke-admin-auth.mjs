#!/usr/bin/env node

const baseUrl = process.env.SINGHUB_SMOKE_BASE_URL;
if (!baseUrl) {
  throw new Error("Set SINGHUB_SMOKE_BASE_URL to the preview or production origin.");
}

for (const path of ["/admin/scout", "/admin/singers", "/admin/venue-activity", "/admin/light-up-venues", "/api/admin/venue-enhancements/bulk"]) {
  const response = await fetch(new URL(path, baseUrl), {
    redirect: "manual",
  });

  if (![401, 404].includes(response.status)) {
    throw new Error(
      "Expected unauthenticated " + path + " to return 401 or 404, received " + response.status + ".",
    );
  }

  console.log("PASS " + path + " rejected an unauthenticated request with " + response.status + ".");
}
