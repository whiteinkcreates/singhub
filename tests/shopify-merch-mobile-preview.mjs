import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const url='https://whiteinkcreates.com/pages/singhub-merch-table?preview_theme_id=157062922337';
const out='.merch-mobile-qa';await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--no-sandbox']});
const reports=[];
try{for(const viewport of [{width:320,height:568},{width:360,height:740},{width:390,height:844},{width:390,height:550},{width:768,height:1024},{width:768,height:400},{width:1440,height:900}]){
 const context=await browser.newContext({viewport});const page=await context.newPage();
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.locator('.sh-hero-media img').waitFor();await page.waitForFunction(()=>{const image=document.querySelector('.sh-hero-media img');return image?.complete&&image.naturalWidth>0;});
 await page.evaluate(()=>document.fonts.ready);
 for(const frame of page.frames())if(frame.url().includes('/preview-bar/')){const hide=frame.getByRole('button',{name:'Hide bar',exact:true});if(await hide.isVisible())await hide.click();}
 const metrics=await page.evaluate(()=>{
  const hero=document.querySelector('.sh-hero'),image=hero.querySelector('img'),copy=hero.querySelector('.sh-hero-copy'),cta=hero.querySelector('.sh-hero-link'),nav=document.querySelector('.sh-app-nav');
  const box=el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height};};
  return {viewport:{width:innerWidth,height:innerHeight},pageWidth:document.documentElement.scrollWidth,fit:getComputedStyle(image).objectFit,position:getComputedStyle(hero).position,photo:box(image),copy:box(copy),cta:box(cta),navTop:getComputedStyle(nav).display==='none'?innerHeight:box(nav).top,controls:document.querySelectorAll('.sh-product-form').length,variantControls:document.querySelectorAll('[data-variant]').length,ratio:getComputedStyle(hero).getPropertyValue('--sh-hero-mobile-ratio').trim(),previewStyle:hero.style.getPropertyValue('--sh-hero-mobile-fit').trim()};
 });
 assert.equal(metrics.previewStyle,'contain','Must render the patched preview, not the current live theme');
 assert.ok(metrics.pageWidth<=viewport.width,'No horizontal page overflow');
 assert.ok(metrics.controls>0&&metrics.variantControls>0,'Real products and variant controls remain');
 assert.equal(metrics.fit,viewport.width<=860?'contain':'cover');
 if(viewport.width<=860){assert.ok(metrics.copy.top>=metrics.photo.bottom-1,'The mobile photograph remains above the copy');assert.ok(metrics.cta.right<=viewport.width&&metrics.cta.left>=0);if(viewport.height>520){assert.ok(metrics.cta.bottom<=metrics.navTop,'CTA remains above fixed mobile navigation');assert.equal(metrics.position,'sticky');}else assert.equal(metrics.position,'relative');}
 else assert.equal(metrics.position,'sticky');
 await page.screenshot({path:out+'/hero-'+viewport.width+'x'+viewport.height+'.png'});
 await page.getByRole('button',{name:/^Bag /}).click();await page.getByRole('dialog').waitFor();await page.getByRole('button',{name:'Close bag',exact:true}).click();
 if(viewport.height>520){await page.getByRole('link',{name:'Find your gear',exact:false}).click();await page.locator('#sh-products').waitFor();}
 reports.push(metrics);await context.close();console.log('Shopify theme preview passed at '+viewport.width+'x'+viewport.height);
}
await writeFile(out+'/measurements.json',JSON.stringify(reports,null,2));
}catch(error){for(const context of browser.contexts())for(const page of context.pages())if(!page.isClosed()){await page.screenshot({path:out+'/failure.png',fullPage:true}).catch(()=>{});}throw error;}finally{await browser.close();}
