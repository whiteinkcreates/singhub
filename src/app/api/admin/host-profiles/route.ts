import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {getHostBySlug} from '@/lib/hostData';
import {HOST_DIRECTORY_MEDIA_KEY,parseHostMediaSettings} from '@/lib/hostMedia';
import {getHostMediaSettings,saveHostMediaSettings} from '@/lib/hostMedia.server';
async function validHostMediaTarget(slug:string){return slug===HOST_DIRECTORY_MEDIA_KEY||Boolean(await getHostBySlug(slug));}
export async function GET(request:Request){
 const slug=new URL(request.url).searchParams.get('slug')||'';
 if(!await validHostMediaTarget(slug))return NextResponse.json({error:'Choose a registered host.'},{status:400});
 try{return NextResponse.json({profile:await getHostMediaSettings(slug)});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Could not load host media.'},{status:503});}
}
export async function PUT(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:'Cross-site admin writes are not allowed.'},{status:403});
 let slug:string;let profile;
 try{const body=await request.json();slug=body.slug;if(typeof slug!=='string'||!await validHostMediaTarget(slug))throw new Error('Choose a registered host.');profile=parseHostMediaSettings(body.profile);}
 catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Invalid host media.'},{status:400});}
 try{await saveHostMediaSettings(slug,profile);revalidatePath('/hosts');revalidatePath('/hosts/[slug]','page');revalidatePath('/admin/hosts');revalidatePath('/','page');return NextResponse.json({ok:true,profile});}
 catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Host media was not saved.'},{status:503});}
}
