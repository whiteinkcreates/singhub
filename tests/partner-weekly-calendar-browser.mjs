import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
if(process.argv.includes('--prepare')){
 if(process.env.CI!=='true')throw new Error('Calendar fixture is CI-only');
 await mkdir('src/app/weekly-calendar-qa',{recursive:true});
 await writeFile('src/app/weekly-calendar-qa/page.tsx',`'use client';
import {VenueMonthlyCalendar} from '@/components/venue/VenueMonthlyCalendar';
import '@/components/v2/styles/basic.css';
const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
const m=Object.fromEntries(parts.map(p=>[p.type,p.value]));
const date=m.year+'-'+m.month+'-'+m.day;
export default function CalendarQa(){return <main className="v2-basic" style={{minHeight:'100vh',padding:12,background:'#080d17'}}>
<VenueMonthlyCalendar venueName="Demo Partner" events={[{date,title:'Theme Karaoke',category:'karaoke',time:'8 PM'},{date,title:'Trivia Night',category:'game',time:'6 PM'}]}/>
<VenueMonthlyCalendar venueName="Partial Partner" partial events={[]}/>
</main>;}`);
 process.exit(0);
}
const {chromium}=await import('playwright');
const browser=await chromium.launch({args:['--no-sandbox']});
const base=process.env.QA_BASE_URL||'http://127.0.0.1:3100';
await mkdir('.calendar-qa',{recursive:true});
try{
 for(const width of [390,1280]){
  const page=await browser.newPage({viewport:{width,height:900}});page.setDefaultTimeout(15_000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/weekly-calendar-qa',{waitUntil:'domcontentloaded'});
  const calendar=page.getByRole('region',{name:'Demo Partner events',exact:true});
  await calendar.getByRole('heading',{name:'This week at Demo Partner'}).waitFor();
  assert.equal(await calendar.locator('.calendar-grid').count(),0);
  assert.equal(await calendar.getByText('Theme Karaoke',{exact:true}).count(),1);
  assert.equal(await calendar.locator('.kind-trivia').count(),1,'current category classification survives');
  await calendar.getByRole('button',{name:'Open full month calendar'}).click();
  await calendar.getByRole('heading',{name:'Full month lineup'}).waitFor();
  assert.ok(await calendar.locator('.calendar-grid .calendar-day').count()>=28);
  assert.equal(await calendar.getByRole('button',{name:'Show this week'}).getAttribute('aria-expanded'),'true');
  await calendar.getByRole('button',{name:'Show this week'}).click();
  await calendar.getByRole('button',{name:'Next week'}).click();
  await calendar.getByText(/No dates listed for this week/).waitFor();
  await calendar.getByRole('button',{name:'Previous week'}).click();
  await calendar.getByText('Theme Karaoke',{exact:true}).waitFor();
  const partial=page.getByRole('region',{name:'Partial Partner events',exact:true});
  await partial.getByRole('heading',{name:'This week at Partial Partner'}).waitFor();
  assert.match(await partial.innerText(),/not the venue's complete event calendar/);
  await partial.getByRole('button',{name:'Open listed dates calendar'}).click();
  assert.equal(await partial.getByRole('heading',{name:'Dates on the calendar'}).count(),1,'partial calendar never claims complete schedule');
  const ids=await page.locator('[aria-controls]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-controls')));
  assert.equal(new Set(ids).size,ids.length,'separate calendar controls have unique targets');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),'no horizontal overflow');
  assert.deepEqual(errors,[]);
  await page.screenshot({path:'.calendar-qa/calendar-'+width+'.png',fullPage:true});await page.close();
  console.log('Weekly/month calendar, navigation, category colors and partial-schedule safeguards passed at '+width+'px');
 }
}finally{await browser.close();}
