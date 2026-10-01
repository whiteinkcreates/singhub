import {NextResponse} from 'next/server';
import {listVenueMedia,uploadVenueMedia} from '@/lib/venueMediaCloudinary';
import {getHostBySlug} from '@/lib/hostData';
import {HOST_DIRECTORY_MEDIA_KEY} from '@/lib/hostMedia';
export const runtime='nodejs';
async function validTarget(slug:string){return slug===HOST_DIRECTORY_MEDIA_KEY||Boolean(await getHostBySlug(slug));}
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
