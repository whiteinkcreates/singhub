import type { Metadata } from "next";
import {PositionedImage} from "@/components/media/PositionedImage";
import { HeroScrollCue } from "@/components/layout/HeroScrollCue";
import { SingBoard } from "@/components/singboard/SingBoard";
import { getActiveSingBoardFlyers } from "@/lib/singboard/repository";
import { SINGBOARD_STICKER_ART } from "@/lib/singboardStickerArt";
import {getHostMediaSettings} from "@/lib/hostMedia.server";
import {SITE_SINGBOARD_HERO_KEY} from "@/lib/hostMedia";

export const metadata: Metadata = {
  title: "SingBOARD | SingHUB",
  description: "See San Diego karaoke events, community notices, and wanted posts from local venues and KJs on SingBOARD.",
  alternates: { canonical: "/singboard" },
};

export const dynamic = "force-dynamic";

export default async function SingBoardPage() {
  const [flyers,hero] = await Promise.all([getActiveSingBoardFlyers(),getHostMediaSettings(SITE_SINGBOARD_HERO_KEY).catch(()=>null)]);

  return (
    <main data-scroll-page="singboard" className="min-h-[100dvh] bg-[#05060a] pb-24 text-white">
      <section data-page-hero="" className="relative isolate overflow-hidden border-b border-white/10" aria-labelledby="singboard-hero-title">
        <div data-board-hero-frame="" className="relative h-full w-full">
          <PositionedImage placement={hero?.heroPlacement} position={hero?.heroPosition}
            src={hero?.heroUrl||SINGBOARD_STICKER_ART}
            alt={hero?.heroAlt||"SingBOARD sticker wall"}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="relative z-10 flex h-full w-full items-end px-5 pb-28 pt-6 sm:px-10 sm:pb-20">
            <div data-hero-copy="" className="w-full">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300">SAN DIEGO KARAOKE COMMUNITY</p>
              <h1 id="singboard-hero-title" className="m-0 text-[clamp(3.5rem,8vw,6.8rem)] font-black uppercase leading-[0.84] tracking-[-0.025em]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>SingBOARD</h1>
              <p className="mt-4 max-w-xl text-sm font-semibold leading-relaxed text-slate-200 sm:text-base">
                Karaoke event flyers, community updates and wanted posts from local venues and KJs.
              </p>
            </div>
          </div>
        </div>
        <HeroScrollCue />
      </section>

      <section data-page-surface="" className="mx-auto max-w-6xl px-3 pt-5 sm:px-6 sm:pt-7">
        <div className="mb-3 flex items-end justify-between gap-4 px-1">
          <div>
            <h2 className="mt-1 text-xl font-black sm:text-2xl">What&apos;s pinned</h2>
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
