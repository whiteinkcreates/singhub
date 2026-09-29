"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type Performance = {
  id: string;
  song_title: string;
  artist: string | null;
  venue_slug: string | null;
  venue_name: string | null;
  performed_on: string;
};

type SavedVenue = {
  venue_slug: string;
  venue_name: string;
  neighborhood: string | null;
};

type Achievement = {
  id: string;
  badge_key: string;
  badge_name: string;
  awarded_at: string;
  award_note: string | null;
};

type ExportFormat = "square" | "portrait" | "story";

const PATCH_POSITIONS = [
  [35, 29], [50, 27], [65, 29], [31, 38], [43, 38], [57, 38], [69, 38], [34, 47],
  [50, 47], [66, 47], [31, 56], [43, 56], [57, 56], [69, 56], [35, 65], [50, 65],
  [65, 65], [39, 74], [52, 74], [63, 74], [39, 82], [50, 82], [61, 82], [50, 89],
] as const;

const STAR_POSITIONS = Array.from({ length: 20 }, (_, index) => {
  const leftSide = index % 2 === 0;
  const row = Math.floor(index / 2);
  return {
    left: leftSide ? 16 + (row % 2) * 3 : 81 - (row % 2) * 3,
    top: 34 + row * 4.7,
    rotate: leftSide ? -12 + row * 3 : 12 - row * 3,
  };
});

const FORMAT_RATIOS: Record<ExportFormat, string> = {
  square: "1 / 1",
  portrait: "4 / 5",
  story: "9 / 16",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(`${value}T12:00:00`),
  );
}

function Jacket({
  neon,
  performances,
  achievements,
  onSelectPatch,
}: {
  neon: boolean;
  performances: number;
  achievements: Achievement[];
  onSelectPatch?: (achievement: Achievement) => void;
}) {
  return (
    <div className="relative mx-auto aspect-[1199/1312] w-full max-w-[34rem] drop-shadow-[0_28px_40px_rgba(0,0,0,.78)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={neon ? "/images/account/jacket-neon.webp" : "/images/account/jacket-denim.webp"}
        alt={neon ? "Black neon SingHUB jacket preview" : "Denim My Jacket"}
        className="absolute inset-0 h-full w-full object-contain"
      />
      {PATCH_POSITIONS.map(([left, top], index) => {
        const achievement = achievements[index];
        return achievement ? (
          <button
            key={achievement.id}
            type="button"
            onClick={() => onSelectPatch?.(achievement)}
            aria-label={`Open ${achievement.badge_name} badge`}
            className="absolute grid aspect-square w-[9%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-fuchsia-100 bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-[clamp(.42rem,1.5vw,.72rem)] font-black text-white shadow-[0_0_14px_rgba(236,72,153,.7)] transition hover:scale-110"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            {achievement.badge_name.slice(0, 1)}
          </button>
        ) : (
          <span
            key={index}
            aria-hidden="true"
            className="absolute aspect-square w-[7.2%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/25 bg-black/15"
            style={{ left: `${left}%`, top: `${top}%` }}
          />
        );
      })}
      {STAR_POSITIONS.slice(0, Math.min(performances, STAR_POSITIONS.length)).map((star, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="absolute -translate-x-1/2 -translate-y-1/2 text-[clamp(.7rem,2.4vw,1.3rem)] text-amber-300 drop-shadow-[0_0_7px_rgba(253,224,71,.75)]"
          style={{ left: `${star.left}%`, top: `${star.top}%`, rotate: `${star.rotate}deg` }}
        >
          ★
        </span>
      ))}
      {performances > STAR_POSITIONS.length ? (
        <span className="absolute bottom-[24%] right-[10%] rounded-full border border-amber-200/60 bg-black/80 px-2 py-1 text-xs font-black text-amber-200">
          +{performances - STAR_POSITIONS.length}
        </span>
      ) : null}
    </div>
  );
}

