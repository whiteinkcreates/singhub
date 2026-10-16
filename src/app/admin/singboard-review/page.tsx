import Link from "next/link";
import {requireAdminAuthorization} from "@/lib/adminAuthorization";
import {getSingBoardReviewQueue} from "@/lib/singboard/repository";
import {SINGBOARD_CATEGORIES} from "@/lib/singboard/categories";

export const dynamic="force-dynamic";
export const metadata={title:"SingBOARD Post Review | SingHUB Admin",robots:{index:false,follow:false}};

export default async function SingBoardReviewPage(){
  await requireAdminAuthorization();
  const posts=await getSingBoardReviewQueue();
  const pending=posts.filter(post=>post.reviewStatus==="pending");
  const ordered=[...pending,...posts.filter(post=>post.reviewStatus==="verified")];
  return <main className="mx-auto max-w-6xl px-4 py-10 text-white">
    <nav className="flex flex-wrap gap-4 text-sm font-bold text-cyan-200"><Link href="/admin">← Admin Tools</Link><Link href="/admin/singboard-access">Manage contributors</Link><Link href="/singboard">Public board ↗</Link></nav>
    <p className="mt-7 text-xs font-black uppercase tracking-[.2em] text-fuchsia-300">POST-PUBLICATION MODERATION</p>
    <h1 className="mt-2 text-4xl font-black">SingBOARD review</h1>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Verified contributors publish without waiting on you. Posts appear immediately, then land here for an optional accuracy check or one-click takedown. Pending does not mean SingHUB independently verified the claim.</p>
    <div className="mt-5 flex gap-4 text-sm"><span className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3"><strong className="text-xl text-amber-200">{pending.length}</strong> awaiting review</span><span className="rounded-xl border border-white/15 px-4 py-3">{posts.length} active posts</span></div>
    <section className="mt-6 space-y-3" aria-label="SingBOARD review queue">
    {ordered.length===0&&<p className="rounded-xl border border-white/10 p-6 text-slate-300">No active posts need attention.</p>}
    {ordered.map(post=><article className="rounded-2xl border border-white/10 bg-white/[.035] p-4" key={post.id}>
      <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase ${SINGBOARD_CATEGORIES[post.category].badge}`}>{SINGBOARD_CATEGORIES[post.category].label}</span>
          <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${post.reviewStatus==="verified"?"bg-emerald-400/20 text-emerald-200":"bg-amber-400/20 text-amber-100"}`}>{post.reviewStatus==="verified"?"Reviewed":"Pending review"}</span>
        </div>
        <h2 className="mt-2 text-lg font-black">{post.title}</h2>
        <p className="text-sm text-slate-300">{post.venueName} · Posted by {post.posterName}</p>
        <p className="mt-1 text-xs text-slate-500">Published {new Date(post.postedAt).toLocaleDateString("en-US",{timeZone:"America/Los_Angeles"})} · {post.postType} · Expires {post.eventDate}</p>
        <Link className="mt-2 inline-block text-sm font-bold text-cyan-200 underline" href={`/events/${post.id}`} target="_blank">Inspect post ↗</Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {post.reviewStatus==="pending"&&<form method="post" action="/api/admin/singboard-review"><input type="hidden" name="postId" value={post.id}/><input type="hidden" name="action" value="verify"/><button className="rounded-lg bg-emerald-300 px-4 py-2 text-xs font-black text-slate-950">Verify</button></form>}
        <form method="post" action="/api/admin/singboard-review"><input type="hidden" name="postId" value={post.id}/><input type="hidden" name="action" value="unpublish"/><button className="rounded-lg border border-rose-300/40 px-4 py-2 text-xs font-black text-rose-200">Unpublish</button></form>
      </div>
      </div>
    </article>)}
    </section>
    <p className="mt-6 text-xs leading-5 text-slate-400">A post can be reviewed or unpublished here. Manage poster revocation separately in Posting Access. Existing SingHUB venue/KJ identity linking is required before profile distribution.</p>
  </main>;
}
