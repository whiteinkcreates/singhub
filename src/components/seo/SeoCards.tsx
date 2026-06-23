import Link from "next/link";
import type { GuidePost, NeighborhoodSeoPage } from "@/lib/seoContent";
import type { VenueListing } from "@/types";

export function VenueMiniCard({ venue }: { venue: VenueListing }) {
  return (
    <Link
      href={`/venues/${venue.slug}`}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-white/[0.07]"
    >
      <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
        {venue.neighborhood || "San Diego"}
      </p>
      <h3 className="mt-2 text-xl font-black text-white">{venue.venueName}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        {venue.karaokeDay} {venue.startTime ? `at ${venue.startTime}` : "karaoke"}
      </p>
      {venue.vibeTags.length > 0 ? (
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-fuchsia-200">
          {venue.vibeTags.slice(0, 3).join(" • ")}
        </p>
      ) : null}
    </Link>
  );
}

export function GuideCard({ post }: { post: GuidePost }) {
  return (
    <Link
      href={`/guides/${post.slug}`}
      className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30 transition hover:-translate-y-0.5 hover:border-fuchsia-300/50"
    >
      <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300">
        {post.category}
      </p>
      <h3 className="mt-3 text-2xl font-black text-white">{post.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{post.description}</p>
      <p className="mt-4 text-sm font-bold text-cyan-200">Read guide →</p>
    </Link>
  );
}

export function NeighborhoodCard({ neighborhood }: { neighborhood: NeighborhoodSeoPage }) {
  return (
    <Link
      href={`/neighborhoods/${neighborhood.slug}`}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/50"
    >
      <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
        Neighborhood Guide
      </p>
      <h3 className="mt-3 text-2xl font-black text-white">{neighborhood.name}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{neighborhood.vibe}</p>
      <p className="mt-4 text-sm font-bold text-fuchsia-200">Explore {neighborhood.name} →</p>
    </Link>
  );
}
