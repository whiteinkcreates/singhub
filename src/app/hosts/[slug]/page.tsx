import { notFound } from "next/navigation";
import { HostAvatar } from "@/components/host/HostAvatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { HOST_WEEKDAYS, getActiveHosts, getHostBySlug } from "@/lib/hostData";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdC5G3JP5JSLrj5Za1S-ueRvSKVPr_l_OuBk0Ru6RZmXi5lOQ/viewform?usp=header";

type HostProfilePageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function generateStaticParams() {
  const hosts = await getActiveHosts();
  return hosts.map((host) => ({ slug: host.slug }));
}

export async function generateMetadata({ params }: HostProfilePageProps) {
  const { slug } = await params;
  const host = await getHostBySlug(slug);

  if (!host) {
    return {
      title: "Karaoke Host | SingHUB",
    };
  }

  return {
    title: `${host.publicDisplayName} | San Diego Karaoke Host | SingHUB`,
    description: host.bio || `See ${host.publicDisplayName}'s weekly karaoke schedule on SingHUB.`,
  };
}

function ExternalLink({ href, children }: { href: string | undefined; children: string }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
    >
      {children}
    </a>
  );
}

export default async function HostProfilePage({ params }: HostProfilePageProps) {
  const { slug } = await params;
  const host = await getHostBySlug(slug);

  if (!host) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:py-18">
      <section className="relative overflow-hidden rounded-[2rem] border border-fuchsia-300/35 bg-slate-950 p-5 shadow-2xl shadow-fuchsia-950/30 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(217,70,239,0.25),transparent_24rem),radial-gradient(circle_at_82%_15%,rgba(34,211,238,0.2),transparent_26rem)]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <HostAvatar host={host} large />
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
                Karaoke Host
              </p>
              <h1 className="mt-2 text-4xl font-black leading-tight text-white md:text-6xl">
                {host.publicDisplayName}
              </h1>
              <p className="mt-3 text-base font-semibold text-fuchsia-100 md:text-lg">
                {host.primaryAreas.join(" • ") || "San Diego"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {host.verificationStatus && <Badge variant="verified">{host.verificationStatus}</Badge>}
            {host.featured && <Badge variant="premium">Featured</Badge>}
            {host.privateEvents && <Badge>Private events</Badge>}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-slate-950/72 p-5 md:p-6">
            <h2 className="text-2xl font-black text-white">Weekly schedule</h2>
            <div className="mt-5 divide-y divide-white/10">
              {HOST_WEEKDAYS.map((day) => {
                const gigs = host.schedule[day];

                return (
                  <div key={day} className="grid gap-3 py-4 md:grid-cols-[8rem_1fr]">
                    <h3 className="font-black text-cyan-100">{day}</h3>
                    {gigs.length > 0 ? (
                      <div className="space-y-3">
                        {gigs.map((gig) => (
                          <div key={`${day}-${gig.raw}`} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                            <p className="font-black text-white">{gig.venueName || "Venue TBA"}</p>
                            <p className="mt-1 text-sm text-slate-300">
                              {[gig.time, gig.neighborhood].filter(Boolean).join(" • ") || "Time TBA"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No regular listing yet</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {host.bio && (
            <section className="rounded-2xl border border-white/10 bg-slate-950/72 p-5 md:p-6">
              <h2 className="text-2xl font-black text-white">About</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">{host.bio}</p>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          {host.vibeTags.length > 0 && (
            <section className="rounded-2xl border border-white/10 bg-slate-950/72 p-5">
              <h2 className="text-xl font-black text-white">Room vibe</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {host.vibeTags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-white/10 bg-slate-950/72 p-5">
            <h2 className="text-xl font-black text-white">Links</h2>
            <div className="mt-4 grid gap-3">
              <ExternalLink href={host.instagramUrl}>Instagram</ExternalLink>
              <ExternalLink href={host.tiktokUrl}>TikTok</ExternalLink>
              <ExternalLink href={host.websiteUrl}>Website</ExternalLink>
              <ExternalLink href={host.tipLink}>Tip jar</ExternalLink>
              <ExternalLink href={host.bookingLink}>Booking</ExternalLink>
            </div>
          </section>

          {host.favoriteKaraokeSpots && (
            <section className="rounded-2xl border border-white/10 bg-slate-950/72 p-5">
              <h2 className="text-xl font-black text-white">Favorite spots</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{host.favoriteKaraokeSpots}</p>
            </section>
          )}

          <section className="rounded-2xl border border-fuchsia-300/30 bg-fuchsia-300/10 p-5">
            <h2 className="text-xl font-black text-white">Host karaoke in San Diego?</h2>
            <p className="mt-3 text-sm leading-6 text-fuchsia-50">
              Send your KJ info to SingHUB for review and cleanup.
            </p>
            <div className="mt-4">
              <Button href={FORM_URL}>Send Your KJ Info</Button>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
