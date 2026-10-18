import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const base='http://localhost:3100';
await mkdir('.mysinghub-qa',{recursive:true});
const browser=await chromium.launch({args:['--no-sandbox']});
try{for(const width of [390,1440]){
 await fetch('http://127.0.0.1:3101/reset');
 const context=await browser.newContext({viewport:{width,height:900},acceptDownloads:true});const page=await context.newPage();
 page.on('requestfailed',request=>console.log('Fixture network failure:',request.method(),new URL(request.url()).pathname,request.failure()?.errorText));
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.clock.install({time:new Date('2026-10-18T09:00:00Z')}); // 2 AM Sunday, still Saturday's karaoke night.
 const payload={access_token:'test-token',refresh_token:'test-refresh',expires_at:Math.floor(new Date('2026-10-19').getTime()/1000),expires_in:86400,token_type:'bearer',user:{id:'isolated-singer',email:'qa@example.invalid',email_confirmed_at:'2026-01-01',app_metadata:{},user_metadata:{}}};
 await context.addCookies([{name:'sb-127-auth-token',value:'base64-'+Buffer.from(JSON.stringify(payload)).toString('base64url'),domain:'localhost',path:'/'}]);
 await page.goto(base+'/venues/the-lamplighter',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:/^SingHERE (tonight|signup information)$/}).click();
 const sang=page.getByRole('link',{name:'I just sang',exact:true});assert.equal(await sang.getAttribute('href'),'/account?perform=the-lamplighter');await sang.click();
 await page.getByLabel('Song title',{exact:true}).waitFor();assert.equal(await page.getByLabel('Performed on',{exact:true}).inputValue(),'2026-10-17');
 await page.getByLabel('Song title',{exact:true}).fill('Rejected song');await page.getByRole('button',{name:'Save song & earn star',exact:true}).click();
 await page.locator('.account-service-dialog [role=status]').filter({hasText:/Performance could not be saved\.|Your account could not be updated\./}).waitFor();assert.equal(await page.getByRole('button',{name:'Share my new star',exact:true}).count(),0);
 await page.getByLabel('Song title',{exact:true}).fill('Fixture Song');await page.getByRole('button',{name:'Save song & earn star',exact:true}).click();
 await page.getByRole('button',{name:'Share my new star',exact:true}).waitFor();await page.getByRole('button',{name:'Not now',exact:true}).click();
 await page.locator('#recent').getByText('Fixture Song',{exact:true}).waitFor();
 await page.waitForFunction(()=>document.querySelector('.tour-counts')?.textContent.includes('1 Nights performed'));
 assert.ok((await page.locator('.tour-counts').textContent()).includes('1 Karaoke nights'));
 assert.equal(await page.locator('.tour-stop').count(),2);
 await page.getByRole('heading',{name:'My Upcoming Gigs',exact:true}).waitFor();await page.getByRole('heading',{name:'Your Karaoke Radar',exact:true}).waitFor();
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Download jacket portrait',exact:true}).click();const download=await downloadPromise;assert.equal(await download.failure(),null);await download.saveAs('.mysinghub-qa/jacket-'+width+'.png');
 // A second song in the same night updates the setlist without increasing the night count.
 await page.goto(base+'/account?perform=the-lamplighter',{waitUntil:'networkidle'});await page.getByLabel('Song title',{exact:true}).fill('Second Fixture Song');await page.getByRole('button',{name:'Save song & earn star',exact:true}).click();await page.getByRole('button',{name:'Not now',exact:true}).click();
 await page.locator('#recent').getByText('Second Fixture Song',{exact:true}).waitFor();await page.waitForFunction(()=>document.querySelector('.tour-counts')?.textContent.includes('1 Nights performed'));
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.locator('#tour-stops').screenshot({path:'.mysinghub-qa/tour-'+width+'.png'});
 // The established sticky hero sits behind the content sheet while scrolled. Return to its controls normally.
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.getByRole('button',{name:'Sign in',exact:true}).waitFor();
 await page.waitForFunction(()=>document.querySelector('.tour-counts')?.textContent.includes('— Nights performed'));
 assert.equal(await page.locator('.tour-stop').count(),0);assert.equal(await page.locator('#recent').getByText('Fixture Song',{exact:true}).count(),0);
 assert.deepEqual(errors,[]);await context.close();console.log('My SingHUB full song, counts, jacket export and sign-out flow passed at '+width+'px');
 }
 const context=await browser.newContext();const page=await context.newPage();
 await page.goto(base+'/account?perform=the-lamplighter',{waitUntil:'networkidle'});await page.getByLabel('Email address',{exact:true}).waitFor();
 let redirect='';page.on('request',request=>{if(request.method()==='POST'&&request.url().includes('/auth/v1/otp'))redirect=decodeURIComponent(new URL(request.url()).searchParams.get('redirect_to')||'');});
 await page.getByLabel('Email address',{exact:true}).fill('qa@example.invalid');await page.getByRole('button',{name:'Email my sign-in link',exact:true}).click();await page.getByRole('button',{name:'Link sent · Check your email',exact:true}).waitFor();
 assert.ok(redirect.includes('/account?perform=the-lamplighter'),'sign-in return preserves the selected venue');
 assert.equal((await context.request.get(base+'/api/tour-stops')).status(),401);await page.screenshot({path:'.mysinghub-qa/signed-out.png'});await context.close();
}catch(error){for(const context of browser.contexts())for(const page of context.pages()){if(!page.isClosed()){await page.screenshot({path:'.mysinghub-qa/failure.png',fullPage:true}).catch(()=>{});await writeFile('.mysinghub-qa/failure.html',await page.content()).catch(()=>{});}}throw error;}finally{await browser.close();}
