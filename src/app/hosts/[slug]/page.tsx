import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { HostAvatar } from "@/components/host/HostAvatar";
import { ShareProfileButton } from "@/components/host/ShareProfileButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  HOST_WEEKDAYS,
  getActiveHosts,
  getHostBySlug,
  getTodayInLosAngeles,
} from "@/lib/hostData";
import type { HostGig, HostProfile, HostWeekday } from "@/types";

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdC5G3JP5JSLrj5Za1S-ueRvSKVPr_l_OuBk0Ru6RZmXi5lOQ/viewform?usp=header";

type HostProfilePageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

type NextGig = {
  day: HostWeekday;
  gig: HostGig;
  dayOffset: number;
};

type HostVenue = {
  key: string;
  venueName: string;
  venueId?: string;
  neighborhood?: string;
  appearances: Array<{ day: HostWeekday; time: string }>;
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

  const description =
    host.bio ||
    `See where ${host.publicDisplayName} is hosting karaoke this week in San Diego on SingHUB.`;

  return {
    title: `${host.publicDisplayName} Karaoke Schedule | SingHUB`,
    description,
    openGraph: {
      title: `${host.publicDisplayName} Karaoke Schedule | SingHUB`,
      description,
      images: [host.profileImageUrl || host.logoUrl || "/images/og/singhub-og.png"],
    },
  };
}

function getNextGig(host: HostProfile): NextGig | undefined {
  const today = getTodayInLosAngeles();
  const todayIndex = HOST_WEEKDAYS.indexOf(today);

  for (let dayOffset = 0; dayOffset < HOST_WEEKDAYS.length; dayOffset += 1) {
    const day = HOST_WEEKDAYS[(todayIndex + dayOffset) % HOST_WEEKDAYS.length];
    const gig = host.schedule[day]?.[0];

    if (gig) {
      return { day, gig, dayOffset };
    }
  }

  return undefined;
}

function getNextGigLabel(nextGig: NextGig) {
  if (nextGig.dayOffset === 0) return "Tonight";
  if (nextGig.dayOffset === 1) return "Tomorrow";
  return nextGig.day;
}

function getHostVenues(host: HostProfile): HostVenue[] {
  const venueMap = new Map<string, HostVenue>();

  HOST_WEEKDAYS.forEach((day) => {
    host.schedule[day].forEach((gig) => {
      if (!gig.venueName) return;

      const key = gig.venueId || gig.venueName.toLowerCase();
      const existing = venueMap.get(key);

      if (existing) {
        existing.appearances.push({ day, time: gig.time });
        if (!existing.neighborhood && gig.neighborhood) {
          existing.neighborhood = gig.neighborhood;
        }
        return;
      }

      venueMap.set(key, {
        key,
        venueName: gig.venueName,
        venueId: gig.venueId,
        neighborhood: gig.neighborhood,
        appearances: [{ day, time: gig.time }],
      });
    });
  });

  return Array.from(venueMap.values());
}

function SocialLink({
  href,
  children,
}: {
  href: string | undefined;
  children: string;
}) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm font-bold text-white transition hover:border-cyan-300/60 hover:bg-cyan-300/10 hover:text-cyan-100"
    >
      {children}
    </a>
  );
}

function VenueLink({
  venueId,
  children,
  className = "",
}: {
  venueId?: string;
  children: ReactNode;
  className?: string;
}) {
  if (!venueId) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Link href={`/venues/${venueId}`} className={className}>
      {children}
    </Link>
  );
}

