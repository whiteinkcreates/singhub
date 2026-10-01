import 'server-only';
import {createAdminClient} from '@/lib/supabase/admin';
import {HOST_DIRECTORY_MEDIA_KEY,parseHostMediaSettings,type HostMediaSettings} from './hostMedia';
export async function getHostMediaSettings(slug:string):Promise<HostMediaSettings|null>{
 const {data,error}=await createAdminClient().from('host_media').select('media').eq('slug',slug).maybeSingle();
 if(error)throw new Error(`Host media could not be loaded: ${error.message}`);
 return data?parseHostMediaSettings(data.media):null;
}
export async function getHostMediaOverrides(){
 const result=new Map<string,HostMediaSettings>();
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)return result;
 try{const {data,error}=await createAdminClient().from('host_media').select('slug,media');if(error)throw error;for(const row of data||[])result.set(row.slug,parseHostMediaSettings(row.media));}
 catch(error){console.error('Host media read failed; retaining canonical host data',error);}
 return result;
}
export async function getHostDirectoryMedia(){return (await getHostMediaOverrides()).get(HOST_DIRECTORY_MEDIA_KEY);}
export async function saveHostMediaSettings(slug:string,media:HostMediaSettings){
 const {error}=await createAdminClient().from('host_media').upsert({slug,media,updated_at:new Date().toISOString()});
 if(error)throw new Error(`Host media was not saved: ${error.message}`);
}
