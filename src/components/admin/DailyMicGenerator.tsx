"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { PollQuestion } from "@/lib/pollBank";
import {
  DAILY_MIC_BRAND,
  DAILY_MIC_TEMPLATES,
  type DailyMicTemplate,
  type NormalizedBox,
} from "@/lib/dailyMicBrand";

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

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (!line || ctx.measureText(next).width <= maxWidth) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function imageRect(image: HTMLImageElement, width: number, height: number) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  return { x: (width - drawWidth) / 2, y: (height - drawHeight) / 2, width: drawWidth, height: drawHeight };
}

function absoluteBox(box: NormalizedBox, master: ReturnType<typeof imageRect>) {
  return { x: master.x + box.x * master.width, y: master.y + box.y * master.height, width: box.width * master.width, height: box.height * master.height };
}

function paintCleanPanel(ctx: CanvasRenderingContext2D, box: ReturnType<typeof absoluteBox>) {
  ctx.save();
  ctx.fillStyle = "#f4efe6";
  ctx.fillRect(box.x + 3, box.y + 3, box.width - 6, box.height - 6);
  ctx.restore();
}

function drawFitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  box: ReturnType<typeof absoluteBox>,
  options?: { maxLines?: number; align?: "left" | "center"; minSize?: number; maxSize?: number },
) {
  const maxLines = options?.maxLines ?? 4;
  const align = options?.align ?? "center";
  const minSize = options?.minSize ?? 20;
  const maxSize = options?.maxSize ?? 52;
  const inset = Math.max(16, box.width * 0.055);
  const usableWidth = box.width - inset * 2;
  const usableHeight = box.height - inset * 1.4;
  let size = maxSize;
  let lines: string[] = [];

  while (size >= minSize) {
    ctx.font = `900 ${size}px Arial, Helvetica, sans-serif`;
    lines = wrapLines(ctx, text, usableWidth);
    const lineHeight = size * 1.08;
    if (lines.length <= maxLines && lines.length * lineHeight <= usableHeight) break;
    size -= 2;
  }
  if (!lines.length) return;
  lines = lines.slice(0, maxLines);
  const lineHeight = size * 1.08;
  const blockHeight = lines.length * lineHeight;
  const top = box.y + (box.height - blockHeight) / 2 + size * 0.82;

  ctx.fillStyle = "#101014";
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  lines.forEach((line, index) => {
    ctx.fillText(line, align === "center" ? box.x + box.width / 2 : box.x + inset, top + index * lineHeight);
  });
  ctx.textAlign = "left";
}

function panelCopy(poll: PollQuestion) {
  const question = poll.socialQuestion || poll.question;
  if (poll.options.length <= 1) return question;
  return `${question}\n${poll.options.map((option, index) => `${index + 1}. ${option.label}`).join("  •  ")}`;
}

