import type { Metadata } from "next";
import { SingBoard } from "@/components/singboard/SingBoard";
import { getActiveSingBoardFlyers } from "@/lib/singboard/repository";

export const metadata: Metadata = {
  title: "SingBoard | SingHUB",
  description: "See what is happening around San Diego karaoke and pin your own event flyer to the SingBoard.",
};

export const dynamic = "force-dynamic";

export default async function SingBoardPage() {
  const flyers = await getActiveSingBoardFlyers();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="mb-6 max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-300">What&apos;s happening around San Diego karaoke</p>
        <p className="mt-3 text-base leading-7 text-slate-300 md:text-lg">
          Contests, themed nights, live events and one-offs pinned by verified venues and KJs.
        </p>
      </div>
      <SingBoard initialFlyers={flyers} />
    </main>
  );
}
