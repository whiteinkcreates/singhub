import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {getAccessToken} from './google-sheets-api.mjs';

const VERIFIED='2026-11-05';
const PROVENANCE='Katie (Famously Slutty Karaoke) direct email Nov 2, 2026; Corey direct seasonal start-time update 2026-11-05';
const IDS={venues:['venue-0027'],events:['weekly-cheers-bar-san-diego-monday','weekly-cheers-bar-san-diego-wednesday']};
const clean=value=>String(value??'').trim();
function columnName(index){let name='';for(let n=index+1;n;n=Math.floor((n-1)/26))name=String.fromCharCode(65+(n-1)%26)+name;return name;}
function quoted(tab){return "'"+tab.replaceAll("'","''")+"'";}

export function planCheersRepair(snapshots,tabs){
 const updates=[];
 for(const type of ['venues','events']){
  const [headers=[],...rows]=snapshots[type];
  const column=(aliases,required=true)=>{const found=headers.map(clean).map((name,i)=>aliases.includes(name)?i:-1).filter(i=>i>=0);if(found.length!==1){if(!required&&!found.length)return -1;throw Error('Missing or ambiguous canonical column: '+aliases.join('/'));}return found[0];};
  const idAt=column(type==='venues'?['venue_id','id']:['event_id']);
  const startAt=column(['start_time']);const dateAt=column(['last_verified']);
  const slugAt=column(type==='venues'?['venue_slug','slug']:['venue_slug']);
  for(const id of IDS[type]){
   const matches=rows.map((row,i)=>({row,i})).filter(({row})=>clean(row[idAt])===id);
   if(matches.length!==1)throw Error('Expected exactly one row for '+id);
   const {row,i}=matches[0];
   if(clean(row[slugAt])!=='cheers-bar-san-diego')throw Error('Unexpected Cheers venue identity for '+id);
   const currentStart=clean(row[startAt]);const currentDate=clean(row[dateAt]);
   if(['8:30 PM','8:30PM','20:30'].includes(currentStart)&&/^\d{4}-\d{2}-\d{2}$/.test(currentDate)&&currentDate>=VERIFIED)continue;
   if(!['8:00 PM','8 PM','20:00','8:30 PM'].includes(currentStart)||!['2026-11-02',VERIFIED].includes(currentDate))throw Error('Unexpected current start/date for '+id+'; refusing to overwrite unreviewed facts.');
   const changes=new Map([[startAt,'8:30 PM'],[dateAt,VERIFIED]]);
   const sourceAt=column(['source_secondary','source_2'],false);
   if(sourceAt>=0){const existing=clean(row[sourceAt]);changes.set(sourceAt,existing.includes('seasonal start-time update 2026-11-05')?existing:existing?existing+'; Corey direct seasonal start-time update 2026-11-05':PROVENANCE);}
   if(type==='venues'){
    changes.set(column(['description']),'Cheers on Adams Ave is a University Heights gay dive bar with Famously Slutty Karaoke, hosted by Ed & Katie every Monday and Wednesday. During the shorter-day months, karaoke begins at 8:30 PM. End times are flexible, and karaoke may continue until closing when the room is busy.');
   }else{
    const day=id.endsWith('monday')?'Monday':'Wednesday';
    if(clean(row[column(['karaoke_day'])])!==day)throw Error('Unexpected weekday for '+id);
    const note=day+' at Cheers on Adams Ave, hosted by Ed & Katie as Famously Slutty Karaoke. Seasonal shorter-day start time is 8:30 PM (direct confirmation 2026-11-05). End time remains flexible and karaoke may continue until closing when busy; structured end time is approximate for filtering.';
    const notes=headers.map(clean).map((h,index)=>['event_notes','public_notes'].includes(h)?index:-1).filter(index=>index>=0);
    if(!notes.length)throw Error('Missing event notes for '+id);
    for(const at of notes)changes.set(at,note);
   }
   for(const [at,value] of changes){if(clean(row[at])!==value)updates.push({id,field:clean(headers[at]),before:clean(row[at]),after:value,range:quoted(tabs[type])+'!'+columnName(at)+(i+2),type,row:i+1,column:at});}
  }
 }
 return updates;
}

export async function repairCheers({apply=false,request=fetch,config,env=process.env,tokenProvider=getAccessToken,save=()=>{}}={}){
 config??=JSON.parse(fs.readFileSync('config/data-sources.json','utf8'));
 const sheetId=env.GOOGLE_SHEETS_ID||env.SINGHUB_SHEET_ID||config.defaultSourceSheetId;
 const tabs={venues:config.tabs.venues,events:config.tabs.events};
 const token=await tokenProvider(apply?'https://www.googleapis.com/auth/spreadsheets':'https://www.googleapis.com/auth/spreadsheets.readonly');
 const base='https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+'/values';
 const call=async(url,options={})=>{const response=await request(url,{...options,headers:{Authorization:'Bearer '+token,...options.headers}});if(!response.ok)throw Error('Canonical repair API returned HTTP '+response.status);return response.json();};
 const read=async()=>Object.fromEntries(await Promise.all(Object.entries(tabs).map(async([type,tab])=>[type,(await call(base+'/'+encodeURIComponent(quoted(tab)+'!A:AZ'))).values||[]])));
 const initial=await read();const updates=planCheersRepair(initial,tabs);save({mode:apply?'apply':'dry-run',updates});
 if(!apply||!updates.length)return {applied:false,verified:!updates.length,updates};
 const fresh=await read();
 if(JSON.stringify(fresh)!==JSON.stringify(initial))throw Error('Canonical rows changed after planning; no updates applied.');
 await call(base+':batchUpdate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({valueInputOption:'RAW',data:updates.map(update=>({range:update.range,values:[[update.after]]}))})});
 const after=await read();
 for(const update of updates)if(clean(after[update.type][update.row]?.[update.column])!==update.after)throw Error('Read-back verification failed for '+update.id+'/'+update.field+'; inspect source before retrying.');
 return {applied:true,verified:true,updates};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 repairCheers({apply:process.argv.includes('--apply'),save:plan=>fs.writeFileSync('cheers-canonical-repair-plan.json',JSON.stringify(plan,null,2))}).then(result=>{fs.writeFileSync('cheers-canonical-repair-result.json',JSON.stringify(result,null,2));console.log(JSON.stringify({applied:result.applied,verified:result.verified,cells:result.updates.length,rows:[...new Set(result.updates.map(u=>u.id))]}));console.log('::notice title=Cheers canonical repair result::'+(result.applied?'Applied and read-back verified':result.verified?'Already correct; verified without changes':'Dry-run only; no writes')+'; cells='+result.updates.length+'; affected rows='+[...new Set(result.updates.map(u=>u.id))].join(', '));}).catch(error=>{console.error('::error title=Cheers canonical repair stopped::'+error.message);process.exitCode=1;});
}
