import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "SingHUB | Find Karaoke Tonight",
  description: "Find karaoke nights in San Diego by day, neighborhood, venue, and vibe.",
  icons: {
    icon: "/images/singhub-mark.png",
    shortcut: "/images/singhub-mark.png",
    apple: "/images/singhub-mark.png"
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
