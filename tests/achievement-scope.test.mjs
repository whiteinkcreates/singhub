import { execFileSync } from "node:child_process";
import { test } from "node:test";
import assert from "node:assert/strict";

// The achievement pilot must NEVER edit hero assets, venue/editor data, KJ pages,
// or SingHERE while parallel visual and navigation work is underway.
const protectedPrefixes = [
  "public/images/",
  "src/components/venue/",
  "src/components/host/",
  "src/components/hotel/",
  "src/components/media/",
  "src/app/venues/",
  "src/app/hosts/",
  "src/lib/venueData",
  "src/lib/venueEnhancements",
  "src/lib/venueMedia",
  "src/lib/singHere",
  "src/lib/hostData",
  "src/app/api/admin/venue-media/",
  "src/components/admin/VenueLightUpBuilder.tsx",
  "src/components/v2/BasicVenueTemplate.tsx",
  "src/components/v2/EnhancedVenueTemplate.tsx",
  "src/components/v2/SingHereDialog.tsx",
  "src/components/venue/",
];
const protectedExact = new Set(["src/proxy.ts", "next.config.ts"]);
test("achievement changes never touch hero-image, venue, KJ, or SingHERE workstreams", () => {
  // fetch-depth:0 in CI ensures origin/main is available for the fork-point diff.
  const files = execFileSync("git", ["diff","--name-only","origin/main...HEAD"], {
    encoding:"utf8",
  }).trim().split("\n").filter(Boolean);
  const violations = files.filter(path =>
    protectedExact.has(path) || protectedPrefixes.some(prefix => path.startsWith(prefix))
  );
  assert.deepEqual(violations, [], "Unexpected cross-workstream edits. Coordinate before changing these files.");
});
