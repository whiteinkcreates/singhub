import Link from "next/link";
import { listSingBoardAccessMembers } from "@/lib/singboard/repository";
import { createAccessMemberAction, rotateAccessCodeAction, setAccessActiveAction } from "./actions";

export const metadata = { title: "SingBOARD Access | SingHUB Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function typeLabel(value:string){return value==="kj"?"KJ":value.charAt(0).toUpperCase()+value.slice(1)}

export default async function SingBoardAccessPage(){
  const members=await listSingBoardAccessMembers();
  return <main className="mx-auto max-w-6xl px-4 py-10 text-white">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.24em] text-fuchsia-300">SingBOARD</p><h1 className="mt-2 text-4xl font-black">Posting Access</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Create and manage the people and venues allowed to post to SingBOARD. You choose the access code here. SingHUB stores it securely behind the scenes.</p></div><Link href="/admin" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold">← Admin Tools</Link></div>

    <section className="mt-8 rounded-3xl border border-white/10 bg-white/[.04] p-5 md:p-6"><h2 className="text-2xl font-black">Give someone access</h2><p className="mt-1 text-sm text-slate-400">Use a code you can comfortably send by text or DM. Minimum 8 characters.</p>
      <form action={createAccessMemberAction} className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-400">Name / business<input name="displayName" required placeholder="Tigg / The Regal" className="min-h-11 rounded-xl border border-white/15 bg-slate-950 px-3 text-sm normal-case text-white"/></label>
        <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-400">Type<select name="posterType" defaultValue="venue" className="min-h-11 rounded-xl border border-white/15 bg-slate-950 px-3 text-sm normal-case text-white"><option value="venue">Venue</option><option value="kj">KJ</option><option value="admin">Admin</option></select></label>
        <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-400">Access code<input name="accessCode" required minLength={8} placeholder="Regal-Sing-26" className="min-h-11 rounded-xl border border-white/15 bg-slate-950 px-3 text-sm normal-case text-white"/></label>
        <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-400">Venue ID <span className="normal-case font-normal">optional</span><input name="venueId" placeholder="venue id" className="min-h-11 rounded-xl border border-white/15 bg-slate-950 px-3 text-sm normal-case text-white"/></label>
        <div className="flex items-end"><button className="min-h-11 w-full rounded-xl bg-fuchsia-400 px-4 py-2 text-sm font-black text-slate-950">Create access</button></div>
        <input type="hidden" name="hostId" value=""/>
      </form>
    </section>

    <section className="mt-6 rounded-3xl border border-white/10 bg-white/[.04] p-5 md:p-6"><div className="flex items-end justify-between gap-4"><div><h2 className="text-2xl font-black">Who has access</h2><p className="mt-1 text-sm text-slate-400">{members.filter(member=>member.active).length} active · {members.length} total</p></div></div>
      <div className="mt-5 space-y-3">{members.length===0&&<p className="rounded-2xl border border-white/10 p-4 text-slate-400">Nobody has SingBOARD posting access yet.</p>}{members.map(member=><div key={member.id} className={`rounded-2xl border p-4 ${member.active?"border-emerald-300/20 bg-emerald-300/[.04]":"border-white/10 bg-black/20 opacity-70"}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="text-lg font-black">{member.displayName}</p><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-300">{typeLabel(member.posterType)}</span><span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${member.active?"bg-emerald-300 text-slate-950":"bg-slate-700 text-slate-200"}`}>{member.active?"Active":"Revoked"}</span></div>{member.venueId&&<p className="mt-1 text-xs text-slate-500">Venue ID: {member.venueId}</p>}<p className="mt-1 text-xs text-slate-500">Access codes are not displayed after saving. Replace it below if needed.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row"><form action={rotateAccessCodeAction} className="flex gap-2"><input type="hidden" name="memberId" value={member.id}/><input name="accessCode" minLength={8} required placeholder="New access code" className="min-h-10 w-44 rounded-lg border border-white/15 bg-slate-950 px-3 text-sm"/><button className="rounded-lg border border-cyan-300/30 px-3 py-2 text-xs font-black text-cyan-200">Replace code</button></form><form action={setAccessActiveAction}><input type="hidden" name="memberId" value={member.id}/><input type="hidden" name="active" value={member.active?"false":"true"}/><button className={`min-h-10 rounded-lg px-3 py-2 text-xs font-black ${member.active?"border border-red-300/30 text-red-200":"bg-emerald-300 text-slate-950"}`}>{member.active?"Revoke access":"Restore access"}</button></form></div>
        </div>
      </div>)}</div>
    </section>
  </main>
}
