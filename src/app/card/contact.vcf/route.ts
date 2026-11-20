const contact = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  "N:White;Corey;;;",
  "FN:Corey White",
  "ORG:SingHUB",
  "TITLE:Founder",
  "EMAIL;TYPE=INTERNET,WORK:hello@singhub.app",
  "URL:https://singhub.app",
  "NOTE:San Diego karaoke discovery and community",
  "END:VCARD",
  "",
].join("\r\n");

export function GET() {
  return new Response(contact, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="SingHUB-Corey-White.vcf"',
      "Cache-Control": "public, max-age=86400",
    },
  });
}
