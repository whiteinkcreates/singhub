import type { Metadata } from "next";
import Script from "next/script";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-NQGPSYB6Q7";

export const metadata: Metadata = {
  title: "SingHUB | Find Karaoke Tonight",
  description: "Find karaoke nights in San Diego by day, neighborhood, venue, and vibe.",
  icons: {
    icon: "/icon.png?v=5",
    shortcut: "/icon.png?v=5",
    apple: "/icon.png?v=5"
  }
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
