import type { Metadata } from "next";
import { Suspense } from "react";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PwaInstallManager } from "@/components/pwa/PwaInstallManager";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import "./globals.css";

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
      <body>
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
        <PwaRegister />
        <PwaInstallManager />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
