import Link from "next/link";
import type { KaraokeForecast } from "@/lib/homepageForecast";

const hours = ["6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM", "12 AM"];

export function KaraokeForecastCard({ forecast }: { forecast: KaraokeForecast }) {
  const max = Math.max(...forecast.intensity, 1);
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-cyan-300/25 bg-[linear-gradient(145deg,rgba(2,6,23,0.96),rgba(12,22,44,0.94)_48%,rgba(51,10,58,0.82))] p-1 shadow-[0_28px_80px_rgba(2,6,23,0.42)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-300/50 via-fuchsia-400/80 to-violet-400/40" />
      <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/12 blur-3xl" />
      <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative rounded-[1.75rem] border border-white/[0.05] bg-slate-950/45 px-5 py-6 backdrop-blur md:px-7 md:py-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-fuchsia-300/25 bg-fuchsia-400/10 shadow-[0_0_30px_rgba(217,70,239,0.14)]">
                <span className="text-xl">▥</span>
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Live from the schedule</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">Tonight’s Karaoke Forecast</h2>
              </div>
            </div>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300">
            San Diego • updates daily
          </div>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[0.88fr_1.12fr] xl:items-end">
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5 md:p-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔥</span>
              <p className="text-xl font-black text-fuchsia-200 md:text-2xl">{forecast.headline}</p>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-cyan-200 bg-clip-text text-6xl font-black leading-none text-transparent md:text-7xl">{forecast.score}</span>
              <span className="pb-1 text-2xl font-black text-slate-300">/ 100</span>
            </div>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">{forecast.summary}</p>
          </div>

          <div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Tonight</p>
                <p className="mt-2 text-2xl font-black text-white">{forecast.eventCount}</p>
                <p className="mt-1 text-sm text-slate-400">verified karaoke events</p>
              </div>
              <div className="rounded-2xl border border-violet-300/15 bg-violet-300/[0.04] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-200">Hot zone</p>
                <p className="mt-2 text-lg font-black text-white">{forecast.hotZone}</p>
                <p className="mt-1 text-sm text-slate-400">{forecast.hotZoneCount} events clustered here</p>
              </div>
              <div className="rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/[0.04] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-200">Peak</p>
                <p className="mt-2 text-lg font-black text-white">{forecast.peakWindow}</p>
                <p className="mt-1 text-sm text-slate-400">highest scheduled overlap</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex h-28 items-end gap-2" aria-label="Karaoke intensity by hour">
                {forecast.intensity.map((value, index) => {
                  const heightPx = value > 0 ? 10 + Math.round((value / max) * 66) : 0;
                  return (
                    <div key={hours[index]} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                      <div className="flex h-20 w-full items-end justify-center">
                        <div
                          className="w-full max-w-10 rounded-t-md bg-gradient-to-t from-cyan-400 via-violet-400 to-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.16)] transition-[height] duration-500"
                          style={{ height: `${heightPx}px` }}
                          title={`${hours[index]}: ${value} active karaoke event${value === 1 ? "" : "s"}`}
                        />
                      </div>
                      <span className="whitespace-nowrap text-[0.6rem] font-bold text-slate-500 sm:text-[0.68rem]">{hours[index]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">Schedule-based today. Crowd activity will layer in as SingHUB check-ins come online.</p>
          <Link href="/find-karaoke?day=tonight" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 px-5 py-3 text-sm font-black text-white shadow-[0_0_32px_rgba(236,72,153,0.22)] transition hover:scale-[1.02]">
            See Tonight’s Karaoke →
          </Link>
        </div>
      </div>
    </section>
  );
}
