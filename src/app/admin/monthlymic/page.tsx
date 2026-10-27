import Link from "next/link";
import {createAdminClient} from "@/lib/supabase/admin";
import {monthlyMic} from "@/lib/monthlymic";
import {cancelMonthlyMicRsvp} from "./actions";
export const dynamic="force-dynamic";
export const metadata={title:"MonthlyMic RSVPs | SingHUB Admin",robots:{index:false,follow:false}};
export default async function MonthlyMicAdmin(){
 const db=createAdminClient();
 const {data,error}=await db.from("monthlymic_rsvps").select("id,full_name,email,status,party_size,just_duet,photo_permission,availability,shirt_size,source,created_at").eq("event_id",monthlyMic.id).order("created_at",{ascending:false}).limit(500);
 return <main className="mx-auto max-w-6xl px-4 py-10 text-white">
 <Link href="/admin" className="text-cyan-300">← Admin</Link>
 <h1 className="mt-5 text-4xl font-black">MonthlyMic RSVPs</h1>
 <p className="mt-2 text-slate-300">Event: {monthlyMic.id} · Admin only · Private attendee information</p>
 {error?<p role="alert" className="mt-5 text-rose-300">Could not load attendee list. Check the MonthlyMic database migration.</p>:<>
 <p className="mt-5 text-xl font-bold">{(data||[]).filter(x=>x.status==="going").reduce((n,x)=>n+x.party_size,0)} planning to come · {(data||[]).filter(x=>x.status==="interested").length} interested · {(data||[]).filter(x=>x.just_duet&&x.status!=="cancelled").length} JustDuet participants</p>
 <div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-white/30">{["Name","Email","Status","Party","Available","Shirt","JustDuet","Photo OK","Source","Action"].map(s=><th key={s} className="p-3">{s}</th>)}</tr></thead><tbody>{(data||[]).map(x=><tr key={x.id} className="border-b border-white/10"><td className="p-3">{x.full_name}</td><td className="p-3">{x.email}</td><td className="p-3">{x.status}</td><td className="p-3">{x.party_size}</td><td className="p-3">{x.availability}</td><td className="p-3">{x.shirt_size||"—"}</td><td className="p-3">{x.just_duet?"Yes":"No"}</td><td className="p-3">{x.photo_permission?"Yes":"No"}</td><td className="p-3">{x.source}</td><td className="p-3">{x.status!=="cancelled"&&<form action={cancelMonthlyMicRsvp}><input type="hidden" name="id" value={x.id}/><button className="rounded-md border border-white/20 px-3 py-1">Cancel</button></form>}</td></tr>)}</tbody></table></div>
 </>}
 </main>;
}
