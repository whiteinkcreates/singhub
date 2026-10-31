import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/singboard/flyerExtraction.ts", import.meta.url), "utf8");
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const fixtureModule = { exports: {} };
new Function("module", "exports", output)(fixtureModule, fixtureModule.exports);
const { normalizeFlyerFields, uniqueIdentityMatch } = fixtureModule.exports;

test("flyer extraction never guesses dates and rejects invalid calendar days", () => {
  const fields=normalizeFlyerFields({
    title: "Halloween Karaoke", eventDates:["2026-10-31","2026-02-30","October 23","2026-10-31"],
    venueName:"Handlery Hotel Ballroom", hostName:"Jen Sing",
  });
  assert.deepEqual(fields.eventDates, ["2026-10-31"]);
  assert.equal(fields.hostName, "Jen Sing");
  assert.equal(fields.linkUrl, "");
  assert.equal(fields.neighborhood, "");
});

test("untrusted flyer output cannot inject script, data or unsafe links", () => {
  for(const link of ["javascript:alert(1)","data:text/html,bad","file:///etc/passwd","/not-fully-qualified"]) {
    assert.equal(normalizeFlyerFields({ linkUrl:link }).linkUrl, "");
  }
  assert.equal(normalizeFlyerFields({ linkUrl:"https://singhub.app/events" }).linkUrl,"https://singhub.app/events");
});

test("canonical profile matching requires one unambiguous exact identity", () => {
  const venues=[{name:"The Mesa Bar & Grill",id:"mesa"},{name:"The Mesa Bar & Grill",id:"different"}];
  assert.equal(uniqueIdentityMatch("The Mesa Bar and Grill",venues,venue=>[venue.name]),undefined);
  assert.deepEqual(uniqueIdentityMatch("The Mesa Bar & Grill",venues.slice(0,1),venue=>[venue.name]),venues[0]);
  assert.equal(uniqueIdentityMatch("Mesa",venues.slice(0,1),venue=>[venue.name]),undefined);
});

test("publishing requires authenticated contributor and server-side canonical ownership", () => {
  const route=readFileSync(new URL("../src/app/api/singboard/publish/route.ts",import.meta.url),"utf8");
  assert.match(route,/getAuthorizedSingBoardPoster/);
  assert.match(route,/Your posting access is not linked to a public venue/);
  assert.match(route,/You cannot post as another KJ/);
  assert.match(route,/reviewStatus: poster.poster_type === "admin" \? "verified" : "pending"/);
  assert.match(route,/safeLink\(linkUrl\)/);
});

test("AI extraction is contributor gated and keeps API key server-side", () => {
  const route=readFileSync(new URL("../src/app/api/singboard/extract/route.ts",import.meta.url),"utf8");
  assert.match(route,/getAuthorizedSingBoardPoster\(accessCode\)/);
  assert.match(route,/process.env.OPENAI_API_KEY/);
  assert.match(route,/store: false/);
  assert.match(route,/normalizeFlyerFields/);
});
