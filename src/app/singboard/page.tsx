import type { Metadata } from "next";
import { SingBoard } from "@/components/singboard/SingBoard";
import { getActiveSingBoardFlyers } from "@/lib/singboard/repository";

export const metadata: Metadata = {
  title: "SingBoard | SingHUB",
  description: "See what is happening around San Diego karaoke and pin your own event flyer to the SingBoard.",
  alternates: { canonical: "/singboard" },
};

export const dynamic = "force-dynamic";

export default async function SingBoardPage() {
  const flyers = await getActiveSingBoardFlyers();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="mb-6 max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-fuchsia-300">Special events. Theme nights. One-offs.</p>
        <p className="mt-3 text-base leading-7 text-slate-300 md:text-lg">
          The bulletin board for karaoke events around San Diego. See what&apos;s coming up, tap a flyer for details, and go sing.
        </p>
      </div>
      <SingBoard initialFlyers={flyers} />
    </main>
  );
}
