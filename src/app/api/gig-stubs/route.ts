import {NextResponse} from 'next/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {getVenueListings} from '@/lib/venueData';
import {getPublicVenues} from '@/lib/publicVenueFilters';
import {collectGigStubs,locationMatch,nightlifeDate,type GigStubVisit} from '@/lib/gigStubs';
export const dynamic='force-dynamic';
async function viewer(request:Request){
 const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
 if(!token)return null;
 const client=createAdminClient();const {data,error}=await client.auth.getUser(token);
 return !error&&data.user?.email_confirmed_at?{client,user:data.user}:null;
}
const columns='venue_id,venue_slug,venue_name,neighborhood,nightlife_date,created_at,method';
export async function GET(request:Request){
 try{const auth=await viewer(request);if(!auth)return NextResponse.json({error:'Sign in to see your TourStops.'},{status:401});
 const {data,error}=await auth.client.from('singer_venue_visits').select(columns).eq('user_id',auth.user.id).order('created_at',{ascending:true});if(error)throw error;
 const stops=collectGigStubs((data||[]) as GigStubVisit[]);return NextResponse.json({stops,stubs:stops},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({error:'TourStops could not load. Try again.'},{status:503});}
}
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:'Cross-site check-ins are not allowed.'},{status:403});
 try{const auth=await viewer(request);if(!auth)return NextResponse.json({error:'Sign in to collect your TourStop.'},{status:401});
 const text=await request.text();if(text.length>2048)return NextResponse.json({error:'Invalid check-in.'},{status:400});
 let body;try{body=JSON.parse(text);}catch{return NextResponse.json({error:'Invalid check-in.'},{status:400});}
 if(!body||typeof body.venueSlug!=='string'||!['self_reported','location_matched'].includes(body.method))return NextResponse.json({error:'Choose a venue and check-in method.'},{status:400});
 const venue=getPublicVenues(await getVenueListings()).find(v=>v.slug===body.venueSlug);if(!venue)return NextResponse.json({error:'This venue is not available for check-in.'},{status:404});
 if(body.method==='location_matched'&&!locationMatch(body.location,venue))return NextResponse.json({error:'Your location could not be matched nearby. You can record a self-reported visit instead.'},{status:422});
 const previous=await auth.client.from('singer_venue_visits').select('id',{count:'exact',head:true}).eq('user_id',auth.user.id).eq('venue_id',venue.id);if(previous.error)throw previous.error;
 const {error}=await auth.client.from('singer_venue_visits').insert({user_id:auth.user.id,venue_id:venue.id,venue_slug:venue.slug,venue_name:venue.venueName,neighborhood:venue.neighborhood,nightlife_date:nightlifeDate(),method:body.method});
 if(error&&error.code!=='23505')throw error;
 return NextResponse.json({collected:!error&&previous.count===0,alreadyCheckedIn:Boolean(error),venueName:venue.venueName},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({error:'Your visit was not saved. Please try again.'},{status:503});}
}
