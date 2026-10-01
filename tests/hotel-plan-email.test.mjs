import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import ts from 'typescript';

const source=readFileSync(new URL('../src/lib/v2/singerAccount.ts',import.meta.url),'utf8');
function service(user,error=null,sendError=null){
 const sent=[];
 const client={auth:{getUser:async()=>({data:{user},error}),signInWithOtp:async payload=>{sent.push(payload);return {error:sendError};}}};
 const exports={};
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,require:()=>({createClient:()=>client}),process:{env:{NEXT_PUBLIC_SUPABASE_URL:'https://example.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'test'}},location:{origin:'https://singhub.app'},Error});
 return {send:exports.sendSavedPlanLink,sent};
}
test('signed-in plan email uses verified account address and returns to saved plans',async()=>{
 const {send,sent}=service({email:'guest@example.com'});
 await send();
 assert.equal(sent.length,1);
 assert.equal(sent[0].email,'guest@example.com');
 assert.equal(sent[0].options.emailRedirectTo,'https://singhub.app/auth/callback?next=%2Faccount');
});
test('provider failures propagate so a saved plan does not claim email success',async()=>{
 const error=new Error('Email rate limit exceeded');
 const {send,sent}=service({email:'guest@example.com'},null,error);
 await assert.rejects(send(),/Email rate limit exceeded/);
 assert.equal(sent.length,1);
});
test('missing session and invalid session cannot send a plan email',async()=>{
 const missing=service(null);
 await assert.rejects(missing.send(),/Sign in again/);
 assert.equal(missing.sent.length,0);
 const invalid=service({email:'guest@example.com'},new Error('Invalid session'));
 await assert.rejects(invalid.send(),/Invalid session/);
 assert.equal(invalid.sent.length,0);
});
