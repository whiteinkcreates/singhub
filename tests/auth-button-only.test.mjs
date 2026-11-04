import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";

const dialog=readFileSync("src/components/v2/AccountServiceDialog.tsx","utf8");
const email=readFileSync("docs/auth-button-only-email-template.html","utf8");

test("My SingHUB sign-in presents a single button-only email path",()=>{
 assert.match(dialog,/sendAccountLink\(submittedEmail,next\)/);
 assert.match(dialog,/Sign in to SingHUB/);
 assert.match(dialog,/Send a new link or change email/);
 assert.doesNotMatch(dialog,/verifyEmailCode|verifyOtp|setOtp|sentEmail|singhub-email-otp|one-time-code|six-digit|code & sign in/i);
});
test("Supabase email template sends one secure confirmation button without any OTP text",()=>{
 assert.match(email,/href="{{ \.ConfirmationURL }}"/);
 assert.equal((email.match(/<a\s/g)||[]).length,1,"one CTA link only");
 assert.doesNotMatch(email,/\.Token\s*}}|\bOption 1\b|\bOption 2\b|Paste this code|six-digit/i);
 assert.match(email,/>Sign in to SingHUB<\/a>/);
 assert.match(email,/Subject: Your SingHUB sign-in link/);
});

test("support recovery guidance matches button-only sign-in",()=>{
 const support=readFileSync("src/app/support/page.tsx","utf8");
 assert.match(support,/tap the Sign in to SingHUB button/);
 assert.doesNotMatch(support,/enter (?:its |the )?six-digit code/i);
});
