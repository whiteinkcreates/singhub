"use client";

export const GA_MEASUREMENT_ID = "G-NQGPSYB6Q7";
export const INTERNAL_ANALYTICS_KEY = "singhub-internal-analytics";

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
    Boolean(window[`ga-disable-${GA_MEASUREMENT_ID}`]) ||
    window.localStorage.getItem(INTERNAL_ANALYTICS_KEY) === "1"
  );
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined" || isAnalyticsDisabled()) return;

  const cleanParams = Object.fromEntries(
    Object.entries(params).filter((entry): entry is [string, AnalyticsValue] => entry[1] !== undefined),
  );

  window.gtag?.("event", eventName, cleanParams);
}

