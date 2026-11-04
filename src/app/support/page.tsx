import Link from "next/link";
import { SupportReportForm } from "@/components/support/SupportReportForm";

export const metadata = {
  title: "Help & Report a Problem | SingHUB",
  description: "Get help with SingHUB sign-in, venue listings, check-ins, offers, or site issues.",
  alternates: {canonical: "/support"},
};

export default function SupportPage() {
  return <main className="mx-auto max-w-4xl px-4 py-12 md:py-20">
    <div className="max-w-3xl">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">SINGHUB SUPPORT</p>
      <h1 className="mt-3 text-4xl font-black text-white md:text-6xl">Something not working? <span className="text-fuchsia-300">Tell us.</span></h1>
      <p className="mt-5 text-base leading-7 text-slate-300">
        Sign-in link expired? Check-in behaving strangely? Wrong karaoke information? We want to know when it happens, not weeks later. No account is needed to report a problem.
      </p>
      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <Link href="/account?signin=1" className="rounded-full border border-cyan-300/40 px-4 py-2 font-bold text-cyan-200 hover:bg-cyan-300/10">Try signing in again</Link>
        <Link href="/claim-listing" className="rounded-full border border-white/20 px-4 py-2 font-bold text-slate-200 hover:bg-white/10">Claim or correct a listing</Link>
        <a href="mailto:hello@singhub.app?subject=SingHUB%20support" className="rounded-full border border-white/20 px-4 py-2 font-bold text-slate-200 hover:bg-white/10">Email hello@singhub.app</a>
      </div>
    </div>
    <SupportReportForm />
    <section className="mt-8 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-5 text-sm leading-6 text-slate-300">
      <h2 className="font-bold text-white">Sign-in tip</h2>
      <p className="mt-2">If a magic link opens in a different browser or an email app preview, the session may not finish. Return to the browser where you requested the email and enter the six-digit code from that same email. If it has expired, request a fresh one.</p>
      <p className="mt-2">Do not send passwords, sign-in codes, private QR codes, payment details, or screenshots containing them.</p>
    </section>
  </main>;
}
