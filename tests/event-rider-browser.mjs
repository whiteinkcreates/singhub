import assert from "node:assert/strict";
import {chromium} from "playwright";

const base=process.env.BASE_URL||"http://127.0.0.1:3000";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 for(const width of [390,1280]){
  const page=await browser.newPage({viewport:{width,height:900}});
  page.setDefaultTimeout(15_000);
  const errors=[];let submission;
  page.on("pageerror",error=>errors.push(error.message));
  await page.route("**/api/submit-listing",async route=>{
   submission=route.request().postDataJSON();
   await route.fulfill({status:200,contentType:"application/json",body:'{"ok":true}'});
  });
  await page.goto(base+"/plan-karaoke",{waitUntil:"domcontentloaded"});
  assert.match(await page.title(),/Plan a Karaoke Party/);
  await page.getByRole("button",{name:/Holiday party/}).click();
  await page.getByRole("button",{name:/Find our karaoke venue/}).click();
  await page.getByRole("button",{name:/21–50/}).click();
  await page.getByRole("button",{name:/Anywhere in San Diego County/}).click();
  await page.getByPlaceholder(/office in Mission Valley/).fill("Office in Mission Valley");
  await page.getByRole("button",{name:/Continue/}).click();
  await page.getByRole("button",{name:/Continue/}).click();
  await page.getByRole("button",{name:/Custom event shirts/}).click();
  await page.getByRole("button",{name:/Continue/}).click();
  await page.getByPlaceholder("First and last name").fill("QA Example");
  await page.getByPlaceholder("you@company.com").fill("example@example.com");
  await page.getByRole("checkbox",{name:/I agree that SingHUB may contact me/}).check();
  await page.getByRole("button",{name:/Send my event rider/}).click();
  await page.getByText("You're on the list.").waitFor();
  assert.equal(submission.submissionType,"karaoke_event_inquiry");
  assert.equal(submission.eventType,"Holiday party");
  assert.equal(submission.bookingNeed,"venue");
  assert.equal(submission.groupSize,"21–50");
  assert.equal(submission.areaNotes,"Office in Mission Valley");
  assert.ok(submission.requirements.includes("Custom event shirts"));
  assert.equal(submission.contactConsent,true);
  await page.goto(base+"/hire-a-kj",{waitUntil:"domcontentloaded"});
  assert.match(await page.title(),/Hire a Karaoke/);
  await page.getByRole("button",{name:/Birthday/}).click();
  await page.getByRole("button",{name:/Hire a karaoke host/}).click();
  await page.goto(base+"/kj-bookings",{waitUntil:"domcontentloaded"});
  assert.match(await page.title(),/Booking Opportunities/);
  await page.goto(base+"/venues/premium",{waitUntil:"domcontentloaded"});
  assert.match(await page.locator("main").innerText(),/More ways to fill the room/);
  assert.match(await page.locator("main").innerText(),/\$59/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+4),"No horizontal overflow at "+width);
  assert.deepEqual(errors,[]);
  await page.close();
  console.log("Event Rider routes and conversion flow passed at "+width+"px");
 }
} finally {await browser.close();}
