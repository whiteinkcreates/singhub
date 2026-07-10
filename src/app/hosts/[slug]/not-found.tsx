import Link from "next/link";
import { Button } from "@/components/ui/Button";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdC5G3JP5JSLrj5Za1S-ueRvSKVPr_l_OuBk0Ru6RZmXi5lOQ/viewform?usp=header";

export default function HostNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-4 py-16">
      <section className="w-full rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 text-center shadow-2xl shadow-fuchsia-950/25 md:p-10">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
          Host not found
        </p>
        <h1 className="mt-4 text-4xl font-black text-white md:text-5xl">
          This KJ profile is not live yet.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-300">
          The profile may still be getting cleaned up, or the link may have changed. Browse active hosts or send us the correct info.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/hosts" variant="secondary">
            Browse Hosts
          </Button>
          <Button href={FORM_URL}>
            Claim / Update Your KJ Profile
          </Button>
        </div>
        <Link href="/" className="mt-6 inline-flex text-sm font-bold text-cyan-100 hover:text-fuchsia-100">
          Back to SingHUB
        </Link>
      </section>
    </main>
  );
}
