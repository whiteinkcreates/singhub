import type { Metadata } from "next";
import { SingBoard } from "@/components/singboard/SingBoard";
import { getActiveSingBoardFlyers } from "@/lib/singboard/repository";

export const metadata: Metadata = {
  title: "SingBOARD | SingHUB",
  description: "See San Diego karaoke events, community notices, and wanted posts from local venues and KJs on SingBOARD.",
  alternates: { canonical: "/singboard" },
};

export const dynamic = "force-dynamic";

export default async function SingBoardPage() {
  const flyers = await getActiveSingBoardFlyers();

  return (
    <main data-scroll-page="singboard" className="min-h-[100dvh] overflow-hidden bg-[#05060a] pb-24 text-white">
      <style>{`
        @keyframes singboard-rise {
          from { opacity: 0; transform: translateY(34px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .singboard-rise { animation: singboard-rise .28s cubic-bezier(.2,.8,.2,1) both; }
      `}</style>

      <section className="singboard-rise min-h-[100dvh] bg-[#05060a] px-2 pt-3 sm:px-4 sm:pt-4">
        <div className="mx-auto flex max-w-7xl items-end justify-between gap-3 px-2 pb-2 sm:px-3">
          <div>
            <img src="/images/singboard-wordmark.webp" alt="SingBOARD" className="h-auto w-40 sm:w-52" />
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[.12em] text-slate-400 sm:text-xs">San Diego karaoke events + community</p>
          </div>
          <p className="max-w-44 text-right text-[10px] leading-tight text-slate-400 sm:max-w-xs sm:text-xs">Tap any pin for the full event page.</p>
        </div>

        <SingBoard initialFlyers={flyers} />
      </section>
    </main>
  );
}
