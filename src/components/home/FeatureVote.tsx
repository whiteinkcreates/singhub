"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CURRENT_FEATURE_POLL,
  FEATURE_OPTION_IDS,
  type FeatureOptionId,
  type FeatureVoteApiResponse,
} from "@/lib/featureVote";

type VoteReceipt = {
  version: 2;
  pollSlug: string;
  optionId: FeatureOptionId;
  productUpdatesOptIn: boolean;
};

const RECEIPT_KEY = "singhub-feature-vote-receipt-v2";

function readVoteReceipt(): VoteReceipt | null {
  try {
    const raw = window.localStorage.getItem(RECEIPT_KEY);
    if (!raw) return null;
    const receipt = JSON.parse(raw) as VoteReceipt;
    if (
      receipt.version !== 2 ||
      receipt.pollSlug !== CURRENT_FEATURE_POLL.slug ||
      !FEATURE_OPTION_IDS.has(receipt.optionId)
    ) {
      window.localStorage.removeItem(RECEIPT_KEY);
      return null;
    }
    return receipt;
  } catch {
    window.localStorage.removeItem(RECEIPT_KEY);
    return null;
  }
}

export function FeatureVote() {
  const [selectedOptionId, setSelectedOptionId] =
    useState<FeatureOptionId | null>(null);
  const [results, setResults] = useState<FeatureVoteApiResponse | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [productUpdatesOptIn, setProductUpdatesOptIn] = useState(false);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [showEmailStep, setShowEmailStep] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const receipt = readVoteReceipt();
    let active = true;
    if (receipt) {
      queueMicrotask(() => {
        if (!active) return;
        setSelectedOptionId(receipt.optionId);
        setProductUpdatesOptIn(receipt.productUpdatesOptIn);
        setHasVoted(true);
      });
    }

    void fetch("/api/feature-vote")
      .then(async (response) => {
        const body = (await response.json()) as FeatureVoteApiResponse & {
          error?: string;
        };
        if (!response.ok) {
          throw new Error(body.error || "Feature voting is unavailable.");
        }
        return body;
      })
      .then((body) => {
        if (active) setResults(body);
      })
      .catch((error) => {
        if (active) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Feature voting is unavailable.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function openEmailStep() {
    if (!selectedOptionId) {
      setMessage("Pick the feature you want SingHUB to build first.");
      return;
    }
    setShowEmailStep(true);
    setMessage("");
  }

  async function submitVote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedOptionId) {
      setMessage("Pick the feature you want SingHUB to build first.");
      return;
    }
    if (!email.trim()) {
      setMessage("Enter your email to count your vote.");
      return;
    }

    setSaving(true);
    setMessage("Counting your vote...");
    try {
      const response = await fetch("/api/feature-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pollSlug: CURRENT_FEATURE_POLL.slug,
          optionId: selectedOptionId,
          email,
          productUpdatesOptIn,
          website,
        }),
      });
      const body = (await response.json()) as FeatureVoteApiResponse & {
        error?: string;
        saved?: boolean;
      };
      if (!response.ok || !body.saved) {
        throw new Error(body.error || "Your feature vote could not be saved.");
      }

      const receipt: VoteReceipt = {
        version: 2,
        pollSlug: CURRENT_FEATURE_POLL.slug,
        optionId: selectedOptionId,
        productUpdatesOptIn,
      };
      window.localStorage.setItem(RECEIPT_KEY, JSON.stringify(receipt));
      setResults(body);
      setHasVoted(true);
      setShowEmailStep(false);
      setMessage("Vote counted. Here is where singers are leaning.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Your feature vote could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      id="feature-vote"
      className="scroll-mt-24 overflow-hidden rounded-[2rem] border border-amber-200/20 bg-[linear-gradient(145deg,#16130f,#0f172a_48%,#151029)] shadow-[0_28px_80px_rgba(2,6,23,.42)]"
    >
      <div className="grid lg:grid-cols-[.72fr_1.28fr]">
        <div className="relative overflow-hidden border-b border-white/10 p-6 lg:border-b-0 lg:border-r md:p-8">
          <div className="absolute inset-0 opacity-25 [background-image:repeating-linear-gradient(0deg,transparent_0_17px,rgba(255,255,255,.05)_18px),radial-gradient(circle_at_20%_10%,rgba(245,158,11,.35),transparent_15rem)]" />
          <div className="relative">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-200">
              Help build SingHUB
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-white md:text-4xl">
              What should SingHUB build next?
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-300 md:text-base">
              Vote for the feature you would actually use. One email, one current
              vote, and no account or inbox detour.
            </p>

            <div className="mt-7 rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_14px_#34d399]" />
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-200">
                  Singers voting
                </p>
              </div>
              <p className="mt-3 text-3xl font-black text-white">
                {results?.totalVotes || 0}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                One current vote per email.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300">
            Choose one
          </p>
          <h3 className="mt-2 text-2xl font-black text-white">
            Choose the feature you want most.
          </h3>

          <div
            role="radiogroup"
            aria-label={CURRENT_FEATURE_POLL.question}
            className="mt-5 grid gap-3 md:grid-cols-3"
          >
            {CURRENT_FEATURE_POLL.options.map((option) => {
              const selected = option.id === selectedOptionId;
              const result = results?.options.find(
                (item) => item.id === option.id,
              );
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
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full border-4 text-sm font-black shadow-[inset_0_3px_7px_rgba(0,0,0,.55)] ${selected ? "border-fuchsia-200 bg-fuchsia-500 text-white" : "border-slate-500 bg-slate-700 text-slate-200"}`}
                  >
                    {option.pedal}
                  </span>
                  <strong className="mt-6 block text-lg font-black text-white">
                    {option.title}
                  </strong>
                  <span className="mt-2 block text-sm leading-5 text-slate-400">
                    {option.description}
                  </span>
                  {hasVoted && result ? (
                    <span className="mt-4 block text-xs font-black text-cyan-200">
                      {result.percentage}% of singers
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={openEmailStep}
            disabled={saving || loading}
            className="mt-5 min-h-12 w-full rounded-xl bg-gradient-to-r from-fuchsia-400 to-cyan-300 px-5 text-sm font-black uppercase tracking-[0.08em] text-slate-950 disabled:opacity-50"
          >
            {hasVoted ? "Change my vote" : "Cast my vote"}
          </button>

          {showEmailStep ? (
            <form
              onSubmit={submitVote}
              className="mt-5 rounded-xl border border-dashed border-cyan-300/35 bg-cyan-300/[.045] p-4"
            >
              <label
                htmlFor="feature-vote-email"
                className="text-sm font-black text-white"
              >
                Enter your email
              </label>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Your vote counts immediately and results unlock here. No account,
                password, or email verification.
              </p>
              <input
                id="feature-vote-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                className="absolute left-[-9999px] h-px w-px opacity-0"
                aria-hidden="true"
              />
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  id="feature-vote-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="min-h-11 flex-1 rounded-lg border border-white/15 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-300"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-11 rounded-lg bg-cyan-300 px-4 text-sm font-black text-slate-950 disabled:opacity-50"
                >
                  {saving ? "Counting..." : "Count my vote"}
                </button>
              </div>
              <label className="mt-3 flex cursor-pointer items-start gap-3 text-xs font-bold text-slate-300">
                <input
                  type="checkbox"
                  checked={productUpdatesOptIn}
                  onChange={(event) =>
                    setProductUpdatesOptIn(event.target.checked)
                  }
                  className="mt-0.5 h-4 w-4 accent-fuchsia-500"
                />
                <span>
                  Email me when new SingHUB features launch. Occasional useful
                  updates only.
                </span>
              </label>
            </form>
          ) : null}

          <p
            className="mt-4 min-h-5 text-sm font-bold text-cyan-200"
            aria-live="polite"
          >
            {message}
          </p>
        </div>
      </div>
    </section>
  );
}
