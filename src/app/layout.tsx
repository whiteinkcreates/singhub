import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

const faviconUrl = "/favicon.svg?v=4";

export const metadata: Metadata = {
  title: "SingHUB | Find Karaoke Tonight",
  description: "Find karaoke nights in San Diego by day, neighborhood, venue, and vibe.",
  icons: {
    icon: faviconUrl,
    shortcut: faviconUrl,
    apple: faviconUrl
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
