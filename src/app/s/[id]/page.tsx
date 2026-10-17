import Link from 'next/link';
import {createAdminClient} from '@/lib/supabase/admin';
export const dynamic='force-dynamic';
export const metadata={title:'SingHUB Singer QR',robots:{index:false,follow:false}};
export default async function SingerReferralLanding({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const valid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
 let singer:string|null=null;
 if(valid){
  try{
   const db=createAdminClient();
   const {data}=await db.from('singer_public_identities').select('user_id,display_name').eq('public_id',id).eq('discoverable',true).maybeSingle();
   if(data){
    const {data:profile}=await db.from('singer_profiles').select('karaoke_alias').eq('user_id',data.user_id).maybeSingle();
    singer=profile?.karaoke_alias?.trim()||data.display_name||null;
   }
  }catch(error){console.error('Public singer QR page read failed',error);}
 }
 return <main className="min-h-screen bg-[#070c14] text-white flex items-center justify-center px-5 py-12">
  <section className="w-full max-w-md rounded-2xl border border-cyan-400/30 bg-[#111c2b] p-7 text-center shadow-2xl">
   <p className="text-xs font-bold uppercase tracking-[.22em] text-fuchsia-300">SingHUB community</p>
   <h1 className="mt-3 text-4xl font-black">Welcome to SingHUB</h1>
   <p className="mt-3 leading-6 text-slate-300">{singer?'You found '+singer+' on SingHUB!':'Find your next karaoke night and meet the people who make it great.'}</p>
   <Link href="/" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-fuchsia-600 px-6 font-bold text-white">Find karaoke near you</Link>
   <p className="mt-5 text-xs text-slate-400">Scanning a QR never signs you into someone else’s account or checks you in at a venue.</p>
  </section>
 </main>;
}
