import Link from "next/link";
import { requireAdminAuthorization } from "@/lib/adminAuthorization";
import { createAdminClient } from "@/lib/supabase/admin";
import { getKaraokeEventListings } from "@/lib/eventData";
import { removeKaraokeChange } from "./actions";
import KaraokeChangeForm from "./KaraokeChangeForm";

export const dynamic = "force-dynamic";
export const metadata = { title:"Date-Specific Karaoke Changes | SingHUB", robots:{index:false,follow:false} };

type SavedRow = {
 event_id:string;venue_slug:string;nightlife_date:string;status:string;
 start_time:string|null;end_time:string|null;host_name:string|null;note:string|null;updated_at:string;
};

export default async function KaraokeChangesPage({searchParams}:{searchParams:Promise<{saved?:string;removed?:string;event?:string;date?:string}>}) {
  await requireAdminAuthorization();
  const params = await searchParams;
  const events = (await getKaraokeEventListings())
    .filter(event=>event.activeStatus==="active")
    .map(event=>({eventId:event.eventId,venueSlug:event.venueSlug,venueName:event.venueName,day:event.karaokeDay,startTime:event.startTime,endTime:event.endTime,hostName:event.hostName||""}))
    .sort((a,b)=>a.venueName.localeCompare(b.venueName)||a.day.localeCompare(b.day));
  const today = new Date();
  today.setUTCDate(today.getUTCDate()-2);
  const {data,error} = await createAdminClient().from("karaoke_event_overrides")
    .select("event_id,venue_slug,nightlife_date,status,start_time,end_time,host_name,note,updated_at")
    .gte("nightlife_date",today.toISOString().slice(0,10))
    .order("nightlife_date",{ascending:true}).limit(250);
  if (error) throw new Error("Cannot load saved karaoke changes: "+error.message);
  const rows = (data||[]) as SavedRow[];
  const editing = rows.find(row=>row.event_id===params.event && row.nightlife_date===params.date);
  const names = new Map(events.map(event=>[event.eventId,event.venueName]));
  return <main className="mx-auto max-w-6xl space-y-8 px-5 py-10 text-white">
    <header>
      <Link href="/admin" className="text-sm font-bold text-cyan-200">← Admin Tools</Link>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-fuchsia-300">SingHUB / Schedule Control</p>
      <h1 className="mt-2 text-4xl font-black">Tonight & future changes</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-300">Cancel a single occurrence, adjust its hours, or substitute a host. Pick tonight or a future date. Your original recurring schedule remains intact.</p>
      {(params.saved||params.removed)&&<p role="status" className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-3 font-bold text-emerald-200">{params.saved?"Dated karaoke change saved and public caches refreshed.":"The dated change was undone; regular schedule restored."}</p>}
    </header>
    <KaraokeChangeForm key={editing?.event_id+"-"+editing?.nightlife_date||"new"} events={events} edit={editing}/>
    <section className="rounded-2xl border border-white/15 bg-slate-950/80 p-5">
      <h2 className="text-2xl font-black">Current & upcoming exceptions</h2>
      <p className="mt-2 text-sm text-slate-300">One row per karaoke event and date. Undo restores the recurring event; edit overwrites the exception for that date. Old exceptions expire automatically.</p>
      {!rows.length?<p className="mt-5 text-slate-400">No future exceptions recorded.</p>:<div className="mt-5 grid gap-3">
        {rows.map(row=><article key={row.event_id+"-"+row.nightlife_date} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="min-w-0">
            <p className="text-sm font-black text-white">{names.get(row.event_id)||row.venue_slug}</p>
            <p className="mt-1 text-sm text-slate-300">{row.nightlife_date} · <strong className="text-cyan-200">{row.status==="canceled"?"NOT TONIGHT":row.status==="time_changed"?"TIME CHANGED":"HOST CHANGED"}</strong> · {row.status==="time_changed"?[row.start_time,row.end_time].filter(Boolean).join(" to "):row.status==="host_changed"?row.host_name:"Recurring night canceled"}</p>
            {row.note&&<p className="mt-1 text-xs text-slate-500">Internal source: {row.note}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="rounded-lg border border-white/20 px-3 py-2 text-sm font-bold text-cyan-200" href={"/venues/"+row.venue_slug}>Venue</Link>
            <Link className="rounded-lg border border-cyan-300/30 px-3 py-2 text-sm font-bold text-cyan-200" href={"/admin/karaoke-changes?event="+encodeURIComponent(row.event_id)+"&date="+row.nightlife_date+"#edit"}>Edit</Link>
            <form action={removeKaraokeChange}>
              <input type="hidden" name="event_id" value={row.event_id}/>
              <input type="hidden" name="venue_slug" value={row.venue_slug}/>
              <input type="hidden" name="nightlife_date" value={row.nightlife_date}/>
              <button type="submit" className="rounded-lg border border-rose-400/30 px-3 py-2 text-sm font-bold text-rose-200">Undo</button>
            </form>
          </div>
        </article>)}
      </div>}
    </section>
  </main>;
}
