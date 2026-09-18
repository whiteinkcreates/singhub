import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.singhub.app" }],
        destination: "https://singhub.app/:path*",
        permanent: true,
      },
      {
        source: "/venues/diversionary-theatre-clark-cabaret-bar",
        destination: "/venues/clark-cabaret",
        permanent: true,
      },
      {
        source: "/venues/carriage-house",
        destination: "/venues/carriage-house-cocktails-karaoke",
        permanent: true,
      },
      {
        source: "/venues/cheers-bar-grill",
        destination: "/venues/cheers-bar-san-diego",
        permanent: true,
      },
      {
        source: "/venues/deanos",
        destination: "/venues/deanos-pub",
        permanent: true,
      },
      {
        source: "/venues/deanos-pub-santee",
        destination: "/venues/deanos-east",
        permanent: true,
      },
      {
        source: "/venues/navajo-live",
        destination: "/venues/mcguffies-live",
        permanent: true,
      },
      {
        source: "/venues/pal-joeys-cocktail-lounge",
        destination: "/venues/pal-joeys",
        permanent: true,
      },
      {
        source: "/venues/the-cordova-bar",
        destination: "/venues/cordova-bar",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