export function MySingHub() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [alias, setAlias] = useState("");
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [performanceCount, setPerformanceCount] = useState(0);
  const [venues, setVenues] = useState<SavedVenue[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [neon, setNeon] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [format, setFormat] = useState<ExportFormat>("square");
  const [selectedPatch, setSelectedPatch] = useState<Achievement | null>(null);
  const [addingSong, setAddingSong] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const loadAccount = useCallback(async (currentUser: User) => {
    const supabase = createClient();
    const [profileResult, performanceResult, countResult, venuesResult, achievementsResult] = await Promise.all([
      supabase.from("singer_profiles").select("karaoke_alias").eq("user_id", currentUser.id).maybeSingle(),
      supabase
        .from("singer_performances")
        .select("id,song_title,artist,venue_slug,venue_name,performed_on")
        .eq("user_id", currentUser.id)
        .order("performed_on", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10),
      supabase.from("singer_performances").select("id", { count: "exact", head: true }).eq("user_id", currentUser.id),
      supabase
        .from("singer_saved_venues")
        .select("venue_slug,venue_name,neighborhood")
        .eq("user_id", currentUser.id)
        .order("saved_at", { ascending: false }),
      supabase
        .from("singer_achievements")
        .select("id,badge_key,badge_name,awarded_at,award_note")
        .eq("user_id", currentUser.id)
        .order("awarded_at", { ascending: true }),
    ]);

    setAlias(profileResult.data?.karaoke_alias ?? "");
    setPerformances((performanceResult.data ?? []) as Performance[]);
    setPerformanceCount(countResult.count ?? 0);
    setVenues((venuesResult.data ?? []) as SavedVenue[]);
    setAchievements((achievementsResult.data ?? []) as Achievement[]);

    const pendingSlug = searchParams.get("save");
    const pendingName = searchParams.get("name");
    if (pendingSlug && pendingName) {
      await supabase.from("singer_saved_venues").upsert({
        user_id: currentUser.id,
        venue_slug: pendingSlug,
        venue_name: pendingName,
        neighborhood: searchParams.get("neighborhood") || null,
      });
      const { data } = await supabase
        .from("singer_saved_venues")
        .select("venue_slug,venue_name,neighborhood")
        .eq("user_id", currentUser.id)
        .order("saved_at", { ascending: false });
      setVenues((data ?? []) as SavedVenue[]);
      window.history.replaceState({}, "", "/account");
      setMessage(`${pendingName} is saved.`);
    }
  }, [searchParams]);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) void loadAccount(data.user);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) void loadAccount(session.user);
    });
    return () => data.subscription.unsubscribe();
  }, [loadAccount]);

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setMessage("Sending your private sign-in link…");
    const saveQuery = searchParams.toString();
    const next = `/account${saveQuery ? `?${saveQuery}` : ""}`;
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectUrl, shouldCreateUser: true },
    });
    setMessage(error ? error.message : "Check your email. Your SingHUB link is on the way.");
  }

  async function saveAlias() {
    if (!user) return;
    const { error } = await createClient().from("singer_profiles").upsert({
      user_id: user.id,
      karaoke_alias: alias.trim() || null,
      updated_at: new Date().toISOString(),
    });
    setMessage(error ? error.message : "Karaoke alias saved.");
  }

  async function addPerformance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const form = new FormData(event.currentTarget);
    const songTitle = String(form.get("song") || "").trim();
    if (!songTitle) return;
    const { error } = await createClient().from("singer_performances").insert({
      user_id: user.id,
      song_title: songTitle,
      artist: String(form.get("artist") || "").trim() || null,
      venue_name: String(form.get("venue") || "").trim() || null,
      performed_on: String(form.get("date") || new Date().toISOString().slice(0, 10)),
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    event.currentTarget.reset();
    setAddingSong(false);
    await loadAccount(user);
    setMessage("Performance added. You earned another sleeve star.");
  }

  async function removeVenue(slug: string) {
    if (!user) return;
    await createClient().from("singer_saved_venues").delete().eq("user_id", user.id).eq("venue_slug", slug);
    setVenues((current) => current.filter((venue) => venue.venue_slug !== slug));
  }

  async function sharePerformance() {
    const latest = performances[0];
    const venue = latest?.venue_name ? ` at ${latest.venue_name}` : "";
    const song = latest?.song_title ? ` Singing “${latest.song_title}”` : "";
    const text = `I just rocked the mic${venue}.${song} 🎤 Find your karaoke night on SingHUB.`;
    if (navigator.share) {
      await navigator.share({ title: "My SingHUB performance", text, url: "https://singhub.app" });
    } else {
      await navigator.clipboard.writeText(text);
      setMessage("Performance caption copied.");
    }
  }

  async function exportJacket() {
    if (!exportRef.current) return;
    setMessage("Preparing your jacket…");
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(exportRef.current, { pixelRatio: 2, cacheBust: true });
    const link = document.createElement("a");
    link.download = `my-singhub-jacket-${format}.png`;
    link.href = dataUrl;
    link.click();
    setMessage(`${format[0].toUpperCase()}${format.slice(1)} jacket downloaded.`);
  }

  if (loading) {
    return <main className="grid min-h-[70vh] place-items-center text-sm font-bold text-slate-300">Opening backstage…</main>;
  }

  return (
    <main className="overflow-hidden bg-[#030407]">
      <section className="relative flex min-h-[78svh] items-end overflow-hidden px-4 pb-28 pt-24">
        <div className="absolute inset-0 bg-[url('/images/account/backstage-crowd.webp')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030407] via-black/48 to-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,.2),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(34,211,238,.14),transparent_28%)]" />
        <div className="relative mx-auto w-full max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-fuchsia-300">My SingHUB</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black uppercase leading-[.88] text-white sm:text-7xl lg:text-8xl">
            Your nights.<br />Your story.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
            Your karaoke history lives backstage. Build your jacket, collect performance stars, and keep the songs and rooms worth coming back to.
          </p>
        </div>
      </section>

      <div className="relative z-10 -mt-20 rounded-t-[2.5rem] border-t border-white/15 bg-[#080a0f]/95 px-4 pb-24 pt-8 shadow-[0_-30px_70px_rgba(0,0,0,.6)] backdrop-blur md:rounded-t-[4rem] md:pt-12">
        <div className="mx-auto max-w-7xl">
          {message ? (
            <div role="status" className="mb-6 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-100">
              {message}
            </div>
          ) : null}

          {!user ? (
            <section className="mx-auto max-w-xl rounded-[2rem] border border-white/15 bg-black/65 p-6 shadow-2xl md:p-9">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Your private backstage pass</p>
              <h2 className="mt-3 text-3xl font-black text-white">Sign in with your email.</h2>
              <p className="mt-3 leading-7 text-slate-300">No password to remember. We will send a secure link that opens your My SingHUB account.</p>
              <form onSubmit={sendMagicLink} className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                <label className="sr-only" htmlFor="member-email">Email address</label>
                <input id="member-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-h-12 rounded-full border border-white/15 bg-white/[0.06] px-5 text-white outline-none placeholder:text-slate-500 focus:border-fuchsia-300" />
                <button className="min-h-12 rounded-full bg-fuchsia-500 px-6 text-sm font-black text-white shadow-lg shadow-fuchsia-500/20 transition hover:bg-fuchsia-400">Email my link</button>
              </form>
              <p className="mt-5 text-xs leading-5 text-slate-500">Your setlist, saved rooms, and jacket are private unless you choose to share an export.</p>
            </section>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Signed in as</p>
                  <p className="mt-1 font-bold text-slate-200">{user.email}</p>
                </div>
                <button type="button" onClick={() => void createClient().auth.signOut()} className="text-sm font-bold text-slate-400 hover:text-white">Sign out</button>
              </div>

              <section className="overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br from-white/[0.07] to-transparent shadow-2xl">
                <div className="grid lg:grid-cols-[.8fr_1.2fr]">
                  <div className="flex flex-col justify-center p-6 md:p-10">
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-fuchsia-300">The free base jacket</p>
                    <h2 className="mt-3 text-5xl font-black uppercase leading-none text-white">My Jacket</h2>
                    <p className="mt-5 leading-7 text-slate-300">Twenty-four fixed patch spaces live across the back. Your {performanceCount} performance {performanceCount === 1 ? "star lives" : "stars live"} on the sleeves.</p>
                    <div className="mt-6">
                      <label htmlFor="karaoke-alias" className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Karaoke alias</label>
                      <div className="mt-2 flex gap-2">
                        <input id="karaoke-alias" value={alias} onChange={(event) => setAlias(event.target.value)} placeholder="Add yours" maxLength={50} className="min-w-0 flex-1 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-white outline-none focus:border-cyan-300" />
                        <button type="button" onClick={saveAlias} className="rounded-full border border-cyan-300/40 px-4 text-sm font-black text-cyan-100">Save</button>
                      </div>
                    </div>
                    <div className="mt-7 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setNeon(false)} className={`rounded-full px-4 py-2 text-sm font-black ${!neon ? "bg-white text-black" : "border border-white/15 text-slate-300"}`}>Denim · Free</button>
                      <button type="button" onClick={() => setNeon(true)} className={`rounded-full px-4 py-2 text-sm font-black ${neon ? "bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white" : "border border-white/15 text-slate-300"}`}>Black Neon · Premium preview</button>
                    </div>
                  </div>
                  <div className="relative overflow-auto bg-[radial-gradient(circle_at_50%_45%,rgba(236,72,153,.16),transparent_35%),linear-gradient(135deg,#08090d,#111827)] p-5 md:p-8">
                    <div style={{ transform: `scale(${zoom})`, transformOrigin: "center", transition: "transform .18s ease" }}>
                      <Jacket neon={neon} performances={performanceCount} achievements={achievements} onSelectPatch={setSelectedPatch} />
                    </div>
                    <label className="mx-auto mt-4 flex max-w-xs items-center gap-3 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Zoom
                      <input type="range" min="1" max="1.65" value={zoom} step="0.05" onChange={(event) => setZoom(Number(event.target.value))} className="w-full accent-fuchsia-400" />
                    </label>
                  </div>
                </div>
                <div className="border-t border-white/10 p-5 md:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-black text-white">Patch case</h3>
                      <p className="mt-1 text-sm text-slate-400">{achievements.length} earned · {24 - Math.min(achievements.length, 24)} spaces open. Tap an earned patch to read it.</p>
                    </div>
                    <p className="max-w-lg text-sm leading-6 text-slate-500">Badge definitions are in design. Awards will only appear after the achievement rules and verification process are locked.</p>
                  </div>
                </div>
              </section>

              <div className="grid gap-8 lg:grid-cols-[1.12fr_.88fr]">
                <section className="rounded-[2rem] border border-white/12 bg-white/[0.04] p-5 md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div><h2 className="text-2xl font-black text-white">Recent Setlist</h2><p className="mt-1 text-sm text-slate-400">Your latest 10 performances stay visible here for free.</p></div>
                    <button type="button" onClick={() => setAddingSong((value) => !value)} className="shrink-0 rounded-full bg-fuchsia-500 px-4 py-2 text-sm font-black text-white">Add song</button>
                  </div>
                  {addingSong ? (
                    <form onSubmit={addPerformance} className="mt-5 grid gap-3 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/[0.06] p-4 sm:grid-cols-2">
                      <input name="song" required placeholder="Song title" className="rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-fuchsia-300" />
                      <input name="artist" placeholder="Artist" className="rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-fuchsia-300" />
                      <input name="venue" placeholder="Venue" className="rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-fuchsia-300" />
                      <input name="date" type="date" max={new Date().toISOString().slice(0, 10)} defaultValue={new Date().toISOString().slice(0, 10)} className="rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-fuchsia-300" />
                      <button className="rounded-full bg-white px-5 py-3 text-sm font-black text-black sm:col-span-2">Add performance</button>
                    </form>
                  ) : null}
                  <div className="mt-5 divide-y divide-white/10">
                    {performances.length ? performances.map((performance) => (
                      <article key={performance.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-4">
                        <span className="text-lg text-amber-300">★</span>
                        <div className="min-w-0"><strong className="block truncate text-white">{performance.song_title}</strong><p className="truncate text-sm text-slate-400">{[performance.artist, performance.venue_name].filter(Boolean).join(" · ") || "Performance"}</p></div>
                        <time className="text-xs font-bold text-slate-500">{formatDate(performance.performed_on)}</time>
                      </article>
                    )) : <p className="py-8 text-center text-sm leading-6 text-slate-500">Add your first performance and the first star will land on your sleeve.</p>}
                  </div>
                  <p className="mt-5 border-t border-white/10 pt-4 text-sm leading-6 text-slate-500">Singer Tools will turn your history into a permanent, searchable KaraokeList songbook. The connection is not live yet.</p>
                </section>

                <div className="space-y-8">
                  <section className="rounded-[2rem] border border-white/12 bg-white/[0.04] p-5 md:p-7">
                    <h2 className="text-2xl font-black text-white">Saved Venues</h2>
                    <p className="mt-1 text-sm text-slate-400">Rooms you want one tap away.</p>
                    <div className="mt-5 space-y-3">
                      {venues.length ? venues.map((venue) => (
                        <div key={venue.venue_slug} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
                          <Link href={`/venues/${venue.venue_slug}`} className="min-w-0"><strong className="block truncate text-white">{venue.venue_name}</strong><span className="text-sm text-slate-500">{venue.neighborhood || "Open venue"}</span></Link>
                          <button type="button" onClick={() => removeVenue(venue.venue_slug)} className="text-xs font-black text-slate-500 hover:text-white">Remove</button>
                        </div>
                      )) : <p className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-slate-500">Use “Save venue” on any SingHUB venue page.</p>}
                    </div>
                  </section>

                  <section className="rounded-[2rem] border border-fuchsia-300/20 bg-gradient-to-br from-fuchsia-500/12 to-cyan-400/5 p-5 md:p-7">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300">Performance share</p>
                    <h2 className="mt-2 text-2xl font-black text-white">Share your performance.</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">SingHUB prepares the caption. You choose the app and confirm the post.</p>
                    <button type="button" onClick={sharePerformance} className="mt-5 rounded-full bg-fuchsia-500 px-5 py-3 text-sm font-black text-white">Share performance</button>
                  </section>
                </div>
              </div>

              <section className="grid overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-[#0d1422] to-[#07080c] lg:grid-cols-[.72fr_1.28fr]">
                <div className="p-6 md:p-9">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">Singer Tools</p>
                  <h2 className="mt-3 text-4xl font-black uppercase leading-none text-white">For deeper song prep.</h2>
                  <p className="mt-5 leading-7 text-slate-300">Save a permanent repertoire, remember your keys, and find connected rooms that have your song.</p>
                  <span className="mt-6 inline-flex rounded-full border border-white/15 bg-black/35 px-4 py-2 text-sm font-black text-white">KaraokeList integration planned</span>
                </div>
                <div className="grid gap-px bg-white/10 sm:grid-cols-2">
                  {[
                    ["∞", "Permanent Songbook", "Unlimited songs, keys, notes, and personal tags beyond your recent 10."],
                    ["✓", "Who Has My Song?", "Match saved songs against connected venue catalogs before you go."],
                    ["♬", "Song Picker", "Get help choosing from your own repertoire when decision paralysis hits."],
                    ["✦", "Magic Mic", "Surface a song that fits the moment when you want the app to choose."],
                  ].map(([icon, title, copy]) => (
                    <article key={title} className="bg-[#090c12] p-6"><span className="text-2xl font-black text-fuchsia-300">{icon}</span><h3 className="mt-3 font-black text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p></article>
                  ))}
                </div>
              </section>

              <section className="rounded-[2rem] border border-white/12 bg-white/[0.04] p-5 md:p-8">
                <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-fuchsia-300">Downloadable · Social-ready</p>
                    <h2 className="mt-3 text-3xl font-black text-white">Export My Jacket</h2>
                    <p className="mt-3 leading-7 text-slate-400">Choose the shape for a feed post, portrait post, or story. Your jacket and real totals come with you.</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {(["square", "portrait", "story"] as ExportFormat[]).map((item) => <button key={item} type="button" onClick={() => setFormat(item)} className={`rounded-full px-4 py-2 text-sm font-black capitalize ${format === item ? "bg-white text-black" : "border border-white/15 text-slate-300"}`}>{item}</button>)}
                    </div>
                    <button type="button" onClick={exportJacket} className="mt-5 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-5 py-3 text-sm font-black text-white">Download {format}</button>
                  </div>
                  <div ref={exportRef} className="relative mx-auto flex w-full max-w-lg flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_50%_35%,rgba(236,72,153,.25),transparent_35%),linear-gradient(145deg,#111827,#020307)] p-[6%]" style={{ aspectRatio: FORMAT_RATIOS[format] }}>
                    <div><p className="text-[clamp(.55rem,1.5vw,.8rem)] font-black uppercase tracking-[.28em] text-fuchsia-300">My SingHUB</p><h3 className="mt-1 text-[clamp(1rem,3vw,2rem)] font-black uppercase text-white">{alias || "My Jacket"}</h3></div>
                    <div className="min-h-0 flex-1"><Jacket neon={neon} performances={performanceCount} achievements={achievements} /></div>
                    <div className="flex justify-between text-[clamp(.55rem,1.5vw,.78rem)] font-black uppercase tracking-[.12em] text-slate-300"><span>{achievements.length} patches</span><span>{performanceCount} performance stars</span></div>
                  </div>
                </div>
              </section>

              <section className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-black/40 p-6">
                <div><p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Merch table</p><h2 className="mt-1 text-xl font-black text-white">SingHUB gear is coming.</h2></div>
                <button type="button" disabled className="rounded-full border border-white/15 px-5 py-3 text-sm font-black text-slate-500">Visit Merch Table · Coming soon</button>
              </section>
            </div>
          )}
        </div>
      </div>

      {selectedPatch ? (
        <div role="dialog" aria-modal="true" aria-labelledby="patch-title" className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-4 backdrop-blur" onClick={() => setSelectedPatch(null)}>
          <div className="w-full max-w-md rounded-[2rem] border border-fuchsia-300/30 bg-[#0b0d13] p-7 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-4 border-fuchsia-100 bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-4xl font-black text-white shadow-[0_0_28px_rgba(236,72,153,.6)]">{selectedPatch.badge_name.slice(0, 1)}</div>
            <p className="mt-6 text-center text-xs font-black uppercase tracking-[0.25em] text-fuchsia-300">Achievement patch</p>
            <h2 id="patch-title" className="mt-2 text-center text-2xl font-black text-white">{selectedPatch.badge_name}</h2>
            <p className="mt-3 text-center leading-7 text-slate-400">{selectedPatch.award_note || `Awarded ${new Date(selectedPatch.awarded_at).toLocaleDateString()}.`}</p>
            <button type="button" onClick={() => setSelectedPatch(null)} className="mt-6 w-full rounded-full bg-white px-5 py-3 text-sm font-black text-black">Close</button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
