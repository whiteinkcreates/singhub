"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { usePathname } from "next/navigation";
import {useEffect,useState} from "react";
import {accountClient} from "@/lib/v2/singerAccount";
import styles from "./AppNavigation.module.css";

const destinations = [
  { href: "/discover", label: "Discover", icon: "search" },
  { href: "/find-karaoke", label: "Venues", icon: "location_on" },
  { href: "/backyard", label: "The Backyard", icon: "local_activity" },
  { href: "/hosts", label: "Hosts", icon: "mic" },
  { href: "/singboard", label: "SingBOARD", icon: "dashboard" },
];
export function AppNavigation() {
  const pathname = usePathname();
  const [authStatus,setAuthStatus]=useState<"checking"|"signed-in"|"signed-out">("checking");
  useEffect(()=>{
    let mounted=true;let unsubscribe:(()=>void)|undefined;
    try{
      const auth=accountClient().auth;
      void auth.getUser().then(({data,error})=>{if(mounted)setAuthStatus(!error&&data.user?"signed-in":"signed-out");})
        .catch(()=>{if(mounted)setAuthStatus("signed-out");});
      const {data}=auth.onAuthStateChange((_event,session)=>{if(mounted)setAuthStatus(session?.user?"signed-in":"signed-out");});
      unsubscribe=()=>data.subscription.unsubscribe();
    }catch{queueMicrotask(()=>{if(mounted)setAuthStatus("signed-out");});}
    return ()=>{mounted=false;unsubscribe?.();};
  },[]);
  const accountHref=authStatus==="signed-out"?"/account?signin=1":"/account";
  const accountLabel=authStatus==="signed-out"?"Sign in":"My SingHUB";
  function active(href: string) {
    if (href === "/find-karaoke") return pathname === href || pathname.startsWith("/venues/") || pathname === "/places";
    return pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
  }
  const accountActive = pathname === "/account";
  return <>
    <header className={styles.header} data-app-navigation="">
      <Link href="/" className={styles.brand} aria-label="SingHUB home"><img src="/images/singhub-v2/singhub-wordmark.png" width={128} height={52} alt="SingHUB" /></Link>
      <nav className={styles.primary} aria-label="Primary">{destinations.map(item => <Link key={item.href} href={item.href} className={item.href==="/backyard"?styles.backyardLink:undefined} aria-current={active(item.href) ? "page" : undefined}>{item.label}</Link>)}<details className={styles.more}><summary>More</summary><div className={styles.moreMenu}><a href="https://whiteinkcreates.com/pages/singhub-merch-table">Merch Table</a><Link href="/hotel">For Hotels</Link><Link href="/venues/premium">For Venues</Link><Link href="/submit-listing">Submit a Listing</Link></div></details></nav>
      <Link href={accountHref} className={styles.account} aria-label={authStatus==="signed-out"?"Sign in to My SingHUB":"My SingHUB account"} aria-current={accountActive ? "page" : undefined}><span>{accountLabel}</span><i className="material-symbols-rounded" aria-hidden="true">account_circle</i></Link>
    </header>
    <nav className={styles.mobile} aria-label="Mobile navigation">{[...destinations.filter(item=>item.href!=="/singboard"), { href: accountHref, label: accountLabel, icon: "account_circle" }].map(item => <Link key={item.href} href={item.href} className={item.href==="/backyard"?styles.backyardLink:undefined} aria-current={(item.icon==="account_circle"?accountActive:active(item.href)) ? "page" : undefined}><i className="material-symbols-rounded" aria-hidden="true">{item.icon}</i><span>{item.href==="/backyard"?"Backyard":item.label}</span></Link>)}<details className={styles.mobileMore}><summary><i className="material-symbols-rounded" aria-hidden="true">menu</i><span>More</span></summary><div className={styles.mobileMoreMenu}><a href="https://whiteinkcreates.com/pages/singhub-merch-table">Merch Table</a><Link href="/singboard">SingBOARD</Link><Link href="/hotel">For Hotels</Link><Link href="/venues/premium">For Venues</Link><Link href="/submit-listing">Submit Listing</Link></div></details></nav>
  </>;
}
