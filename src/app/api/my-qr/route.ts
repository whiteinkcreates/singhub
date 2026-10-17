import {NextResponse} from 'next/server';
import {createAdminClient} from '@/lib/supabase/admin';
export const dynamic='force-dynamic';

async function viewer(request:Request){
 const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
 if(!token)return null;
 const client=createAdminClient();
 const {data,error}=await client.auth.getUser(token);
 return !error&&data.user?.email_confirmed_at?{client,user:data.user}:null;
}
const headers={'Cache-Control':'private, no-store'};
export async function GET(request:Request){
 try{
  const auth=await viewer(request);
  if(!auth)return NextResponse.json({error:'Sign in to access your personal QR.'},{status:401,headers});
  const {data:existing,error:lookupError}=await auth.client.from('singer_public_identities').select('public_id,discoverable,display_name').eq('user_id',auth.user.id).maybeSingle();
  if(lookupError)throw lookupError;
  if(existing)return NextResponse.json({id:existing.public_id,discoverable:existing.discoverable}, {headers});
  const {data,error}=await auth.client.from('singer_public_identities').upsert({user_id:auth.user.id},{onConflict:'user_id',ignoreDuplicates:true}).select('public_id,discoverable').maybeSingle();
  if(error)throw error;
  if(data)return NextResponse.json({id:data.public_id,discoverable:data.discoverable},{headers});
  const {data:created,error:createdError}=await auth.client.from('singer_public_identities').select('public_id,discoverable').eq('user_id',auth.user.id).single();
  if(createdError)throw createdError;
  return NextResponse.json({id:created.public_id,discoverable:created.discoverable},{headers});
 }catch(error){console.error('Personal QR lookup failed',error);return NextResponse.json({error:'Your QR is temporarily unavailable.'},{status:503,headers});}
}
export async function PATCH(request:Request){
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:'Cross-site changes are not allowed.'},{status:403,headers});
 try{
  const auth=await viewer(request);
  if(!auth)return NextResponse.json({error:'Sign in to update your QR settings.'},{status:401,headers});
  const raw=await request.text();
  if(raw.length>300)return NextResponse.json({error:'Invalid preferences.'},{status:400,headers});
  let input:unknown;try{input=JSON.parse(raw);}catch{return NextResponse.json({error:'Invalid preferences.'},{status:400,headers});}
  if(!input||typeof input!=='object'||typeof (input as Record<string,unknown>).discoverable!=='boolean')
   return NextResponse.json({error:'Discoverability choice required.'},{status:400,headers});
  const discoverable=(input as {discoverable:boolean}).discoverable;
  const {data,error}=await auth.client.from('singer_public_identities').update({discoverable}).eq('user_id',auth.user.id).select('public_id,discoverable').single();
  if(error)throw error;
  return NextResponse.json({id:data.public_id,discoverable:data.discoverable},{headers});
 }catch(error){console.error('Personal QR setting failed',error);return NextResponse.json({error:'Your privacy setting could not be saved.'},{status:503,headers});}
}