export default async function HostProfilePage({ params }: HostProfilePageProps) {
  const { slug } = await params;
  const host = await getHostBySlug(slug);

  if (!host) notFound();

  const nextGig = getNextGig(host);
  const hostVenues = getHostVenues(host);
  const activeDays = HOST_WEEKDAYS.filter((day) => host.schedule[day].length > 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <section className="relative overflow-hidden rounded-[2rem] border border-fuchsia-300/30 bg-slate-950 p-5 shadow-2xl shadow-fuchsia-950/30 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(217,70,239,0.28),transparent_24rem),radial-gradient(circle_at_88%_18%,rgba(34,211,238,0.22),transparent_26rem)]" />

        <div className="relative">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <HostAvatar host={host} large />

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                    SingHUB KJ
                  </p>
                  {host.verificationStatus && (
                    <Badge variant="verified">{host.verificationStatus}</Badge>
                  )}
                </div>

                <h1 className="mt-2 text-4xl font-black leading-tight text-white md:text-6xl">
                  {host.publicDisplayName}
                </h1>

                <p className="mt-3 text-base font-semibold text-fuchsia-100 md:text-lg">
                  {host.primaryAreas.join(" / ") || "San Diego Karaoke"}
                </p>
              </div>
            </div>

            <ShareProfileButton hostName={host.publicDisplayName} />
          </div>

          {host.vibeTags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {host.vibeTags.slice(0, 6).map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </section>

      {nextGig && (
        <section className="relative mt-6 overflow-hidden rounded-3xl border border-cyan-300/30 bg-cyan-300/[0.06] p-5 md:p-7">
          <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-fuchsia-400/10 blur-3xl" />

          <div className="relative grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                Catch {host.publicDisplayName} next
              </p>
              <p className="mt-2 text-2xl font-black text-white md:text-3xl">
                {getNextGigLabel(nextGig)} at {nextGig.gig.venueName || "Venue TBA"}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-300 md:text-base">
                {[nextGig.gig.time, nextGig.gig.neighborhood].filter(Boolean).join(" / ") ||
                  "Details coming soon"}
              </p>
            </div>

            {nextGig.gig.venueId && (
              <Button href={`/venues/${nextGig.gig.venueId}`}>View Venue</Button>
            )}
          </div>
        </section>
      )}

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-slate-950/72 p-5 md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-200">
                  The regular rotation
                </p>
                <h2 className="mt-1 text-2xl font-black text-white md:text-3xl">
                  Where I host
                </h2>
              </div>
              {activeDays.length > 0 && (
                <p className="text-sm font-bold text-cyan-100">
                  {activeDays.length} weekly {activeDays.length === 1 ? "night" : "nights"}
                </p>
              )}
            </div>

            {hostVenues.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {hostVenues.map((venue) => (
                  <VenueLink
                    key={venue.key}
                    venueId={venue.venueId}
                    className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-cyan-300/50 hover:bg-cyan-300/[0.06]"
                  >
                    <p className="text-lg font-black text-white group-hover:text-cyan-100">
                      {venue.venueName}
                    </p>
                    {venue.neighborhood && (
                      <p className="mt-1 text-sm text-slate-400">{venue.neighborhood}</p>
                    )}
                    <div className="mt-4 space-y-1.5">
                      {venue.appearances.map((appearance) => (
                        <p
                          key={`${venue.key}-${appearance.day}-${appearance.time}`}
                          className="text-sm font-semibold text-slate-200"
                        >
                          <span className="text-fuchsia-200">{appearance.day}</span>
                          {appearance.time ? ` • ${appearance.time}` : ""}
                        </p>
                      ))}
                    </div>
                    {venue.venueId && (
                      <p className="mt-4 text-sm font-black text-cyan-200">
                        View karaoke venue →
                      </p>
                    )}
                  </VenueLink>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-slate-400">
                Regular hosting nights are being confirmed.
              </p>
            )}
          </section>

          {host.bio && (
            <section className="rounded-3xl border border-white/10 bg-slate-950/72 p-5 md:p-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-200">
                Meet the host
              </p>
              <h2 className="mt-1 text-2xl font-black text-white">
                About {host.publicDisplayName}
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-300">{host.bio}</p>
            </section>
          )}

          <section
            id="schedule"
            className="rounded-3xl border border-white/10 bg-slate-950/72 p-5 md:p-6"
          >
            <h2 className="text-2xl font-black text-white">Weekly karaoke schedule</h2>
            <p className="mt-2 text-sm text-slate-400">
              The recurring nights currently listed for this host on SingHUB.
            </p>

            <div className="mt-5 divide-y divide-white/10">
              {activeDays.length > 0 ? (
                activeDays.map((day) => (
                  <div key={day} className="grid gap-3 py-4 sm:grid-cols-[7rem_1fr]">
                    <h3 className="font-black text-cyan-100">{day}</h3>
                    <div className="space-y-2">
                      {host.schedule[day].map((gig) => (
                        <VenueLink
                          key={`${day}-${gig.raw}`}
                          venueId={gig.venueId}
                          className="block rounded-xl border border-white/10 bg-white/[0.035] p-3 transition hover:border-cyan-300/40"
                        >
                          <p className="font-black text-white">{gig.venueName || "Venue TBA"}</p>
                          <p className="mt-1 text-sm text-slate-300">
                            {[gig.time, gig.neighborhood].filter(Boolean).join(" / ") ||
                              "Time TBA"}
                          </p>
                        </VenueLink>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-4 text-sm text-slate-500">
                  No regular schedule has been confirmed yet.
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          {(host.instagramUrl || host.tiktokUrl || host.websiteUrl) && (
            <section className="rounded-3xl border border-white/10 bg-slate-950/72 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                Follow the KJ
              </p>
              <h2 className="mt-1 text-xl font-black text-white">Find me online</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <SocialLink href={host.instagramUrl}>Instagram</SocialLink>
                <SocialLink href={host.tiktokUrl}>TikTok</SocialLink>
                <SocialLink href={host.websiteUrl}>Website</SocialLink>
              </div>
            </section>
          )}

          {host.favoriteKaraokeSpots && (
            <section className="rounded-3xl border border-white/10 bg-slate-950/72 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-200">
                Off the clock
              </p>
              <h2 className="mt-1 text-xl font-black text-white">Favorite karaoke spots</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {host.favoriteKaraokeSpots}
              </p>
            </section>
          )}

          <section className="rounded-3xl border border-fuchsia-300/30 bg-fuchsia-300/10 p-5">
            <h2 className="text-xl font-black text-white">
              Are you {host.publicDisplayName}?
            </h2>
            <p className="mt-3 text-sm leading-6 text-fuchsia-50">
              Add a photo, update your bio, confirm your regular nights, or change your links.
            </p>
            <div className="mt-4">
              <Button href={FORM_URL} variant="secondary">
                Claim / Update This Profile
              </Button>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
