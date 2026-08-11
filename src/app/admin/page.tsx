import Link from "next/link";

export const metadata = {
  title: "Admin Tools | SingHUB",
  description: "Internal SingHUB tools.",
  robots: {
    index: false,
    follow: false,
  },
};

const tools = [
  {
    href: "/admin/scout",
    eyebrow: "Discovery",
    title: "Scout Dashboard",
    description:
      "Review karaoke leads and turn messy discovery signals into verified venue and event data.",
  },
  {
    href: "/admin/venue-comparison",
    eyebrow: "Venue Partnerships",
    title: "Venue Sales Comparison",
    description:
      "Compare any venue's current free presence with a Founding Venue preview, including every enhanced-field opportunity.",
  },
];

export default function AdminHomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-white">
      <section className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
          SingHUB Internal
        </p>
        <h1 className="mt-3 text-4xl font-black md:text-6xl">Admin Tools</h1>
        <p className="mt-4 text-slate-300">
          Backstage tools for keeping the Venue Index accurate and building venue partnerships.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-cyan-300/[0.05]"
          >
            <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300">
              {tool.eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-black text-white group-hover:text-cyan-100">
              {tool.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {tool.description}
            </p>
            <p className="mt-5 text-sm font-black text-cyan-200">Open tool →</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
