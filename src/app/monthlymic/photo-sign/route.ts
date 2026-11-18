import QRCode from "qrcode";
import {SITE_WORDMARK_SRC} from "@/lib/siteWordmark";

export const runtime = "nodejs";

export async function GET() {
  const target = "https://singhub.app/monthlymic#monthlymic-gallery";
  const qr = await QRCode.toDataURL(target, {
    errorCorrectionLevel: "H",
    margin: 4,
    width: 900,
    color: { dark: "#071627", light: "#FFFFFF" }
  });
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MonthlyMic #001 | Photo Submission QR Sign</title>
<style>
@page { size: letter portrait; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; color: #08111d; background: #e8eef2; font-family: Arial, Helvetica, sans-serif; }
.page { width: 8.5in; min-height: 11in; padding: 0.42in 0.58in 0.40in; margin: 20px auto; background: #fff; box-shadow: 0 10px 50px #06152622; text-align: center; position: relative; overflow: hidden; }
.brand { display: flex; align-items: center; justify-content: center; margin: 0 auto 0.04in; height: 1.03in; }
.brand img { height: 1.01in; width: auto; max-width: 5.3in; object-fit: contain; }
.eyebrow { margin: 0; font-size: 17px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: #cc0088; }
h1 { margin: 0.18in 0 0.01in; font-size: 60px; line-height: 0.98; font-weight: 900; letter-spacing: -0.065em; text-transform: uppercase; }
h1 span { color: #ec008b; }
.subhead { margin: 0.10in auto 0.16in; font-size: 22px; line-height: 1.22; font-weight: 800; max-width: 6.9in; }
.pinkline { height: 0.08in; background: #ec008b; border-radius: 50px; width: 1.8in; margin: 0 auto 0.10in; }
.qr-wrap { background: #fff; display: inline-block; margin: 0.06in auto 0; }
.qr { display: block; height: 4.55in; width: 4.55in; image-rendering: pixelated; }
.steps { margin: 0.06in 0 0.09in; font-size: 21px; font-weight: 900; letter-spacing: .025em; }
.url { font-size: 17px; color: #006d94; line-height: 1.25; font-weight: 700; overflow-wrap: anywhere; margin: 0 auto 0.08in; }
.info { margin: 0.13in auto 0; max-width: 7.05in; padding-top: 0.13in; border-top: 3px solid #10c6e5; font-size: 16px; font-weight: 700; line-height: 1.35; }
.disclosure { color: #3c4b56; font-size: 12px; line-height: 1.4; max-width: 6.9in; margin: 0.08in auto 0; }
.tools { margin: 18px auto; max-width: 8.5in; display: flex; gap: 14px; justify-content: center; }
.tools button, .tools a { padding: 11px 16px; text-decoration: none; font-size: 15px; font-weight: 800; color: white; background: #0e1a2b; border: 0; border-radius: 6px; cursor: pointer; }
.tools a { background: #bd007b; }
@media screen and (max-width: 850px) { .page { width: min(100%, 8.5in); min-height: auto; padding: 18px; margin: 0 auto; box-shadow: none; } .brand { height: auto; } .brand img { width: min(86%, 390px); height: auto; } h1 { font-size: clamp(35px, 9vw, 60px); } .subhead { font-size: 19px; } .qr { width: min(80vw, 4.55in); height: auto; } .steps { font-size: 15px; } .url { font-size: 13px; } .info { font-size: 14px; } }
@media print { html, body { background: white !important; } .page { margin: 0; width: 8.5in; height: 11in; box-shadow: none; page-break-after: avoid; break-after: avoid; } .tools { display: none !important; } * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<main class="page">
  <div class="brand"><img src="${SITE_WORDMARK_SRC}" alt="SingHUB official wordmark" width="510" height="170"></div>
  <p class="eyebrow">MonthlyMic #001 · The Mesa</p>
  <h1>GOT <span>PICS?</span></h1>
  <p class="subhead">SHARE YOUR SHOTS FROM TONIGHT.</p>
  <div class="pinkline" aria-hidden="true"></div>
  <div class="qr-wrap"><img class="qr" src="${qr}" alt="QR code to the SingHUB MonthlyMic photo submission form" width="900" height="900"></div>
  <p class="steps">SCAN · CHOOSE A PHOTO · SEND IT</p>
  <p class="url">singhub.app/monthlymic#monthlymic-gallery</p>
  <p class="info">Your photos. Our karaoke community.<br>No account needed. Photos are reviewed before appearing publicly.</p>
  <p class="disclosure">JPG, PNG or WebP · Up to 8 MB · Name, email and photo permission required.<br>Only submit photos you took or have permission to share.</p>
</main>
<div class="tools">
  <button onclick="window.print()">Print this letter-size sign</button>
  <a href="${qr}" download="SingHUB_MonthlyMic_Photo_Submission_QR.png">Download the QR only</a>
</div>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    }
  });
}
