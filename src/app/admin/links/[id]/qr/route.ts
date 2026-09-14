import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createElement } from "react";
import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { getGoLinkById, getGoPublicUrl } from "@/lib/goLinks/repository";

export const dynamic = "force-dynamic";

const QR_SIZE = 1000;
const LOGO_PLATE_SIZE = 200;
const LOGO_SIZE = 164;

function svgDataUri(svg: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

async function addSingHubMark(qrSvg: string) {
  const logo = await readFile(join(process.cwd(), "public/images/singhub-mark.png"));
  const qrHref = svgDataUri(qrSvg);
  const logoHref = `data:image/png;base64,${logo.toString("base64")}`;
  const platePosition = (QR_SIZE - LOGO_PLATE_SIZE) / 2;
  const logoPosition = (QR_SIZE - LOGO_SIZE) / 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${QR_SIZE}" height="${QR_SIZE}" viewBox="0 0 ${QR_SIZE} ${QR_SIZE}">
  <image href="${qrHref}" width="${QR_SIZE}" height="${QR_SIZE}" />
  <rect x="${platePosition}" y="${platePosition}" width="${LOGO_PLATE_SIZE}" height="${LOGO_PLATE_SIZE}" rx="24" fill="#ffffff" />
  <image href="${logoHref}" x="${logoPosition}" y="${logoPosition}" width="${LOGO_SIZE}" height="${LOGO_SIZE}" preserveAspectRatio="xMidYMid meet" />
</svg>`;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const link = await getGoLinkById(id);
  if (!link) return new NextResponse("Link not found.", { status: 404 });

  const requestUrl = new URL(request.url);
  const format = requestUrl.searchParams.get("format") === "png" ? "png" : "svg";
  const download = requestUrl.searchParams.get("download") === "1";

  const qrUrl = new URL("https://api.qrserver.com/v1/create-qr-code/");
  qrUrl.searchParams.set("data", getGoPublicUrl(link.slug));
  qrUrl.searchParams.set("size", `${QR_SIZE}x${QR_SIZE}`);
  qrUrl.searchParams.set("format", "svg");
  qrUrl.searchParams.set("color", "000000");
  qrUrl.searchParams.set("bgcolor", "ffffff");
  qrUrl.searchParams.set("qzone", "4");
  qrUrl.searchParams.set("ecc", "H");

  const upstream = await fetch(qrUrl, { cache: "no-store" });
  if (!upstream.ok) return new NextResponse("QR generation failed.", { status: 502 });

  const brandedQr = await addSingHubMark(await upstream.text());
  const filename = `singhub-${link.slug}-qr.${format}`;
  const headers = new Headers();
  headers.set("Content-Type", format === "png" ? "image/png" : "image/svg+xml");
  headers.set("Cache-Control", "private, max-age=3600");
  headers.set("Content-Disposition", `${download ? "attachment" : "inline"}; filename="${filename}"`);

  if (format === "png") {
    return new ImageResponse(
      createElement(
        "div",
        { style: { display: "flex", width: "100%", height: "100%" } },
        createElement("img", {
          src: svgDataUri(brandedQr),
          width: QR_SIZE,
          height: QR_SIZE,
          alt: "",
        }),
      ),
      { width: QR_SIZE, height: QR_SIZE, headers },
    );
  }

  return new NextResponse(brandedQr, { status: 200, headers });
}
