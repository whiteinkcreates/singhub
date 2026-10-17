import {NextResponse} from 'next/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {getVenueListings} from '@/lib/venueData';
import {getPublicVenues} from '@/lib/publicVenueFilters';
import {getKaraokeEventsByVenueSlug} from '@/lib/eventData';
import {nightlifeDate} from '@/lib/tourStops';
import {karaokeRunsOnDate} from '@/lib/engagement/chairDates';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store'};
export async function GET(request:Request){
 const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
 if(!token)return NextResponse.json({error:'Sign in to view your plans.'},{status:401,headers});
 try{
  const db=createAdminClient();
  const {data:auth,error:authError}=await db.auth.getUser(token);
  if(authError||!auth.user?.email_confirmed_at)return NextResponse.json({error:'Sign in to view your plans.'},{status:401,headers});
  const today=nightlifeDate();
  const {data:plans,error}=await db.from('singer_venue_plans')
   .select('venue_id,venue_slug,nightlife_date,intent,visibility')
   .eq('user_id',auth.user.id).gte('nightlife_date',today)
   .order('nightlife_date',{ascending:true}).limit(100);
  if(error)throw error;
  const known=getPublicVenues(await getVenueListings());
  const venues=new Map(known.map(v=>[v.id,v]));
  const upcoming=await Promise.all((plans||[]).map(async plan=>{
   const venue=venues.get(plan.venue_id);
   if(!venue||venue.slug!==plan.venue_slug)return null;
   const events=await getKaraokeEventsByVenueSlug(venue.slug);
   const eligible=events.filter(event=>karaokeRunsOnDate(event,plan.nightlife_date));
   if(!eligible.length)return null;
   return {venueSlug:venue.slug,venueName:venue.venueName,date:plan.nightlife_date,intent:plan.intent,
    visibility:plan.visibility,venueUrl:'/venues/'+venue.slug,
    events:eligible.map(event=>({eventId:event.eventId,startTime:event.startTime,endTime:event.endTime,hostName:event.hostName||null}))};
  }));
  return NextResponse.json({plans:upcoming.filter(p=>p!==null),timezone:'America/Los_Angeles',note:'Planned appearances are not confirmed attendance.'},{headers});
 }catch(error){console.error('My planned appearances lookup failed',error);return NextResponse.json({error:'Could not load your planned nights.'},{status:503,headers});}
}
