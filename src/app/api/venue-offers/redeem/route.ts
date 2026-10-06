import {NextResponse} from 'next/server';
import {redeemVenueOffer} from '@/lib/venueOffers.server';

export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:'Cross-site redemption is not allowed.'},{status:403});
 try{
  const text=await request.text();if(text.length>2048)return NextResponse.json({error:'Invalid redemption request.'},{status:400});
  const body=JSON.parse(text) as {venueSlug?:string;registerKey?:string;code?:string};
  const venueSlug=(body.venueSlug||'').trim();
  const registerKey=(body.registerKey||'').trim();
  const code=(body.code||'').replace(/\D/g,'').slice(0,6);
  if(!venueSlug||registerKey.length<20||code.length!==6)return NextResponse.json({error:'Venue key and six-digit offer code are required.'},{status:400});
  const result=await redeemVenueOffer({venueSlug,registerKey,code});
  if(!result.ok)return NextResponse.json({error:result.error},{status:result.status});
  return NextResponse.json({redeemed:true,alreadyRedeemed:result.alreadyRedeemed,offer:result.unlock},{headers:{'Cache-Control':'no-store'}});
 }catch(error){
  console.error('Venue offer redemption failed',error);
  return NextResponse.json({error:'Offer could not be redeemed.'},{status:500});
 }
}
