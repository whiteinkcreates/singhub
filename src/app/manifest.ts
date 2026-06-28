import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SingHUB",
    short_name: "SingHUB",
    description: "Find karaoke nights in San Diego by day, neighborhood, venue, and vibe.",
    start_url: "/",
    display: "standalone",
    background_color: "#030307",
    theme_color: "#030307",
    icons: [
      {
        src: "/icon.png?v=5",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon.png?v=5",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
