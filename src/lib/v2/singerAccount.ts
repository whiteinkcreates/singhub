// Queries and write payloads recovered from 2562ebf (existing singer account).
// RLS owns authorization. No admin key or browser-awarded achievements.
import { createClient } from '@/lib/supabase/client';
export type Performance={id:string;song_title:string;artist:string|null;venue_slug:string|null;venue_name:string|null;performed_on:string};
export type SavedVenue={venue_slug:string;venue_name:string;neighborhood:string|null};
export type Achievement={id:string;badge_key:string;badge_name:string;awarded_at:string;award_note:string|null};
export type SavedHotel={hotel_slug:string;hotel_name:string};
export type HotelPlan={hotel_slug:string;hotel_name:string;venue_slug:string;venue_name:string};
export function accountClient(){if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)throw new Error('Sign-in is unavailable in this environment.');return createClient();}
export async function loadSingerAccount(userId:string){
 const client=accountClient();const results=await Promise.all([
  client.from('singer_profiles').select('karaoke_alias').eq('user_id',userId).maybeSingle(),
  client.from('singer_performances').select('id,song_title,artist,venue_slug,venue_name,performed_on').eq('user_id',userId).order('performed_on',{ascending:false}).order('created_at',{ascending:false}).limit(10),
  client.from('singer_performances').select('id',{count:'exact',head:true}).eq('user_id',userId),
  client.from('singer_saved_venues').select('venue_slug,venue_name,neighborhood').eq('user_id',userId).order('saved_at',{ascending:false}),
  client.from('singer_achievements').select('id,badge_key,badge_name,awarded_at,award_note').eq('user_id',userId).order('awarded_at',{ascending:true}),
  client.from('singer_saved_hotels').select('hotel_slug,hotel_name').eq('user_id',userId).order('saved_at',{ascending:false}),
  client.from('hotel_guest_plans').select('hotel_slug,hotel_name,venue_slug,venue_name').eq('user_id',userId).order('created_at',{ascending:false}),
 ]);for(const result of results)if(result.error)throw result.error;
 return {alias:results[0].data?.karaoke_alias as string||'',performances:(results[1].data||[]) as Performance[],performanceCount:results[2].count||0,venues:(results[3].data||[]) as SavedVenue[],achievements:(results[4].data||[]) as Achievement[],hotels:(results[5].data||[]) as SavedHotel[],plans:(results[6].data||[]) as HotelPlan[]};
}
export async function sendAccountLink(email:string,next:string){const {error}=await accountClient().auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:location.origin+'/auth/callback?next='+encodeURIComponent(next),shouldCreateUser:true}});if(error)throw error;}
export async function sendSavedPlanLink(){
 const {data,error}=await accountClient().auth.getUser();
 if(error)throw error;
 if(!data.user?.email)throw new Error('Sign in again to email your saved plan.');
 // A saved plan belongs to this account. Do not send its access link to an
 // editable form address that could belong to a different account.
 await sendAccountLink(data.user.email,'/account');
}
export async function saveHotelPlan(hotel:{slug:string;name:string},venue:{slug:string;name:string},saveHotel:boolean){const client=accountClient();const {data,error}=await client.auth.getUser();if(error&&error.name!=='AuthSessionMissingError')throw error;if(!data.user)return false;
 const result=await client.from('hotel_guest_plans').upsert({user_id:data.user.id,hotel_slug:hotel.slug,hotel_name:hotel.name,venue_slug:venue.slug,venue_name:venue.name});if(result.error)throw result.error;
 if(saveHotel){const result=await client.from('singer_saved_hotels').upsert({user_id:data.user.id,hotel_slug:hotel.slug,hotel_name:hotel.name});if(result.error)throw new Error('Your venue was saved, but the hotel could not be saved. '+result.error.message);}return true;
}
