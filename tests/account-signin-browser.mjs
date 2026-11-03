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
  assert.match(await dialog.innerText(),/Sign in to My SingHUB/i);
  assert.ok(await dialog.getByRole('textbox',{name:'Email address'}).isVisible());
  // Confirm the full email code reaches Auth without sending real messages.
  if(width===390){
   const headers={
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods':'POST, OPTIONS',
    'Content-Type':'application/json',
   };
   let verifiedToken='';
   await page.route('**/auth/v1/otp*',async route=>{
    await route.fulfill({status:route.request().method()==='OPTIONS'?204:200,headers,body:route.request().method()==='OPTIONS'?'':'{}'});
   });
   await page.route('**/auth/v1/verify*',async route=>{
    if(route.request().method()==='POST')verifiedToken=String(route.request().postDataJSON()?.token||'');
    await route.fulfill({status:route.request().method()==='OPTIONS'?204:422,headers,body:route.request().method()==='OPTIONS'?'':JSON.stringify({message:'Test-only rejected code',code:'otp_expired'})});
   });
   await dialog.getByRole('textbox',{name:'Email address'}).fill('qa@example.invalid');
   await dialog.getByRole('button',{name:'Email my sign-in link'}).click();
   const code=dialog.getByRole('textbox',{name:'Email sign-in code'});
   await code.waitFor();
   await code.fill('0 1 2 3 4 5 6 7');
   assert.equal(await code.inputValue(),'01234567','eight digits and leading zero survived paste');
   const verify=dialog.getByRole('button',{name:'Verify code & sign in'});
   assert.equal(await verify.isEnabled(),true,'eight-digit code is accepted for submission');
   await verify.click();
   await dialog.getByText('Test-only rejected code').waitFor();
   assert.equal(verifiedToken,'01234567','full eight-digit code sent to Supabase Auth');
  }
  await dialog.getByRole('button',{name:'Close account action'}).click();
  await page.getByRole('button',{name:'Create account',exact:true}).click();
  assert.match(await dialog.innerText(),/Create your My SingHUB account/i);
  assert.ok(await dialog.getByRole('textbox',{name:'Email address'}).isVisible());
  await dialog.getByRole('button',{name:'Close account action'}).click();
  await page.goto(base+'/account?signin=1&next=%2Fvenues%2Fredwing-bar-grill',{waitUntil:'networkidle'});
  await dialog.waitFor({state:'visible'});
  await dialog.getByRole('button',{name:'Close account action'}).click();
  await page.goto(base+'/auth/callback?next=%2Faccount',{waitUntil:'networkidle'});
  assert.equal(new URL(page.url()).pathname,'/account');
  assert.equal(new URL(page.url()).searchParams.get('authError'),'missing_code');
  assert.match(await dialog.innerText(),/expired or did not open correctly/i);
  await page.goto(base+'/auth/callback?next=https%3A%2F%2Funtrusted.example',{waitUntil:'networkidle'});
  assert.ok(['localhost','127.0.0.1'].includes(new URL(page.url()).hostname),'external redirect is rejected');
  assert.equal(new URL(page.url()).pathname,'/account','unsafe redirect rejected');
  assert.deepEqual(errors,[],'browser runtime errors at '+width);
  await page.close();
 }
 console.log('4 responsive account sign-in/signup, nav, expired callback and open-redirect checks passed.');
}finally{await browser?.close();server?.kill();}
