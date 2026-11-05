import assert from 'node:assert/strict';
import {generateKeyPairSync} from 'node:crypto';
import * as crypto from 'node:crypto';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {test} from 'node:test';

const {privateKey} = generateKeyPairSync('rsa', {modulusLength:2048});
function loadSheets({fail=false, missing=false}={}) {
  let now=0, auth=0, sheets=0, status=fail?429:200;
  const exports={};
  const context={exports,require:id=>{assert.equal(id,'node:crypto');return crypto;},Buffer,URLSearchParams,AbortSignal,
    process:{env:missing?{}:{GOOGLE_SERVICE_ACCOUNT_EMAIL:'fixture@example.invalid',GOOGLE_PRIVATE_KEY:privateKey.export({type:'pkcs8',format:'pem'})}},
    Date:class extends Date {static now(){return now;}},
    fetch:async(url)=>{await Promise.resolve();if(url.includes('oauth2')){auth++;return {ok:true,json:async()=>({access_token:'fixture-token',expires_in:3600})};}
      sheets++;return {ok:status===200,status,json:async()=>({values:[['host_id','bio'],['test','new live bio']]})};},
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/googleSheets.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,context);
  return {read:exports.getGoogleSheetRows,counts:()=>({auth,sheets}),advance:ms=>{now+=ms;},setStatus:value=>{status=value;}};
}

test('parallel reads share signing/token exchange and identical Sheets requests',async()=>{
 const s=loadSheets();const rows=await Promise.all(Array.from({length:30},()=>s.read('book','hosts')));
 assert.equal(rows[0][0].bio,'new live bio');assert.deepEqual(s.counts(),{auth:1,sheets:1});
 await s.read('book','other-tab');assert.deepEqual(s.counts(),{auth:1,sheets:2});
 s.advance(3541_000);await s.read('book','hosts');assert.deepEqual(s.counts(),{auth:2,sheets:3});
});
test('quota failure pauses repeated reads, then retries and recovers',async()=>{
 const s=loadSheets({fail:true});await assert.rejects(s.read('book','hosts'),/429/);
 for(let i=0;i<10;i++)await assert.rejects(s.read('book','hosts'),/temporarily paused/);
 assert.deepEqual(s.counts(),{auth:1,sheets:1});s.advance(60_001);s.setStatus(200);
 assert.equal((await s.read('book','hosts'))[0].bio,'new live bio');assert.deepEqual(s.counts(),{auth:1,sheets:2});
});
test('401 expires the token and uses a new exchange after cooldown',async()=>{
 const s=loadSheets();s.setStatus(401);await assert.rejects(s.read('book','hosts'),/401/);
 s.advance(60_001);s.setStatus(200);await s.read('book','hosts');assert.deepEqual(s.counts(),{auth:2,sheets:2});
});
test('missing credentials never make an external request',async()=>{
 const s=loadSheets({missing:true});await assert.rejects(s.read('book','hosts'),/not configured/);assert.deepEqual(s.counts(),{auth:0,sheets:0});
});
