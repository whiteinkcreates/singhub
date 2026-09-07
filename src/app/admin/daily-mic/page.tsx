import Link from "next/link";
import { DailyMicGenerator } from "@/components/admin/DailyMicGenerator";
import { DailyMicTemplateUploader } from "@/components/admin/DailyMicTemplateUploader";
import { getPollForDate } from "@/lib/pollBank";

export const metadata = { title: "Daily Mic | SingHUB Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function DailyMicAdminPage() {
  const poll = getPollForDate();
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 text-white">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.24em] text-fuchsia-300">Social acquisition</p>
          <h1 className="mt-2 text-4xl font-black md:text-5xl">Daily Mic Generator</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Turn today&apos;s question into the approved category artwork, a stronger caption, and a direct path back to the vote.</p>
        </div>
        <Link href="/admin" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold">← Admin Tools</Link>
      </div>
      <div className="mt-7"><DailyMicGenerator poll={poll} /></div>
      <div className="mt-7"><DailyMicTemplateUploader /></div>
    </main>
  );
}
