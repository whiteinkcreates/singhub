import {HostMediaEditor} from '@/components/admin/HostMediaEditor';
import {getHostDirectoryMedia} from '@/lib/hostMedia.server';
import {getActiveHosts} from '@/lib/hostData';
export const metadata={title:'Host Media | SingHUB Admin'};
export const dynamic='force-dynamic';
export default async function HostAdminPage(){const [hosts,media]=await Promise.all([getActiveHosts({includeMedia:false}),getHostDirectoryMedia()]);return <HostMediaEditor fallbackHero={media?.heroUrl} hosts={hosts.map(host=>({slug:host.slug,publicDisplayName:host.publicDisplayName,profileImageUrl:host.profileImageUrl,logoUrl:host.logoUrl}))} />;}
