import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Exercise the same TypeScript utility that the live sign-in form imports.
const source=readFileSync("src/lib/authEmailOtp.ts","utf8");
const exports={};
vm.runInNewContext(
 ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
 {exports},
);
const {normalizeEmailOtp,isValidEmailOtp}=exports;

test("eight-digit email OTP including its leading zero survives normalization",()=>{
 assert.equal(normalizeEmailOtp("01234567"),"01234567");
 assert.equal(normalizeEmailOtp("0 1 2 3 4 5 6 7"),"01234567");
 assert.equal(normalizeEmailOtp(" 0123-4567 "),"01234567");
 assert.equal(isValidEmailOtp(normalizeEmailOtp("0 1 2 3 4 5 6 7")),true);
});

test("supports Supabase-configured 6–10-digit email codes without accepting junk",()=>{
 for(const code of ["012345","0123456","01234567","012345678","0123456789"])
  assert.equal(isValidEmailOtp(code),true,code);
 for(const code of ["","01234","01234567890","A1234567","0123456A"])
  assert.equal(isValidEmailOtp(code),false,code);
 assert.equal(normalizeEmailOtp("0 1 2 3 4 5 6 7 8 9 0"),"0123456789");
});

test("sign-in form cannot truncate valid pasted codes or claim six digits",()=>{
 const dialog=readFileSync("src/components/v2/AccountServiceDialog.tsx","utf8");
 assert.match(dialog,/isValidEmailOtp\(otp\)/);
 assert.match(dialog,/normalizeEmailOtp\(event\.target\.value\)/);
 assert.doesNotMatch(dialog,/maxLength=\{6\}|slice\(0,6\)|\[0-9\]\{6\}|Six-digit email code|six-digit code/i);
 assert.match(dialog,/pattern="\[0-9\]\{6,10\}"/);
});
