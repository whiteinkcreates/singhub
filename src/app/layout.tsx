import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SingHUB | Find Karaoke Tonight",
  description:
    "Find karaoke nights in San Diego by day, neighborhood, venue, and vibe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}