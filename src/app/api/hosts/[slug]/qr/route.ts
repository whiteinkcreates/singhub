import {NextRequest} from 'next/server';
import {getHostBySlug} from '@/lib/hostData';
export async function GET(request:NextRequest,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 if(!await getHostBySlug(slug))return new Response('Host not found',{status:404});
 // Keep exported cards on the current reviewed app origin, never an arbitrary redirect.
 const candidate=request.nextUrl.searchParams.get('origin');
 const origin=candidate&&candidate===request.nextUrl.origin?candidate:request.nextUrl.origin;
 const qr=new URL('https://api.qrserver.com/v1/create-qr-code/');
 qr.searchParams.set('data',`${origin}/hosts/${encodeURIComponent(slug)}`);
 qr.searchParams.set('size','300x300');qr.searchParams.set('format','png');qr.searchParams.set('qzone','4');qr.searchParams.set('ecc','M');
 try{const response=await fetch(qr,{next:{revalidate:86400},signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error('QR unavailable');return new Response(await response.arrayBuffer(),{headers:{'Content-Type':'image/png','Cache-Control':'public, max-age=3600'}});}catch{return new Response('QR temporarily unavailable',{status:502});}
}
