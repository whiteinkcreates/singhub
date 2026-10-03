import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
if(process.argv.includes('--prepare')){
 if(process.env.CI!=='true')throw new Error('This temporary route is restricted to the CI browser build.');
 await mkdir('src/app/media-placement-qa',{recursive:true});
 await writeFile('src/app/media-placement-qa/page.tsx',`"use client";
import {useState} from 'react';
import {ImagePlacementEditor} from '@/components/admin/ImagePlacementEditor';
import {PositionedImage} from '@/components/media/PositionedImage';
import type {ResponsiveImagePlacement} from '@/lib/imagePlacement';
export default function MediaQa(){const [crop,setCrop]=useState<ResponsiveImagePlacement>();return <main className="mx-auto max-w-4xl p-5"><h1>Shared media placement browser QA</h1><ImagePlacementEditor label="Hero" src="/images/venues/north-bar-taps.jpg" alt="North Bar taps" value={crop} onChange={setCrop}/><h2>Public renderer</h2><div className="h-48 overflow-hidden" data-testid="public-frame"><PositionedImage src="/images/venues/north-bar-taps.jpg" alt="Public crop" placement={crop} className="h-full w-full object-cover"/></div><output data-testid="crop-json">{JSON.stringify(crop)}</output></main>}`);
 process.exit(0);
}
const {chromium}=await import('playwright');await mkdir('.media-qa',{recursive:true});const browser=await chromium.launch({args:['--no-sandbox']});
try{for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:1000}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto('http://localhost:3100/media-placement-qa',{waitUntil:'networkidle'});assert.equal(response.status(),200);
 await page.getByRole('button',{name:'Move hero image left',exact:true}).click();await page.getByRole('button',{name:'Mobile',exact:true}).click();
 await page.getByRole('button',{name:'Move hero image down',exact:true}).click();await page.getByLabel('Hero mobile zoom',{exact:true}).fill('1.50');
 const crop=JSON.parse(await page.getByTestId('crop-json').textContent());assert.equal(crop.desktop.x,55);assert.equal(crop.desktop.zoom,1);assert.equal(crop.mobile.y,45);assert.equal(crop.mobile.zoom,1.5);
 const publicImage=page.getByAltText('Public crop');const computed=await publicImage.evaluate(img=>({position:getComputedStyle(img).objectPosition,transform:getComputedStyle(img).transform}));
 assert.equal(computed.position,width===390?'50% 45%':'55% 50%');assert.equal(computed.transform,width===390?'matrix(1.5, 0, 0, 1.5, 0, 0)':'matrix(1, 0, 0, 1, 0, 0)');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 await page.screenshot({path:'.media-qa/editor-'+width+'.png',fullPage:true});await page.getByRole('button',{name:'Reset mobile crop',exact:true}).click();const reset=JSON.parse(await page.getByTestId('crop-json').textContent());assert.equal(reset.mobile.zoom,1);assert.equal(reset.desktop.x,55);await context.close();console.log('Editor and public responsive renderer passed at '+width+'px');
}}finally{await browser.close();}
