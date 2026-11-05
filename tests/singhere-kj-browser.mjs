import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
if(process.argv.includes('--prepare')){
 if(process.env.CI!=='true')throw new Error('Fixture preparation is CI-only');
 await mkdir('src/app/singhere-kj-qa',{recursive:true});
 await writeFile('src/app/singhere-kj-qa/page.tsx',`'use client';
import {useState} from 'react';
import {SingHereDialog} from '@/components/v2/SingHereDialog';
import {SingHereAction} from '@/components/venue/SingHereAction';
import type {VenueListing} from '@/types';
const venue={venueName:'Fixture Venue',slug:'fixture-venue',venueType:'live_bar',website:'https://venue.example.test/'} as VenueListing;
const policy='Host-confirmed fixture rotation. One song per turn.';
export default function Fixture(){const [mode,setMode]=useState('');return <main style={{padding:24,color:'white'}}><button onClick={()=>setMode('confirmed')}>Open confirmed policy</button><button onClick={()=>setMode('blank')}>Open blank policy</button><button onClick={()=>setMode('unsafe')}>Open unsafe signup</button><SingHereAction venueName="Legacy fixture" config={{rotationPolicy:policy,mode:'instructions'}}/>{mode&&<SingHereDialog venue={venue} config={{mode:'external',url:mode==='unsafe'?'https://user:fixture@queue.example.test/':'https://queue.example.test/',rotationPolicy:mode==='confirmed'?policy:undefined,kjName:'Fixture KJ',kjTips:[{label:'Tip Fixture KJ',url:'https://tips.example.test/'}]}} onClose={()=>setMode('')}/>}</main>;}`);
 process.exit(0);
}
const {chromium}=await import('playwright');const browser=await chromium.launch({args:['--no-sandbox']});
const base=process.env.QA_BASE_URL||'http://127.0.0.1:3100';await mkdir('.singhere-kj-qa',{recursive:true});
try{for(const width of [390,1280]){
 const page=await browser.newPage({viewport:{width,height:900}});page.setDefaultTimeout(15_000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/singhere-kj-qa',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'Open confirmed policy'}).click();let dialog=page.getByRole('dialog',{name:'Ready to sing?'});
 await dialog.getByText('Host-confirmed fixture rotation. One song per turn.').waitFor();
 assert.equal(await dialog.getByRole('link',{name:'Open singer signup ↗'}).getAttribute('href'),'https://queue.example.test/');
 assert.equal(await dialog.getByRole('link',{name:'Tip Fixture KJ ↗'}).getAttribute('href'),'https://tips.example.test/');
 assert.equal(await dialog.getByRole('link',{name:'I just sang',exact:true}).getAttribute('href'),'/account?perform=fixture-venue');
 const box=await dialog.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1,'dialog fits viewport');
 await page.screenshot({path:'.singhere-kj-qa/confirmed-'+width+'.png'});
 await dialog.getByRole('button',{name:'Close SingHERE'}).click();
 await page.getByRole('button',{name:'Open blank policy'}).click();dialog=page.getByRole('dialog',{name:'Ready to sing?'});await dialog.waitFor();assert.equal(await dialog.locator('.singhere-rotation').count(),0,'blank policy makes no rotation claim');
 await dialog.getByRole('button',{name:'Close SingHERE'}).click();
 await page.getByRole('button',{name:'Open unsafe signup'}).click();dialog=page.getByRole('dialog',{name:'Ready to sing?'});await dialog.waitFor();assert.equal(await dialog.getByRole('link',{name:'Open singer signup ↗'}).count(),0,'credentialed URL never rendered');
 await dialog.getByRole('button',{name:'Close SingHERE'}).click();
 await page.getByRole('button',{name:'SingHERE at Legacy fixture'}).click();await page.getByRole('dialog',{name:'SingHERE at Legacy fixture'}).getByText('Host-confirmed fixture rotation. One song per turn.').waitFor();
 assert.deepEqual(errors,[]);await page.close();console.log('Confirmed/blank policies, signup validation, tips and performance handoff passed at '+width+'px');
}}finally{await browser.close();}
