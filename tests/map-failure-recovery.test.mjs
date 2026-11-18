import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import ts from 'typescript';

const source=readFileSync('src/components/map/SingHubBasemap.tsx','utf8');
const body=source.slice(source.indexOf('export function protectBasemapRemoval'),source.indexOf('/** Native vector'));
const exports={};
vm.runInNewContext(ts.transpileModule(body,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports});

test('failed WebGL initialization can be retried and removed repeatedly without crashing',()=>{
 let removed=0;
 const layer={getMaplibreMap:()=>undefined,getContainer:()=>({remove:()=>removed++}),onRemove(){throw Error('missing renderer');}};
 exports.protectBasemapRemoval(layer);
 assert.doesNotThrow(()=>{layer.onRemove({});layer.onRemove({});});
 assert.equal(removed,2);
});

test('initialized renderer uses adapter cleanup once and subsequent removal stays safe',()=>{
 let renderer={},calls=0;const map={};
 const layer={getMaplibreMap:()=>renderer,getContainer:()=>undefined,onRemove(value){assert.equal(this,layer);assert.equal(value,map);calls++;renderer=null;return this;}};
 exports.protectBasemapRemoval(layer);
 assert.equal(layer.onRemove(map),layer);
 assert.doesNotThrow(()=>layer.onRemove(map));
 assert.equal(calls,1);
});
