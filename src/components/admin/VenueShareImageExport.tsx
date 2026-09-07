"use client";

import { useState } from "react";
import type { KaraokeEventListing, VenueListing } from "@/types";

type Props = {
  venues: VenueListing[];
  events: KaraokeEventListing[];
};

const WIDTH = 1080;
const HEIGHT = 1350;
const DEMO_IMAGE_URL =
  "https://res.cloudinary.com/dy3lyejkk/image/upload/v1781683694/ChatGPT_Image_Jun_17_2026_01_05_26_AM_sjmyq4.png";

const DAY_ORDER: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

function cleanValue(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed || /^(tbd|unknown|-|n\/a)$/i.test(trimmed)) return undefined;
  return trimmed;
}

function safeName(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
}

function getSelectedSlug() {
  return document.querySelector<HTMLSelectElement>(
    ".venue-pdf-screen-only select",
  )?.value;
}

function getDayOrder(day: string) {
  const normalized = day.toLowerCase();
  const match = Object.keys(DAY_ORDER).find((name) => normalized.includes(name));
  return match ? DAY_ORDER[match] : 99;
}

function venueEvents(events: KaraokeEventListing[], venueSlug: string) {
  return events
    .filter((event) => event.venueSlug === venueSlug && event.eventId !== "event-0020")
    .sort((a, b) => getDayOrder(a.karaokeDay || "") - getDayOrder(b.karaokeDay || ""));
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string,
  stroke?: string,
  lineWidth = 1,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 4,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
      continue;
    }
    if (line) lines.push(line);
    line = word;
    if (lines.length === maxLines - 1) break;
  }
  if (line && lines.length < maxLines) lines.push(line);

  if (lines.length === maxLines && words.join(" ") !== lines.join(" ")) {
    let finalLine = lines[maxLines - 1];
    while (ctx.measureText(`${finalLine}...`).width > maxWidth && finalLine.includes(" ")) {
      finalLine = finalLine.slice(0, finalLine.lastIndexOf(" "));
    }
    lines[maxLines - 1] = `${finalLine}...`;
  }

  lines.forEach((item, index) => ctx.fillText(item, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

async function loadImage(url: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  );
}

function scheduleSummary(events: KaraokeEventListing[]) {
  if (events.length === 0) return "Karaoke schedule is being confirmed.";

  const starts = Array.from(new Set(events.map((event) => cleanValue(event.startTime)).filter(Boolean)));
  const ends = Array.from(new Set(events.map((event) => cleanValue(event.endTime)).filter(Boolean)));
  if (events.length >= 5 && starts.length === 1 && ends.length === 1) {
    return `${events.length} nights/week | ${starts[0]} - ${ends[0]}`;
  }

  return events
    .slice(0, 4)
    .map((event) =>
      [event.karaokeDay, cleanValue(event.startTime), cleanValue(event.endTime)]
        .filter(Boolean)
        .join(" | "),
    )
    .join("  •  ");
}

function hostSummary(events: KaraokeEventListing[]) {
  const hosts = Array.from(
    new Set(events.map((event) => cleanValue(event.hostName)).filter(Boolean)),
  );
  return hosts.length ? hosts.join(", ") : "Host details being confirmed";
}

function enhancedItems(venue: VenueListing) {
  return [
    ["Weekly specials", cleanValue(venue.specials) || "Karaoke-night deals + recurring offers"],
    ["Happy hour", cleanValue(venue.happyHour) || "Times, offers + recurring deals"],
    ["Food highlights", cleanValue(venue.foodHighlights) || "Kitchen hours, late-night bites + signatures"],
    ["Drink highlights", cleanValue(venue.drinkHighlights) || "Signature drinks, drafts, shots + specials"],
    ["Parking / arrival", cleanValue(venue.parkingInfo) || "Parking, rideshare + first-visit arrival tips"],
    ["Events / booking", cleanValue(venue.bookingContact) || "Event links, groups + booking contact"],
  ];
}

async function buildJpg(
  venue: VenueListing,
  events: KaraokeEventListing[],
) {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable in this browser.");

  const navy = "#0f172a";
  const slate = "#475569";
  const cyan = "#06b6d4";
  const purple = "#a855f7";
  const paper = "#f8fafc";
  const border = "#cbd5e1";

  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  roundedRect(ctx, 54, 48, 972, 8, 4, navy);

  ctx.fillStyle = cyan;
  ctx.font = "900 22px Arial, sans-serif";
  ctx.fillText("SINGHUB FOUNDING VENUE PILOT", 58, 94);

  ctx.fillStyle = navy;
  ctx.font = "900 48px Arial, sans-serif";
  const titleBottom = wrapText(
    ctx,
    `${venue.venueName} + SingHUB`,
    58,
    154,
    900,
    54,
    2,
  );

  ctx.fillStyle = slate;
  ctx.font = "500 24px Arial, sans-serif";
  ctx.fillText("A venue profile preview built for singers deciding where to go.", 58, titleBottom + 12);

  const currentY = titleBottom + 48;
  roundedRect(ctx, 58, currentY, 964, 252, 24, "#ffffff", border, 3);

  roundedRect(ctx, 82, currentY + 22, 260, 38, 19, "#ffffff", border, 2);
  ctx.fillStyle = navy;
  ctx.font = "900 17px Arial, sans-serif";
  ctx.fillText("CURRENT FREE PROFILE", 102, currentY + 48);

  ctx.fillStyle = navy;
  ctx.font = "900 32px Arial, sans-serif";
  ctx.fillText(venue.venueName, 82, currentY + 94);

  ctx.fillStyle = slate;
  ctx.font = "700 19px Arial, sans-serif";
  const location = [venue.neighborhood, venue.address].filter(Boolean).join(" | ");
  wrapText(ctx, location, 82, currentY + 126, 890, 25, 2);

  ctx.fillStyle = navy;
  ctx.font = "900 18px Arial, sans-serif";
  ctx.fillText("VERIFIED KARAOKE", 82, currentY + 177);

  ctx.fillStyle = navy;
  ctx.font = "700 21px Arial, sans-serif";
  wrapText(ctx, scheduleSummary(events), 82, currentY + 210, 560, 26, 2);

  ctx.fillStyle = slate;
  ctx.font = "700 17px Arial, sans-serif";
  wrapText(ctx, `KJ / Host: ${hostSummary(events)}`, 665, currentY + 210, 320, 23, 2);

  const enhancedY = currentY + 282;
  roundedRect(ctx, 58, enhancedY, 964, 704, 28, "#ffffff", "#c084fc", 4);

  const imageX = 78;
  const imageY = enhancedY + 20;
  const imageW = 924;
  const imageH = 300;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(imageX, imageY, imageW, imageH, 22);
  ctx.clip();
  const hero = await loadImage(cleanValue(venue.bannerImageUrl) || DEMO_IMAGE_URL);
  if (hero) {
    drawCover(ctx, hero, imageX, imageY, imageW, imageH);
  } else {
    ctx.fillStyle = navy;
    ctx.fillRect(imageX, imageY, imageW, imageH);
  }
  const gradient = ctx.createLinearGradient(0, imageY, 0, imageY + imageH);
  gradient.addColorStop(0, "rgba(15,23,42,0.12)");
  gradient.addColorStop(1, "rgba(15,23,42,0.92)");
  ctx.fillStyle = gradient;
  ctx.fillRect(imageX, imageY, imageW, imageH);
  ctx.restore();

  roundedRect(ctx, 102, imageY + 24, 310, 42, 21, "rgba(15,23,42,0.82)", "#d8b4fe", 2);
  ctx.fillStyle = "#f5d0fe";
  ctx.font = "900 17px Arial, sans-serif";
  ctx.fillText("ENHANCED PROFILE EXAMPLE", 123, imageY + 52);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 42px Arial, sans-serif";
  ctx.fillText("A richer venue presence", 102, imageY + 232);
  ctx.font = "700 20px Arial, sans-serif";
  ctx.fillStyle = "#cffafe";
  ctx.fillText("Your imagery becomes the visual anchor, not a decoration.", 102, imageY + 270);

  const items = enhancedItems(venue);
  const gridY = imageY + imageH + 24;
  const cardW = 444;
  const cardH = 92;
  items.forEach(([label, copy], index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 78 + column * 468;
    const y = gridY + row * 108;
    roundedRect(ctx, x, y, cardW, cardH, 18, "#fafafa", "#e2e8f0", 2);
    ctx.fillStyle = purple;
    ctx.font = "900 16px Arial, sans-serif";
    ctx.fillText(label.toUpperCase(), x + 18, y + 28);
    ctx.fillStyle = navy;
    ctx.font = "500 18px Arial, sans-serif";
    wrapText(ctx, copy, x + 18, y + 58, cardW - 36, 22, 2);
  });

  const noteY = enhancedY + 650;
  roundedRect(ctx, 78, noteY, 924, 72, 18, "#f0f9ff", "#bae6fd", 2);
  ctx.fillStyle = "#164e63";
  ctx.font = "800 18px Arial, sans-serif";
  wrapText(
    ctx,
    "Accurate karaoke information stays the baseline. Enhanced adds stronger presentation, richer venue details, and more ways for SingHUB to feature what makes the venue worth choosing.",
    98,
    noteY + 27,
    884,
    24,
    2,
  );

  return canvas;
}

function canvasToJpeg(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.type !== "image/jpeg") {
          reject(new Error("The browser did not create a valid JPEG."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.94,
    );
  });
}

