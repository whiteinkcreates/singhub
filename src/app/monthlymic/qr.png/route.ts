import QRCode from "qrcode";
export const runtime="nodejs";
export async function GET(){
 const url="https://singhub.app/monthlymic?src=irl-qr";
 const png=await QRCode.toBuffer(url,{type:"png",width:1200,margin:4,errorCorrectionLevel:"H",color:{dark:"#10121AFF",light:"#FFFFFFFF"}});
 return new Response(new Uint8Array(png),{headers:{"Content-Type":"image/png","Content-Disposition":"attachment; filename=\"SingHUB-MonthlyMic-Invite-QR.png\"","Cache-Control":"public, max-age=3600"}});
}
