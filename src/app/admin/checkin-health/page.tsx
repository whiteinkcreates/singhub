import Link from 'next/link';
import {createAdminClient} from '@/lib/supabase/admin';
import {requireAdminAuthorization} from '@/lib/adminAuthorization';

export const dynamic='force-dynamic';
export const metadata={title:'Check-in Reliability | SingHUB Admin',robots:{index:false,follow:false}};

type Attempt={
 venue_slug:string;venue_name:string;action:'venue'|'tour'|'unknown';
 outcome:'success'|'failure';phase:string;reason:string|null;
 accuracy_band:string|null;source:'app'|'user_report';created_at:string;
};
function nameOf(reason:string|null){
 const names:Record<string,string>={
  too_far:'Outside GPS radius',low_accuracy:'Indoor GPS inaccurate',
  permission_denied:'Location permission denied',
  position_unavailable:'Location unavailable',gps_timeout:'GPS timed out',
  gps_unsupported:'Location unsupported',invalid_location:'Invalid GPS reading',
  missing_venue_coordinates:'Venue pin missing',
  no_location_prompt:'No GPS prompt (reported)',
  network_error:'Network request failed',request_error:'Check-in API error',
  auth_expired:'Sign-in expired',schedule_closed:'Karaoke window closed',
  unknown:'Unknown reason'
 };
 return reason?names[reason]||reason.replaceAll('_',' '):'GPS verified';
}
function localTime(date:string){
 return new Intl.DateTimeFormat('en-US',{
  timeZone:'America/Los_Angeles',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',
 }).format(new Date(date));
}

