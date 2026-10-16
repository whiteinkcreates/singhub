"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AppNavigation.module.css";

const destinations = [
  { href: "/", label: "Discover", icon: "search" },
  { href: "/find-karaoke", label: "Venues", icon: "location_on" },
  { href: "/backyard", label: "The Backyard", icon: "local_activity" },
  { href: "/hosts", label: "Hosts", icon: "mic" },
  { href: "/singboard", label: "SingBOARD", icon: "dashboard" },
];
export function AppNavigation() {
  const pathname = usePathname();
  function active(href: string) {
    if (href === "/find-karaoke") return pathname === href || pathname.startsWith("/venues/") || pathname === "/places";
    return pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
  }
  const accountActive = pathname === "/account";
  return <>
    <header className={styles.header} data-app-navigation="">
      <Link href="/" className={styles.brand} aria-label="SingHUB home"><img src="/images/singhub-v2/singhub-wordmark.png" width={128} height={52} alt="SingHUB" /></Link>
      <nav className={styles.primary} aria-label="Primary">{destinations.map(item => <Link key={item.href} href={item.href} className={item.href==="/backyard"?styles.backyardLink:undefined} aria-current={active(item.href) ? "page" : undefined}>{item.label}</Link>)}<details className={styles.more}><summary>More</summary><div className={styles.moreMenu}><Link href="/hotel">For Hotels</Link><Link href="/venues/premium">For Venues</Link><Link href="/submit-listing">Submit a Listing</Link></div></details></nav>
      <Link href="/account" className={styles.account} aria-current={accountActive ? "page" : undefined}><span>My SingHUB</span><i className="material-symbols-rounded" aria-hidden="true">account_circle</i></Link>
    </header>
    <nav className={styles.mobile} aria-label="Mobile navigation">{[...destinations.filter(item=>item.href!=="/singboard"), { href: "/account", label: "My SingHUB", icon: "account_circle" }].map(item => <Link key={item.href} href={item.href} className={item.href==="/backyard"?styles.backyardLink:undefined} aria-current={active(item.href) ? "page" : undefined}><i className="material-symbols-rounded" aria-hidden="true">{item.icon}</i><span>{item.href==="/backyard"?"Backyard":item.label}</span></Link>)}<details className={styles.mobileMore}><summary><i className="material-symbols-rounded" aria-hidden="true">menu</i><span>More</span></summary><div className={styles.mobileMoreMenu}><Link href="/singboard">SingBOARD</Link><Link href="/hotel">For Hotels</Link><Link href="/venues/premium">For Venues</Link><Link href="/submit-listing">Submit Listing</Link></div></details></nav>
  </>;
}
