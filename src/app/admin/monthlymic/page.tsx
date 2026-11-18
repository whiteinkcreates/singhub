import MonthlyMicMediaAdmin from "./MonthlyMicMediaAdmin";
import {requireAdminAuthorization} from "@/lib/adminAuthorization";
import Link from "next/link";
import {createAdminClient} from "@/lib/supabase/admin";
import {monthlyMic} from "@/lib/monthlymic";
import {cancelMonthlyMicRsvp} from "./actions";
export const dynamic="force-dynamic";
export const metadata={title:"MonthlyMic RSVPs | SingHUB Admin",robots:{index:false,follow:false}};
export default async function MonthlyMicAdmin(){
 await requireAdminAuthorization();
 const db=createAdminClient();
 const {data,error}=await db.from("monthlymic_rsvps").select("id,full_name,email,status,party_size,just_duet,photo_permission,availability,future_updates,shirt_size,source,created_at").eq("event_id",monthlyMic.id).order("created_at",{ascending:false}).limit(500);
 const {data:feedback,error:feedbackError}=await db.from("monthlymic_feedback").select("id,display_name,reply_email,anonymous,rating,message,created_at").eq("event_id",monthlyMic.id).order("created_at",{ascending:false}).limit(200);
 return <main className="mx-auto max-w-6xl px-4 py-10 text-white">
 <Link href="/admin" className="text-cyan-300">← Admin</Link>
 <h1 className="mt-5 text-4xl font-black">MonthlyMic RSVPs</h1>
 <p className="mt-2 text-slate-300">Event: {monthlyMic.id} · Admin only · Private attendee information</p>
 {error?<p role="alert" className="mt-5 text-rose-300">Could not load attendee list. Check the MonthlyMic database migration.</p>:<>
 <p className="mt-5 text-xl font-bold">{(data||[]).filter(x=>x.status==="going").reduce((n,x)=>n+x.party_size,0)} planning to come · {(data||[]).filter(x=>x.future_updates&&x.status!=="cancelled").length} future-update subscribers · {(data||[]).filter(x=>x.just_duet&&x.status!=="cancelled").length} JustDuet participants</p>
 <div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-white/30">{["Name","Email","Status","Party","Available","Future alerts","Shirt","JustDuet","Photo OK","Source","Action"].map(s=><th key={s} className="p-3">{s}</th>)}</tr></thead><tbody>{(data||[]).map(x=><tr key={x.id} className="border-b border-white/10"><td className="p-3">{x.full_name}</td><td className="p-3">{x.email}</td><td className="p-3">{x.status}</td><td className="p-3">{x.party_size}</td><td className="p-3">{x.availability}</td><td className="p-3">{x.future_updates?"Opted in":"No"}</td><td className="p-3">{x.shirt_size||"—"}</td><td className="p-3">{x.just_duet?"Yes":"No"}</td><td className="p-3">{x.photo_permission?"Yes":"No"}</td><td className="p-3">{x.source}</td><td className="p-3">{x.status!=="cancelled"&&<form action={cancelMonthlyMicRsvp}><input type="hidden" name="id" value={x.id}/><button className="rounded-md border border-white/20 px-3 py-1">Cancel</button></form>}</td></tr>)}</tbody></table></div>
 </>}
 <section className="mt-12 rounded-2xl border border-fuchsia-400/25 p-5" aria-labelledby="monthlymic-admin-feedback">
  <h2 id="monthlymic-admin-feedback" className="text-2xl font-black">Private MonthlyMic notes</h2>
  <p className="mt-2 text-sm text-slate-300">Only admin can see these. Anonymous submissions have no name or contact email. Never publish a note without asking.</p>
  {feedbackError?<p role="alert" className="mt-4 text-rose-300">Feedback unavailable. Check the database setup.</p>:!feedback?.length?<p className="mt-4 text-slate-400">No feedback yet.</p>:
   <div className="mt-5 space-y-4">{feedback.map(item=><article key={item.id} className="rounded-xl border border-white/15 bg-white/5 p-4">
     <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-300">
       <strong className="text-white">{item.anonymous?"Anonymous":item.display_name||"Named attendee"}</strong>
       <span>{new Date(item.created_at).toLocaleString("en-US",{dateStyle:"medium",timeStyle:"short",timeZone:"America/Los_Angeles"})}</span>
     </div>
     {item.rating&&<p className="mt-2 font-bold text-cyan-200">Rating: {item.rating}/5</p>}
     <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-white">{item.message}</p>
     {item.reply_email&&<a href={`mailto:${item.reply_email}`} className="mt-3 inline-block break-all text-sm text-cyan-200 underline">Reply to {item.reply_email}</a>}
   </article>)}</div>}
 </section>
 <MonthlyMicMediaAdmin/>
 </main>;
}
