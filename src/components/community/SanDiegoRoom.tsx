"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

type ChannelId = "tonight" | "new-finds" | "schedule-checks" | "scout-ops";

type RoomMessage = {
  id: string;
  channel: ChannelId;
  author: string;
  badge?: string;
  time: string;
  body: string;
};

const channels: { id: ChannelId; label: string; helper: string; icon: string }[] = [
  { id: "tonight", label: "tonight", helper: "Plans and invitations", icon: "🎤" },
  { id: "new-finds", label: "new-finds", helper: "Fresh karaoke leads", icon: "📡" },
  { id: "schedule-checks", label: "schedule-checks", helper: "Confirm changes", icon: "✅" },
  { id: "scout-ops", label: "scout-ops", helper: "Verification missions", icon: "🧭" },
];

const initialMessages: RoomMessage[] = [
  {
    id: "seed-1",
    channel: "tonight",
    author: "MadHatter",
    badge: "🎩",
    time: "Pinned",
    body: "Where are you singing tonight? Drop the venue, rough arrival time, and whether you want company.",
  },
  {
    id: "seed-2",
    channel: "new-finds",
    author: "SingHUB Scout",
    badge: "📡",
    time: "Scene note",
    body: "A new place can enter the Venue Index before its recurring schedule is verified. It stays off Tonight until the event evidence is strong enough.",
  },
  {
    id: "seed-3",
    channel: "schedule-checks",
    author: "SingHUB",
    badge: "✅",
    time: "Verification rule",
    body: "Report cancellations, host changes, start-time shifts, and seasonal pauses here so the Finder stays trustworthy.",
  },
  {
    id: "seed-4",
    channel: "scout-ops",
    author: "MadHatter",
    badge: "🎩",
    time: "Mission",
    body: "San Diego stays the laboratory. We max out this scene, document the process, then human Scouts help take the same system city by city.",
  },
];

export function SanDiegoRoom() {
  const [activeChannel, setActiveChannel] = useState<ChannelId>("tonight");
  const [messages, setMessages] = useState<RoomMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");

  const activeMessages = useMemo(
    () => messages.filter((message) => message.channel === activeChannel),
    [activeChannel, messages],
  );

  const activeChannelData = channels.find((channel) => channel.id === activeChannel)!;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;

    setMessages((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        channel: activeChannel,
        author: "You",
        time: "Just now",
        body,
      },
    ]);
    setDraft("");
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/30">
      <div className="border-b border-amber-300/20 bg-amber-300/[0.07] px-5 py-3 text-sm leading-6 text-amber-100">
        Phase 1.5 mobile room preview. Messages you add are visible in this browser session only until accounts and persistent community posts are connected.
      </div>

      <div className="grid min-h-[42rem] lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-slate-950/85 p-4 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-fuchsia-300">
                SingHUB Room
              </p>
              <h2 className="mt-1 text-xl font-black text-white">San Diego</h2>
            </div>
            <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100">
              SD FIRST
            </span>
          </div>

          <nav className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {channels.map((channel) => {
              const active = activeChannel === channel.id;
              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => setActiveChannel(channel.id)}
                  className={`rounded-2xl border p-3 text-left transition ${
                    active
                      ? "border-fuchsia-300/60 bg-fuchsia-300/12 shadow-[0_0_20px_rgba(217,70,239,.12)]"
                      : "border-white/10 bg-white/[0.03] hover:border-cyan-300/30 hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-black text-white">
                    <span aria-hidden="true">{channel.icon}</span> #{channel.label}
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">{channel.helper}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
            <p className="text-sm font-black text-white">Need the actual schedule?</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Room chatter never replaces verified Finder data.
            </p>
            <Link
              href="/find-karaoke?day=tonight"
              className="mt-3 inline-flex text-sm font-black text-cyan-200 hover:text-fuchsia-200"
            >
              Open Tonight →
            </Link>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          <header className="border-b border-white/10 px-5 py-4 md:px-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
              {activeChannelData.icon} #{activeChannelData.label}
            </p>
            <p className="mt-1 text-sm text-slate-400">{activeChannelData.helper}</p>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto p-5 md:p-6">
            {activeMessages.map((message) => (
              <article
                key={message.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {message.badge && <span aria-hidden="true">{message.badge}</span>}
                  <span className="font-black text-white">{message.author}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {message.time}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-200">
                  {message.body}
                </p>
              </article>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/10 p-4 md:p-5">
            <label className="sr-only" htmlFor="room-message">
              Post to {activeChannelData.label}
            </label>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <textarea
                id="room-message"
                rows={2}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={`Post to #${activeChannelData.label}…`}
                className="min-h-20 w-full resize-none rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-fuchsia-300/60 focus:ring-2 focus:ring-fuchsia-300/15"
              />
              <button
                type="submit"
                className="min-h-12 rounded-2xl bg-gradient-to-r from-cyan-300 to-fuchsia-400 px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-950 transition hover:scale-[1.02]"
              >
                Preview Post
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
