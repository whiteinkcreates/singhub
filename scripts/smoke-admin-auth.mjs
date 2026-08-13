#!/usr/bin/env node

const baseUrl = process.env.SINGHUB_SMOKE_BASE_URL;
if (!baseUrl) {
  throw new Error("Set SINGHUB_SMOKE_BASE_URL to the preview or production origin.");
}

const response = await fetch(new URL("/admin/scout", baseUrl), {
  redirect: "manual",
});

if (![401, 404].includes(response.status)) {
  throw new Error(
    `Expected unauthenticated /admin/scout to return 401 or 404, received ${response.status}.`,
  );
}

console.log(`PASS /admin/scout rejected an unauthenticated request with ${response.status}.`);
