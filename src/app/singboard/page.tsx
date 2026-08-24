import type { Metadata } from "next";
import { SingBoard } from "@/components/singboard/SingBoard";

export const metadata: Metadata = {
  title: "SingBoard | SingHUB",
  description: "See what is happening around San Diego karaoke and pin your own event flyer to the SingBoard.",
};

export default function SingBoardPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="mb-7 max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-300">San Diego karaoke community board</p>
        <h1 className="mt-2 text-4xl font-black text-white md:text-6xl">SingBoard</h1>
        <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
          Contests, themed nights, live events and one-offs from around the karaoke community. Grab a spot and pin your flyer like the real thing.
        </p>
      </div>
      <SingBoard />
    </main>
  );
}
