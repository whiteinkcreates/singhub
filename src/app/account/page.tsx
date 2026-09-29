import type { Metadata } from "next";
import { Suspense } from "react";
import { MySingHub } from "@/components/account/MySingHub";

export const metadata: Metadata = {
  title: "My SingHUB | Your Karaoke Story",
  description: "Keep your recent setlist, saved venues, performance stars, and My Jacket in one place.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <Suspense fallback={<main className="grid min-h-[70vh] place-items-center text-sm font-bold text-slate-300">Opening backstage…</main>}>
      <MySingHub />
    </Suspense>
  );
}
