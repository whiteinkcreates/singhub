import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const base=process.env.ACCOUNT_QA_BASE_URL||'http://127.0.0.1:3118';
const out='.account-signin-qa';
const server=process.env.ACCOUNT_QA_BASE_URL?null:spawn(process.execPath,['node_modules/next/dist/bin/next','start','--port','3118'],{stdio:'ignore'});
let browser;
try{
 await mkdir(out,{recursive:true});
 for(let i=0;i<60;i++){try{if((await fetch(base+'/account')).ok)break;}catch{}if(i===59)throw Error('Account QA server never started');await new Promise(resolve=>setTimeout(resolve,1000));}
 browser=await chromium.launch({args:['--no-sandbox']});
 for(const width of [360,390,768,1440]){
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const response=await page.goto(base+'/account',{waitUntil:'networkidle'});
  assert.equal(response.status(),200,'account route at '+width);
  await page.getByRole('button',{name:'Sign in',exact:true}).waitFor();
  assert.ok(await page.getByRole('button',{name:'Create account',exact:true}).isVisible(),'signup above fold');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'account horizontal overflow at '+width);
  const authLink=page.locator(width<=950?'nav[aria-label="Mobile navigation"] a[href="/account?signin=1"]':'header[data-app-navigation] a[aria-label="Sign in to My SingHUB"]');
  assert.ok(await authLink.isVisible(),'signed-out nav at '+width);
  await page.screenshot({path:out+'/account-signed-out-'+width+'.png'});
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  const dialog=page.locator('dialog.account-service-dialog');
  assert.ok(await dialog.isVisible(),'sign-in modal visible');
  assert.match(await dialog.innerText(),/Sign in to My SingHUB/);
  assert.ok(await dialog.getByRole('textbox',{name:'Email address'}).isVisible());
  await dialog.getByRole('button',{name:'Close account action'}).click();
  await page.getByRole('button',{name:'Create account',exact:true}).click();
  assert.match(await dialog.innerText(),/Create your My SingHUB account/);
  assert.ok(await dialog.getByRole('textbox',{name:'Email address'}).isVisible());
  await dialog.getByRole('button',{name:'Close account action'}).click();
  await page.goto(base+'/account?signin=1&next=%2Fvenues%2Fredwing-bar-grill',{waitUntil:'networkidle'});
  await dialog.waitFor({state:'visible'});
  await dialog.getByRole('button',{name:'Close account action'}).click();
  await page.goto(base+'/auth/callback?next=%2Faccount',{waitUntil:'networkidle'});
  assert.equal(new URL(page.url()).pathname,'/account');
  assert.equal(new URL(page.url()).searchParams.get('authError'),'missing_code');
  assert.match(await dialog.innerText(),/expired or could not be completed/i);
  await page.goto(base+'/auth/callback?next=https%3A%2F%2Funtrusted.example',{waitUntil:'networkidle'});
  assert.equal(new URL(page.url()).origin,new URL(base).origin,'redirect remains same-origin');
  assert.equal(new URL(page.url()).pathname,'/account','unsafe redirect rejected');
  assert.deepEqual(errors,[],'browser runtime errors at '+width);
  await page.close();
 }
 console.log('4 responsive account sign-in/signup, nav, expired callback and open-redirect checks passed.');
}finally{await browser?.close();server?.kill();}
