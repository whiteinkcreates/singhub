import {NextResponse} from 'next/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {getVenueListings} from '@/lib/venueData';
import {getPublicVenues} from '@/lib/publicVenueFilters';
import {locationMatchReason,nightlifeDate} from '@/lib/tourStops';
import {getMarketConfig} from '@/lib/markets';
import {getVenueOfferUnlock,unlockVenueOffer} from '@/lib/venueOffers.server';
export const dynamic='force-dynamic';

async function viewer(request:Request){
 const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
 if(!token)return null;
 const client=createAdminClient();
 const {data,error}=await client.auth.getUser(token);
 return !error&&data.user?.email_confirmed_at?{client,user:data.user}:null;
}
function offerWeekday(day:string){
 // Offer days use the same 4 AM venue-day rollover as redemption and check-ins.
 return new Intl.DateTimeFormat('en-US',{weekday:'long',timeZone:'UTC'}).format(new Date(day+'T12:00:00Z'));
}
async function venueFor(slug:string){
 const venue=getPublicVenues(await getVenueListings()).find(item=>item.slug===slug);
 // Multi-market check-ins stay staged until every market has local-time tests.
 return venue&&getMarketConfig(venue.metro)?.status==='live'?venue:undefined;
}
export async function GET(request:Request){
 try{
  const auth=await viewer(request);
  if(!auth)return NextResponse.json({error:'Sign in to view your venue check-in.'},{status:401});
  const slug=new URL(request.url).searchParams.get('venueSlug');
  if(!slug)return NextResponse.json({error:'Venue required.'},{status:400});
  const venue=await venueFor(slug);
  if(!venue)return NextResponse.json({error:'Venue unavailable.'},{status:404});
  const day=nightlifeDate();
  const {data,error}=await auth.client.from('singer_venue_checkins').select('id,method,checked_in_at').eq('user_id',auth.user.id).eq('venue_id',venue.id).eq('checked_in_on',day).maybeSingle();
  if(error)throw error;
  const offerUnlock=await getVenueOfferUnlock(auth.user.id,venue.id,day);
  return NextResponse.json({checkin:data||null,offerUnlock},{headers:{'Cache-Control':'private, no-store'}});
 }catch(error){console.error('Venue check-in lookup failed',error);return NextResponse.json({error:'Could not load venue check-in.'},{status:503});}
}
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:'Cross-site check-ins are not allowed.'},{status:403});
 try{
  const auth=await viewer(request);
  if(!auth)return NextResponse.json({error:'Sign in to check in.'},{status:401});
  const raw=await request.text();
  if(raw.length>2048)return NextResponse.json({error:'Invalid check-in.'},{status:400});
  let body:unknown;
  try{body=JSON.parse(raw);}catch{return NextResponse.json({error:'Invalid check-in.'},{status:400});}
  if(!body||typeof body!=='object')return NextResponse.json({error:'Invalid check-in.'},{status:400});
  const input=body as Record<string,unknown>;
  if(typeof input.venueSlug!=='string'||!['location_matched','self_reported'].includes(String(input.method)))return NextResponse.json({error:'Choose a venue and check-in method.'},{status:400});
  const venue=await venueFor(input.venueSlug);
  if(!venue)return NextResponse.json({error:'Venue unavailable.'},{status:404});
  if(input.method==='location_matched'){
   const reason=locationMatchReason(input.location,venue);
   if(reason)return NextResponse.json({error:'Location could not be verified. You can record a self-reported visit.',code:reason},{status:422});
  }
  const day=nightlifeDate();
  const {data:existing,error:lookupError}=await auth.client.from('singer_venue_checkins').select('id').eq('user_id',auth.user.id).eq('venue_id',venue.id).eq('checked_in_on',day).maybeSingle();
  if(lookupError)throw lookupError;
  let checkinId=existing?.id as string|undefined;
  if(!checkinId){
   const {data,error}=await auth.client.from('singer_venue_checkins').insert({user_id:auth.user.id,venue_id:venue.id,venue_slug:venue.slug,venue_name:venue.venueName,checked_in_on:day,method:input.method}).select('id').single();
   if(error&&error.code!=='23505')throw error;
   checkinId=data?.id;
   if(!checkinId){
    const {data:race,error:raceError}=await auth.client.from('singer_venue_checkins').select('id').eq('user_id',auth.user.id).eq('venue_id',venue.id).eq('checked_in_on',day).single();
    if(raceError)throw raceError;
    checkinId=race.id;
   }
  }
  let offerUnlock;
  let offerError: string|undefined;
  try {
   offerUnlock=await unlockVenueOffer({userId:auth.user.id,checkinId,venueId:venue.id,venueSlug:venue.slug,nightlifeDate:day,weekday:offerWeekday(day)});
  } catch(error) {
   console.error('Venue offer unlock failed after successful check-in',error);
   offerError='Your visit was saved, but the venue offer could not be loaded. Try again shortly.';
  }
  return NextResponse.json({checkedIn:true,alreadyCheckedIn:Boolean(existing),venueName:venue.venueName,offerUnlock,offerError,tourStopCollected:false},{headers:{'Cache-Control':'private, no-store'}});
 }catch(error){console.error('Venue check-in save failed',error);return NextResponse.json({error:'Venue check-in could not be saved.'},{status:503});}
}
