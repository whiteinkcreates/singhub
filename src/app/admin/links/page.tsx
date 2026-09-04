import Link from "next/link";
import { GoLinkCopyButton } from "@/components/admin/GoLinkCopyButton";
import { getGoPublicUrl, listGoLinks, type GoLink } from "@/lib/goLinks/repository";
import { cloneGoLinkAction, createGoLinkAction, setGoLinkStatusAction, updateGoLinkAction } from "./actions";

export const metadata = { title: "Links + QR | SingHUB Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const inputClass = "min-h-11 rounded-xl border border-white/15 bg-slate-950 px-3 text-sm text-white placeholder:text-slate-600";
const labelClass = "grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-400";

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Los_Angeles" }).format(new Date(value));
}

function matches(link: GoLink, q: string) {
  if (!q) return true;
  const haystack = [link.name, link.slug, link.destination, link.linkType, link.campaign, link.partner, link.channel, link.placement, link.tags.join(" "), link.notes].join(" ").toLowerCase();
  return haystack.includes(q.toLowerCase());
}

function statusMatches(link: GoLink, status: string) {
  if (status === "all") return true;
  if (status === "current") return link.status !== "archived";
  return link.status === status;
}

function MetadataChips({ link }: { link: GoLink }) {
  const values = [link.campaign && `Campaign: ${link.campaign}`, link.partner && `Partner: ${link.partner}`, link.channel && `Channel: ${link.channel}`, link.placement && `Placement: ${link.placement}`, ...link.tags.map(tag => `#${tag}`)].filter(Boolean) as string[];
  if (!values.length) return null;
  return <div className="mt-3 flex flex-wrap gap-2">{values.map(value => <span key={value} className="rounded-full border border-white/10 bg-white/[.04] px-2 py-1 text-[10px] font-bold text-slate-300">{value}</span>)}</div>;
}

