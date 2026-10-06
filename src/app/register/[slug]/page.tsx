import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {VenueOfferRegister} from '@/components/venue/VenueOfferRegister';
import {getVenueListings} from '@/lib/venueData';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'SingHUB Offer Register',robots:{index:false,follow:false}};

export default async function RegisterPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const venue=(await getVenueListings()).find(item=>item.slug===slug);
 if(!venue)notFound();
 return <main className="min-h-screen bg-slate-950 px-4 py-12 text-white"><div className="mx-auto mb-8 max-w-md"><p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">SingHUB</p><h1 className="mt-2 text-4xl font-black">Offer Register</h1><p className="mt-3 text-sm leading-6 text-slate-400">Staff redemption for SingHUB Offers. Keep the private register key on venue-managed devices only.</p></div><VenueOfferRegister venueSlug={venue.slug} venueName={venue.venueName}/></main>;
}
