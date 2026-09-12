"use client";

import { toJpeg } from "html-to-image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DailyMicQuestionPanel } from "@/components/home/DailyMicQuestionPanel";
import { DAILY_MIC_BRAND } from "@/lib/dailyMicBrand";
import type { PollQuestion } from "@/lib/pollBank";

const CARD_DIMENSIONS = {
  feed: { width: 1080, height: 1350, captureWidth: 540, captureHeight: 675 },
  story: { width: 1080, height: 1920, captureWidth: 540, captureHeight: 960 },
} as const;

const CATEGORY_LABELS: Record<PollQuestion["category"], string> = {
  "karaoke-court": "Karaoke Court",
  "kill-one": "Kill One",
  "this-or-that": "This / That",
  "song-battle": "Song Battle",
  "would-you-rather": "Would You Rather",
  confessions: "Confessions",
  "open-mic": "Open Mic",
  "wild-card": "Wild Card",
};

type CardFormat = keyof typeof CARD_DIMENSIONS;

function captionVariants(poll: PollQuestion) {
  const options = poll.options.length > 1
    ? `\n\n${poll.options.map((option) => option.label).join(" • ")}`
    : "";
  const question = poll.socialQuestion || poll.question;

  return {
    Punchy: `${poll.socialHook}\n\n${question}${options}\n\nPick one. Then go see what everyone else chose.\n\nVote + see results → ${DAILY_MIC_BRAND.voteUrl}`,
    Funny: `${poll.socialHook}\n\n${question}${options}\n\nMake your choice. Defend the damage in the comments.\n\nVote + see results → ${DAILY_MIC_BRAND.voteUrl}`,
    "Argument Starter": `${poll.socialHook}\n\n${question}${options}\n\nVote first. Then make your case in the comments.\n\nVote + see results → ${DAILY_MIC_BRAND.voteUrl}`,
  };
}

function dataUrlToBlob(dataUrl: string) {
  const [metadata, encoded] = dataUrl.split(",");
  const mimeType = metadata.match(/data:(.*?);/)?.[1] || "image/png";
  const binary = window.atob(encoded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

async function waitForCaptureAssets(node: HTMLElement) {
  await Promise.race([
    document.fonts.ready,
    new Promise<void>((resolve) => window.setTimeout(resolve, 5000)),
  ]);

  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map(async (image) => {
      if (image.complete && image.naturalWidth > 0) return;
      if (image.complete) {
        throw new Error(`Could not load ${image.currentSrc || image.src}`);
      }
      await new Promise<void>((resolve, reject) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener(
          "error",
          () => reject(new Error(`Could not load ${image.currentSrc || image.src}`)),
          { once: true },
        );
      });
    }),
  );
}

