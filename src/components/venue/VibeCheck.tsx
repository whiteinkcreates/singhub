"use client";

import type { Session } from "@supabase/supabase-js";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  MAX_VIBE_SELECTIONS,
  VIBE_CHECK_LOOKBACK_DAYS,
  VIBE_CHECK_TAGS,
  type VibeCheckApiResponse,
  type VibeTagSlug,
} from "@/lib/vibeChecks";

type VibeCheckEvent = {
  eventId: string;
  karaokeDay: string;
  startTime: string;
  hostName?: string;
};

type VibeCheckProps = {
  venue: {
    id: string;
    slug: string;
    name: string;
  };
  events: VibeCheckEvent[];
};

type ContributionPayload = {
  venueId: string;
  venueSlug: string;
  eventId: string;
  visitedOn: string;
  tagSlugs: VibeTagSlug[];
  productUpdatesOptIn: boolean;
};

type PendingContribution = ContributionPayload & {
  version: 1;
  createdAt: number;
};

const PENDING_KEY = "singhub-vibe-check-pending-v1";
const AUTH_IS_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

function sanDiegoDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function earliestVisitDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - VIBE_CHECK_LOOKBACK_DAYS);
  return sanDiegoDate(date);
}

function emptyResults(): VibeCheckApiResponse["results"] {
  return {
    totalResponses: 0,
    lookbackDays: VIBE_CHECK_LOOKBACK_DAYS,
    lastUpdatedAt: null,
    tags: VIBE_CHECK_TAGS.map((tag) => ({
      slug: tag.slug,
      label: tag.label,
      count: 0,
      percentage: 0,
    })),
  };
}

function eventLabel(event: VibeCheckEvent) {
  const host = event.hostName ? ` with ${event.hostName}` : "";
  return `${event.karaokeDay} · ${event.startTime}${host}`;
}

function readPendingContribution(): PendingContribution | null {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const pending = JSON.parse(raw) as PendingContribution;
    const isFresh = Date.now() - pending.createdAt < 2 * 60 * 60 * 1000;
    if (pending.version !== 1 || !isFresh) {
      window.localStorage.removeItem(PENDING_KEY);
      return null;
    }
    return pending;
  } catch {
    window.localStorage.removeItem(PENDING_KEY);
    return null;
  }
}

