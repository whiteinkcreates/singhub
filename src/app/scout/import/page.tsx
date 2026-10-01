import Link from "next/link";
import { ScoutImportTool } from "@/components/scout/ScoutImportTool";

export const metadata = {
  title: "SCOUT Import | SingHUB",
  description: "Validate and load source-backed karaoke candidates into the internal SCOUT queue.",
  robots: { index: false, follow: false },
};

export default function ScoutImportPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <section className="max-w-4xl">
        <Link href="/admin/scout" className="text-sm font-bold text-cyan-200 hover:text-white">
          ← SCOUT Command Center
        </Link>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
          Internal Import
        </p>
        <h1 className="mt-3 text-4xl font-black text-white md:text-6xl">
          SCOUT Candidate Import
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Load source-backed research into the internal SCOUT database without publishing anything
          to the public Venue Index. Stable candidate IDs make repeated research runs update the
          same venue lead instead of creating duplicates.
        </p>
        <p className="mt-4 text-base leading-7 text-slate-400">
          Every candidate belongs to a registered market such as <code className="text-cyan-200">san-diego</code>
          {" "}or <code className="text-cyan-200">phoenix</code>. Discovery remains separate from
          verification, and importing a candidate does not contact a venue or make its data public.
        </p>
      </section>

      <ScoutImportTool />
    </main>
  );
}
