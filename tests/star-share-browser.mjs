import assert from 'node:assert/strict';
import {mkdir,writeFile,appendFile} from 'node:fs/promises';
if(process.argv.includes('--prepare')){
 if(process.env.CI!=='true')throw new Error('Fixture is restricted to CI.');
 await appendFile(process.env.GITHUB_ENV,'NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:3101\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=isolated-layout-fixture\n');
 await mkdir('src/app/star-share-qa',{recursive:true});
 await writeFile('src/app/star-share-qa/page.tsx',`"use client";
import {useState} from 'react';
import {AccountServiceDialog} from '@/components/v2/AccountServiceDialog';
import type {User} from '@supabase/supabase-js';
import type {VenueListing} from '@/types';
import '@/components/v2/styles/account.css';
export default function StarQa(){const [request,setRequest]=useState<'performance'|null>('performance');const [stars,setStars]=useState(0);return <div className="v2-account"><output aria-label="Earned stars">{stars}</output><AccountServiceDialog state={{user:{id:'isolated-singer'} as User,account:null,error:'',refresh:async()=>{setStars(value=>value+1);}}} venues={[{slug:'fixture-venue',venueName:'Isolated QA venue'} as VenueListing]} request={request} onClose={()=>setRequest(null)} onMessage={()=>{}}/></div>}`);
 process.exit(0);
}
const {chromium}=await import('playwright');const browser=await chromium.launch({args:['--no-sandbox']});
try{for(const width of [390,1440]){
 const context=await browser.newContext({viewport:{width,height:844}});const page=await context.newPage();let saves=0;
 page.on('request',request=>{if(request.method()==='POST'&&request.url().includes('/rest/v1/singer_performances'))saves++;});
 await page.goto('http://localhost:3100/star-share-qa?perform=fixture-venue',{waitUntil:'networkidle'});
 await page.getByLabel('Song title',{exact:true}).fill('Rejected song');await page.getByLabel('Performed on',{exact:true}).fill('2026-10-02');await page.getByRole('button',{name:'Save',exact:true}).click();
 await page.getByRole('status').filter({hasText:/Performance could not be saved\.|Your account could not be updated\./}).waitFor();assert.equal(await page.getByRole('button',{name:'Share my new star',exact:true}).count(),0);
 await page.getByLabel('Song title',{exact:true}).fill('My karaoke song');await page.getByRole('button',{name:'Save',exact:true}).click();
 await page.getByRole('button',{name:'Share my new star',exact:true}).waitFor();assert.equal(await page.getByLabel('Earned stars').textContent(),'1');assert.equal(saves,2);
 assert.ok((await page.locator('dialog').textContent()).includes('Sharing is optional.'));assert.ok((await page.locator('dialog').textContent()).includes('My karaoke song at Isolated QA venue'));
 await mkdir('.main-hero-qa',{recursive:true});await page.screenshot({path:'.main-hero-qa/new-star-'+width+'.png'});
 await page.getByRole('button',{name:'Not now',exact:true}).click();assert.equal(await page.locator('dialog[open]').count(),0);assert.equal(await page.getByLabel('Earned stars').textContent(),'1');assert.equal(saves,2);
 await context.close();console.log('New-star prompt at '+width+'px: failed save earns nothing, successful save prompts once, dismiss keeps star');
}}finally{await browser.close();}
