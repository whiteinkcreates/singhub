import {NextResponse} from 'next/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {getVenueListings} from '@/lib/venueData';
import {getPublicVenues} from '@/lib/publicVenueFilters';
import {getMarketConfig} from '@/lib/markets';

export const dynamic='force-dynamic';

// Privacy rules: diagnostic events contain NO lat/lon, street address,
// raw error string, IP address, device identifier or browser fingerprint.
const actions=new Set(['venue','tour']);
const outcomes=new Set(['success','failure']);
const phases=new Set(['browser','api','network']);
const reasons=new Set([
 'permission_denied','position_unavailable','gps_timeout','gps_unsupported',
 'too_far','low_accuracy','invalid_location','missing_venue_coordinates',
 'network_error','request_error','auth_expired','schedule_closed','unknown'
]);
const accuracyBands=new Set(['0-25m','26-75m','76-150m','151-300m','301-1000m','over-1000m']);
const fields=new Set(['venueSlug','action','outcome','phase','reason','accuracyBand']);

export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)
  return NextResponse.json({error:'Cross-site diagnostics are not allowed.'},{status:403});
 try{
  const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if(!token)return NextResponse.json({error:'Sign in required.'},{status:401});
  const supabase=createAdminClient();
  const {data,error:authError}=await supabase.auth.getUser(token);
  if(authError||!data.user?.email_confirmed_at)
   return NextResponse.json({error:'Sign in required.'},{status:401});

  const text=await request.text();
  if(text.length>800)return NextResponse.json({error:'Invalid diagnostic event.'},{status:400});
  let raw:unknown;
  try{raw=JSON.parse(text);}catch{return NextResponse.json({error:'Invalid diagnostic event.'},{status:400});}
  if(!raw||typeof raw!=='object'||Array.isArray(raw))
   return NextResponse.json({error:'Invalid diagnostic event.'},{status:400});
  const input=raw as Record<string,unknown>;
  if(Object.keys(input).some(key=>!fields.has(key)))
   return NextResponse.json({error:'Only privacy-safe diagnostic fields are accepted.'},{status:400});
  if(typeof input.venueSlug!=='string'||input.venueSlug.length>110||
    !actions.has(String(input.action))||!outcomes.has(String(input.outcome))||
    !phases.has(String(input.phase))||
    (input.outcome==='failure'&&!reasons.has(String(input.reason)))||
    (input.outcome==='success'&&input.reason!==undefined&&input.reason!==null)||
    (input.accuracyBand!==undefined&&input.accuracyBand!==null&&!accuracyBands.has(String(input.accuracyBand))))
   return NextResponse.json({error:'Invalid diagnostic event.'},{status:400});

  const venue=getPublicVenues(await getVenueListings()).find(v=>v.slug===input.venueSlug);
  if(!venue||getMarketConfig(venue.metro)?.status!=='live')
   return NextResponse.json({error:'Venue unavailable.'},{status:404});

  // One authenticated singer cannot flood the diagnostic log from this endpoint.
  const since=new Date(Date.now()-60_000).toISOString();
  const {count,error:rateError}=await supabase.from('singer_location_attempts')
   .select('id',{count:'exact',head:true}).eq('user_id',data.user.id).gte('created_at',since);
  if(rateError)throw rateError;
  if((count||0)>=30)return NextResponse.json({error:'Too many diagnostic events.'},{status:429});

  const {error}=await supabase.from('singer_location_attempts').insert({
   user_id:data.user.id,
   venue_id:venue.id,
   venue_slug:venue.slug,
   venue_name:venue.venueName,
   action:input.action,
   outcome:input.outcome,
   phase:input.phase,
   reason:input.outcome==='failure'?input.reason:null,
   accuracy_band:input.accuracyBand||null,
   source:'app'
  });
  if(error)throw error;
  return new Response(null,{status:204,headers:{'Cache-Control':'no-store'}});
 }catch(error){
  console.error('GPS diagnostic could not be recorded',error instanceof Error?error.message:'unknown');
  return NextResponse.json({error:'Diagnostic event could not be recorded.'},{status:503});
 }
}
