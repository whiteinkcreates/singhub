import type { Metadata } from "next";
import { SingBoard } from "@/components/singboard/SingBoard";
import { getActiveSingBoardFlyers } from "@/lib/singboard/repository";
import { SINGBOARD_STICKER_ART } from "@/lib/singboardStickerArt";

export const metadata: Metadata = {
  title: "SingBOARD | SingHUB",
  description: "See San Diego karaoke events, community notices, and wanted posts from local venues and KJs on SingBOARD.",
  alternates: { canonical: "/singboard" },
};

export const dynamic = "force-dynamic";

export default async function SingBoardPage() {
  const flyers = await getActiveSingBoardFlyers();

  return (
    <main data-scroll-page="singboard" className="min-h-[100dvh] bg-[#05060a] pb-24 text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="relative h-[48vh] min-h-[360px] max-h-[620px] sm:h-[54vh]">
          <img
            src={SINGBOARD_STICKER_ART}
            alt="SingBOARD sticker wall"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,10,.08)_0%,rgba(5,6,10,.18)_48%,rgba(5,6,10,.92)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-5 pb-7 sm:px-8 sm:pb-9">
            <img src="/images/singboard-wordmark.webp" alt="SingBOARD" className="h-auto w-48 sm:w-64" />
            <p className="mt-2 max-w-xl text-sm font-semibold text-slate-200 sm:text-base">
              San Diego karaoke events, community posts, and the stuff worth knowing about.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-3 pt-5 sm:px-6 sm:pt-7">
        <div className="mb-3 flex items-end justify-between gap-4 px-1">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-fuchsia-300">What&apos;s pinned</p>
            <h1 className="mt-1 text-xl font-black sm:text-2xl">SingBOARD</h1>
          </div>
          <p className="max-w-52 text-right text-[10px] leading-snug text-slate-400 sm:max-w-xs sm:text-xs">
            Tap a flyer or note for the full event page.
          </p>
        </div>

        <SingBoard initialFlyers={flyers} />
      </section>
    </main>
  );
}
