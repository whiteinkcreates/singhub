import type { Metadata } from "next";
import Script from "next/script";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PwaInstallManager } from "@/components/pwa/PwaInstallManager";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-NQGPSYB6Q7";

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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = window.gtag || gtag;
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <PwaRegister />
        <PwaInstallManager />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
