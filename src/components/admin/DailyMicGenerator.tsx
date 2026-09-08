"use client";

import { Archivo_Black } from "next/font/google";
import { useEffect, useMemo, useState } from "react";
import type { PollQuestion } from "@/lib/pollBank";
import {
  DAILY_MIC_BRAND,
  DAILY_MIC_TEMPLATES,
  type DailyMicTemplate,
  type NormalizedBox,
} from "@/lib/dailyMicBrand";

const archivoBlack = Archivo_Black({ weight: "400", subsets: ["latin"] });
const DISPLAY_FONT = archivoBlack.style.fontFamily;
const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

const CARD_DIMENSIONS = {
  feed: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
} as const;

type CardFormat = keyof typeof CARD_DIMENSIONS;
type AbsoluteBox = { x: number; y: number; width: number; height: number };

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
  return {
    x: (width - drawWidth) / 2,
    y: (height - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  };
}

function absoluteBox(box: NormalizedBox, master: ReturnType<typeof imageRect>): AbsoluteBox {
  return {
    x: master.x + box.x * master.width,
    y: master.y + box.y * master.height,
    width: box.width * master.width,
    height: box.height * master.height,
  };
}

function insetBox(box: AbsoluteBox, insetX: number, insetY = insetX): AbsoluteBox {
  return {
    x: box.x + insetX,
    y: box.y + insetY,
    width: Math.max(1, box.width - insetX * 2),
    height: Math.max(1, box.height - insetY * 2),
  };
}

function roundedRect(ctx: CanvasRenderingContext2D, box: AbsoluteBox, radius: number) {
  const r = Math.min(radius, box.width / 2, box.height / 2);
  ctx.beginPath();
  ctx.moveTo(box.x + r, box.y);
  ctx.arcTo(box.x + box.width, box.y, box.x + box.width, box.y + box.height, r);
  ctx.arcTo(box.x + box.width, box.y + box.height, box.x, box.y + box.height, r);
  ctx.arcTo(box.x, box.y + box.height, box.x, box.y, r);
  ctx.arcTo(box.x, box.y, box.x + box.width, box.y, r);
  ctx.closePath();
}

function paintCleanPanel(ctx: CanvasRenderingContext2D, box: AbsoluteBox) {
  ctx.save();
  ctx.fillStyle = DAILY_MIC_BRAND.paper;
  ctx.fillRect(box.x + 3, box.y + 3, box.width - 6, box.height - 6);
  ctx.restore();
}

function drawFitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  box: AbsoluteBox,
  options?: {
    maxLines?: number;
    align?: "left" | "center";
    minSize?: number;
    maxSize?: number;
    lineHeight?: number;
    padRatio?: number;
    color?: string;
  },
) {
  const maxLines = options?.maxLines ?? 4;
  const align = options?.align ?? "center";
  const minSize = options?.minSize ?? 20;
  const maxSize = options?.maxSize ?? 52;
  const lineHeightRatio = options?.lineHeight ?? 1.06;
  const inset = Math.max(8, box.width * (options?.padRatio ?? 0.04));
  const usableWidth = Math.max(1, box.width - inset * 2);
  const usableHeight = Math.max(1, box.height - inset * 1.1);

  let size = maxSize;
  let lines: string[] = [];
  while (size >= minSize) {
    ctx.font = `${size}px ${DISPLAY_FONT}`;
    lines = wrapLines(ctx, text, usableWidth);
    const lineHeight = size * lineHeightRatio;
    if (lines.length <= maxLines && lines.length * lineHeight <= usableHeight) break;
    size -= 1;
  }
  if (!lines.length) return;

  const lineHeight = size * lineHeightRatio;
  const blockHeight = lines.length * lineHeight;
  const firstBaseline = box.y + (box.height - blockHeight) / 2 + size * 0.83;

  ctx.fillStyle = options?.color ?? "#101014";
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  lines.slice(0, maxLines).forEach((line, index) => {
    ctx.fillText(
      line,
      align === "center" ? box.x + box.width / 2 : box.x + inset,
      firstBaseline + index * lineHeight,
    );
  });
  ctx.textAlign = "left";
}

