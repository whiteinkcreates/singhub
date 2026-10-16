import {NextResponse} from 'next/server';
import {deleteVenueMedia,listVenueMedia,uploadVenueMedia} from '@/lib/venueMediaCloudinary';
import {getHostBySlug} from '@/lib/hostData';
import {createAdminClient} from '@/lib/supabase/admin';
import {HOST_DIRECTORY_MEDIA_KEY,SITE_HERO_KEYS} from '@/lib/hostMedia';
export const runtime='nodejs';
async function validTarget(slug:string){return slug===HOST_DIRECTORY_MEDIA_KEY||SITE_HERO_KEYS.some(key=>key===slug)||Boolean(await getHostBySlug(slug));}
export async function GET(request:Request){
 const slug=new URL(request.url).searchParams.get('slug')||'';
 if(!await validTarget(slug))return NextResponse.json({error:'Choose a registered host.'},{status:400});
 try{return NextResponse.json({ok:true,assets:await listVenueMedia(slug,'hosts')});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Could not load host images.'},{status:503});}
}
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:'Cross-site admin writes are not allowed.'},{status:403});
 try{const form=await request.formData();const slug=String(form.get('slug')||'');const file=form.get('file');
 if(!await validTarget(slug))return NextResponse.json({error:'Choose a registered host.'},{status:400});
 if(!(file instanceof File)||!['image/jpeg','image/png','image/webp'].includes(file.type))return NextResponse.json({error:'Upload a JPG, PNG or WebP image.'},{status:400});
 if(!file.size||file.size>12*1024*1024)return NextResponse.json({error:'Images must be non-empty and under 12 MB.'},{status:400});
 return NextResponse.json({ok:true,asset:await uploadVenueMedia(file,slug,'hosts')});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Host image upload failed.'},{status:503});}
}

/** Refuse Cloudinary deletion while any saved host/site page still references the asset. */
export async function DELETE(request:Request){
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:'Cross-site admin writes are not allowed.'},{status:403});
 try{
  const body=await request.json();
  const slug=typeof body.slug==='string'?body.slug.trim():'';
  const publicId=typeof body.publicId==='string'?body.publicId.trim():'';
  if(!publicId||!await validTarget(slug))return NextResponse.json({error:'Choose a registered host or site page and an upload.'},{status:400});
  const assets=await listVenueMedia(slug,'hosts');
  const asset=assets.find(item=>item.publicId===publicId);
  if(!asset)return NextResponse.json({error:'That upload does not belong to this media library.'},{status:404});
  const {data,error}=await createAdminClient().from('host_media').select('slug,media');
  if(error||!data)throw new Error('Image usage could not be verified; nothing was deleted.');
  const matches=(value:unknown)=>{
   if(typeof value!=='string')return false;
   if(value===asset.url)return true;
   try{
    const expected=new URL(asset.url),candidate=new URL(value);
    const path=decodeURIComponent(candidate.pathname);
    return expected.origin===candidate.origin&&(path.includes('/'+asset.publicId+'.')||path.endsWith('/'+asset.publicId));
   }catch{return false;}
  };
  const assignments=data.flatMap(row=>{
   const media=row.media&&typeof row.media==='object'?row.media as Record<string,unknown>:{};
   return ['heroUrl','portraitUrl'].filter(field=>matches(media[field])).map(field=>row.slug+' ('+field+')');
  });
  const canonical=await getHostBySlug(slug);
  if(canonical&&(matches(canonical.profileImageUrl)||matches(canonical.logoUrl)))assignments.push(slug+' (canonical host portrait)');
  if(assignments.length)return NextResponse.json({error:'Image still used by '+assignments.join(', ')+'. Clear or replace the assignment and save before deleting.'},{status:409});
  await deleteVenueMedia(publicId,slug,'hosts');
  return NextResponse.json({ok:true,deleted:publicId});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Host image could not be deleted.'},{status:500});}
}
