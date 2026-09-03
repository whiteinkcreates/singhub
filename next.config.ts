import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/venues/diversionary-theatre-clark-cabaret-bar",
        destination: "/venues/clark-cabaret",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
