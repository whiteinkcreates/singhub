import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/admin", "/api/admin/"],
      },
    ],
    sitemap: "https://singhub.app/sitemap.xml",
    host: "https://singhub.app",
  };
}
