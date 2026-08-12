"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type NavItem = {
  href: string;
  label: string;
  detail?: string;
};

const primaryItems: NavItem[] = [
  { href: "/find-karaoke", label: "Find Karaoke" },
  { href: "/places", label: "Places" },
  { href: "/hosts", label: "Hosts" },
  { href: "/community/san-diego", label: "Community" },
];

const secondaryItems: NavItem[] = [
  { href: "/neighborhoods", label: "Neighborhoods" },
  { href: "/submit-listing", label: "Submit a Listing" },
  { href: "/claim-listing", label: "Claim a Listing" },
  { href: "/about", label: "About SingHUB" },
  {
    href: "mailto:hello@singhub.app",
    label: "Contact Us",
    detail: "hello@singhub.app",
  },
];

function MenuLink({ item, onClick }: { item: NavItem; onClick: () => void }) {
  const classes =
    "flex min-h-11 items-center rounded-xl px-4 py-3 text-sm font-bold text-slate-100 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-300";

  if (item.href.startsWith("mailto:")) {
    return (
      <a href={item.href} className={classes} onClick={onClick}>
        <span>
          <span className="block">{item.label}</span>
          {item.detail ? (
            <span className="mt-0.5 block text-xs font-semibold text-cyan-200">
              {item.detail}
            </span>
          ) : null}
        </span>
      </a>
    );
  }

  return (
    <Link href={item.href} className={classes} onClick={onClick}>
      {item.label}
    </Link>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/88 backdrop-blur">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 lg:py-3">
        <Link
          href="/"
          className="group relative z-50 inline-flex min-w-0 shrink-0 items-center rounded-xl px-1 transition hover:scale-[1.01]"
          aria-label="SingHUB home"
          onClick={closeMenu}
        >
          <Image
            src="/images/header-singhub-logo.png"
            alt="SingHUB"
            width={2400}
            height={600}
            priority
            className="h-10 w-auto max-w-[180px] object-contain sm:max-w-[210px] lg:h-12 lg:max-w-[240px]"
          />
        </Link>

        <div className="relative z-50 flex min-w-0 items-center justify-end gap-2">
          <nav
            className="hidden min-w-0 items-center justify-end gap-1 text-sm font-semibold text-slate-200 lg:flex"
            aria-label="Primary navigation"
          >
            {primaryItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Button
              href="/venues/premium"
              variant="secondary"
              className="ml-1 px-4 py-2"
            >
              For Venues
            </Button>
          </nav>

          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-slate-950/80 text-white transition hover:border-fuchsia-300/60 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="site-navigation-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </>
              )}
            </svg>
          </button>
        </div>

        {menuOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-30 cursor-default bg-black/55"
              aria-label="Close navigation menu"
              onClick={closeMenu}
            />
            <nav
              id="site-navigation-menu"
              className="absolute right-4 top-full z-50 mt-2 max-h-[calc(100vh-5rem)] w-[calc(100vw-2rem)] max-w-sm overflow-y-auto rounded-2xl border border-white/15 bg-slate-950/98 p-3 shadow-2xl shadow-black/60 lg:w-80"
              aria-label="More navigation"
            >
              <div className="lg:hidden">
                <p className="px-4 pb-2 pt-1 text-[0.65rem] font-black uppercase tracking-[0.22em] text-cyan-200">
                  Explore SingHUB
                </p>
                {primaryItems.map((item) => (
                  <MenuLink key={item.href} item={item} onClick={closeMenu} />
                ))}
                <MenuLink
                  item={{ href: "/venues/premium", label: "For Venues" }}
                  onClick={closeMenu}
                />
                <div className="my-2 border-t border-white/10" />
              </div>

              <p className="px-4 pb-2 pt-1 text-[0.65rem] font-black uppercase tracking-[0.22em] text-fuchsia-200">
                More
              </p>
              {secondaryItems.map((item) => (
                <MenuLink key={item.href} item={item} onClick={closeMenu} />
              ))}
            </nav>
          </>
        ) : null}
      </div>
    </header>
  );
}
