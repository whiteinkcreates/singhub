"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { PollQuestion } from "@/lib/pollBank";
import { DAILY_MIC_BRAND, DAILY_MIC_TEMPLATES } from "@/lib/dailyMicBrand";

const CARD_DIMENSIONS = {
  feed: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
} as const;

function loadCanvasImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${src}`));
    image.src = src;
  });
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);
  return lines;
}

async function renderDailyMicImage(
  poll: PollQuestion,
  label: string,
  format: "feed" | "story",
) {
  const { width, height } = CARD_DIMENSIONS[format];
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable in this browser.");

  ctx.fillStyle = "#09090b";
  ctx.fillRect(0, 0, width, height);

  const pinkGlow = ctx.createRadialGradient(245, 230, 0, 245, 230, 510);
  pinkGlow.addColorStop(0, "rgba(255,42,163,.26)");
  pinkGlow.addColorStop(1, "rgba(255,42,163,0)");
  ctx.fillStyle = pinkGlow;
  ctx.fillRect(0, 0, width, height);

  const purpleGlow = ctx.createRadialGradient(860, height * 0.7, 0, 860, height * 0.7, 560);
  purpleGlow.addColorStop(0, "rgba(139,92,246,.22)");
  purpleGlow.addColorStop(1, "rgba(139,92,246,0)");
  ctx.fillStyle = purpleGlow;
  ctx.fillRect(0, 0, width, height);

  const inset = 70;
  const wordmark = await loadCanvasImage(DAILY_MIC_BRAND.wordmark);
  const wordmarkWidth = 420;
  const wordmarkHeight = wordmarkWidth * (wordmark.naturalHeight / wordmark.naturalWidth);
  ctx.drawImage(wordmark, inset, inset, wordmarkWidth, wordmarkHeight);

  const badgeY = inset + wordmarkHeight + 72;
  ctx.font = "900 28px Arial, sans-serif";
  const badgeWidth = ctx.measureText(label.toUpperCase()).width + 58;
  roundedRect(ctx, inset, badgeY, badgeWidth, 64, 32);
  ctx.fillStyle = "rgba(217,70,239,.12)";
  ctx.fill();
  ctx.strokeStyle = "rgba(240,171,252,.45)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#f5d0fe";
  ctx.fillText(label.toUpperCase(), inset + 29, badgeY + 42);

  const question = poll.socialQuestion || poll.question;
  let fontSize = format === "story" ? 82 : 76;
  let questionLines: string[] = [];
  do {
    ctx.font = `900 ${fontSize}px Arial, sans-serif`;
    questionLines = wrapLines(ctx, question, width - inset * 2);
    fontSize -= 2;
  } while (questionLines.length > (format === "story" ? 6 : 5) && fontSize > 52);

  ctx.fillStyle = "#ffffff";
  const lineHeight = fontSize * 0.98;
  const questionY = badgeY + 145;
  questionLines.forEach((line, index) => {
    ctx.fillText(line, inset, questionY + index * lineHeight);
  });

  const footerY = height - 70;
  if (poll.options.length > 1) {
    const gap = 18;
    const cardWidth = (width - inset * 2 - gap) / 2;
    const rows = Math.ceil(poll.options.length / 2);
    const cardHeight = 108;
    const optionsTop = footerY - 70 - rows * cardHeight - (rows - 1) * gap;

    poll.options.forEach((option, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = inset + column * (cardWidth + gap);
      const y = optionsTop + row * (cardHeight + gap);
      roundedRect(ctx, x, y, cardWidth, cardHeight, 24);
      ctx.fillStyle = "rgba(255,255,255,.055)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.18)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 27px Arial, sans-serif";
      const optionLines = wrapLines(ctx, option.label, cardWidth - 44).slice(0, 2);
      const optionLineHeight = 31;
      const textTop = y + (cardHeight - optionLines.length * optionLineHeight) / 2 + 24;
      optionLines.forEach((line, lineIndex) => {
        ctx.fillText(line, x + 22, textTop + lineIndex * optionLineHeight);
      });
    });
  }

  ctx.font = "900 23px Arial, sans-serif";
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText("CAST YOUR VOTE", inset, footerY);
  const url = "SINGHUB.APP/VOTE";
  ctx.fillText(url, width - inset - ctx.measureText(url).width, footerY);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob?.type === "image/png" ? resolve(blob) : reject(new Error("Could not create a PNG image.")),
      "image/png",
    );
  });
}

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
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const template = DAILY_MIC_TEMPLATES[poll.category];
  const captions = useMemo(() => captionVariants(poll), [poll]);
  const caption = captions[captionStyle];

  async function copyCaption() {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function imageFilename() {
    return `SingHUB-Daily-Mic-${poll.slug}-${format}-${CARD_DIMENSIONS[format].width}x${CARD_DIMENSIONS[format].height}.png`;
  }

  async function downloadImage() {
    setExporting(true);
    setExportMessage(null);
    try {
      const blob = await renderDailyMicImage(poll, template.label, format);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = imageFilename();
      link.type = "image/png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      setExportMessage(`Image saved as ${imageFilename()}. Look in Downloads.`);
    } catch (error) {
      console.error(error);
      setExportMessage("Could not create the image in this browser.");
    } finally {
      setExporting(false);
    }
  }

  async function shareImage() {
    setExporting(true);
    setExportMessage(null);
    try {
      const blob = await renderDailyMicImage(poll, template.label, format);
      const file = new File([blob], imageFilename(), { type: "image/png" });
      const shareData = { files: [file], title: `${template.label} | SingHUB`, text: caption };
      if (!navigator.share || !navigator.canShare?.(shareData)) {
        setExportMessage("This browser cannot share image files directly. Use Download Image instead.");
        return;
      }
      await navigator.share(shareData);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error(error);
      setExportMessage("Could not share the image. Use Download Image instead.");
    } finally {
      setExporting(false);
    }
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
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={downloadImage} disabled={exporting} className="min-h-11 rounded-xl bg-fuchsia-300 px-4 text-sm font-black text-slate-950 disabled:opacity-50">{exporting ? "Creating image..." : "Download image"}</button>
          <button type="button" onClick={shareImage} disabled={exporting} className="min-h-11 rounded-xl border border-fuchsia-300/40 px-4 text-sm font-black text-fuchsia-100 disabled:opacity-50">Share image</button>
          <button type="button" onClick={copyCaption} className="min-h-11 rounded-xl border border-white/15 px-4 text-sm font-black sm:col-span-2">{copied ? "Caption copied" : "Copy caption"}</button>
        </div>
        {exportMessage && <p className="mt-3 text-sm font-semibold text-cyan-200">{exportMessage}</p>}
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-black uppercase tracking-[.18em] text-slate-500">Template direction</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{template.visualDirection}</p>
        </div>
      </aside>
    </div>
  );
}
