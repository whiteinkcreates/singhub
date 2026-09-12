"use client";

import type { Session } from "@supabase/supabase-js";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  CURRENT_FEATURE_POLL,
  type FeatureOptionId,
  type FeatureVoteApiResponse,
} from "@/lib/featureVote";
import { createClient } from "@/lib/supabase/client";

type VotePayload = {
  pollSlug: string;
  optionId: FeatureOptionId;
  productUpdatesOptIn: boolean;
};

type PendingVote = VotePayload & {
  version: 1;
  createdAt: number;
};

const PENDING_KEY = "singhub-feature-vote-pending-v1";
const AUTH_IS_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

function readPendingVote() {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const pending = JSON.parse(raw) as PendingVote;
    if (
      pending.version !== 1 ||
      pending.pollSlug !== CURRENT_FEATURE_POLL.slug ||
      Date.now() - pending.createdAt > 2 * 60 * 60 * 1000
    ) {
      window.localStorage.removeItem(PENDING_KEY);
      return null;
    }
    return pending;
  } catch {
    window.localStorage.removeItem(PENDING_KEY);
    return null;
  }
}

export function FeatureVote() {
  const [selectedOptionId, setSelectedOptionId] = useState<FeatureOptionId | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!AUTH_IS_CONFIGURED);
  const [results, setResults] = useState<FeatureVoteApiResponse | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [productUpdatesOptIn, setProductUpdatesOptIn] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailStep, setShowEmailStep] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const [message, setMessage] = useState("");
  const [recoveredPending, setRecoveredPending] = useState(false);
  const accessToken = session?.access_token || null;

  const postVote = useCallback(async (payload: VotePayload, token: string) => {
    setSaving(true);
    setMessage("Locking in your vote…");

    try {
      const response = await fetch("/api/feature-vote", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as FeatureVoteApiResponse & {
        error?: string;
        saved?: boolean;
      };
      if (!response.ok || !body.saved) {
        throw new Error(body.error || "Your feature vote could not be saved.");
      }

      setResults(body);
      setSelectedOptionId(body.user?.selectedOptionId || payload.optionId);
      setProductUpdatesOptIn(
        body.user?.productUpdatesOptIn ?? payload.productUpdatesOptIn,
      );
      setHasVoted(true);
      setShowEmailStep(false);
      setMessage("Vote saved. You now get to see where the band is leaning.");
      window.localStorage.removeItem(PENDING_KEY);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Your feature vote could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }, []);

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
    if (!authReady) return;
    const pending = accessToken ? readPendingVote() : null;
    if (pending) return;
    let active = true;
    const headers: HeadersInit = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    void fetch("/api/feature-vote", { headers })
      .then(async (response) => {
        const body = (await response.json()) as FeatureVoteApiResponse & { error?: string };
        if (!response.ok) throw new Error(body.error || "Feature voting is unavailable.");
        return body;
      })
      .then((body) => {
        if (!active) return;
        setResults(body);
        setSelectedOptionId(body.user?.selectedOptionId || null);
        setProductUpdatesOptIn(body.user?.productUpdatesOptIn || false);
        setHasVoted(Boolean(body.user?.selectedOptionId));
      })
      .catch((error) => {
        if (active) {
          setMessage(
            error instanceof Error ? error.message : "Feature voting is unavailable.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [accessToken, authReady]);

  useEffect(() => {
    if (!accessToken || recoveredPending) return;
    const pending = readPendingVote();
    if (!pending) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setRecoveredPending(true);
      setSelectedOptionId(pending.optionId);
      setProductUpdatesOptIn(pending.productUpdatesOptIn);
      void postVote(pending, accessToken);
    });
    return () => {
      active = false;
    };
  }, [accessToken, postVote, recoveredPending]);

  function currentPayload(): VotePayload | null {
    if (!selectedOptionId) {
      setMessage("Pick the feature you want SingHUB to build first.");
      return null;
    }
    return {
      pollSlug: CURRENT_FEATURE_POLL.slug,
      optionId: selectedOptionId,
      productUpdatesOptIn,
    };
  }

  function submitVote() {
    const payload = currentPayload();
    if (!payload) return;
    if (!accessToken) {
      setShowEmailStep(true);
      setMessage("Confirm your email to make this vote count. No password.");
      return;
    }
    void postVote(payload, accessToken);
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
      const pending: PendingVote = { ...payload, version: 1, createdAt: Date.now() };
      window.localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
      const { error } = await createClient().auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/#feature-vote`,
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      setMessage("Link sent. Open it from your email and SingHUB will cast your vote.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "The sign-in link could not be sent.",
      );
    } finally {
      setSendingLink(false);
    }
  }

  return (
    <section id="feature-vote" className="scroll-mt-24 overflow-hidden rounded-[2rem] border border-amber-200/20 bg-[linear-gradient(145deg,#16130f,#0f172a_48%,#151029)] shadow-[0_28px_80px_rgba(2,6,23,.42)]">
      <div className="grid lg:grid-cols-[.72fr_1.28fr]">
        <div className="relative overflow-hidden border-b border-white/10 p-6 lg:border-b-0 lg:border-r md:p-8">
          <div className="absolute inset-0 opacity-25 [background-image:repeating-linear-gradient(0deg,transparent_0_17px,rgba(255,255,255,.05)_18px),radial-gradient(circle_at_20%_10%,rgba(245,158,11,.35),transparent_15rem)]" />
          <div className="relative">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-200">SingHUB Garage Session</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-white md:text-4xl">You pick the next track.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-300 md:text-base">Vote on what gets built next. The roadmap should reflect what singers will actually use, not whatever sounded clever in a founder’s notebook at 1 AM.</p>

            <div className="mt-7 rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_14px_#34d399]" />
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-200">Members in the room</p>
              </div>
              <p className="mt-3 text-3xl font-black text-white">{results?.totalVotes || 0}</p>
              <p className="mt-1 text-xs text-slate-500">One current vote per confirmed email.</p>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300">Choose one</p>
          <h3 className="mt-2 text-2xl font-black text-white">{CURRENT_FEATURE_POLL.question}</h3>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {CURRENT_FEATURE_POLL.options.map((option) => {
              const selected = option.id === selectedOptionId;
              const result = results?.options.find((item) => item.id === option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setSelectedOptionId(option.id);
                    setMessage("");
                  }}
                  className={`relative min-h-52 rounded-2xl border-2 p-4 text-left transition hover:-translate-y-1 ${selected ? "border-fuchsia-300 bg-fuchsia-300/10 shadow-[0_0_24px_rgba(244,114,182,.22)]" : "border-white/10 bg-black/20 hover:border-cyan-300/40"}`}
                >
                  <span className={`flex h-11 w-11 items-center justify-center rounded-full border-4 text-sm font-black shadow-[inset_0_3px_7px_rgba(0,0,0,.55)] ${selected ? "border-fuchsia-200 bg-fuchsia-500 text-white" : "border-slate-500 bg-slate-700 text-slate-200"}`}>{option.pedal}</span>
                  <strong className="mt-6 block text-lg font-black text-white">{option.title}</strong>
                  <span className="mt-2 block text-sm leading-5 text-slate-400">{option.description}</span>
                  {hasVoted && result ? (
                    <span className="mt-4 block text-xs font-black text-cyan-200">{result.percentage}% of the room</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[.035] p-3 text-sm font-bold text-slate-300">
            <input type="checkbox" checked={productUpdatesOptIn} onChange={(event) => setProductUpdatesOptIn(event.target.checked)} className="mt-1 h-4 w-4 accent-fuchsia-500" />
            <span>Tell me when new SingHUB features launch. Occasional useful updates only.</span>
          </label>

          {session?.user.email ? <p className="mt-3 text-xs font-semibold text-slate-500">Voting as {session.user.email}</p> : null}

          <button type="button" onClick={submitVote} disabled={saving || !authReady} className="mt-5 min-h-12 w-full rounded-xl bg-gradient-to-r from-fuchsia-400 to-cyan-300 px-5 text-sm font-black uppercase tracking-[0.08em] text-slate-950 disabled:opacity-50">
            {saving ? "Saving vote…" : hasVoted ? "Change my vote" : "Cast my vote"}
          </button>

          {showEmailStep && !accessToken ? (
            <form onSubmit={sendMagicLink} className="mt-5 rounded-xl border border-dashed border-cyan-300/35 bg-cyan-300/[.045] p-4">
              <label htmlFor="feature-vote-email" className="text-sm font-black text-white">Confirm with your email</label>
              <p className="mt-1 text-xs leading-5 text-slate-400">One click, no password. The same sign-in works for future Vibe Checks.</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input id="feature-vote-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-h-11 flex-1 rounded-lg border border-white/15 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-300" />
                <button type="submit" disabled={sendingLink} className="min-h-11 rounded-lg bg-cyan-300 px-4 text-sm font-black text-slate-950 disabled:opacity-50">{sendingLink ? "Sending…" : "Email my link"}</button>
              </div>
            </form>
          ) : null}

          <p className="mt-4 min-h-5 text-sm font-bold text-cyan-200" aria-live="polite">{message}</p>
        </div>
      </div>
    </section>
  );
}