export default async function CheckInHealthPage(){
 await requireAdminAuthorization();
 const db=createAdminClient();
 const since=new Date(Date.now()-30*24*60*60*1000).toISOString();
 const {data,error}=await db.from('singer_location_attempts')
  .select('venue_slug,venue_name,action,outcome,phase,reason,accuracy_band,source,created_at')
  .gte('created_at',since).order('created_at',{ascending:false}).limit(1500);
 const entries=(data||[]) as Attempt[];
 const automatic=entries.filter(e=>e.source==='app');
 const reports=entries.filter(e=>e.source==='user_report');
 const successes=automatic.filter(e=>e.outcome==='success').length;
 const failures=automatic.filter(e=>e.outcome==='failure').length;
 const venues=new Map<string,{slug:string;name:string;successes:number;failures:number;reported:number;reasons:Map<string,number>}>();
 for(const entry of entries){
  let row=venues.get(entry.venue_slug);
  if(!row){row={slug:entry.venue_slug,name:entry.venue_name,successes:0,failures:0,reported:0,reasons:new Map()};venues.set(entry.venue_slug,row);}
  if(entry.source==='user_report'){row.reported++;continue;}
  if(entry.outcome==='success')row.successes++;
  else{
   row.failures++;
   const reason=entry.reason||'unknown';
   row.reasons.set(reason,(row.reasons.get(reason)||0)+1);
  }
 }
 const top=[...venues.values()].sort((a,b)=>b.failures-a.failures||b.reported-a.reported||a.name.localeCompare(b.name));
 const reasons=new Map<string,number>();
 for(const entry of automatic.filter(item=>item.outcome==='failure')){
  const reason=entry.reason||'unknown';reasons.set(reason,(reasons.get(reason)||0)+1);
 }
 const common=[...reasons].sort((a,b)=>b[1]-a[1]);

 return <main className="mx-auto max-w-7xl px-4 py-10 text-white">
  <div className="mb-6"><Link href="/admin" className="text-sm font-bold text-cyan-200">← Admin tools</Link></div>
  <p className="text-xs font-black uppercase tracking-[.25em] text-fuchsia-300">SingHUB · Singer Experience</p>
  <h1 className="mt-3 text-4xl font-black">Location Check-in Health</h1>
  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
   Last 30 days. GPS button attempts for venue check-ins and karaoke Tour Stops, including failures before a phone returns coordinates.
   No precise GPS coordinates, IP addresses, or raw device identifiers are stored.
  </p>
  {error&&<p role="alert" className="mt-6 rounded-xl border border-red-400 p-4 text-red-200">Could not load check-in diagnostics: {error.message}</p>}
  <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Location reliability totals">
   {[
    ['Automatic GPS attempts',automatic.length],
    ['Verified GPS successes',successes],
    ['Automatic failures',failures],
    ['Reported incidents',reports.length]
   ].map(([label,value])=><div key={String(label)} className="rounded-2xl border border-cyan-500/25 bg-slate-950 p-5">
    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <strong className="mt-2 block text-4xl font-black">{value}</strong>
   </div>)}
  </section>
  <p className="mt-3 text-sm text-slate-400">
   {automatic.length?Math.round(100*failures/automatic.length)+'% failed among recorded GPS button attempts.':'Automatic recording begins after the GPS telemetry release.'}
   {' '}Historical chat reports remain separate from measured attempts. This view shows the newest 1,500 events at most.
  </p>
  <section className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
   <div>
    <h2 className="text-2xl font-black">By venue</h2>
    <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
     <table className="w-full min-w-[570px] border-collapse text-left text-sm">
      <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400"><tr>
       <th className="p-3">Venue</th><th className="p-3">GPS successes</th><th className="p-3">GPS failures</th><th className="p-3">Reported</th><th className="p-3">Main failure</th>
      </tr></thead>
      <tbody>{top.map(row=><tr key={row.slug} className="border-t border-white/10">
       <td className="p-3 font-bold"><Link className="text-cyan-200 hover:underline" href={'/venues/'+row.slug}>{row.name}</Link></td>
       <td className="p-3 text-cyan-100">{row.successes}</td>
       <td className="p-3 text-rose-200">{row.failures}</td>
       <td className="p-3 text-slate-300">{row.reported}</td>
       <td className="p-3 text-slate-300">{[...row.reasons].sort((a,b)=>b[1]-a[1]).map(([key])=>nameOf(key))[0]||'—'}</td>
      </tr>)}</tbody>
     </table>
     {!top.length&&<p className="p-5 text-sm text-slate-300">No attempts recorded yet.</p>}
    </div>
   </div>
   <div>
    <h2 className="text-2xl font-black">Failure reasons</h2>
    <div className="mt-4 space-y-2">
     {common.map(([reason,count])=><div key={reason} className="flex justify-between gap-3 rounded-xl border border-white/10 bg-white/[.04] p-3 text-sm">
      <span>{nameOf(reason)}</span><strong>{count}</strong>
     </div>)}
     {!common.length&&<p className="text-sm text-slate-400">No automatic failures yet.</p>}
    </div>
   </div>
  </section>
  <section className="mt-10">
   <h2 className="text-2xl font-black">Recent events</h2>
   <p className="mt-1 text-sm text-slate-400">Chat reports show when they were logged, not necessarily the time of the original incident.</p>
   <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
    <table className="w-full min-w-[700px] border-collapse text-left text-sm">
     <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400"><tr>
      <th className="p-3">Logged (SD)</th><th className="p-3">Venue</th><th className="p-3">Button</th><th className="p-3">Outcome</th><th className="p-3">Reason</th><th className="p-3">GPS accuracy</th><th className="p-3">Source</th>
     </tr></thead>
     <tbody>{entries.slice(0,120).map((entry,i)=><tr key={entry.created_at+entry.venue_slug+i} className="border-t border-white/10">
      <td className="p-3 whitespace-nowrap text-slate-400">{localTime(entry.created_at)}</td>
      <td className="p-3 font-semibold">{entry.venue_name}</td>
      <td className="p-3">{entry.action==='tour'?'Tour Stop':entry.action==='venue'?'Venue check-in':'Unknown'}</td>
      <td className={'p-3 font-bold '+(entry.outcome==='failure'?'text-rose-200':'text-cyan-200')}>{entry.outcome}</td>
      <td className="p-3">{nameOf(entry.reason)}</td>
      <td className="p-3">{entry.accuracy_band||'—'}</td>
      <td className="p-3">{entry.source==='user_report'?'User-reported':'Automatic'}</td>
     </tr>)}</tbody>
    </table>
   </div>
  </section>
 </main>;
}
