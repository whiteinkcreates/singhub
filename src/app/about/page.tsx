import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About SingHUB | Find Karaoke Near You",
  description:
    "Learn why SingHUB was built and how it helps singers find karaoke nights, places, hosts, and local communities.",
};

const audiences = [
  {
    eyebrow: "For singers",
    title: "Spend less time searching. Sing more.",
    body: "Find karaoke by night, place, neighborhood, or host, then choose the room that fits what you want tonight.",
  },
  {
    eyebrow: "For hosts",
    title: "Make your nights easier to find.",
    body: "Give regulars and new singers one reliable place to find your schedule, venues, and host profile.",
  },
  {
    eyebrow: "For venues",
    title: "Turn karaoke into a destination.",
    body: "Show people when karaoke happens, what your room offers, and why they should walk through your door.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 py-12 md:py-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-fuchsia-300/35 bg-slate-950/85 px-6 py-10 shadow-2xl shadow-fuchsia-950/25 md:px-10 md:py-16 lg:px-16">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-red-400" />
          <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-fuchsia-500/15 blur-3xl" />
          <div className="relative max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200">
              About SingHUB
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl">
              Karaoke should be easier to find.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
              SingHUB brings karaoke nights, places, neighborhoods, hosts, and
              local community into one place. We are starting in San Diego and
              building a better way to answer the question that starts every
              karaoke night: where are we singing?
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="/find-karaoke?day=tonight">
                Find Karaoke Tonight
              </Button>
              <Button href="/community/san-diego" variant="secondary">
                Enter the SD Community
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          {audiences.map((audience) => (
            <article
              key={audience.eyebrow}
              className="rounded-2xl border border-white/10 bg-slate-950/70 p-6"
            >
              <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-200">
                {audience.eyebrow}
              </p>
              <h2 className="mt-3 text-2xl font-black text-white">
                {audience.title}
              </h2>
              <p className="mt-3 leading-7 text-slate-300">{audience.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-20 lg:grid-cols-2">
        <article className="rounded-2xl border border-cyan-300/25 bg-cyan-300/5 p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
            Why it exists
          </p>
          <h2 className="mt-3 text-3xl font-black text-white">
            Built from the karaoke crowd, not above it.
          </h2>
          <p className="mt-4 leading-7 text-slate-300">
            SingHUB was founded by Corey White, a San Diego karaoke regular who
            got tired of chasing schedules across social posts, flyers, and
            outdated listings. The goal is practical: help more people find the
            right karaoke room and help the people creating those rooms get
            discovered.
          </p>
        </article>

        <article className="rounded-2xl border border-red-300/25 bg-red-300/5 p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-200">
            Help keep it accurate
          </p>
          <h2 className="mt-3 text-3xl font-black text-white">
            Karaoke schedules move.
          </h2>
          <p className="mt-4 leading-7 text-slate-300">
            Nights get added, hosts change, and events occasionally disappear.
            SingHUB verifies information as the index grows and welcomes updates
            from singers, hosts, and venues who know what is happening locally.
          </p>
          <Link
            href="/submit-listing"
            className="mt-5 inline-flex font-bold text-red-100 hover:text-white"
          >
            Submit or update karaoke information
          </Link>
        </article>
      </section>

      <section className="border-t border-white/10 bg-slate-950/55">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-200">
              Questions, ideas, corrections?
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              Talk to SingHUB.
            </h2>
            <a
              href="mailto:hello@singhub.app"
              className="mt-3 inline-block font-bold text-cyan-200 hover:text-white"
            >
              hello@singhub.app
            </a>
          </div>
          <Button href="mailto:hello@singhub.app" variant="secondary">
            Contact SingHUB
          </Button>
        </div>
      </section>
    </main>
  );
}
