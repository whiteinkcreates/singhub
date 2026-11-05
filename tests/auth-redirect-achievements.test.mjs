import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import vm from "node:vm";
import ts from "typescript";

const exports={};
const source=readFileSync("src/lib/authRedirect.ts","utf8");
const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
vm.runInNewContext(output,{exports,URL,URLSearchParams});
const origin="https://singhub.app";
const destination=(pathname="/account",search="",hash="")=>exports.accountEmailReturnPath(pathname,search,hash,origin);

test("default signed-out account email link returns to achievement patch case",()=>{
 assert.equal(destination(),"/account#achievements");
 assert.equal(destination("/account","?signin=1"),"/account#achievements");
 assert.equal(destination("/account","?signup=1"),"/account#achievements");
 assert.equal(destination("/account","?authError=missing_code"),"/account#achievements");
});

test("explicit actions remain at their original destination after sign-in",()=>{
 assert.equal(destination("/account","?perform=the-lamplighter"),"/account?perform=the-lamplighter");
 assert.equal(destination("/account","?save=redwing"),"/account?save=redwing");
 assert.equal(destination("/account","?followHost=kj-loy"),"/hosts/kj-loy");
 assert.equal(destination("/account","?next=%2Fhotel%2Forli%3FsaveHotel%3D1"),"/hotel/orli?saveHotel=1");
 assert.equal(destination("/hotel/pendry","","#tonight"),"/hotel/pendry#tonight");
});

test("external redirects and unexpected paths are blocked",()=>{
 assert.equal(destination("/account","?next=https%3A%2F%2Fevil.example"),"/account");
 assert.equal(destination("/account","?next=%2F%2Fevil.example"),"/account");
 assert.equal(destination("/account","?followHost=%2F%2Fevil.example"),"/account#achievements");
});
