import {NextResponse} from 'next/server';
import {requireAdminAuthorization} from '@/lib/adminAuthorization';
import {getVenueListings} from '@/lib/venueData';
import {rotateVenueRegisterKey} from '@/lib/venueOffers.server';

export async function POST(request:Request){
 try{
  await requireAdminAuthorization();
  const body=await request.json() as {venueSlug?:string};
  const venueSlug=(body.venueSlug||'').trim();
  const venue=(await getVenueListings()).find(item=>item.slug===venueSlug);
  if(!venue)return NextResponse.json({error:'Choose a valid venue.'},{status:404});
  const registerKey=await rotateVenueRegisterKey(venueSlug);
  return NextResponse.json({venueSlug,venueName:venue.venueName,registerKey,registerPath:'/register/'+venueSlug},{headers:{'Cache-Control':'no-store'}});
 }catch(error){
  console.error('Venue register key generation failed',error);
  return NextResponse.json({error:'Register key could not be generated.'},{status:500});
 }
}
