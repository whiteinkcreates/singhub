export const revalidate = 300;
/* eslint-disable @next/next/no-img-element */
import { HostDirectory } from '@/components/host/HostDirectory';
import { HostChrome } from '@/components/host/HostChrome';
import { HOST_FORM_URL } from '@/components/host/HostProfileTemplate';
import { getActiveHosts } from '@/lib/hostData';
import { getSanDiegoPublicVenues,getSanDiegoRegionHosts } from '@/lib/sanDiegoMarket';
import { getVenueListings } from '@/lib/venueData';
import '@/components/host/hosts.css';
export const metadata={title:'San Diego Karaoke Hosts | SingHUB',description:'Meet the KJs and karaoke hosts running rooms across San Diego.',alternates:{canonical:'/hosts'}};
export default async function HostsPage(){
 const [activeHosts,venues]=await Promise.all([getActiveHosts(),getVenueListings()]);
 const hosts=getSanDiegoRegionHosts(activeHosts,getSanDiegoPublicVenues(venues));
 return <div className="host-system"><HostChrome /><main><section className="host-directory-hero"><img className="host-hero-photo" src="/images/hosts/hosts-booth.webp" alt="Karaoke from behind the host's mixer, with a singer and crowd in the room" /><div className="host-hero-shade" /><div className="host-directory-identity"><p className="host-eyebrow">SINGHUB HOSTS</p><h1>BEHIND THE MIC</h1><p>Meet the KJs who bring San Diego karaoke to life.</p><a className="host-button pink" href={HOST_FORM_URL} target="_blank" rel="noreferrer">Get listed / Update your profile</a></div></section><HostDirectory hosts={hosts.map(({contactEmail,notes,...host})=>{void contactEmail;void notes;return host;})} /></main></div>;
}
