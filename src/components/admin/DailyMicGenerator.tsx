"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { PollQuestion } from "@/lib/pollBank";
import { DAILY_MIC_BRAND, DAILY_MIC_TEMPLATES } from "@/lib/dailyMicBrand";

function captionVariants(poll: PollQuestion) {
  const options = poll.options.length > 1 ? `\n\n${poll.options.map((o) => o.label).join(" • ")}` : "";
  const question = poll.socialQuestion || poll.question;
  return {
    Punchy: `${poll.socialHook}\n\n${question}${options}\n\nPick one. Then go see what everyone else chose.\n\nVote + see results → ${DAILY_MIC_BRAND.voteUrl}`,
    Funny: `${poll.socialHook}\n\n${question}${options}\n\nMake your choice. Defend the damage in the comments.\n\nVote + see results → ${DAILY_MIC_BRAND.voteUrl}`,
    "Argument Starter": `${poll.socialHook}\n\n${question}${options}\n\nVote first. Then make your case in the comments.\n\nVote + see results → ${DAILY_MIC_BRAND.voteUrl}`,
  };
}

export function DailyMicGenerator({ poll }: { poll: PollQuestion }) {
  const [format, setFormat] = useState<"feed" | "story">("feed");
  const [captionStyle, setCaptionStyle] = useState<"Punchy" | "Funny" | "Argument Starter">("Punchy");
  const [copied, setCopied] = useState(false);
  const template = DAILY_MIC_TEMPLATES[poll.category];
  const captions = useMemo(() => captionVariants(poll), [poll]);
  const caption = captions[captionStyle];

  async function copyCaption() {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  async function share() {
    if (!navigator.share) return copyCaption();
    await navigator.share({ title: `${template.label} | SingHUB`, text: caption, url: DAILY_MIC_BRAND.voteUrl });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[.22em] text-fuchsia-300">Today&apos;s social card</p>
            <h2 className="mt-2 text-2xl font-black">{template.label}</h2>
          </div>
          <div className="flex rounded-xl border border-white/10 p-1 text-sm font-bold">
            {(["feed", "story"] as const).map((value) => (
              <button key={value} type="button" onClick={() => setFormat(value)} className={`rounded-lg px-3 py-2 capitalize ${format === value ? "bg-white text-black" : "text-slate-300"}`}>{value}</button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-center overflow-hidden rounded-2xl bg-slate-950 p-4">
          <div className={`relative flex w-full max-w-[540px] flex-col overflow-hidden border border-white/10 bg-[#09090b] text-white ${format === "feed" ? "aspect-[4/5]" : "aspect-[9/16]"}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,42,163,.18),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(139,92,246,.16),transparent_30%)]" />
            <div className="relative flex h-full flex-col p-[6%]">
              <Image src={DAILY_MIC_BRAND.wordmark} alt={DAILY_MIC_BRAND.wordmarkAlt} width={2400} height={600} className="h-auto w-[42%] object-contain" priority />
              <div className="mt-[8%] inline-flex w-fit rounded-full border border-fuchsia-300/30 px-3 py-1 text-[clamp(10px,1.4vw,14px)] font-black uppercase tracking-[.18em] text-fuchsia-200">{template.label}</div>
              <h3 className="mt-[6%] max-w-[92%] text-[clamp(28px,5.6vw,58px)] font-black leading-[.94] tracking-[-.04em]">{poll.socialQuestion || poll.question}</h3>
              {poll.options.length > 1 && <div className="mt-auto grid gap-2 pt-[6%] sm:grid-cols-2">{poll.options.map((option) => <div key={option.id} className="rounded-xl border border-white/15 bg-white/[.05] px-3 py-3 text-[clamp(12px,1.6vw,17px)] font-extrabold leading-tight">{option.label}</div>)}</div>}
              <div className="mt-[5%] flex items-end justify-between gap-4 text-[clamp(9px,1.2vw,12px)] font-black uppercase tracking-[.16em] text-slate-300"><span>Cast your vote</span><span>SingHUB.app/vote</span></div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">Brand lock: official SingHUB wordmark asset only. No recreated logo text, no gradient substitutions, no brush-stroke typography. Template art slots in behind this fixed layout.</p>
      </section>

      <aside className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
        <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-300">Caption bait</p>
        <div className="mt-4 flex flex-wrap gap-2">{(["Punchy", "Funny", "Argument Starter"] as const).map((style) => <button key={style} type="button" onClick={() => setCaptionStyle(style)} className={`rounded-full border px-3 py-2 text-xs font-black ${captionStyle === style ? "border-fuchsia-300 bg-fuchsia-300/15 text-white" : "border-white/10 text-slate-400"}`}>{style}</button>)}</div>
        <textarea readOnly value={caption} className="mt-4 min-h-72 w-full rounded-2xl border border-white/10 bg-slate-950 p-4 text-sm leading-6 text-slate-200" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={copyCaption} className="min-h-11 rounded-xl border border-white/15 px-4 text-sm font-black">{copied ? "Copied" : "Copy caption"}</button>
          <button type="button" onClick={share} className="min-h-11 rounded-xl bg-fuchsia-300 px-4 text-sm font-black text-slate-950">Share</button>
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-black uppercase tracking-[.18em] text-slate-500">Template direction</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{template.visualDirection}</p>
        </div>
      </aside>
    </div>
  );
}
