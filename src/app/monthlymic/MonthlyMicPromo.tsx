import {createAdminClient} from "@/lib/supabase/admin";
import {monthlyMic} from "@/lib/monthlymic";

/** Approved promotional art only. Never mix pre-event mockups into the real photo gallery. */
export default async function MonthlyMicPromo(){
 const {data,error}=await createAdminClient().from("monthlymic_media")
  .select("id,image_url,alt_text,caption").eq("event_id",monthlyMic.id)
  .eq("placement","promo").eq("status","approved")
  .order("sort_order",{ascending:true}).order("created_at",{ascending:true}).limit(3);
 if(error||!data?.length)return null;
 return <section aria-label="MonthlyMic promotional preview" className="mx-auto max-w-5xl px-5 pt-10">
  <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
   <div><p className="text-xs font-black uppercase tracking-[.23em] text-cyan-300">MonthlyMic #001</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">Come meet your karaoke people.</h2></div>
   <span className="text-xs text-slate-400">Promotional mockups, not event photos</span>
  </div>
  <div className={data.length===1?"grid gap-4":"grid gap-4 sm:grid-cols-2"}>
   {data.map(photo=><figure key={photo.id} className="overflow-hidden rounded-2xl border border-white/15 bg-slate-900">
    <img src={photo.image_url} alt={photo.alt_text||"Friends chatting at a karaoke meetup, promotional concept"} loading="lazy" className="h-auto w-full"/>
    {photo.caption&&<figcaption className="px-4 py-3 text-sm text-slate-200">{photo.caption}</figcaption>}
   </figure>)}
  </div>
 </section>;
}
