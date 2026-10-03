"use client";

export const GA_MEASUREMENT_ID = "G-NQGPSYB6Q7";
export const INTERNAL_ANALYTICS_KEY = "singhub-internal-analytics";
const PUBLIC_HOSTS = new Set(["singhub.app", "www.singhub.app"]);
let initialized = false;

export function analyticsLocation(href: string) {
  const url = new URL(href);
  const kept = new URLSearchParams();
  for (const name of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "source"]) {
    const value = url.searchParams.get(name);
    if (value) kept.set(name, value);
  }
  return url.origin + url.pathname + (kept.size ? "?" + kept.toString() : "");
}

export function hotelAnalyticsContext(): AnalyticsParams {
  if (typeof document === "undefined") return {};
  const hotel = document.querySelector<HTMLElement>("[data-hotel-slug]");
  return hotel ? {hotel_slug: hotel.dataset.hotelSlug, hotel_experience: hotel.dataset.hotelExperience, hotel_route: window.location.pathname} : {};
}

export type AnalyticsValue = string | number | boolean;
export type AnalyticsParams = Record<string, AnalyticsValue | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

export function isAnalyticsDisabled() {
  if (typeof window === "undefined") return true;

  return (
    !PUBLIC_HOSTS.has(window.location.hostname) ||
    window.location.pathname.startsWith("/admin") ||
    Boolean(window[`ga-disable-${GA_MEASUREMENT_ID}`]) ||
    window.localStorage.getItem(INTERNAL_ANALYTICS_KEY) === "1"
  );
}

export function initializeAnalytics() {
  if (isAnalyticsDisabled() || initialized) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    // Google commands use Arguments objects, including before its script loads.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {send_page_view: false, page_location: analyticsLocation(window.location.href), page_referrer: document.referrer ? analyticsLocation(document.referrer) : ""});
  initialized = true;
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined" || isAnalyticsDisabled()) return;
  initializeAnalytics();

  const eventParams: AnalyticsParams = {...hotelAnalyticsContext(), page_location: analyticsLocation(window.location.href), ...params};
  const cleanParams = Object.fromEntries(
    Object.entries(eventParams).filter((entry): entry is [string, AnalyticsValue] => entry[1] !== undefined),
  );

  window.gtag?.("event", eventName, cleanParams);
}
