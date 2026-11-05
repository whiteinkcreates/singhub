import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {test} from 'node:test';
function fixture(){const exports={},events=[];vm.runInNewContext(ts.transpileModule(readFileSync('src/app/api/auth/incident/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,URL,Response,require:id=>id==='next/server'?{NextResponse:{json:Response.json}}:{recordAuthIncident:async(_request,source,code)=>{events.push({source,code});}}});return {events,post:(body,origin='https://singhub.example.test')=>exports.POST(new Request('https://singhub.example.test/api/auth/incident',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)}))};}
test('auth incident endpoint accepts category-only same-origin reports',async()=>{const {events,post}=fixture();assert.equal((await post({code:'email_send_failed'})).status,204);assert.deepEqual(events,[{source:'client',code:'email_send_failed'}]);});
test('cross-origin and sensitive or unknown incident fields never reach recording',async()=>{const {events,post}=fixture();assert.equal((await post({code:'email_send_failed'},'https://other.example.test')).status,403);for(const value of [{code:'email_send_failed',email:'fixture@example.invalid'},{code:'email_send_failed',token:'fixture-token'},{code:'untrusted'},null,[],{code:'email_send_failed',raw:'x'.repeat(400)}])assert.equal((await post(value)).status,400);assert.equal(events.length,0);});
