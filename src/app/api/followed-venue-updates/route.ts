import {NextResponse} from 'next/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {getVenueListings} from '@/lib/venueData';
import {getPublicVenues} from '@/lib/publicVenueFilters';
import {getKaraokeEventsByVenueSlug} from '@/lib/eventData';
import {upcomingNightlifeDates,karaokeRunsOnDate} from '@/lib/engagement/chairDates';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store'};
export async function GET(request:Request){
 const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
 if(!token)return NextResponse.json({error:'Sign in to see followed venue updates.'},{status:401,headers});
 try{
  const db=createAdminClient(),{data,error}=await db.auth.getUser(token);
  if(error||!data.user?.email_confirmed_at)return NextResponse.json({error:'Sign in to see followed venue updates.'},{status:401,headers});
  const {data:follows,error:followError}=await db.from('singer_follows').select('target_id,target_slug,target_name')
   .eq('user_id',data.user.id).eq('target_type','venue').eq('notifications_enabled',true).limit(30);
  if(followError)throw followError;
  const venues=new Map(getPublicVenues(await getVenueListings()).map(v=>[v.id,v]));
  const days=upcomingNightlifeDates(7);const updates=[];
  for(const follow of follows||[]){
   const venue=venues.get(follow.target_id);
   if(!venue||venue.slug!==follow.target_slug)continue;
   const events=await getKaraokeEventsByVenueSlug(venue.slug);
   const valid=days.filter(date=>events.some(event=>karaokeRunsOnDate(event,date)));
   if(!valid.length)continue;
   const {data:plans,error:plansError}=await db.from('singer_venue_plans').select('nightlife_date')
    .eq('venue_id',venue.id).eq('intent','going').gte('nightlife_date',days[0]).lte('nightlife_date',days.at(-1)!);
   if(plansError)throw plansError;
   const counts=new Map<string,number>();
   for(const plan of plans||[])counts.set(plan.nightlife_date,(counts.get(plan.nightlife_date)||0)+1);
   for(const date of valid){
    const going=counts.get(date)||0;
    // Require meaningful aggregate interest; avoid implying one member is a crowd.
    if(going>=3)updates.push({venueName:venue.venueName,venueSlug:venue.slug,date,chairsTipped:going,href:'/venues/'+venue.slug});
   }
  }
  updates.sort((a,b)=>a.date.localeCompare(b.date)||b.chairsTipped-a.chairsTipped);
  return NextResponse.json({updates:updates.slice(0,15),kind:'in_app',note:'Aggregated SingHUB plans, not actual attendance. No push or email is sent.'},{headers});
 }catch(e){console.error('Venue updates lookup failed',e);return NextResponse.json({error:'Could not load venue updates.'},{status:503,headers});}
}
