"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  GA_MEASUREMENT_ID,
  INTERNAL_ANALYTICS_KEY,
  trackEvent,
  initializeAnalytics,
  analyticsLocation,
  hotelAnalyticsContext,
} from "@/lib/analytics";

const PUBLIC_HOSTS = new Set(["singhub.app", "www.singhub.app"]);
const INVISIBLE_PATH_CHARACTERS = /[\u200B-\u200D\u2060\uFEFF\uFFFD]/g;

function cleanPath(pathname: string) {
  const cleaned = pathname.replace(INVISIBLE_PATH_CHARACTERS, "");
  return cleaned || "/";
}

function getVenueSlug(pathname: string) {
  const match = cleanPath(pathname).match(/^\/venues\/([^/?#]+)/);
  return match?.[1];
}

function subscribeToClientMount() {
  return () => undefined;
}

export function AnalyticsProvider() {
  const pathname = usePathname();
  const mounted = useSyncExternalStore(subscribeToClientMount, () => true, () => false);
  const isAdminPath = pathname.startsWith("/admin");
  const enabled = mounted &&
    PUBLIC_HOSTS.has(window.location.hostname) &&
    !isAdminPath &&
    window.localStorage.getItem(INTERNAL_ANALYTICS_KEY) !== "1";
  const lastTrackedPath = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!mounted) return;
    if (isAdminPath) {
      window.localStorage.setItem(INTERNAL_ANALYTICS_KEY, "1");
    }
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = !enabled;
  }, [enabled, isAdminPath, mounted]);

  useEffect(() => {
    if (!enabled) return;

    initializeAnalytics();

    const pagePath = cleanPath(pathname);
    if (lastTrackedPath.current === pagePath) return;
    lastTrackedPath.current = pagePath;

    trackEvent("page_view", {
      page_location: analyticsLocation(window.location.href),
      page_path: pagePath,
      page_title: document.title,
    });

    const hotel = hotelAnalyticsContext();
    const query = new URLSearchParams(window.location.search);
    if (hotel.hotel_slug && (query.get("utm_medium")?.toLowerCase() === "qr" || query.get("source") === "qr")) {
      trackEvent("hotel_qr_visit", hotel);
    }

    if (pagePath === "/find-karaoke") {
      trackEvent("find_karaoke_view", { source_path: pagePath });
    }

    const venueSlug = getVenueSlug(pagePath);
    if (venueSlug) {
      trackEvent("venue_profile_view", {
        venue_slug: venueSlug,
        source_path: pagePath,
      });
    }
  }, [enabled, pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!anchor) return;

      const declaredEvent = anchor.dataset.analyticsEvent;
      const href = anchor.getAttribute("href") || "";
      const sourcePath = cleanPath(window.location.pathname);
      const venueSlug = anchor.dataset.venueSlug || getVenueSlug(sourcePath);

      if (declaredEvent) {
        trackEvent(declaredEvent, {
          venue_slug: venueSlug,
          venue_name: anchor.dataset.venueName,
          destination_type: anchor.dataset.destinationType,
          source_path: sourcePath,
        });
        return;
      }

      const destinationPath = cleanPath(new URL(href, window.location.origin).pathname);
      const destinationVenueSlug = getVenueSlug(destinationPath);
      if (destinationVenueSlug) {
        trackEvent("venue_profile_open", {
          venue_slug: destinationVenueSlug,
          source_path: sourcePath,
        });
      }
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}
