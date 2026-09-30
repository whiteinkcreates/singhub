"use client";
import { usePathname } from 'next/navigation';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
export function ProductionChrome({position}:{position:'header'|'footer'}){
 const path=usePathname();
 const v2=path==='/'||path==='/find-karaoke'||path==='/account'||path.startsWith('/hotel/')||(path.startsWith('/venues/')&&!['/venues/demo','/venues/premium'].includes(path));
 if(v2)return null;
 return position==='header'?<SiteHeader />:<SiteFooter />;
}
