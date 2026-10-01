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
 return {send:()=>exports.sendAccountLink('guest@example.com','/hotel/pendry-san-diego?plan=happy-does&saveHotel=1'),sent};
}
test('first-visit email carries the pending plan through the auth callback',async()=>{
 const {send,sent}=service({email:'guest@example.com'});
 await send();
 assert.equal(sent.length,1);
 assert.equal(sent[0].email,'guest@example.com');
 assert.equal(sent[0].options.emailRedirectTo,'https://singhub.app/auth/callback?next=%2Fhotel%2Fpendry-san-diego%3Fplan%3Dhappy-does%26saveHotel%3D1');
});
test('provider failures propagate so a saved plan does not claim email success',async()=>{
 const error=new Error('Email rate limit exceeded');
 const {send,sent}=service({email:'guest@example.com'},null,error);
 await assert.rejects(send(),/Email rate limit exceeded/);
 assert.equal(sent.length,1);
});