async function renderDailyMicImage(poll: PollQuestion, template: DailyMicTemplate, format: "feed" | "story") {
  const { width, height } = CARD_DIMENSIONS[format];
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable in this browser.");

  const [masterImage, officialWordmark] = await Promise.all([
    loadCanvasImage(template.masterPath),
    loadCanvasImage(DAILY_MIC_BRAND.wordmark),
  ]);

  ctx.fillStyle = DAILY_MIC_BRAND.ink;
  ctx.fillRect(0, 0, width, height);

  if (format === "story") {
    const coverScale = Math.max(width / masterImage.naturalWidth, height / masterImage.naturalHeight);
    const bgW = masterImage.naturalWidth * coverScale;
    const bgH = masterImage.naturalHeight * coverScale;
    ctx.save();
    ctx.globalAlpha = 0.24;
    ctx.filter = "blur(28px) brightness(.55)";
    ctx.drawImage(masterImage, (width - bgW) / 2, (height - bgH) / 2, bgW, bgH);
    ctx.restore();
  }

  const master = imageRect(masterImage, width, height);
  ctx.drawImage(masterImage, master.x, master.y, master.width, master.height);

  const brandBandHeight = master.height * 0.075;
  const brandGradient = ctx.createLinearGradient(0, master.y, 0, master.y + brandBandHeight * 1.35);
  brandGradient.addColorStop(0, "rgba(4,4,8,.98)");
  brandGradient.addColorStop(0.72, "rgba(4,4,8,.86)");
  brandGradient.addColorStop(1, "rgba(4,4,8,0)");
  ctx.fillStyle = brandGradient;
  ctx.fillRect(master.x, master.y, master.width, brandBandHeight * 1.4);
  const logoWidth = Math.min(master.width * 0.34, 390);
  const logoHeight = logoWidth * (officialWordmark.naturalHeight / officialWordmark.naturalWidth);
  ctx.drawImage(officialWordmark, master.x + (master.width - logoWidth) / 2, master.y + Math.max(10, master.height * 0.012), logoWidth, logoHeight);

  if (template.questionBox) {
    const box = absoluteBox(template.questionBox, master);
    if (template.clearDynamicBoxes) paintCleanPanel(ctx, box);
    drawFitText(ctx, panelCopy(poll), box, {
      maxLines: template.mode === "question-panel" ? 6 : 4,
      minSize: 18,
      maxSize: template.mode === "question-panel" ? 42 : 46,
    });
  }

  if (template.optionBoxes?.length) {
    template.optionBoxes.forEach((normalized, index) => {
      const option = poll.options[index];
      if (!option) return;
      const box = absoluteBox(normalized, master);
      if (template.clearDynamicBoxes) paintCleanPanel(ctx, box);
      drawFitText(ctx, option.label, box, {
        maxLines: 4,
        minSize: 18,
        maxSize: template.optionBoxes!.length === 4 ? 34 : 44,
      });
    });
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob?.type === "image/png" ? resolve(blob) : reject(new Error("Could not create a PNG image.")), "image/png");
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

function PreviewText({ poll, template }: { poll: PollQuestion; template: DailyMicTemplate }) {
  const renderBox = (box: NormalizedBox, text: string, clear = false) => (
    <div
      className={`absolute flex items-center justify-center overflow-hidden px-[2.2%] text-center font-black leading-[1.04] text-zinc-950 ${clear ? "bg-[#f4efe6]" : ""}`}
      style={{ left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.width * 100}%`, height: `${box.height * 100}%`, fontSize: "clamp(8px,2.1vw,18px)" }}
    >
      {text}
    </div>
  );

  return (
    <>
      {template.questionBox && renderBox(template.questionBox, panelCopy(poll), Boolean(template.clearDynamicBoxes))}
      {template.optionBoxes?.map((box, index) => poll.options[index] ? (
        <div key={poll.options[index].id}>{renderBox(box, poll.options[index].label, Boolean(template.clearDynamicBoxes))}</div>
      ) : null)}
    </>
  );
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

  async function buildImage() {
    return renderDailyMicImage(poll, template, format);
  }

  async function downloadImage() {
    setExporting(true);
    setExportMessage(null);
    try {
      const blob = await buildImage();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = imageFilename();
      link.type = "image/png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      setExportMessage(`Saved ${imageFilename()} to Downloads.`);
    } catch (error) {
      console.error(error);
      setExportMessage("Template master is missing or the image could not be created.");
    } finally {
      setExporting(false);
    }
  }

  async function shareImage() {
    setExporting(true);
    setExportMessage(null);
    try {
      const blob = await buildImage();
      const file = new File([blob], imageFilename(), { type: "image/png" });
      const shareData = { files: [file], title: `${template.label} | SingHUB`, text: caption };
      if (!navigator.share || !navigator.canShare?.(shareData)) {
        setExportMessage("This browser cannot hand image files to the share sheet. Use Download image.");
        return;
      }
      await navigator.share(shareData);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error(error);
      setExportMessage("Could not share the image. Use Download image instead.");
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
          <div className={`relative w-full max-w-[540px] overflow-hidden bg-black ${format === "feed" ? "aspect-[4/5]" : "aspect-[9/16]"}`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative max-h-full max-w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={template.masterPath} alt={`${template.label} approved master`} className="max-h-full max-w-full object-contain" />
                <PreviewText poll={poll} template={template} />
                <div className="absolute left-0 right-0 top-0 h-[8%] bg-gradient-to-b from-black via-black/90 to-transparent" />
                <Image src={DAILY_MIC_BRAND.wordmark} alt={DAILY_MIC_BRAND.wordmarkAlt} width={2400} height={600} className="absolute left-1/2 top-[1.2%] z-10 h-auto w-[34%] -translate-x-1/2 object-contain" priority />
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">The artwork is fixed by category. Only the daily question/options and the official SingHUB wordmark are composited on export.</p>
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
          <p className="text-xs font-black uppercase tracking-[.18em] text-slate-500">Locked master</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{template.visualDirection}</p>
        </div>
      </aside>
    </div>
  );
}