export function VenueShareImageExport({ venues, events }: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    const slug = getSelectedSlug();
    const venue = venues.find((item) => item.slug === slug) || venues[0];
    if (!venue) return;

    setIsExporting(true);
    setError(null);
    try {
      const canvas = await buildJpg(venue, venueEvents(events, venue.slug));
      const jpeg = await canvasToJpeg(canvas);
      const downloadUrl = URL.createObjectURL(jpeg);
      const link = document.createElement("a");
      link.download = `${safeName(venue.venueName)}-SingHUB-Instagram-Feed-1080x1350.jpg`;
      link.href = downloadUrl;
      link.type = "image/jpeg";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 60_000);
    } catch (exportError) {
      console.error(exportError);
      setError("Could not create the JPG in this browser. Try the PDF export instead.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <>
      <style>{`
        @media print {
          .venue-pdf-hero-strip {
            position: relative !important;
            height: 1.28in !important;
            margin: 9px 0 8px !important;
            overflow: hidden !important;
            box-shadow: inset 0 -32px 42px rgba(15, 23, 42, 0.35) !important;
          }
          .venue-pdf-hero-strip::after {
            content: "VENUE HERO IMAGE" !important;
            position: absolute !important;
            left: 10px !important;
            bottom: 9px !important;
            padding: 4px 7px !important;
            border-radius: 999px !important;
            background: rgba(15, 23, 42, 0.82) !important;
            color: #ffffff !important;
            font-size: 7pt !important;
            line-height: 1 !important;
            font-weight: 900 !important;
            letter-spacing: 0.08em !important;
          }
          .venue-pdf-enhanced-grid {
            gap: 5px !important;
            margin-top: 7px !important;
          }
          .venue-pdf-enhanced-item {
            padding: 6px 7px !important;
          }
          .venue-pdf-enhanced-copy {
            font-size: 7.8pt !important;
            line-height: 1.25 !important;
          }
          .venue-pdf-trust-note {
            margin-top: 10px !important;
            padding: 8px 10px !important;
            font-size: 8.6pt !important;
          }
        }
      `}</style>

      <section className="venue-pdf-screen-only mt-4 rounded-3xl border border-cyan-300/20 bg-slate-950/70 p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
              Instagram feed export
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Downloads a true 1080 x 1350 JPEG for the venue currently selected above. It is sized for a portrait Instagram feed post and can also be sent in Instagram or Facebook messages.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="shrink-0 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-wait disabled:opacity-60"
          >
            {isExporting ? "Building JPEG..." : "Download Instagram JPEG"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm font-semibold text-rose-300">{error}</p>}
      </section>
    </>
  );
}
