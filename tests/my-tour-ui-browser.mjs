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
 return <div className="v2-account" style={{padding:'90px 12px 24px',minHeight:'100vh'}}>
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
const browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const base=process.env.QA_BASE_URL||'http://localhost:3100';
await mkdir('.my-tour-qa',{recursive:true});
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:880}});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const styles=[];const failed=[];let rasterRequests=0;
  page.on('request',request=>{if(request.url().includes('/styles/'))styles.push(request.url());if(request.url().includes('tile.openstreetmap.org'))rasterRequests++;});
  page.on('response',response=>{if((response.url().includes('openfreemap.org')||response.url().includes('maplibre-gl-worker'))&&response.status()>=400)failed.push(response.url()+': '+response.status());});
  await page.goto(base+'/my-tour-qa',{waitUntil:'networkidle'});
  await page.locator('.tour-leaflet-map[data-map-state="ready"][data-map-style="night"]').waitFor({timeout:60000});
  assert.equal(await page.locator('.tour-map canvas').count(),1);
  assert.equal(await page.locator('.tour-map canvas').evaluate(el=>getComputedStyle(el).filter),'none','Native vector colors must not be inverted or filtered');
  assert.equal(await page.locator('.tour-stop-map-marker').count(),2);
  assert.ok((await page.locator('.leaflet-control-attribution').innerText()).includes('OpenMapTiles'));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.locator('.tour-stop-map-marker').first().click();
  assert.match(await page.locator('.leaflet-popup-content a').getAttribute('href'),/^\/venues\//);
  await page.locator('.leaflet-popup-close-button').click();
  await page.getByRole('button',{name:'Street',exact:true}).click();
  await page.locator('.tour-leaflet-map[data-map-state="ready"][data-map-style="street"]').waitFor({timeout:60000});
  await page.locator('#tour-stops').screenshot({path:'.my-tour-qa/street-'+width+'.png'});
  await page.getByRole('button',{name:'Night',exact:true}).click();
  await page.locator('.tour-leaflet-map[data-map-state="ready"][data-map-style="night"]').waitFor({timeout:60000});
  assert.equal(await page.locator('.tour-map canvas').count(),1,'Theme switches must dispose old renderers');
  await page.locator('#tour-stops').screenshot({path:'.my-tour-qa/my-tour-'+width+'.png'});
  await page.getByRole('button',{name:'Open SingHERE QA'}).click();

  const songLink=page.getByRole('link',{name:'I just sang',exact:true});
  await songLink.waitFor();
  assert.match(await songLink.getAttribute('href'),/^\/account\?perform=deanos-pub$/);
  assert.ok(Number.parseFloat(await songLink.evaluate(el=>getComputedStyle(el).borderTopWidth))>=1,'Log song link must be visibly boxed');
  await page.screenshot({path:'.my-tour-qa/song-log-'+width+'.png'});
  await page.getByRole('button',{name:'Close SingHERE',exact:true}).click();
  await page.goto(base+'/discover',{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Map view',exact:true}).click();
  await page.locator('.leaflet-container[data-map-state="ready"][data-map-style="night"]').waitFor({timeout:60000});
  assert.ok(await page.locator('.leaflet-marker-icon').count()>0,'Discovery retains venue markers');
  await page.getByRole('button',{name:'Street',exact:true}).click();
  await page.locator('.leaflet-container[data-map-state="ready"][data-map-style="street"]').waitFor({timeout:60000});
  await page.screenshot({path:'.my-tour-qa/discovery-street-'+width+'.png'});
  await page.getByRole('button',{name:'Night',exact:true}).click();
  await page.locator('.leaflet-container[data-map-state="ready"][data-map-style="night"]').waitFor({timeout:60000});
  assert.equal(await page.locator('.leaflet-container canvas').evaluate(el=>getComputedStyle(el).filter),'none');
  await page.locator('.leaflet-control-zoom-in').click();
  await page.waitForTimeout(700);
  await page.screenshot({path:'.my-tour-qa/discovery-'+width+'.png'});
  await page.getByRole('button',{name:'Close map',exact:true}).click();
  await page.getByRole('button',{name:'Map view',exact:true}).click();
  await page.locator('.leaflet-container[data-map-state="ready"]').waitFor({timeout:60000});
  assert.equal(await page.locator('.leaflet-container canvas').count(),1,'Reopening Discovery creates one renderer');
  assert.ok(styles.some(url=>url.endsWith('/dark')));assert.ok(styles.some(url=>url.endsWith('/positron')));
  assert.equal(rasterRequests,0,'No old raster tiles or inversion fallback');
  assert.deepEqual(failed,[]);assert.deepEqual(errors,[],'No browser JS errors');
  await context.close();
  console.log('Native dark Discovery and My Tour maps, theme switching, markers, popups and resize passed at '+width+'px');
 }
}catch(error){for(const context of browser.contexts())for(const page of context.pages())if(!page.isClosed()){await page.screenshot({path:'.my-tour-qa/failure.png',fullPage:true}).catch(()=>{});console.log((await page.locator('body').innerText()).slice(-1800));}throw error;}finally{await browser.close();}
