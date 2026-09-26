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
    <main className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="mb-6 max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-fuchsia-300">Events. Openings. Things worth knowing.</p>
        <p className="mt-3 text-base leading-7 text-slate-300 md:text-lg">
          The SingBOARD for San Diego karaoke and the people behind it. Find events, community notices, and local venues or KJs looking for good people.
        </p>
      </div>
      <SingBoard initialFlyers={flyers} />
    </main>
  );
}
