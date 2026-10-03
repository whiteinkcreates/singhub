import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
function load(path,modules={}){const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require:name=>modules[name]||require(name)});return exports;}
const placement=load('src/lib/imagePlacement.ts');
const crop={desktop:{x:0,y:100,zoom:1},mobile:{x:78,y:23,zoom:2.15}};
test('crop JSON round trips independently, strips unknown fields and rejects invalid geometry',()=>{
 const parsed=placement.parseImagePlacement(JSON.parse(JSON.stringify(crop)));assert.equal(JSON.stringify(parsed),JSON.stringify(crop));
 assert.equal(placement.parseImagePlacement(undefined),undefined);
 for(const bad of [null,[],{}, {...crop,mobile:null}, {...crop,desktop:{x:-1,y:50,zoom:1}}, {...crop,mobile:{x:101,y:50,zoom:1}}, {...crop,mobile:{x:50,y:NaN,zoom:1}}, {...crop,mobile:{x:50,y:50,zoom:Infinity}}, {...crop,mobile:{x:50,y:50,zoom:0.9}}, {...crop,mobile:{x:50,y:50,zoom:3.1}}, {...crop,mobile:{x:'50',y:50,zoom:1}}])assert.throws(()=>placement.parseImagePlacement(bad));
 assert.equal(placement.parseImagePlacement({...crop,mobile:{...crop.mobile,unknown:true}}).mobile.unknown,undefined);
});
test('production and forced previews use independent positions and zoom, with legacy fallback',()=>{
 const style=placement.placementStyle(crop);assert.equal(style['--image-desktop-position'],'0% 100%');assert.equal(style['--image-mobile-position'],'78% 23%');assert.equal(style['--image-mobile-zoom'],2.15);
 const preview=placement.placementStyle(crop,'center','desktop');assert.equal(preview['--image-mobile-position'],style['--image-desktop-position']);assert.equal(preview['--image-mobile-zoom'],1);
 assert.equal(placement.placementStyle(undefined,'bottom').objectPosition,'bottom');assert.equal(placement.legacyPlacement('right').x,100);
 const css=readFileSync('src/components/media/imagePlacement.css','utf8');assert.match(css,/@media\s*\(max-width:\s*640px\)/);assert.match(css,/transform:scale\(var\(--image-mobile-zoom\)\)/);
});
function nodes(tree){return [tree,...(Array.isArray(tree?.props?.children)?tree.props.children:[tree?.props?.children]).flat(Infinity).filter(x=>x&&typeof x==='object').flatMap(nodes)];}
test('chooser nudges, sliders, reset and copy only change the intended viewport',()=>{
 let mode='desktop',value;const react={useRef:()=>({current:1}),useId:()=>':test:',useState:()=>[mode,next=>{mode=next;}]};
 const {ImagePlacementEditor}=load('src/components/admin/ImagePlacementEditor.tsx',{'react':react,'@/lib/imagePlacement':placement,'@/components/media/PositionedImage':{PositionedImage:()=>null}});
 const render=()=>nodes(ImagePlacementEditor({src:'/image.jpg',alt:'Property',label:'Hero',position:'top',value,onChange:next=>{value=next;}}));
 const click=label=>{const node=render().find(n=>n.props?.['aria-label']===label||(Array.isArray(n.props?.children)?n.props.children.join(''):n.props?.children)===label);assert.ok(node,label);node.props.onClick();};
 click('Move hero image left');assert.equal(value.desktop.x,55);assert.equal(value.mobile.x,50);assert.equal(value.mobile.y,0);
 click('Mobile');click('Move hero image up');assert.equal(value.mobile.y,5);assert.equal(value.desktop.y,0);
 render().find(n=>n.props?.['aria-label']==='Hero mobile zoom').props.onChange({target:{value:'2.25'}});assert.equal(value.mobile.zoom,2.25);assert.equal(value.desktop.zoom,1);
 click('Copy to desktop');assert.equal(value.desktop.zoom,2.25);click('Reset mobile crop');assert.equal(value.mobile.zoom,1);assert.equal(value.mobile.y,0);assert.equal(value.desktop.zoom,2.25);
 for(let i=0;i<25;i++)click('Move hero image right');assert.equal(value.mobile.x,0);
});
