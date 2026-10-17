import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {test} from 'node:test';

const tick=()=>new Promise(resolve=>setTimeout(resolve,5));
function fixture(){
 const slots=[];let cursor=0,setup,listener;const reads=[];const exports={};
 const react={
  useState(value){const index=cursor++;if(!(index in slots))slots[index]=value;return [slots[index],value=>{slots[index]=value;}];},
  useRef(value){const index=cursor++;return slots[index]??(slots[index]={current:value});},
  useCallback(fn){return fn;},useEffect(fn){setup=fn;},
 };
 const client={auth:{getUser:async()=>({data:{user:{id:'member-a'}},error:null}),onAuthStateChange(fn){listener=fn;return {data:{subscription:{unsubscribe(){}}}};}}};
 const loadSingerAccount=id=>new Promise((resolve,reject)=>reads.push({id,resolve,reject}));
 const source=ts.transpileModule(readFileSync('src/components/v2/useSingerAccount.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(source,{exports,require:id=>id==='react'?react:{accountClient:()=>client,loadSingerAccount},queueMicrotask,setTimeout,clearTimeout,Error});
 const render=()=>{cursor=0;return exports.useSingerAccount();};
 render();const cleanup=setup();
 return {render,reads,event:(user)=>listener('SIGNED_OUT',user?{user}:null),cleanup,client};
}
test('account exports remain unavailable until the entire account has loaded',async()=>{
 const f=fixture();await tick();assert.equal(f.render().ready,false);assert.equal(f.render().account,null);
 f.reads[0].resolve({alias:'A',achievements:[]});await tick();
 assert.equal(f.render().ready,true);assert.equal(f.render().account.alias,'A');f.cleanup();
});
test('sign-out invalidates in-flight data from the previous member',async()=>{
 const f=fixture();await tick();
 f.client.auth.getUser=async()=>({data:{user:null},error:null});
 f.event(null);assert.equal(f.render().account,null);assert.equal(f.render().ready,false);
 f.reads[0].resolve({alias:'Previous member',achievements:[{id:'private'}]});await tick();
 assert.equal(f.render().user,null);assert.equal(f.render().account,null);assert.equal(f.render().ready,true);f.cleanup();
});
test('a slower refresh cannot replace a newer member and failed reads clear old awards',async()=>{
 const f=fixture();await tick();
 f.client.auth.getUser=async()=>({data:{user:{id:'member-b'}},error:null});
 f.event({id:'member-b'});await tick();
 f.reads[1].resolve({alias:'B',achievements:[]});await tick();
 f.reads[0].resolve({alias:'A',achievements:[{id:'old'}]});await tick();
 assert.equal(f.render().account.alias,'B');assert.equal(f.render().user.id,'member-b');
 const refreshing=f.render().refresh();await tick();assert.equal(f.render().account,null);
 f.reads[2].reject(new Error('Temporary lookup failure'));await refreshing;
 assert.equal(f.render().ready,true);assert.equal(f.render().account,null);assert.match(f.render().error,/Temporary lookup/);f.cleanup();
});
