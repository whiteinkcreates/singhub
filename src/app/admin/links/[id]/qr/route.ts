import { NextResponse } from "next/server";
import { getGoLinkById, getGoPublicUrl } from "@/lib/goLinks/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const link = await getGoLinkById(id);
  if (!link) return new NextResponse("Link not found.", { status: 404 });

  const requestUrl = new URL(request.url);
  const format = requestUrl.searchParams.get("format") === "png" ? "png" : "svg";
  const download = requestUrl.searchParams.get("download") === "1";

  const qrUrl = new URL("https://api.qrserver.com/v1/create-qr-code/");
  qrUrl.searchParams.set("data", getGoPublicUrl(link.slug));
  qrUrl.searchParams.set("size", "1000x1000");
  qrUrl.searchParams.set("format", format);
  qrUrl.searchParams.set("color", "000000");
  qrUrl.searchParams.set("bgcolor", "ffffff");
  qrUrl.searchParams.set("qzone", "4");
  qrUrl.searchParams.set("ecc", "M");

  const upstream = await fetch(qrUrl, { cache: "no-store" });
  if (!upstream.ok) return new NextResponse("QR generation failed.", { status: 502 });

  const body = await upstream.arrayBuffer();
  const filename = `singhub-${link.slug}-qr.${format}`;
  const headers = new Headers();
  headers.set("Content-Type", format === "png" ? "image/png" : "image/svg+xml");
  headers.set("Cache-Control", "private, max-age=3600");
  headers.set("Content-Disposition", `${download ? "attachment" : "inline"}; filename=\"${filename}\"`);

  return new NextResponse(body, { status: 200, headers });
}
