import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';

if(process.argv.includes('--prepare')){
 if(process.env.CI!=='true')throw new Error('My Tour browser fixture is CI-only.');
 await mkdir('src/app/my-tour-qa',{recursive:true});
 await writeFile('src/app/my-tour-qa/page.tsx',`"use client";
import {useState} from 'react';
import {TourMap} from '@/components/v2/TourMap';
import {SingHereDialog} from '@/components/v2/SingHereDialog';
import type {VenueListing} from '@/types';
import '@/components/v2/styles/account.css';
const venues=[
 {id:'venue-a',slug:'deanos-pub',venueName:"Deano's Pub - La Mesa",city:'La Mesa',neighborhood:'La Mesa',latitude:32.7754,longitude:-117.0327},
 {id:'venue-b',slug:'the-lamplighter',venueName:'The Lamplighter',city:'San Diego',neighborhood:'Mission Hills',latitude:32.751,longitude:-117.181}
] as VenueListing[];
export default function MyTourQa(){
 const [showSingHere,setShowSingHere]=useState(false);
 return <div className="v2-account" style={{padding:'24px 12px',minHeight:'100vh'}}>
  <section className="panel tour-collection" id="tour-stops">
   <header className="panel-head"><div><p className="gig-eyebrow">Your karaoke map</p><h2>My Tour</h2><p>Collect a TourStop when you show up for karaoke.</p></div>
   <div className="tour-count" aria-label="4 Tour Stops"><strong>4</strong><span>Tour<br/>Stops</span></div></header>
   <TourMap venues={venues as (VenueListing & {latitude:number;longitude:number})[]}/>
  </section>
  <button className="button" onClick={()=>setShowSingHere(true)}>Open SingHERE QA</button>
  {showSingHere&&<SingHereDialog venue={venues[0]} onClose={()=>setShowSingHere(false)}/>}
 </div>;
}`);
 process.exit(0);
}

const {chromium}=await import('playwright');
const browser=await chromium.launch({args:['--no-sandbox']});
const base=process.env.QA_BASE_URL||'http://localhost:3100';
// Use deterministic tiles: this checks layout, not availability of the external OSM CDN.
const tilePng=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
await mkdir('.my-tour-qa',{recursive:true});
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:880}});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://tile.openstreetmap.org/**',route=>route.fulfill({status:200,contentType:'image/png',body:tilePng}));
  await page.goto(base+'/my-tour-qa',{waitUntil:'networkidle'});
  await page.locator('.tour-map .leaflet-tile-loaded').first().waitFor();
  const info=await page.evaluate(()=>{
   const map=document.querySelector('.tour-map');
   const tiles=[...document.querySelectorAll('.tour-map .leaflet-tile-loaded')];
   const badge=document.querySelector('.tour-count');
   const label=badge.querySelector('span');
   return {
    badgeWidth:badge.getBoundingClientRect().width,
    labelWidth:label.getBoundingClientRect().width,
    labelHeight:label.getBoundingClientRect().height,
    labelText:label.innerText.trim(),
    tiles:tiles.length,
    positions:tiles.map(tile=>getComputedStyle(tile).position),
    filter:getComputedStyle(tiles[0]).filter,
    viewportWidth:document.documentElement.scrollWidth
   };
  });
  assert.ok(info.badgeWidth>=info.labelWidth,'Tour count text fits the stat box');
  assert.match(info.labelText,/Tour\s+Stops/i,'Count label is stacked');
  assert.ok(info.tiles>=4,'Leaflet loads multiple adjacent map tiles');
  assert.ok(info.positions.every(position=>position==='absolute'),'Leaflet raster tiles must be absolutely positioned');
  assert.notEqual(info.filter,'none','Night map treats tiles with a non-default palette');
  assert.ok(info.viewportWidth<=width+1,'My Tour creates no horizontal page overflow');
  await page.getByRole('button',{name:'Street',exact:true}).click();
  assert.equal(await page.locator('.tour-map').getAttribute('data-map-theme'),'street');
  assert.equal(await page.locator('.tour-map .leaflet-tile-loaded').first().evaluate(tile=>getComputedStyle(tile).filter),'none');
  await page.getByRole('button',{name:'Night',exact:true}).click();
  await page.locator('#tour-stops').screenshot({path:'.my-tour-qa/my-tour-'+width+'.png'});
  await page.getByRole('button',{name:'Open SingHERE QA'}).click();
  await page.getByRole('button',{name:'I just sang',exact:true}).click();
  const songLink=page.getByRole('link',{name:/Log a song I sang/});
  await songLink.waitFor();
  assert.match(await songLink.getAttribute('href'),/^\/account\?perform=deanos-pub$/);
  assert.ok(Number.parseFloat(await songLink.evaluate(el=>getComputedStyle(el).borderTopWidth))>=1,'Log song link must be visibly boxed');
  await page.screenshot({path:'.my-tour-qa/song-log-'+width+'.png'});
  assert.deepEqual(errors,[],'No browser JS errors');
  await context.close();
  console.log('My Tour tile layout, theme toggle, counter and song CTA passed at '+width+'px');
 }
}finally{await browser.close();}