export function VibeCheck({ venue, events }: VibeCheckProps) {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.eventId || "");
  const [visitedOn, setVisitedOn] = useState(() => sanDiegoDate());
  const [selectedTags, setSelectedTags] = useState<VibeTagSlug[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!AUTH_IS_CONFIGURED);
  const [email, setEmail] = useState("");
  const [showEmailStep, setShowEmailStep] = useState(false);
  const [productUpdatesOptIn, setProductUpdatesOptIn] = useState(false);
  const [results, setResults] = useState<VibeCheckApiResponse["results"] | null>(null);
  const [saving, setSaving] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const [hasSavedResponse, setHasSavedResponse] = useState(false);
  const [message, setMessage] = useState("");
  const recoveredPendingRef = useRef(false);

  const selectedEvent = events.find((event) => event.eventId === selectedEventId);
  const accessToken = session?.access_token || null;
  const resultsLoading = authReady && Boolean(selectedEventId) && results === null;
  const rankedResults = useMemo(
    () =>
      (results?.tags || [])
        .filter((tag) => tag.count > 0)
        .toSorted((left, right) => right.count - left.count)
        .slice(0, 6),
    [results],
  );

  const postContribution = useCallback(
    async (payload: ContributionPayload, token: string) => {
      setSaving(true);
      setMessage("Posting your Vibe Check…");

      try {
        const response = await fetch("/api/vibe-checks", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const body = (await response.json()) as VibeCheckApiResponse & {
          error?: string;
          saved?: boolean;
        };

        if (!response.ok || !body.saved) {
          throw new Error(body.error || "Your Vibe Check could not be saved.");
        }

        setResults(body.results);
        setSelectedTags(body.user?.selectedTagSlugs || payload.tagSlugs);
        setVisitedOn(body.user?.visitedOn || payload.visitedOn);
        setProductUpdatesOptIn(
          body.user?.productUpdatesOptIn ?? payload.productUpdatesOptIn,
        );
        setHasSavedResponse(true);
        setShowEmailStep(false);
        setMessage(
          body.results.totalResponses === 1
            ? "You put this karaoke night on the map. First report logged."
            : `Saved. Your report now shapes what ${body.results.totalResponses} singers see here.`,
        );
        window.localStorage.removeItem(PENDING_KEY);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Your Vibe Check could not be saved.",
        );
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!AUTH_IS_CONFIGURED) return;

    const supabase = createClient();
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setAuthReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setAuthReady(true);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!selectedEventId || !authReady) return;
    const pending = accessToken ? readPendingContribution() : null;
    if (
      pending &&
      pending.venueId === venue.id &&
      pending.venueSlug === venue.slug
    ) {
      return;
    }
    let active = true;

    const headers: HeadersInit = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};
    const query = new URLSearchParams({
      venueId: venue.id,
      eventId: selectedEventId,
    });

    void fetch(`/api/vibe-checks?${query}`, { headers })
      .then(async (response) => {
        const body = (await response.json()) as VibeCheckApiResponse & { error?: string };
        if (!response.ok) throw new Error(body.error || "Results are unavailable.");
        return body;
      })
      .then((body) => {
        if (!active) return;
        setResults(body.results);
        setSelectedTags(body.user?.selectedTagSlugs || []);
        setVisitedOn(body.user?.visitedOn || sanDiegoDate());
        setProductUpdatesOptIn(body.user?.productUpdatesOptIn || false);
        setHasSavedResponse(Boolean(body.user?.selectedTagSlugs.length));
      })
      .catch((error) => {
        if (active) {
          setResults(emptyResults());
          setMessage(error instanceof Error ? error.message : "Results are unavailable.");
        }
      });

    return () => {
      active = false;
    };
  }, [accessToken, authReady, selectedEventId, venue.id, venue.slug]);

  useEffect(() => {
    if (!accessToken || recoveredPendingRef.current) return;
    const pending = readPendingContribution();
    if (!pending || pending.venueId !== venue.id || pending.venueSlug !== venue.slug) return;
    if (!events.some((event) => event.eventId === pending.eventId)) {
      window.localStorage.removeItem(PENDING_KEY);
      return;
    }

    recoveredPendingRef.current = true;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setSelectedEventId(pending.eventId);
      setVisitedOn(pending.visitedOn);
      setSelectedTags(pending.tagSlugs);
      setProductUpdatesOptIn(pending.productUpdatesOptIn);
      void postContribution(pending, accessToken);
    });

    return () => {
      active = false;
    };
  }, [accessToken, events, postContribution, venue.id, venue.slug]);

  function chooseEvent(eventId: string) {
    setSelectedEventId(eventId);
    setResults(null);
    setSelectedTags([]);
    setHasSavedResponse(false);
    setMessage("");
  }

  function toggleTag(slug: VibeTagSlug) {
    setMessage("");
    if (selectedTags.includes(slug)) {
      setSelectedTags(selectedTags.filter((tag) => tag !== slug));
      return;
    }
    if (selectedTags.length >= MAX_VIBE_SELECTIONS) {
      setMessage("Four checks is the limit. Uncheck one to choose another.");
      return;
    }
    setSelectedTags([...selectedTags, slug]);
  }

  function currentPayload(): ContributionPayload | null {
    if (!selectedEvent) {
      setMessage("Choose the karaoke night you attended.");
      return null;
    }
    if (!visitedOn) {
      setMessage("Tell us when you were there.");
      return null;
    }
    if (selectedTags.length < 1) {
      setMessage("Check at least one vibe that was actually true.");
      return null;
    }

    return {
      venueId: venue.id,
      venueSlug: venue.slug,
      eventId: selectedEvent.eventId,
      visitedOn,
      tagSlugs: selectedTags,
      productUpdatesOptIn,
    };
  }

  function submitCurrent() {
    const payload = currentPayload();
    if (!payload) return;

    if (!accessToken) {
      setShowEmailStep(true);
      setMessage("Confirm your email to make this report count. No password.");
      return;
    }

    void postContribution(payload, accessToken);
  }

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = currentPayload();
    if (!payload || !email.trim()) {
      if (!email.trim()) setMessage("Enter the email where we should send your sign-in link.");
      return;
    }
    if (!AUTH_IS_CONFIGURED) {
      setMessage("Email sign-in is not configured in this environment yet.");
      return;
    }

    setSendingLink(true);
    setMessage("Sending your sign-in link…");

    try {
      const pending: PendingContribution = {
        ...payload,
        version: 1,
        createdAt: Date.now(),
      };
      window.localStorage.setItem(PENDING_KEY, JSON.stringify(pending));

      const redirectUrl = `${window.location.origin}/venues/${venue.slug}#vibe-check`;
      const { error } = await createClient().auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true,
        },
      });
      if (error) throw error;

      setMessage(
        "Link sent. Open it from your email and SingHUB will post these checkmarks.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "The sign-in link could not be sent.",
      );
    } finally {
      setSendingLink(false);
    }
  }

  if (events.length === 0) {
    return (
      <section id="vibe-check" className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300">Vibe Check</p>
        <h2 className="mt-2 text-2xl font-black text-white">This room needs a verified karaoke night first.</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Vibes belong to a specific karaoke event, not a permanent label slapped on the building.
        </p>
      </section>
    );
  }

  return (
    <section id="vibe-check" className="mt-9 scroll-mt-24">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-fuchsia-300">Vibe Check</p>
        <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">
          Tell the next singer what Google couldn&apos;t.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
          Report the karaoke night you actually attended. Your email confirms one singer and one current report. It is never shown publicly.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,.8fr)]">
        <div className="rounded-[2rem] border border-[#7f4c35] bg-[repeating-linear-gradient(90deg,#3a1f16_0_12px,#4a291d_12px_24px,#32170f_24px_32px)] p-3 shadow-[0_28px_70px_rgba(0,0,0,.42)] md:p-5">
          <div className="relative rounded-2xl bg-[#f1eadc] px-4 pb-6 pt-16 text-slate-950 shadow-[inset_0_0_50px_rgba(80,55,35,.1)] md:px-7">
            <div className="absolute left-1/2 top-[-.8rem] h-16 w-40 -translate-x-1/2 rounded-b-xl rounded-t-md border border-slate-500/60 bg-[linear-gradient(180deg,#d8dde1,#818890_48%,#b9bec3)] shadow-[0_8px_12px_rgba(0,0,0,.28),inset_0_2px_2px_rgba(255,255,255,.8)]">
              <div className="mx-auto mt-3 h-5 w-16 rounded-full border border-slate-700/40 bg-slate-800/45 shadow-inner" />
            </div>

            <div className="border-b-2 border-dotted border-slate-500/50 pb-5">
              <label className="block font-mono text-[11px] font-black uppercase tracking-[0.18em] text-fuchsia-700">
                Which karaoke night?
                <select
                  value={selectedEventId}
                  onChange={(event) => chooseEvent(event.target.value)}
                  className="mt-2 block w-full rounded-lg border border-cyan-700 bg-cyan-100 px-3 py-3 font-sans text-sm font-black text-slate-950 shadow-[3px_3px_0_#0e7490] outline-none focus:border-fuchsia-700"
                >
                  {events.map((event) => (
                    <option key={event.eventId} value={event.eventId}>
                      {eventLabel(event)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-5 block font-mono text-[11px] font-black uppercase tracking-[0.16em] text-slate-600">
                When were you there?
                <input
                  type="date"
                  value={visitedOn}
                  min={earliestVisitDate()}
                  max={sanDiegoDate()}
                  onChange={(event) => setVisitedOn(event.target.value)}
                  className="mt-2 block w-full rounded-lg border border-slate-400 bg-white/55 px-3 py-2.5 font-sans text-sm font-bold text-slate-950 outline-none focus:border-fuchsia-600 sm:w-56"
                />
              </label>
            </div>

            <div className="pt-5">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-fuchsia-700">What was actually true?</p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">Check up to four. Useful beats flattering.</p>
                </div>
                <p className="font-mono text-xs font-black text-slate-600">{selectedTags.length}/{MAX_VIBE_SELECTIONS}</p>
              </div>

              <div className="mt-4 grid gap-x-5 gap-y-1 sm:grid-cols-2">
                {VIBE_CHECK_TAGS.map((tag) => {
                  const checked = selectedTags.includes(tag.slug);
                  const blocked = !checked && selectedTags.length >= MAX_VIBE_SELECTIONS;

                  return (
                    <button
                      key={tag.slug}
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      disabled={blocked}
                      onClick={() => toggleTag(tag.slug)}
                      className="group flex min-h-16 items-start gap-3 border-b border-dotted border-slate-400/55 py-3 text-left disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border-2 bg-white/25 transition ${checked ? "border-fuchsia-700" : "border-slate-600 group-hover:border-fuchsia-600"}`}>
                        <span className={`font-mono text-2xl font-black leading-none text-fuchsia-700 transition duration-150 ${checked ? "scale-100 rotate-[-8deg] opacity-100" : "scale-50 opacity-0"}`}>✓</span>
                      </span>
                      <span>
                        <strong className="block text-sm font-black text-slate-950">{tag.label}</strong>
                        <span className="mt-1 block text-xs leading-4 text-slate-600">{tag.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-400/60 bg-white/35 p-3 text-sm font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={productUpdatesOptIn}
                  onChange={(event) => setProductUpdatesOptIn(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-fuchsia-700"
                />
                <span>Keep me in the loop on useful new SingHUB features. Occasional updates, no nonsense.</span>
              </label>

              {session?.user.email ? (
                <p className="mt-3 text-xs font-semibold text-slate-600">Posting as {session.user.email}</p>
              ) : null}

              <button
                type="button"
                onClick={submitCurrent}
                disabled={saving || !authReady}
                className="mt-5 min-h-12 w-full rounded-xl bg-slate-950 px-5 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[4px_4px_0_#db2777] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Posting…" : hasSavedResponse ? "Update my Vibe Check" : "Post my Vibe Check"}
              </button>

              {showEmailStep && !accessToken ? (
                <form onSubmit={sendMagicLink} className="mt-5 rounded-xl border-2 border-dashed border-fuchsia-700/45 bg-fuchsia-50/80 p-4">
                  <label className="text-sm font-black text-slate-950" htmlFor={`vibe-email-${venue.id}`}>Confirm with your email</label>
                  <p className="mt-1 text-xs leading-5 text-slate-600">We will send a one-click sign-in link. Your checkmarks will be waiting when you return.</p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      id={`vibe-email-${venue.id}`}
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="min-h-11 flex-1 rounded-lg border border-slate-400 bg-white px-3 text-sm text-slate-950 outline-none focus:border-fuchsia-700"
                    />
                    <button type="submit" disabled={sendingLink} className="min-h-11 rounded-lg bg-fuchsia-700 px-4 text-sm font-black text-white disabled:opacity-50">
                      {sendingLink ? "Sending…" : "Email my link"}
                    </button>
                  </div>
                </form>
              ) : null}

              <p className="mt-4 min-h-5 text-sm font-bold text-fuchsia-800" aria-live="polite">{message}</p>
            </div>
          </div>
        </div>

        <aside className="self-start rounded-[2rem] border border-cyan-300/20 bg-[linear-gradient(160deg,rgba(8,47,73,.38),rgba(15,23,42,.94)_48%,rgba(88,28,135,.22))] p-5 shadow-[0_24px_60px_rgba(0,0,0,.3)] md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Singer report</p>
              <h3 className="mt-2 text-2xl font-black text-white">{selectedEvent ? eventLabel(selectedEvent) : venue.name}</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-black text-slate-300">
              Last {VIBE_CHECK_LOOKBACK_DAYS} days
            </span>
          </div>

          {resultsLoading ? (
            <div className="mt-6 space-y-4">
              {[0, 1, 2, 3].map((item) => <div key={item} className="h-12 animate-pulse rounded-xl bg-white/[0.05]" />)}
            </div>
          ) : results && results.totalResponses > 0 ? (
            <>
              <p className="mt-5 text-sm font-bold text-slate-300">
                {results.totalResponses} {results.totalResponses === 1 ? "singer report" : "singer reports"}. Each person counts once.
              </p>
              <div className="mt-6 space-y-5">
                {rankedResults.map((tag) => (
                  <div key={tag.slug}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-bold text-slate-200">{tag.label}</span>
                      <span className="font-black text-white">{tag.percentage}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.07]">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 transition-all duration-500" style={{ width: `${tag.percentage}%` }} />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">{tag.count} {tag.count === 1 ? "report mentions this" : "reports mention this"}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-black/20 p-5">
              <p className="text-lg font-black text-white">No recycled review snippets here.</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Be the first singer to describe this specific karaoke night with structured, useful information.</p>
            </div>
          )}

          <div className="mt-7 rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/[0.05] p-4">
            <p className="text-xs font-black uppercase tracking-[0.17em] text-fuchsia-200">Why this is different</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Email-confirmed input. One current report per singer per night. No anonymous essay about something that happened three years ago.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
