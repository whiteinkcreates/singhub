import {NextResponse} from 'next/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {getVenueListings} from '@/lib/venueData';
import {getPublicVenues} from '@/lib/publicVenueFilters';
import {getKaraokeEventsByVenueSlug} from '@/lib/eventData';
import {eventRunsOnNight} from '@/lib/eventOccurrence';
import {getMarketConfig} from '@/lib/markets';
import {upcomingNightlifeDates,validChairDate} from '@/lib/engagement/chairDates';
export const dynamic='force-dynamic';
const noStore={'Cache-Control':'private, no-store'};
async function venueBySlug(slug:string){
 const venue=getPublicVenues(await getVenueListings()).find(v=>v.slug===slug);
 return venue&&getMarketConfig(venue.metro)?.status==='live'?venue:null;
}
async function viewer(request:Request){
 const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
 if(!token)return null;
 const db=createAdminClient();const {data,error}=await db.auth.getUser(token);
 return !error&&data.user?.email_confirmed_at?{db,user:data.user}:null;
}
const toResponse=(body:object,status=200)=>NextResponse.json(body,{status,headers:noStore});
export async function GET(request:Request){
 const auth=await viewer(request);if(!auth)return toResponse({error:'Sign in to view your planned nights.'},401);
 try{
  const slug=new URL(request.url).searchParams.get('venueSlug');
  if(!slug||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))return toResponse({error:'Venue required.'},400);
  const venue=await venueBySlug(slug);if(!venue)return toResponse({error:'Venue unavailable.'},404);
  const dates=upcomingNightlifeDates();
  const [events,plans]=await Promise.all([
   getKaraokeEventsByVenueSlug(slug),
   auth.db.from('singer_venue_plans').select('nightlife_date,intent,visibility').eq('user_id',auth.user.id).eq('venue_id',venue.id).gte('nightlife_date',dates[0]).lte('nightlife_date',dates.at(-1)!)
  ]);
  if(plans.error)throw plans.error;
  const nights=dates.filter(day=>events.some(event=>eventRunsOnNight(event,day)));
  const {data:rollups,error}=await auth.db.from('singer_venue_plans').select('nightlife_date,intent').eq('venue_id',venue.id).eq('intent','going').gte('nightlife_date',dates[0]).lte('nightlife_date',dates.at(-1)!);
  if(error)throw error;
  const counts=new Map<string,number>();
  for(const row of rollups||[])counts.set(row.nightlife_date,(counts.get(row.nightlife_date)||0)+1);
  return toResponse({venueName:venue.venueName,nights:nights.map(date=>({date,going:counts.get(date)||0,plan:plans.data?.find(p=>p.nightlife_date===date)||null})),disclaimer:'SingHUB member intentions only. Not a reservation, verified attendance, or full crowd forecast.'});
 }catch(error){console.error('Venue plans lookup failed',error);return toResponse({error:'Could not load planned appearances.'},503);}
}
export async function PUT(request:Request){
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return toResponse({error:'Cross-site plans not allowed.'},403);
 const auth=await viewer(request);if(!auth)return toResponse({error:'Sign in to plan your night.'},401);
 try{
  const raw=await request.text();if(raw.length>500)return toResponse({error:'Invalid plan.'},400);
  let body:unknown;try{body=JSON.parse(raw);}catch{return toResponse({error:'Invalid plan.'},400);}
  if(!body||typeof body!=='object')return toResponse({error:'Invalid plan.'},400);
  const input=body as Record<string,unknown>;
  const slug=input.venueSlug,date=input.date,intent=input.intent;
  if(typeof slug!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||typeof date!=='string'||!validChairDate(date,upcomingNightlifeDates())||!['going','maybe','none'].includes(String(intent)))return toResponse({error:'Choose an upcoming karaoke night and attendance intent.'},400);
  const venue=await venueBySlug(slug);if(!venue)return toResponse({error:'Venue unavailable.'},404);
  const events=await getKaraokeEventsByVenueSlug(slug);
  if(!events.some(event=>eventRunsOnNight(event,date)))return toResponse({error:'This date has no published karaoke night.'},422);
  if(intent==='none'){
   const {error}=await auth.db.from('singer_venue_plans').delete().eq('user_id',auth.user.id).eq('venue_id',venue.id).eq('nightlife_date',date);
   if(error)throw error;return toResponse({saved:true,intent:'none'});
  }
  const {error}=await auth.db.from('singer_venue_plans').upsert({user_id:auth.user.id,venue_id:venue.id,venue_slug:venue.slug,nightlife_date:date,intent,visibility:'private',updated_at:new Date().toISOString()},{onConflict:'user_id,venue_id,nightlife_date'});
  if(error)throw error;
  return toResponse({saved:true,intent});
 }catch(error){console.error('Venue plan save failed',error);return toResponse({error:'Could not save your plan.'},503);}
}
