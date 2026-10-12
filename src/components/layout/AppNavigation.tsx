"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AppNavigation.module.css";

const destinations = [
  { href: "/", label: "Discover", icon: "search" },
  { href: "/find-karaoke", label: "Venues", icon: "location_on" },
  { href: "/hosts", label: "Hosts", icon: "mic" },
  { href: "/singboard", label: "SingBOARD", icon: "dashboard" },
];
const mobileDestinations = destinations.filter(item => item.href !== "/singboard");
const moreDestinations = [
  { href: "/hotel", label: "For Hotels" },
  { href: "/venues/premium", label: "For Venues" },
  { href: "/submit-listing", label: "Submit a Listing" },
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
      <nav className={styles.primary} aria-label="Primary">{destinations.map(item => <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined}>{item.label}</Link>)}</nav>
      <div className={styles.tools}>
        <details className={styles.more}>
          <summary aria-label="More navigation">More <i className="material-symbols-rounded" aria-hidden="true">expand_more</i></summary>
          <nav className={styles.moreMenu} aria-label="More destinations">{moreDestinations.map(item => <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined}>{item.label}</Link>)}</nav>
        </details>
        <Link href="/account" className={styles.account} aria-current={accountActive ? "page" : undefined}><span>My SingHUB</span><i className="material-symbols-rounded" aria-hidden="true">account_circle</i></Link>
      </div>
    </header>
    <nav className={styles.mobile} aria-label="Mobile navigation">{[...mobileDestinations, { href: "/account", label: "My SingHUB", icon: "account_circle" }].map(item => <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined}><i className="material-symbols-rounded" aria-hidden="true">{item.icon}</i><span>{item.label}</span></Link>)}</nav>
  </>;
}
