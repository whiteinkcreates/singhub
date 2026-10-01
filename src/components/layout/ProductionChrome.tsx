"use client";
import { usePathname } from 'next/navigation';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
export function ProductionChrome({position}:{position:'header'|'footer'}){
 const path=usePathname();
 const v2=path==='/hosts'||path.startsWith('/hosts/')||path==='/'||path==='/find-karaoke'||path==='/account'||path.startsWith('/hotel/')||(path.startsWith('/venues/')&&!['/venues/demo','/venues/premium'].includes(path));
 if(v2 || path==='/admin/hotels/preview')return null;
 return position==='header'?<SiteHeader />:<SiteFooter />;
}
