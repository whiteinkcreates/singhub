import type { Metadata } from "next";
import { Suspense } from "react";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { OutboundLinks } from "@/components/layout/OutboundLinks";
import { ProductionChrome } from "@/components/layout/ProductionChrome";
import { BandNotes } from "@/components/layout/BandNotes";

import { PwaInstallManager } from "@/components/pwa/PwaInstallManager";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import "./globals.css";
import "@/components/v2/styles/review-revisions.css";
import "@/components/layout/mainPageHero.css";
import "@/components/v2/gigStubs.css";

const siteTitle = "SingHUB | Find Karaoke Near You";
const siteDescription =
  "SingHUB helps you find karaoke near you. Search karaoke nights by day, neighborhood, venue, or host, starting in San Diego.";
const socialImage = "/images/og/singhub-og.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://singhub.app"),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    type: "website",
    url: "/",
    siteName: "SingHUB",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: "SingHUB",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [socialImage],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SingHUB",
  },
  icons: {
    icon: [{ url: "/icon.png", sizes: "512x512", type: "image/png" }],
    shortcut: [{ url: "/icon.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Barlow+Condensed:wght@600;700;800;900&family=Permanent+Marker&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0&display=swap" /></head>
      <body>
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
        <OutboundLinks />
        <PwaRegister />
        <PwaInstallManager />
        <ProductionChrome position="header" />
        {children}
        <BandNotes />
        <ProductionChrome position="footer" />
      </body>
    </html>
  );
}
