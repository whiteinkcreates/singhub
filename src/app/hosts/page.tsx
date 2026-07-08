import { HostDirectoryCard } from "@/components/host/HostCard";
import { Button } from "@/components/ui/Button";
import { getActiveHosts } from "@/lib/hostData";

export const metadata = {
  title: "San Diego Karaoke Hosts | SingHUB",
  description: "Meet the KJs and karaoke hosts running rooms across San Diego.",
};

export default async function HostsPage() {
  const hosts = await getActiveHosts();

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
            SingHUB Hosts
          </p>
          <h1 className="mt-3 text-4xl font-black text-white md:text-6xl">
            San Diego karaoke KJs and hosts
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Browse active local hosts, their weekly rooms, neighborhoods, and karaoke-night style.
          </p>
        </div>
        <Button href="https://docs.google.com/forms/d/e/1FAIpQLSdC5G3JP5JSLrj5Za1S-ueRvSKVPr_l_OuBk0Ru6RZmXi5lOQ/viewform?usp=header" variant="secondary">
          Send Your KJ Info
        </Button>
      </section>

      {hosts.length > 0 ? (
        <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {hosts.map((host) => (
            <HostDirectoryCard key={host.slug} host={host} />
          ))}
        </section>
      ) : (
        <section className="mt-10 rounded-2xl border border-white/10 bg-slate-950/70 p-6 text-slate-200">
          <h2 className="text-2xl font-black text-white">Hosts are coming soon.</h2>
          <p className="mt-3 leading-7">
            Know who is hosting karaoke in San Diego? Send us the info and we will review it for SingHUB.
          </p>
        </section>
      )}
    </main>
  );
}