function downloadFile(file: File) {
  const objectUrl = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

function SocialPollCard({ poll, format }: { poll: PollQuestion; format: CardFormat }) {
  const category = CATEGORY_LABELS[poll.category];
  const isStory = format === "story";

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[linear-gradient(145deg,#020617,#170d2e_52%,#083047)] p-8 text-white">
      <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="absolute -right-24 bottom-24 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />

      <div className="relative flex items-start justify-between gap-5 border-b border-white/12 pb-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={DAILY_MIC_BRAND.wordmark} alt={DAILY_MIC_BRAND.wordmarkAlt} className="h-auto w-48 object-contain" />
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-fuchsia-300">Daily Mic</p>
          <p className="mt-1 text-sm font-black text-white">{category}</p>
        </div>
      </div>

      <div className={`relative flex flex-1 items-center ${isStory ? "py-14" : "py-8"}`}>
        <DailyMicQuestionPanel
          question={poll.socialQuestion || poll.question}
          helper={poll.helper}
          options={poll.options}
          className="w-full border-fuchsia-300/20 bg-slate-950/75 shadow-[0_28px_80px_rgba(2,6,23,0.48)]"
        />
      </div>

      <div className="relative border-t border-white/12 pt-5 text-center">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Vote and see where San Diego lands</p>
        <p className="mt-2 text-lg font-black text-white">SINGHUB.APP/VOTE</p>
      </div>
    </div>
  );
}

export function DailyMicGenerator({ poll }: { poll: PollQuestion }) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [format, setFormat] = useState<CardFormat>("feed");
  const [captionStyle, setCaptionStyle] = useState<"Punchy" | "Funny" | "Argument Starter">("Punchy");
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const dimensions = CARD_DIMENSIONS[format];
  const captions = useMemo(() => captionVariants(poll), [poll]);
  const caption = captions[captionStyle];

  const renderImage = useCallback(async () => {
    const node = captureRef.current;
    if (!node) throw new Error("The Daily Mic card is not ready yet.");

    await waitForCaptureAssets(node);
    return toJpeg(node, {
      cacheBust: true,
      backgroundColor: "#020617",
      pixelRatio: 2,
      quality: 0.95,
      width: dimensions.captureWidth,
      height: dimensions.captureHeight,
    });
  }, [dimensions.captureHeight, dimensions.captureWidth]);

  useEffect(() => {
    let active = true;

    const timeout = window.setTimeout(() => {
      setPreviewUrl(null);
      setPreviewError(null);
      renderImage()
        .then((dataUrl) => {
          if (active) setPreviewUrl(dataUrl);
        })
        .catch((error) => {
          console.error("Daily Mic interface capture failed", error);
          if (active) setPreviewError("Could not capture the live poll interface.");
        });
    }, 100);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [format, poll.slug, renderImage]);

  function imageFilename() {
    return `SingHUB-Daily-Mic-${poll.slug}-${format}-${dimensions.width}x${dimensions.height}.jpg`;
  }

  async function buildImageFile() {
    const dataUrl = await renderImage();
    return new File([dataUrlToBlob(dataUrl)], imageFilename(), { type: "image/jpeg" });
  }

  async function downloadImage() {
    setExporting(true);
    setExportMessage(null);

    try {
      const file = await buildImageFile();
      downloadFile(file);
      setExportMessage(
        `Downloaded ${file.name}. Look in your browser's Downloads folder.`,
      );
    } catch (error) {
      console.error("Daily Mic image download failed", error);
      setExportMessage("Could not capture or download the poll image.");
    } finally {
      setExporting(false);
    }
  }

  async function shareImage() {
    setExporting(true);
    setExportMessage(null);

    try {
      const file = await buildImageFile();
      const shareData = { files: [file], title: "Daily Mic | SingHUB" };
      if (!navigator.share || !navigator.canShare?.(shareData)) {
        downloadFile(file);
        setExportMessage(
          "This browser cannot open a file share sheet, so the JPG was downloaded instead.",
        );
        return;
      }
      await navigator.share(shareData);
      setExportMessage("JPG shared from your device.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("Daily Mic image sharing failed", error);
      setExportMessage("Could not share the poll image. Use Download image.");
    } finally {
      setExporting(false);
    }
  }

  function openFullSizeImage() {
    if (!previewUrl) {
      setExportMessage("The full-size preview is still being created.");
      return;
    }

    const objectUrl = URL.createObjectURL(dataUrlToBlob(previewUrl));
    const opened = window.open(objectUrl, "_blank", "noopener,noreferrer");
    if (!opened) {
      URL.revokeObjectURL(objectUrl);
      setExportMessage(
        "Your browser blocked the image tab. Use Download JPG instead.",
      );
      return;
    }
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 5 * 60_000);
  }

  async function copyCaption() {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <div className="fixed left-[-10000px] top-0" aria-hidden="true">
        <div
          ref={captureRef}
          style={{ width: dimensions.captureWidth, height: dimensions.captureHeight }}
        >
          <SocialPollCard poll={poll} format={format} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-fuchsia-300">Today&apos;s actual poll</p>
              <h2 className="mt-2 text-2xl font-black">Homepage interface capture</h2>
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
                <img src={previewUrl} alt="Daily Mic homepage poll export preview" className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-sm font-semibold text-slate-400">
                  {previewError ?? "Capturing the live poll interface…"}
                </div>
              )}
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Preview, download, and share use the same poll fields shown on the homepage. The exported JPG is exactly {dimensions.width}×{dimensions.height}px.
          </p>
          {previewUrl ? (
            <button
              type="button"
              onClick={openFullSizeImage}
              className="mt-3 inline-flex text-xs font-black text-cyan-200 underline decoration-cyan-300/40 underline-offset-4"
            >
              Open full-size JPG
            </button>
          ) : null}
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
              {exporting ? "Creating JPG..." : "Download JPG"}
            </button>
            <button type="button" onClick={shareImage} disabled={exporting} className="min-h-11 rounded-xl border border-fuchsia-300/40 px-4 text-sm font-black text-fuchsia-100 disabled:opacity-50">
              Share JPG
            </button>
            <button type="button" onClick={copyCaption} className="min-h-11 rounded-xl border border-white/15 px-4 text-sm font-black sm:col-span-2">
              {copied ? "Caption copied" : "Copy caption"}
            </button>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Instagram controls its own share-sheet options. If it only offers Messages, download the JPG and choose it inside Instagram when creating the post.
          </p>
          {exportMessage && <p className="mt-3 text-sm font-semibold text-cyan-200">{exportMessage}</p>}
        </aside>
      </div>
    </>
  );
}
