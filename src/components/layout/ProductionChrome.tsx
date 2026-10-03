"use client";
import { usePathname } from 'next/navigation';
import { AppNavigation } from './AppNavigation';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
export function ProductionChrome({position}:{position:'header'|'footer'}){
 const path=usePathname();
 const v2=path==='/hosts'||path.startsWith('/hosts/')||path==='/'||path==='/find-karaoke'||path==='/account'||path==='/hotel'||path.startsWith('/hotel/')||(path.startsWith('/venues/')&&!['/venues/demo','/venues/premium'].includes(path));
 if((path.startsWith('/admin/hotels/')&&path.endsWith('/package/print'))||path==='/admin/hotels/preview'||path.startsWith('/hotelexperience/'))return null;
 if(position==='header')return path.startsWith('/admin')?<SiteHeader />:<AppNavigation />;
 return v2?null:<SiteFooter />;
}
