"use client";

import { useEffect, useMemo, useState } from "react";

type PollOption = { id: string; label: string; votes: number; percentage: number };
type PollPayload = { slug: string; question: string; helper?: string; category: string; totalVotes: number; options: PollOption[] };
type ApiPayload = { poll: PollPayload; previous?: PollPayload };
type VotePayload = { poll: PollPayload; selectedOptionId?: string; alreadyVoted?: boolean; error?: string };

function getClientId() {
  const key = "singhub-poll-client";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const next = crypto.randomUUID();
  window.localStorage.setItem(key, next);
  return next;
}

export function PollOfTheDay() {
  const [data, setData] = useState<ApiPayload | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/polls/current", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: ApiPayload) => {
        setData(payload);
        const saved = window.localStorage.getItem(`singhub-poll-vote:${payload.poll.slug}`);
        if (saved) setSelected(saved);
      })
      .catch(() => setMessage("Daily Mic is taking the night off."))
      .finally(() => setLoading(false));
  }, []);

  const yesterdayTake = useMemo(() => {
    const previous = data?.previous;
    if (!previous || previous.totalVotes === 0) return null;
    const winner = [...previous.options].sort((a, b) => b.votes - a.votes)[0];
    return winner ? `${winner.percentage}% picked ${winner.label}.` : null;
  }, [data]);

  async function vote(optionId: string) {
    if (!data || voting || selected) return;
    setVoting(true);
    setMessage(null);
    try {
      const response = await fetch("/api/polls/current", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pollSlug: data.poll.slug, optionId, clientId: getClientId() }),
      });
      const payload = (await response.json()) as VotePayload;
      if (!response.ok) throw new Error(payload.error || "Vote failed");
      const lockedOptionId = payload.selectedOptionId || optionId;
      setSelected(lockedOptionId);
      window.localStorage.setItem(`singhub-poll-vote:${data.poll.slug}`, lockedOptionId);
      setData((current) => current ? { ...current, poll: payload.poll } : current);
      if (payload.alreadyVoted) setMessage("Already counted. Showing your original vote.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Vote could not be saved.");
    } finally {
      setVoting(false);
    }
  }

  const poll = data?.poll;
  const showResults = Boolean(selected);

  return (
    <section id="daily-mic" className="scroll-mt-24 relative overflow-hidden rounded-[2rem] border border-fuchsia-300/20 bg-[linear-gradient(145deg,rgba(2,6,23,0.98),rgba(20,13,43,0.94)_52%,rgba(8,47,73,0.48))] shadow-[0_28px_80px_rgba(2,6,23,0.38)]">
      <div className="absolute -left-24 top-4 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative p-5 md:p-7">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-fuchsia-300">One karaoke argument. Every day.</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">Daily Mic</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">New question tomorrow</span>
            {yesterdayTake && <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.04] px-3 py-2 text-cyan-100">Yesterday: {yesterdayTake}</span>}
          </div>
        </div>

        {loading ? (
          <div className="mt-6 h-64 animate-pulse rounded-3xl border border-white/5 bg-white/[0.03]" />
        ) : poll ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.92fr]">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5 md:p-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Today&apos;s argument</p>
              <h3 className="mt-3 max-w-2xl text-2xl font-black leading-tight text-white md:text-3xl">{poll.question}</h3>
              {poll.helper && <p className="mt-2 text-sm leading-6 text-slate-400">{poll.helper}</p>}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {poll.options.map((option) => {
                  const isSelected = selected === option.id;
                  return (
                    <button key={option.id} type="button" disabled={Boolean(selected) || voting} onClick={() => vote(option.id)} className={`min-h-16 rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${isSelected ? "border-fuchsia-300/70 bg-fuchsia-400/20 text-white shadow-[0_0_28px_rgba(217,70,239,0.16)]" : "border-white/12 bg-white/[0.035] text-slate-100 hover:-translate-y-0.5 hover:border-cyan-300/45 hover:bg-cyan-300/[0.06]"} disabled:cursor-default`}>
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 min-h-5 text-xs text-slate-500">{message || (selected ? "Vote locked in. Results are live." : "Tap once. No account needed.")}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-200">{showResults ? "Live results" : "Results unlock after you vote"}</p>
                <p className="text-xs font-bold text-slate-500">{poll.totalVotes.toLocaleString()} votes</p>
              </div>
              <div className="mt-6 space-y-5">
                {poll.options.map((option) => (
                  <div key={option.id}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-bold text-slate-200">{option.label}</span>
                      <span className="font-black text-white">{showResults ? `${option.percentage}%` : "••"}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 transition-all duration-500" style={{ width: showResults ? `${Math.max(option.percentage, option.votes ? 2 : 0)}%` : "0%" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-7 rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/[0.04] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-200">Tomorrow, we argue again.</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">Vote, see where San Diego lands, then go find a microphone before somebody else takes your song.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-6 text-slate-300">{message || "No question loaded."}</div>
        )}
      </div>
    </section>
  );
}
