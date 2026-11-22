import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { test } from "node:test";

const token = "a".repeat(64);

function fixture(fail = false) {
  const exports = {};
  const verifications = [];
  const reports = [];
  const cookiesWritten = [];
  const NextResponse = {
    redirect(to, init = {}) {
      const headers = new Headers(init.headers || {});
      headers.set("Location", String(to));
      const response = new Response(null, { status: init.status || 307, headers });
      response.cookies = { set: (...args) => cookiesWritten.push(args) };
      return response;
    },
    json(data, init = {}) {
      return new Response(JSON.stringify(data), { status: init.status || 200, headers: init.headers });
    },
  };
  const requireMock = id => {
    if (id === "next/server") return { NextResponse };
    if (id === "@supabase/ssr") return {
      createServerClient: (_url, _key, options) => ({
        auth: {
          verifyOtp: async args => {
            verifications.push(args);
            if (fail) return { error: new Error("expired") };
            options.cookies.setAll([{ name: "sb-test", value: "session", options: { path: "/", httpOnly: true } }]);
            return { error: null };
          },
        },
      }),
    };
    if (id === "@/lib/authRedirect") return {
      safeNextPath: (path, origin) =>
        typeof path === "string" && path.startsWith("/") && !path.startsWith("//") &&
        new URL(path, origin).origin === origin ? path : "/account",
    };
    if (id === "@/lib/authIncidents.server") return {
      recordAuthIncident: async (_request, source, code) => { reports.push({ source, code }); },
    };
    throw Error("Unexpected import: " + id);
  };
  const output = ts.transpileModule(
    readFileSync("src/app/auth/confirm/route.ts", "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
  ).outputText;
  vm.runInNewContext(output, { exports, require: requireMock, URL, Response, Headers });
  const url = "https://singhub.app/auth/confirm";
  function makeRequest(input, options = {}) {
    const request = new Request(input, options);
    const jar = [];
    request.cookies = { getAll: () => jar, set: (name, value) => { jar.push({ name, value }); } };
    return request;
  }
  function post(next = "/account#achievements", overrides = {}) {
    const body = new URLSearchParams({ token_hash: token, next, ...overrides });
    return exports.POST(makeRequest(url, {
      method: "POST",
      headers: { origin: "https://singhub.app", "content-type": "application/x-www-form-urlencoded" },
      body,
    }));
  }
  return { exports, verifications, reports, cookiesWritten, post, makeRequest, url };
}

test("email scanners can GET the link without consuming the one-time credential", async () => {
  const f = fixture();
  const url = f.url + "?" + new URLSearchParams({ token_hash: token, type: "email" });
  const response = f.exports.GET(f.makeRequest(url));
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /<form method="post" action="\/auth\/confirm">/);
  assert.match(html, /Finish signing in/);
  assert.match(html, /name="token_hash"/);
  assert.equal(response.headers.get("Referrer-Policy"), "no-referrer");
  assert.equal(response.headers.get("Cache-Control"), "no-store, private");
  assert.equal(f.verifications.length, 0, "GET never verifies an auth token");
});

test("deliberate confirmation POST verifies the token and writes session cookies", async () => {
  const f = fixture();
  const nested = "https://singhub.app/auth/callback?next=%2Fvenues%2Fredwing%23vibe-check";
  const response = await f.post(nested);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "https://singhub.app/venues/redwing#vibe-check");
  assert.equal(f.verifications.length, 1);
  assert.equal(f.verifications[0].token_hash, token);
  assert.equal(f.verifications[0].type, "email");
  assert.equal(f.cookiesWritten.length, 1);
  assert.equal(f.reports.length, 0);
});

test("an expired token recovers without exposing errors or sensitive login details", async () => {
  const f = fixture(true);
  const response = await f.post();
  assert.equal(response.status, 303);
  const target = new URL(response.headers.get("location"));
  assert.equal(target.pathname, "/account");
  assert.equal(target.searchParams.get("authError"), "verification_failed");
  assert.deepEqual(JSON.parse(JSON.stringify(f.reports)), [{ source: "callback", code: "otp_verify_failed" }]);
});

test("cross-site POST and bad tokens are blocked before verification", async () => {
  const f = fixture();
  const crossSite = await f.exports.POST(f.makeRequest(f.url, {
    method: "POST",
    headers: { origin: "https://untrusted.example", "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token_hash: token }),
  }));
  assert.equal(crossSite.status, 403);
  const bad = await f.post("/account", { token_hash: "bad" });
  assert.equal(bad.status, 303);
  assert.equal(new URL(bad.headers.get("location")).searchParams.get("authError"), "invalid_link");
  assert.equal(f.verifications.length, 0);
});

test("external redirect destinations fall back to the singer account", async () => {
  const f = fixture();
  const response = await f.post("https://attacker.example/account");
  assert.equal(response.headers.get("location"), "https://singhub.app/account#achievements");
});

test("only actual email send failures trigger client email failure alerts", () => {
  const source = readFileSync("src/components/v2/AccountServiceDialog.tsx", "utf8");
  assert.match(source, /failed.status!==429&&failed.code!=='over_email_send_rate_limit'/);
  assert.equal((source.match(/code:'email_send_failed'/g) || []).length, 1);
  assert.match(source, /Too many sign-in emails requested/);
});
