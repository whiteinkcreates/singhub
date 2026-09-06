import type { Metadata } from "next";
import Script from "next/script";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-NQGPSYB6Q7";

export const metadata: Metadata = {
  metadataBase: new URL("https://singhub.app"),
  title: "SingHUB | Find Karaoke Near You",
  description:
    "SingHUB helps you find karaoke near you. Search karaoke nights by day, neighborhood, venue, or host, starting in San Diego.",
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
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
