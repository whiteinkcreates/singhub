import { SanDiegoRoom } from "@/components/community/SanDiegoRoom";

export const metadata = {
  title: "San Diego Karaoke Room | SingHUB",
  description:
    "The SingHUB San Diego community room for tonight plans, new karaoke finds, and schedule checks.",
};

export default function SanDiegoCommunityPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <section className="mb-8 rounded-[2rem] border border-fuchsia-300/30 bg-slate-950 p-6 shadow-2xl shadow-fuchsia-950/30 md:p-10">
        <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-300">
          San Diego Karaoke Community
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black text-white md:text-6xl">
          The room where the local scene keeps SingHUB accurate.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
          Coordinate tonight, surface new spots, report schedule changes, and help keep San Diego karaoke information current.
        </p>
      </section>

      <SanDiegoRoom />
    </main>
  );
}