function drawWildCardPanel(ctx: CanvasRenderingContext2D, poll: PollQuestion, box: AbsoluteBox) {
  const question = poll.socialQuestion || poll.question;
  const choices = poll.options.filter((option) => option.label.trim()).slice(0, 4);
  const panel = insetBox(box, box.width * 0.035, box.height * 0.06);
  const questionHeight = panel.height * 0.40;
  const gap = panel.height * 0.035;
  const questionBox: AbsoluteBox = {
    x: panel.x,
    y: panel.y,
    width: panel.width,
    height: questionHeight,
  };
  const gridBox: AbsoluteBox = {
    x: panel.x,
    y: panel.y + questionHeight + gap,
    width: panel.width,
    height: panel.height - questionHeight - gap,
  };

  drawFitText(ctx, question, questionBox, {
    maxLines: 3,
    minSize: Math.floor(box.width * 0.040),
    maxSize: Math.floor(box.width * 0.072),
    lineHeight: 0.98,
    padRatio: 0.025,
  });

  if (choices.length < 2) return;

  const colGap = gridBox.width * 0.025;
  const rowGap = gridBox.height * 0.12;
  const cellWidth = (gridBox.width - colGap) / 2;
  const cellHeight = (gridBox.height - rowGap) / 2;

  choices.forEach((choice, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const cell: AbsoluteBox = {
      x: gridBox.x + col * (cellWidth + colGap),
      y: gridBox.y + row * (cellHeight + rowGap),
      width: cellWidth,
      height: cellHeight,
    };

    ctx.save();
    roundedRect(ctx, cell, cell.height * 0.30);
    ctx.fillStyle = "rgba(255,255,255,0.42)";
    ctx.fill();
    ctx.lineWidth = Math.max(2, box.width * 0.0026);
    ctx.strokeStyle = "#a80064";
    ctx.stroke();

    const circleRadius = cell.height * 0.34;
    const circleX = cell.x + cell.height * 0.52;
    const circleY = cell.y + cell.height / 2;
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#cf0a67";
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${Math.max(16, circleRadius * 1.18)}px ${DISPLAY_FONT}`;
    ctx.fillText(OPTION_LETTERS[index] ?? String.fromCharCode(65 + index), circleX, circleY + 1);

    const textBox: AbsoluteBox = {
      x: cell.x + cell.height * 0.96,
      y: cell.y,
      width: cell.width - cell.height * 1.06,
      height: cell.height,
    };
    drawFitText(ctx, choice.label, textBox, {
      maxLines: 2,
      align: "left",
      minSize: Math.floor(box.width * 0.022),
      maxSize: Math.floor(box.width * 0.038),
      lineHeight: 0.98,
      padRatio: 0.02,
    });
    ctx.restore();
  });
}

function drawQuestionPanel(ctx: CanvasRenderingContext2D, poll: PollQuestion, box: AbsoluteBox) {
  const question = poll.socialQuestion || poll.question;
  const choices = poll.options.filter((option) => option.label.trim());
  const outer = insetBox(box, box.width * 0.03, box.height * 0.06);

  if (choices.length <= 1) {
    drawFitText(ctx, question, outer, {
      maxLines: 5,
      minSize: Math.floor(box.width * 0.035),
      maxSize: Math.floor(box.width * 0.075),
      lineHeight: 1.0,
      padRatio: 0.02,
    });
    return;
  }

  const questionHeight = outer.height * 0.48;
  const questionBox: AbsoluteBox = { x: outer.x, y: outer.y, width: outer.width, height: questionHeight };
  const choicesBox: AbsoluteBox = {
    x: outer.x,
    y: outer.y + questionHeight,
    width: outer.width,
    height: outer.height - questionHeight,
  };

  drawFitText(ctx, question, questionBox, {
    maxLines: 4,
    minSize: Math.floor(box.width * 0.032),
    maxSize: Math.floor(box.width * 0.060),
    lineHeight: 1.0,
    padRatio: 0.02,
  });

  const colGap = choicesBox.width * 0.025;
  const rowGap = choicesBox.height * 0.08;
  const rows = Math.ceil(choices.length / 2);
  const cellWidth = (choicesBox.width - colGap) / 2;
  const cellHeight = (choicesBox.height - rowGap * (rows - 1)) / rows;

  choices.forEach((choice, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const cell: AbsoluteBox = {
      x: choicesBox.x + col * (cellWidth + colGap),
      y: choicesBox.y + row * (cellHeight + rowGap),
      width: cellWidth,
      height: cellHeight,
    };
    drawFitText(ctx, `${OPTION_LETTERS[index] ?? String.fromCharCode(65 + index)}. ${choice.label}`, cell, {
      maxLines: 2,
      minSize: Math.floor(box.width * 0.021),
      maxSize: Math.floor(box.width * 0.036),
      lineHeight: 1.0,
      padRatio: 0.02,
    });
  });
}

async function renderDailyMicImage(poll: PollQuestion, template: DailyMicTemplate, format: CardFormat) {
  const { width, height } = CARD_DIMENSIONS[format];
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable in this browser.");

  await document.fonts.ready;
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
  ctx.drawImage(
    officialWordmark,
    master.x + (master.width - logoWidth) / 2,
    master.y + Math.max(10, master.height * 0.012),
    logoWidth,
    logoHeight,
  );

  if (template.questionBox) {
    const box = absoluteBox(template.questionBox, master);
    if (template.clearDynamicBoxes) paintCleanPanel(ctx, box);
    if (poll.category === "wild-card") drawWildCardPanel(ctx, poll, box);
    else if (template.mode === "question-panel") drawQuestionPanel(ctx, poll, box);
    else {
      drawFitText(ctx, poll.socialQuestion || poll.question, box, {
        maxLines: 4,
        minSize: Math.floor(box.width * 0.040),
        maxSize: Math.floor(box.width * 0.075),
        lineHeight: 1.0,
      });
    }
  }

  if (template.optionBoxes?.length) {
    template.optionBoxes.forEach((normalized, index) => {
      const option = poll.options[index];
      if (!option) return;
      const box = absoluteBox(normalized, master);
      if (template.clearDynamicBoxes) paintCleanPanel(ctx, box);
      drawFitText(ctx, option.label, box, {
        maxLines: 4,
        minSize: Math.floor(box.width * 0.060),
        maxSize: Math.floor(box.width * 0.120),
        lineHeight: 1.0,
        padRatio: 0.04,
      });
    });
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob?.type === "image/png" ? resolve(blob) : reject(new Error("Could not create a PNG image."))),
      "image/png",
    );
  });
}

function captionVariants(poll: PollQuestion) {
  const options = poll.options.length > 1
    ? `\n\n${poll.options.map((o, index) => `${OPTION_LETTERS[index] ?? String.fromCharCode(65 + index)}. ${o.label}`).join(" • ")}`
    : "";
  const question = poll.socialQuestion || poll.question;
  return {
    Punchy: `${poll.socialHook}\n\n${question}${options}\n\nPick one. Then go see what everyone else chose.\n\nVote + see results → ${DAILY_MIC_BRAND.voteUrl}`,
    Funny: `${poll.socialHook}\n\n${question}${options}\n\nMake your choice. Defend the damage in the comments.\n\nVote + see results → ${DAILY_MIC_BRAND.voteUrl}`,
    "Argument Starter": `${poll.socialHook}\n\n${question}${options}\n\nVote first. Then make your case in the comments.\n\nVote + see results → ${DAILY_MIC_BRAND.voteUrl}`,
  };
}

export function DailyMicGenerator({ poll }: { poll: PollQuestion }) {
  const [format, setFormat] = useState<CardFormat>("feed");
  const [captionStyle, setCaptionStyle] = useState<"Punchy" | "Funny" | "Argument Starter">("Punchy");
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const template = DAILY_MIC_TEMPLATES[poll.category];
  const captions = useMemo(() => captionVariants(poll), [poll]);
  const caption = captions[captionStyle];

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setPreviewUrl(null);
    setPreviewError(null);

    renderDailyMicImage(poll, template, format)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      })
      .catch((error) => {
        console.error(error);
        if (active) setPreviewError("Could not render the Daily Mic preview.");
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [poll, template, format]);

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
              <button
                key={value}
                type="button"
                onClick={() => setFormat(value)}
                className={`rounded-lg px-3 py-2 capitalize ${format === value ? "bg-white text-black" : "text-slate-300"}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-center overflow-hidden rounded-2xl bg-slate-950 p-4">
          <div className={`relative w-full max-w-[540px] overflow-hidden bg-black ${format === "feed" ? "aspect-[4/5]" : "aspect-[9/16]"}`}>
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt={`${template.label} rendered preview`} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center text-sm font-semibold text-slate-400">
                {previewError ?? "Rendering the exact export preview…"}
              </div>
            )}
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">Preview, Download, and Share now use the exact same canvas renderer.</p>
      </section>

      <aside className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
        <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-300">Caption bait</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["Punchy", "Funny", "Argument Starter"] as const).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setCaptionStyle(style)}
              className={`rounded-full border px-3 py-2 text-xs font-black ${captionStyle === style ? "border-fuchsia-300 bg-fuchsia-300/15 text-white" : "border-white/10 text-slate-400"}`}
            >
              {style}
            </button>
          ))}
        </div>
        <textarea readOnly value={caption} className="mt-4 min-h-72 w-full rounded-2xl border border-white/10 bg-slate-950 p-4 text-sm leading-6 text-slate-200" />
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={downloadImage} disabled={exporting} className="min-h-11 rounded-xl bg-fuchsia-300 px-4 text-sm font-black text-slate-950 disabled:opacity-50">
            {exporting ? "Creating image..." : "Download image"}
          </button>
          <button type="button" onClick={shareImage} disabled={exporting} className="min-h-11 rounded-xl border border-fuchsia-300/40 px-4 text-sm font-black text-fuchsia-100 disabled:opacity-50">
            Share image
          </button>
          <button type="button" onClick={copyCaption} className="min-h-11 rounded-xl border border-white/15 px-4 text-sm font-black sm:col-span-2">
            {copied ? "Caption copied" : "Copy caption"}
          </button>
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
