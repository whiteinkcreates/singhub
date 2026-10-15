import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {chromium} from 'playwright';
if(process.argv.includes('--prepare')){
 mkdirSync('src/app/hotel-media-delete-qa',{recursive:true});
 writeFileSync('src/app/hotel-media-delete-qa/page.tsx',`import {HotelMediaEditor} from '@/components/admin/HotelMediaEditor';import {getHotelGuide} from '@/lib/hotelGuides';export default function QA(){return <HotelMediaEditor hotels={[getHotelGuide('grande-colonial')!]}/>;}`);
 process.exit(0);
}
const bundled=process.env.HOTEL_QA_CHROMIUM_MODULE?(await import(process.env.HOTEL_QA_CHROMIUM_MODULE)).default:null;
const browser=await chromium.launch({args:bundled?bundled.args.filter(x=>x!=='--single-process'):['--no-sandbox'],...(bundled?{executablePath:process.env.HOTEL_QA_CHROMIUM_EXECUTABLE}:{} )});
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
  const assets=[{publicId:'singhub/hotels/grande-colonial/hero',url:'https://example.invalid/hero.jpg',width:1200,height:800,format:'jpg'},{publicId:'singhub/hotels/grande-colonial/unused',url:'https://example.invalid/unused.jpg',width:1200,height:800,format:'jpg'}];
  let profile={heroImageUrl:assets[0].url,heroAlt:'Hotel exterior',imageSource:'Owner',usageRights:'Owner approved',packageReview:{heroImageUrl:assets[0].url,heroApproved:true,rightsNote:'Owner approved',brandLogoUrl:'',brandApproved:false,brandNote:'',reviewedAt:'2026-10-14'}};
  const deletes=[];const saves=[];
  await context.route('**/api/admin/hotel-profiles*',route=>{if(route.request().method()==='PUT'){profile=route.request().postDataJSON().profile;saves.push(profile);}return route.fulfill({json:{profile}});});
  await context.route('**/api/admin/hotel-media*',route=>{if(route.request().method()==='DELETE'){deletes.push(route.request().postDataJSON());return route.fulfill({json:{ok:true}});}return route.fulfill({json:{assets}});});
  await context.route('**/admin/hotels/preview*',route=>route.fulfill({body:'<html><body>Crop preview fixture</body></html>',contentType:'text/html'}));
  await context.route('https://**/*',route=>route.fulfill({status:404,body:''}));
  const page=await context.newPage();await page.goto('http://127.0.0.1:3100/hotel-media-delete-qa',{waitUntil:'networkidle'});
  const library=page.locator('section').filter({has:page.getByText('Hotel media',{exact:true})}).first();
  assert.equal(await library.getByRole('button',{name:'Remove role first',exact:true}).isDisabled(),true);
  page.once('dialog',dialog=>dialog.dismiss());await library.getByRole('button',{name:'Delete upload',exact:true}).click();assert.equal(deletes.length,0);
  page.once('dialog',dialog=>dialog.accept());await library.getByRole('button',{name:'Delete upload',exact:true}).click();
  await page.waitForFunction(()=>document.body.textContent.includes('Image permanently deleted'));assert.equal(deletes.length,1);assert.equal(deletes[0].publicId,assets[1].publicId);
  await library.getByRole('button',{name:'Clear hero',exact:true}).click();await page.getByRole('button',{name:'Save hotel media',exact:true}).click();
  await page.waitForFunction(()=>document.body.textContent.includes('hero has been removed from public view'));
  assert.equal(saves.at(-1).heroDisabled,true);assert.equal(saves.at(-1).heroImageUrl,'');assert.equal(saves.at(-1).packageReview.heroApproved,false);
  await library.getByRole('button',{name:'Set as hero',exact:true}).click();await page.getByRole('button',{name:'Save hotel media',exact:true}).click();
  await page.waitForFunction(()=>document.body.textContent.includes('Photo staged for asset review'));
  assert.equal(saves.at(-1).heroDisabled,false);assert.equal(saves.at(-1).heroImageUrl,assets[0].url);
  console.log('Hotel media delete/cancel/clear/reselect passed at '+width+'px');await context.close();
 }
}finally{await browser.close();}
