import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

// Evaluate the actual TS helper with type imports erased; no Next app or mock logic.
const compiled = ts.transpileModule(read("src/lib/singHere.ts"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exported = {};
new Function("exports", compiled)(exported);
const { resolveSingHere, verifiedSignupUrl } = exported;

test("rejects malformed, dangerous or credentialed singer-signup links", () => {
  assert.equal(verifiedSignupUrl("javascript:alert(1)"), undefined);
  assert.equal(verifiedSignupUrl("https://user:secret@example.com"), undefined);
  assert.equal(verifiedSignupUrl("https://"), undefined);
  assert.equal(verifiedSignupUrl(" https://example.com/signup "), "https://example.com/signup");
});
test("honors explicit SingHERE signup method and preserves legacy fallbacks", () => {
  assert.equal(resolveSingHere({mode:"instructions", url:"https://example.com"},{externalSignupUrl:"https://queue.example.com"}).url,undefined);
  assert.equal(resolveSingHere({mode:"external",url:"https://example.com/join"},{externalSignupUrl:"https://queue.example.com"}).url,"https://example.com/join");
  assert.equal(resolveSingHere({mode:"external",url:"javascript:bad"},{externalSignupUrl:"https://queue.example.com"}).url,undefined);
  assert.equal(resolveSingHere(undefined,{externalSignupUrl:"https://queue.example.com"}).url,"https://queue.example.com/");
  assert.equal(resolveSingHere(undefined,{privateRoom:true,venueWebsite:"https://venue.example.com"}).url,"https://venue.example.com/");
});
test("venue-specific rotation notes are optional and trimmed", () => {
  assert.equal(resolveSingHere({rotationPolicy:"  First come, first served.  "}).rotationPolicy,"First come, first served.");
  assert.equal(resolveSingHere({rotationPolicy:"  "}).rotationPolicy,undefined);
  assert.equal(resolveSingHere(undefined).rotationPolicy,undefined);
});
test("editor saves, reloads and tracks KJ policies without losing venue hero or calendar", () => {
  const s=read("src/components/admin/VenueLightUpBuilder.tsx");
  for(const p of ["setSingHereRotationPolicy(profile.singHere?.rotationPolicy","rotationPolicy: singHereRotationPolicy.trim()","rotationPolicy: profile.singHere?.rotationPolicy?.trim()","singHereRotationPolicy, singHereUrl","KJ rotation policy (optional, host-confirmed only)","loadedProfileSignature","VenueMediaLibrary","EventEditor","parseVenueCalendarImport"]) assert.ok(s.includes(p),p);
  assert.ok(!s.includes("useEffect(() => {\n    if (!loading && baselineSignature === null)"));
  const api=read("src/app/api/admin/venue-enhancements/route.ts");
  assert.match(api,/profile\.singHere\?\.rotationPolicy/);
  assert.match(api,/rotationPolicy\.length > 1200/);
});
test("host rules remain optional with canonical source and no hero or Following regression", () => {
 const source=read("src/lib/hostData.ts");
 const profile=read("src/components/host/HostProfileTemplate.tsx");
 for(const t of ['"rotation_policy"','"singer_guidelines"',"host.rotationPolicy","singerGuidelines"]) assert.ok(source.includes(t),t);
 assert.match(profile,/host\.singerGuidelines\?\.trim\(\)/);
 assert.match(profile,/<FollowHostButton /);
 assert.match(profile,/PositionedImage placement=\{host\.heroImageUrl/);
});
test("no invented policies appear when source values are blank", () => {
 const venue=read("src/components/v2/SingHereDialog.tsx");
 const legacy=read("src/components/venue/SingHereAction.tsx");
 assert.match(venue,/flow\.rotationPolicy\?<div/);
 assert.match(legacy,/rotationPolicy\?<section/);
});
