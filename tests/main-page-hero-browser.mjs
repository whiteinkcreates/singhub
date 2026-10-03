import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const routes=[['discover','/'],['venues','/find-karaoke'],['hosts','/hosts'],['hotels','/hotel'],['singboard','/singboard'],['account','/account']];
await mkdir('.main-hero-qa',{recursive:true});const browser=await chromium.launch({args:['--no-sandbox']});const results=[];
try{for(const width of [390,1440]){
 const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'});
 for(const [name,path] of routes){
  const page=await context.newPage();try{
   const response=await page.goto('http://localhost:3100'+path,{waitUntil:'networkidle'});assert.equal(response.status(),200,name);
   const hero=page.locator('[data-page-hero]');await hero.waitFor({state:'visible'});
   const before=await page.evaluate(()=>{const hero=document.querySelector('[data-page-hero]'),surface=document.querySelector('[data-page-surface]');const h=hero.getBoundingClientRect(),s=surface.getBoundingClientRect();return {heroTop:h.top,surfaceTop:s.top,sticky:getComputedStyle(hero).position,before:getComputedStyle(hero,'::before').content,after:getComputedStyle(hero,'::after').content,surfaceLeft:s.left,surfaceWidth:s.width,viewport:document.documentElement.clientWidth,overflow:document.documentElement.scrollWidth>innerWidth};});
   assert.equal(before.sticky,'sticky',name);assert.equal(before.before,'none',name);assert.equal(before.after,'none',name);assert.ok(Math.abs(before.surfaceLeft)<1,name+' left gutter');assert.ok(Math.abs(before.surfaceWidth-before.viewport)<1,name+' full-width sheet');assert.equal(before.overflow,false,name+' overflow');
   await page.screenshot({path:'.main-hero-qa/'+name+'-'+width+'-hero.png'});await page.evaluate(()=>window.scrollTo({top:320,behavior:'instant'}));
   const after=await page.evaluate(()=>{const hero=document.querySelector('[data-page-hero]'),surface=document.querySelector('[data-page-surface]');const h=hero.getBoundingClientRect(),s=surface.getBoundingClientRect();const sample=document.elementFromPoint(s.left+3,Math.min(innerHeight-120,s.top+20));return {heroTop:h.top,surfaceTop:s.top,surfaceInFront:surface.contains(sample),scrollY};});
   assert.ok(Math.abs(after.heroTop-before.heroTop)<1,name+' fixed hero position during scrolling');assert.ok(before.surfaceTop-after.surfaceTop>300,name+' independently scrolling content');assert.equal(after.surfaceInFront,true,name+' sheet covers hero');
   await page.screenshot({path:'.main-hero-qa/'+name+'-'+width+'-scroll.png'});results.push({name,width,...before,...after});console.log(name+' '+width+'px: sticky hero, full-width sheet and scroll layering passed');
  }catch(error){await page.screenshot({path:'.main-hero-qa/'+name+'-'+width+'-failure.png'});throw error;}finally{await page.close();}
 }await context.close();
}}finally{await writeFile('.main-hero-qa/results.json',JSON.stringify(results,null,2));await browser.close();}
