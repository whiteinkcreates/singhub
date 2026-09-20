import type { SingersSaySummary } from "@/lib/singersSay.server";
import { VenueSemanticIcon, venueVibeIconName } from "@/components/venue/VenueSemanticIcon";

export function SingersSay({ summary }: { summary: SingersSaySummary }) {
  if (summary.totalResponses < 3 || summary.tags.length === 0) return null;

  const tags = summary.tags.slice(0, 6);

  return (
    <section className="mt-9 rounded-[1.5rem] border border-fuchsia-300/15 bg-[linear-gradient(135deg,rgba(88,28,135,.12),rgba(8,16,24,.98)_55%,rgba(8,145,178,.08))] p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">Singers Say</p>
          <h2 className="mt-1 text-2xl font-black text-white">What karaoke feels like here</h2>
        </div>
        <p className="text-xs font-semibold text-slate-500">Based on {summary.totalResponses} recent singer {summary.totalResponses === 1 ? "response" : "responses"}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {tags.map((tag) => {
          const icon = venueVibeIconName(tag.slug);
          return (
            <div key={tag.slug} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
              {icon ? <VenueSemanticIcon name={icon} className="h-4 w-4 shrink-0 text-fuchsia-200" /> : null}
              <span className="font-bold text-white">{tag.label}</span>
              <span className="text-xs text-cyan-200">{tag.percentage}%</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