export default async function GoLinksAdminPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const params = await searchParams;
  const q = String(params.q || "").trim();
  const status = String(params.status || "current");
  const links = await listGoLinks();
  const filtered = links.filter(link => matches(link, q) && statusMatches(link, status));
  const active = links.filter(link => link.status === "active").length;
  const clicks = links.reduce((total, link) => total + link.clickCount, 0);

  return <main className="mx-auto max-w-7xl px-4 py-10 text-white">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-black uppercase tracking-[.24em] text-cyan-300">SingHUB /go/ registry</p><h1 className="mt-2 text-4xl font-black md:text-5xl">Links + QR</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Create intentional SingHUB links for QR placements, social posts, partners, collabs, Reddit CTAs and campaigns. Destinations can change later without changing the public link or a printed QR.</p></div>
      <Link href="/admin" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold">← Admin Tools</Link>
    </div>

    <section className="mt-7 grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Active links</p><p className="mt-2 text-3xl font-black text-cyan-200">{active}</p></div>
      <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Human clicks</p><p className="mt-2 text-3xl font-black text-fuchsia-200">{clicks.toLocaleString()}</p></div>
      <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><p className="text-xs font-black uppercase tracking-wider text-slate-500">QR standard</p><p className="mt-2 text-sm font-black">Square · black/white · 4-module quiet zone</p><p className="mt-1 text-xs text-slate-500">No dots, gradients or logo overlays.</p></div>
    </section>

    <section className="mt-6 rounded-3xl border border-fuchsia-300/15 bg-fuchsia-300/[.035] p-5 md:p-6">
      <h2 className="text-2xl font-black">Create a link</h2><p className="mt-1 text-sm text-slate-400">Use a readable slug. Slugs are intentionally immutable after creation so printed QRs never silently change. Clone a link when you need a new tracking variant.</p>
      <form action={createGoLinkAction} className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <label className={labelClass}>Name<input name="name" required placeholder="Death Cab IG Story" className={inputClass}/></label>
        <label className={labelClass}>Slug<div className="flex min-h-11 items-center rounded-xl border border-white/15 bg-slate-950"><span className="pl-3 text-sm text-slate-500">/go/</span><input name="slug" required minLength={3} maxLength={80} placeholder="deathcab-ig-story" className="min-w-0 flex-1 bg-transparent px-1 pr-3 text-sm text-white outline-none"/></div></label>
        <label className={`${labelClass} lg:col-span-2`}>Destination<input name="destination" required placeholder="/events/... or https://..." className={inputClass}/></label>
        <label className={labelClass}>Type<select name="linkType" defaultValue="other" className={inputClass}><option value="qr">QR / print</option><option value="social">Social</option><option value="reddit">Reddit</option><option value="collab">Collab / repost</option><option value="partner">Partner</option><option value="venue">Venue</option><option value="event">Event</option><option value="hotel">Hotel</option><option value="other">Other</option></select></label>
        <label className={labelClass}>Campaign<input name="campaign" placeholder="Death Cab Sept 12" className={inputClass}/></label>
        <label className={labelClass}>Partner / venue<input name="partner" placeholder="Death Cab For Karaoke" className={inputClass}/></label>
        <label className={labelClass}>Channel<input name="channel" placeholder="Instagram Story" className={inputClass}/></label>
        <label className={labelClass}>Placement<input name="placement" placeholder="SingHUB teaser story" className={inputClass}/></label>
        <label className={`${labelClass} lg:col-span-2`}>Tags<input name="tags" placeholder="emo, soda-bar, special-event" className={inputClass}/></label>
        <label className={`${labelClass} md:col-span-2 lg:col-span-4`}>Notes<textarea name="notes" placeholder="Where this link was used, who received it, print quantity, etc." className="min-h-24 rounded-xl border border-white/15 bg-slate-950 p-3 text-sm text-white"/></label>
        <button className="min-h-11 rounded-xl bg-cyan-300 px-5 py-2 text-sm font-black text-slate-950 lg:col-span-4">Create SingHUB link</button>
      </form>
    </section>

    <section className="mt-6">
      <form className="grid gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4 sm:grid-cols-[1fr_180px_auto]" method="get">
        <input name="q" defaultValue={q} placeholder="Search campaign, partner, slug, tag, channel..." className={inputClass}/>
        <select name="status" defaultValue={status} className={inputClass}><option value="current">Current</option><option value="active">Active</option><option value="paused">Paused</option><option value="archived">Archived</option><option value="all">All</option></select>
        <button className="rounded-xl border border-white/15 px-5 py-2 text-sm font-black">Filter</button>
      </form>
      <p className="mt-3 text-xs text-slate-500">Archived links stay live and continue tracking. Paused links send visitors to the SingHUB homepage instead.</p>

      <div className="mt-4 space-y-4">{filtered.length === 0 && <div className="rounded-2xl border border-white/10 p-5 text-slate-400">No links match this view.</div>}{filtered.map(link => {
        const publicUrl = getGoPublicUrl(link.slug);
        return <article key={link.id} className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-black">{link.name}</h2><span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${link.status === "active" ? "bg-emerald-300 text-slate-950" : link.status === "paused" ? "bg-amber-300 text-slate-950" : "bg-slate-700 text-slate-200"}`}>{link.status}</span><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-400">{link.linkType}</span></div>
              <p className="mt-2 break-all font-mono text-sm font-bold text-cyan-200">{publicUrl}</p>
              <p className="mt-2 break-all text-xs text-slate-500">→ {link.destination}</p>
              <MetadataChips link={link}/>
              <div className="mt-4 flex flex-wrap gap-5 text-xs text-slate-400"><span><strong className="text-white">{link.clickCount.toLocaleString()}</strong> human clicks</span><span>Last click: <strong className="text-white">{formatDate(link.lastClickedAt)}</strong></span><span>Created: {formatDate(link.createdAt)}</span></div>
            </div>
            <div className="flex flex-wrap gap-2"><GoLinkCopyButton url={publicUrl}/><a href={publicUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-white/15 px-3 py-2 text-xs font-black">Test link ↗</a><a href={`/admin/links/${link.id}/qr?format=svg&download=1`} className="rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-950">QR SVG</a><a href={`/admin/links/${link.id}/qr?format=png&download=1`} className="rounded-lg bg-fuchsia-400 px-3 py-2 text-xs font-black text-slate-950">QR PNG</a></div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {link.status !== "active" && <form action={setGoLinkStatusAction}><input type="hidden" name="id" value={link.id}/><input type="hidden" name="status" value="active"/><button className="rounded-lg border border-emerald-300/30 px-3 py-2 text-xs font-black text-emerald-200">Activate</button></form>}
            {link.status !== "paused" && <form action={setGoLinkStatusAction}><input type="hidden" name="id" value={link.id}/><input type="hidden" name="status" value="paused"/><button className="rounded-lg border border-amber-300/30 px-3 py-2 text-xs font-black text-amber-200">Pause</button></form>}
            {link.status !== "archived" && <form action={setGoLinkStatusAction}><input type="hidden" name="id" value={link.id}/><input type="hidden" name="status" value="archived"/><button className="rounded-lg border border-white/15 px-3 py-2 text-xs font-black text-slate-300">Archive</button></form>}
          </div>

          <details className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4"><summary className="cursor-pointer text-sm font-black text-slate-200">Edit details / clone tracking link</summary>
            <form action={updateGoLinkAction} className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4"><input type="hidden" name="id" value={link.id}/><label className={labelClass}>Name<input name="name" required defaultValue={link.name} className={inputClass}/></label><label className={labelClass}>Type<input name="linkType" defaultValue={link.linkType} className={inputClass}/></label><label className={`${labelClass} lg:col-span-2`}>Destination<input name="destination" required defaultValue={link.destination} className={inputClass}/></label><label className={labelClass}>Campaign<input name="campaign" defaultValue={link.campaign} className={inputClass}/></label><label className={labelClass}>Partner<input name="partner" defaultValue={link.partner} className={inputClass}/></label><label className={labelClass}>Channel<input name="channel" defaultValue={link.channel} className={inputClass}/></label><label className={labelClass}>Placement<input name="placement" defaultValue={link.placement} className={inputClass}/></label><label className={`${labelClass} lg:col-span-2`}>Tags<input name="tags" defaultValue={link.tags.join(", ")} className={inputClass}/></label><label className={`${labelClass} lg:col-span-2`}>Notes<textarea name="notes" defaultValue={link.notes} className="min-h-20 rounded-xl border border-white/15 bg-slate-950 p-3 text-sm text-white"/></label><button className="rounded-xl border border-cyan-300/30 px-4 py-2 text-sm font-black text-cyan-200 lg:col-span-4">Save details</button></form>
            <div className="my-5 border-t border-white/10"/>
            <p className="text-sm font-black">Clone as a tracking variant</p><p className="mt-1 text-xs text-slate-500">Copies the destination, campaign, partner and tags. Give the clone a new slug and optionally change channel or placement.</p>
            <form action={cloneGoLinkAction} className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-5"><input type="hidden" name="id" value={link.id}/><label className={labelClass}>New name<input name="name" required placeholder={`${link.name} - Reddit`} className={inputClass}/></label><label className={labelClass}>New slug<input name="slug" required minLength={3} placeholder={`${link.slug}-reddit`} className={inputClass}/></label><label className={labelClass}>Channel<input name="channel" placeholder="Reddit" className={inputClass}/></label><label className={labelClass}>Placement<input name="placement" placeholder="r/sandiego CTA" className={inputClass}/></label><div className="flex items-end"><button className="min-h-11 w-full rounded-xl bg-fuchsia-400 px-4 py-2 text-sm font-black text-slate-950">Clone</button></div></form>
          </details>
        </article>})}</div>
    </section>
  </main>;
}
