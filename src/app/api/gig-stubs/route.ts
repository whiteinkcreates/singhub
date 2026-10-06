import {NextResponse} from 'next/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {getVenueListings} from '@/lib/venueData';
import {getPublicVenues} from '@/lib/publicVenueFilters';
import {getKaraokeEventsByVenueSlug} from '@/lib/eventData';
import {collectTourStops,locationMatch,nightlifeDate,tourStopEligibility,type TourStopVisit} from '@/lib/tourStops';
export const dynamic='force-dynamic';

async function viewer(request:Request){
 const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
 if(!token)return null;
 const client=createAdminClient();const {data,error}=await client.auth.getUser(token);
 return !error&&data.user?.email_confirmed_at?{client,user:data.user}:null;
}

const columns='venue_id,venue_slug,venue_name,neighborhood,nightlife_date,created_at,method,status,confirmed_at';

export async function GET(request:Request){
 try{
  const auth=await viewer(request);if(!auth)return NextResponse.json({error:'Sign in to see your TourStops.'},{status:401});
  const url=new URL(request.url);const venueSlug=url.searchParams.get('venueSlug');
  if(venueSlug){
   const {data,error}=await auth.client.from('singer_venue_visits').select(columns).eq('user_id',auth.user.id).eq('venue_slug',venueSlug).eq('nightlife_date',nightlifeDate()).maybeSingle();
   if(error)throw error;
   return NextResponse.json({visit:data||null},{headers:{'Cache-Control':'private, no-store'}});
  }
  const {data,error}=await auth.client.from('singer_venue_visits').select(columns).eq('user_id',auth.user.id).eq('status','confirmed').order('created_at',{ascending:true});if(error)throw error;
  const stops=collectTourStops((data||[]) as TourStopVisit[]);return NextResponse.json({stops,stubs:stops},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({error:'TourStops could not load. Try again.'},{status:503});}
}

export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:'Cross-site check-ins are not allowed.'},{status:403});
 try{
  const auth=await viewer(request);if(!auth)return NextResponse.json({error:'Sign in to collect your TourStop.'},{status:401});
  const text=await request.text();if(text.length>2048)return NextResponse.json({error:'Invalid check-in.'},{status:400});
  let body;try{body=JSON.parse(text);}catch{return NextResponse.json({error:'Invalid check-in.'},{status:400});}
  if(!body||typeof body.venueSlug!=='string'||!['self_reported','location_matched'].includes(body.method))return NextResponse.json({error:'Choose a venue and check-in method.'},{status:400});
  const venue=getPublicVenues(await getVenueListings()).find(v=>v.slug===body.venueSlug);if(!venue)return NextResponse.json({error:'This venue is not available for check-in.'},{status:404});
  const eligibility=tourStopEligibility(await getKaraokeEventsByVenueSlug(venue.slug));
  if(eligibility.phase==='closed')return NextResponse.json({error:eligibility.reason,eligibility},{status:409});
  if(body.method==='location_matched'&&!locationMatch(body.location,venue))return NextResponse.json({error:'Your location could not be matched nearby. You can record a self-reported visit instead.'},{status:422});

  const night=nightlifeDate();
  const {data:existing,error:existingError}=await auth.client.from('singer_venue_visits').select(columns).eq('user_id',auth.user.id).eq('venue_id',venue.id).eq('nightlife_date',night).maybeSingle();
  if(existingError)throw existingError;

  if(eligibility.phase==='early'){
   if(existing?.status==='confirmed')return NextResponse.json({collected:false,alreadyCheckedIn:true,venueName:venue.venueName,eligibility,status:'confirmed'},{headers:{'Cache-Control':'private, no-store'}});
   if(existing?.status==='pending')return NextResponse.json({collected:false,pending:true,venueName:venue.venueName,eligibility,status:'pending'},{headers:{'Cache-Control':'private, no-store'}});
   const {error}=await auth.client.from('singer_venue_visits').insert({user_id:auth.user.id,venue_id:venue.id,venue_slug:venue.slug,venue_name:venue.venueName,neighborhood:venue.neighborhood,nightlife_date:night,method:body.method,status:'pending',confirmed_at:null});
   if(error&&error.code!=='23505')throw error;
   return NextResponse.json({collected:false,pending:true,venueName:venue.venueName,eligibility,status:'pending'},{headers:{'Cache-Control':'private, no-store'}});
  }

  if(existing?.status==='confirmed')return NextResponse.json({collected:false,alreadyCheckedIn:true,venueName:venue.venueName,eligibility,status:'confirmed'},{headers:{'Cache-Control':'private, no-store'}});
  if(existing?.status==='pending'){
   const {error}=await auth.client.from('singer_venue_visits').update({status:'confirmed',method:body.method,confirmed_at:new Date().toISOString()}).eq('id',existing.id);
   if(error)throw error;
   const previous=await auth.client.from('singer_venue_visits').select('id',{count:'exact',head:true}).eq('user_id',auth.user.id).eq('venue_id',venue.id).eq('status','confirmed');
   if(previous.error)throw previous.error;
   return NextResponse.json({collected:(previous.count||0)<=1,confirmedFromPending:true,venueName:venue.venueName,eligibility,status:'confirmed'},{headers:{'Cache-Control':'private, no-store'}});
  }

  const previous=await auth.client.from('singer_venue_visits').select('id',{count:'exact',head:true}).eq('user_id',auth.user.id).eq('venue_id',venue.id).eq('status','confirmed');if(previous.error)throw previous.error;
  const {error}=await auth.client.from('singer_venue_visits').insert({user_id:auth.user.id,venue_id:venue.id,venue_slug:venue.slug,venue_name:venue.venueName,neighborhood:venue.neighborhood,nightlife_date:night,method:body.method,status:'confirmed',confirmed_at:new Date().toISOString()});
  if(error&&error.code!=='23505')throw error;
  return NextResponse.json({collected:!error&&previous.count===0,alreadyCheckedIn:Boolean(error),venueName:venue.venueName,eligibility,status:'confirmed'},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({error:'Your visit was not saved. Please try again.'},{status:503});}
}
