import { ScoutImportTool } from "@/components/scout/ScoutImportTool";

export const metadata = {
  title: "Scout Import | SingHUB",
  description: "Paste, preview, and format internal AI Scout karaoke lead imports.",
  robots: { index: false, follow: false },
};

export default function ScoutImportPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <section className="max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
          Internal Import
        </p>
        <h1 className="mt-3 text-4xl font-black text-white md:text-6xl">
          Scout Import
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Paste Stage One research output here to preview messy karaoke leads before
          replacing the internal Scout candidate TSV. This does not write to the repo,
          publish listings, or contact venues.
        </p>
        <p className="mt-4 text-base leading-7 text-slate-400">
          The goal is clean handoff: run Scout research outside the app, paste the
          candidate rows, inspect obvious formatting issues, then copy or download a
          canonical TSV for review in the AI Scout queue.
        </p>
      </section>

      <ScoutImportTool />
    </main>
  );
}
