import Link from "next/link";
import {createAdminClient} from "@/lib/supabase/admin";
import {requireAdminAuthorization} from "@/lib/adminAuthorization";
import {getVenueListings} from "@/lib/venueData";
import {reportRatio,summarizePerks,hasIncompleteRows,type PerkEvent} from "@/lib/adminPerkReporting";

export const dynamic="force-dynamic";
export const metadata={title:"Perks & Redemptions | SingHUB Admin",robots:{index:false,follow:false}};
type Enhancement={slug:string;profile:{enabled?:boolean;singhubOffer?:{enabled?:boolean;title?:string;presentationMode?:string}}|null};
type Checkin={venue_slug:string};

function daysBack(days:number){
 const parts=new Intl.DateTimeFormat("en-US",{timeZone:"America/Los_Angeles",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
 const field=(type:string)=>parts.find(p=>p.type===type)?.value||"01";
 const date=new Date(field("year")+"-"+field("month")+"-"+field("day")+"T12:00:00Z");
 date.setUTCDate(date.getUTCDate()-(days-1));
 return date.toISOString().slice(0,10);
}
function localDate(s:string|null){
 return s?new Intl.DateTimeFormat("en-US",{timeZone:"America/Los_Angeles",month:"short",day:"numeric",year:"numeric"}).format(new Date(s)):"—";
}
function Stat({label,value,note}:{label:string;value:number;note:string}){
 return <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5">
  <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
  <strong className="mt-2 block text-4xl font-black">{value}</strong>
  <p className="mt-2 text-xs leading-5 text-slate-400">{note}</p>
 </div>;
}
export default async function AdminPerks({searchParams}:{searchParams:Promise<{period?:string;q?:string;sort?:string}>}){
 await requireAdminAuthorization();
 const params=await searchParams;
 const period=["7","30","90","all"].includes(params.period||"")?params.period!:"30";
 const since=period==="all"?"":daysBack(Number(period));
 const q=String(params.q||"").trim().toLowerCase().slice(0,120);
 const sort=["unlocks","presented","redeemed","checkins","name"].includes(params.sort||"")?params.sort!:"unlocks";
 const db=createAdminClient();
 const limit=2500;
 const unlockBase=db.from("venue_offer_unlocks")
  .select("venue_slug,offer_title,presentation_mode,unlocked_at,presentation_started_at,presented_at,redeemed_at",{count:"exact"});
 const checkinBase=db.from("singer_venue_checkins").select("venue_slug,checked_in_on",{count:"exact"});
 const [venues,unlocks,checkins,enhancements]=await Promise.all([
  getVenueListings(),
  (since?unlockBase.gte("nightlife_date",since):unlockBase).order("unlocked_at",{ascending:false}).limit(limit),
  (since?checkinBase.gte("checked_in_on",since):checkinBase).order("checked_in_on",{ascending:false}).limit(limit),
  db.from("venue_enhancements").select("slug,profile",{count:"exact"}).limit(500),
 ]);
 const errors=[unlocks.error?.message,checkins.error?.message,enhancements.error?.message].filter(Boolean);
 if(errors.length)return <main className="mx-auto max-w-5xl px-4 py-10 text-white">
  <Link href="/admin" className="text-cyan-200">← Admin Tools</Link>
  <h1 className="mt-6 text-4xl font-black">Perks & Redemptions</h1>
  <p role="alert" className="mt-6 rounded-xl border border-rose-400/40 p-5 text-rose-200">
   Report unavailable: {errors.join("; ")}. No partial figures are shown.
  </p>
 </main>;
 const truncated=[unlocks,checkins,enhancements].some(result=>hasIncompleteRows(result));
 const rollups=summarizePerks((unlocks.data||[]) as PerkEvent[]);
 const configured=new Map(((enhancements.data||[]) as Enhancement[])
  .filter(v=>v.profile?.enabled===true&&v.profile?.singhubOffer?.enabled===true&&Boolean(v.profile.singhubOffer.title?.trim()))
  .map(v=>[v.slug.toLowerCase(),v.profile!.singhubOffer!]));
 const venueNames=new Map(venues.map(v=>[v.slug.toLowerCase(),{name:v.venueName,area:v.neighborhood||v.city||""}]));
 const checkinTotals=new Map<string,number>();
 for(const c of (checkins.data||[]) as Checkin[]){
  const slug=c.venue_slug.toLowerCase();
  checkinTotals.set(slug,(checkinTotals.get(slug)||0)+1);
 }
 const all=[...new Set([...configured.keys(),...rollups.keys()])].map(slug=>{
  const metric=rollups.get(slug),offer=configured.get(slug),venue=venueNames.get(slug);
  return {slug,name:venue?.name||slug,area:venue?.area||"",
   active:!!offer,title:offer?.title||metric?.titles[0]||"Past perk",
   unlocks:metric?.unlocks||0,screenOpens:metric?.screenOpens||0,
   oneTimeUnlocks:metric?.oneTimeUnlocks||0,staffUnlocks:metric?.staffUnlocks||0,
   presented:metric?.screenPresentations||0,redeemed:metric?.staffRedemptions||0,
   lastUnlocked:metric?.lastUnlocked||null,checkins:checkinTotals.get(slug)||0};
 });
 const totals=all.reduce((s,row)=>({
  unlocked:s.unlocked+row.unlocks,presented:s.presented+row.presented,
  redeemed:s.redeemed+row.redeemed,screens:s.screens+row.oneTimeUnlocks,codes:s.codes+row.staffUnlocks
 }),{unlocked:0,presented:0,redeemed:0,screens:0,codes:0});
 const visible=all.filter(v=>[v.name,v.slug,v.area,v.title].some(t=>t.toLowerCase().includes(q)))
 .sort((a,b)=>{
  if(sort==="name")return a.name.localeCompare(b.name);
  const score=(v:typeof a)=>sort==="presented"?v.presented:sort==="redeemed"?v.redeemed:
   sort==="checkins"?v.checkins:v.unlocks;
  return score(b)-score(a)||a.name.localeCompare(b.name);
 });
 const th="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400";
 const td="px-4 py-4 align-top text-sm text-slate-200";
 return <main className="mx-auto max-w-7xl px-4 py-10 text-white">
  <Link href="/admin" className="text-sm font-bold text-cyan-200">← Admin Tools</Link>
  <header className="mt-6">
   <p className="text-xs font-black uppercase tracking-[.25em] text-fuchsia-300">Partner performance · Admin only</p>
   <h1 className="mt-2 text-4xl font-black md:text-5xl">Perks & Redemptions</h1>
   <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
    Compare venue check-ins, offer unlocks, one-time screen presentations, and verified staff-code redemptions.
    A screen shown to staff is <strong>not proof</strong> a discount was honored at the register.
   </p>
   <nav className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
    <Link href="/admin/venue-activity" className="rounded-full border border-white/15 px-4 py-2 text-cyan-200">Venue Activity ↗</Link>
    <Link href="/admin/light-up-venues" className="rounded-full border border-white/15 px-4 py-2 text-cyan-200">Configure perks ↗</Link>
   </nav>
  </header>
  {truncated&&<p role="alert" className="mt-6 rounded-xl border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-100">
   The report could not confirm complete results. Displayed totals may be incomplete. Shorten the date range before comparing venues.
  </p>}
  <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
   <Stat label="Active venue perks" value={configured.size} note="Currently enabled in venue profiles"/>
   <Stat label="Perks unlocked" value={totals.unlocked} note="Earned from check-ins or qualifying Tour Stops"/>
   <Stat label="Screen presentations" value={totals.presented} note={reportRatio(totals.presented,totals.screens)+" of one-time unlocks; singer-controlled, not POS-confirmed"}/>
   <Stat label="Staff redemptions" value={totals.redeemed} note={reportRatio(totals.redeemed,totals.codes)+" of staff-code unlocks; confirmed through the venue's register key"}/>
  </section>
  <form action="/admin/perks" method="get" className="mt-8 flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-4">
   <label className="grid min-w-[190px] flex-1 gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
    Venue or perk<input name="q" type="search" defaultValue={params.q||""} placeholder="Search venue or offer" className="h-11 rounded-xl border border-white/15 bg-slate-950 px-3 text-sm font-normal normal-case tracking-normal text-white"/>
   </label>
   <label className="grid gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">Period
    <select name="period" defaultValue={period} className="h-11 rounded-xl border border-white/15 bg-slate-950 px-3 text-sm text-white">
     <option value="7">Past 7 days</option><option value="30">Past 30 days</option><option value="90">Past 90 days</option><option value="all">All time</option>
    </select>
   </label>
   <label className="grid gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">Sort
    <select name="sort" defaultValue={sort} className="h-11 rounded-xl border border-white/15 bg-slate-950 px-3 text-sm text-white">
     <option value="unlocks">Most unlocks</option><option value="presented">Most presented</option>
     <option value="redeemed">Most redeemed</option><option value="checkins">Most check-ins</option>
     <option value="name">Venue name</option>
    </select>
   </label>
   <button className="h-11 rounded-xl bg-cyan-300 px-5 text-sm font-black text-slate-950">Apply</button>
  </form>
  <p className="mt-3 text-xs text-slate-400">
   {visible.length} venues shown. Includes active perks with zero activity and historical perks. Check-ins are context, not the unlock eligibility denominator.
  </p>
  <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
   <table className="w-full min-w-[1040px] border-collapse">
    <thead className="bg-white/[.06]"><tr>
     <th className={th}>Venue / perk</th><th className={th}>Check-ins</th><th className={th}>Unlocked</th>
     <th className={th}>Screen opened</th><th className={th}>Presented</th>
     <th className={th}>Staff redeemed</th><th className={th}>Last unlock</th><th className={th}>Actions</th>
    </tr></thead>
    <tbody>{visible.map(v=><tr key={v.slug} className="border-t border-white/10">
     <td className={td}>
      <strong className="text-white">{v.name}</strong>
      <span className="block text-xs text-slate-400">{v.area}</span>
      <span className="mt-1 block text-xs">{v.title}</span>
      <span className={"mt-1 block text-xs font-bold "+(v.active?"text-cyan-200":"text-amber-200")}>{v.active?"Perk active":"Historical activity"}</span>
     </td>
     <td className={td}>{v.checkins}</td>
     <td className={td}><strong className="text-lg text-white">{v.unlocks}</strong>
      <span className="block text-xs text-slate-500">{v.oneTimeUnlocks} one-time · {v.staffUnlocks} staff-code</span></td>
     <td className={td}>{v.screenOpens}</td>
     <td className={td}><strong className="text-lg text-cyan-200">{v.presented}</strong>
      <span className="block text-xs text-slate-500">{reportRatio(v.presented,v.oneTimeUnlocks)} of one-time unlocks</span></td>
     <td className={td}><strong className="text-lg text-emerald-200">{v.redeemed}</strong>
      <span className="block text-xs text-slate-500">{reportRatio(v.redeemed,v.staffUnlocks)} of staff-code unlocks</span></td>
     <td className={td}>{localDate(v.lastUnlocked)}</td>
     <td className={td}><div className="flex flex-col gap-2">
      <Link href={"/admin/light-up-venues?venue="+encodeURIComponent(v.slug)} className="font-bold text-cyan-200 hover:underline">Edit perk ↗</Link>
      <Link href={"/admin/venue-activity?q="+encodeURIComponent(v.name)} className="text-slate-300 hover:underline">Venue activity ↗</Link>
     </div></td>
    </tr>)}</tbody>
   </table>
   {!visible.length&&<p className="p-6 text-sm text-slate-300">No active or historical perks for this selection.</p>}
  </div>
  <p className="mt-5 max-w-4xl text-xs leading-6 text-slate-400">
   Definitions: Unlocked means an eligible singer earned the perk. Opened and Presented are singer-device actions.
   Staff redeemed is recorded only after the venue register key validates a code. This report does not access POS transactions.
   It contains aggregated counts, not singer identities or redemption codes.
  </p>
 </main>;
}
