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
  <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-cyan-300/25 bg-slate-900/80 p-5 sm:flex-row sm:items-center sm:justify-between">
   <div className="max-w-lg">
    <p className="text-lg font-black">Take home a piece of MonthlyMic #001.</p>
    <p className="mt-1 text-sm text-slate-300">Choose your color and size. Prepay for pickup at The Mesa on November 18, or have it shipped to you.</p>
    <p className="mt-2 text-xs font-semibold text-amber-200">Event pickup orders close November 5 at 11:59 PM Pacific. Pickup date depends on production and delivery.</p>
   </div>
   <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:items-end">
    <a href="https://whiteinkcreates.com/products/monthlymic-001-the-mesa-event-pickup-prepaid" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-cyan-300 px-5 py-3 text-center text-sm font-black text-slate-950 transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">Shop the #001 tee · $30 pickup</a>
    <a href="https://whiteinkcreates.com/products/monthlymic-001-the-mesa-limited-edition-tee" target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-center text-sm font-semibold text-cyan-200 underline underline-offset-4 hover:text-white">Prefer shipping? Shop the mailed tee</a>
   </div>
  </div>
 </section>;
}
