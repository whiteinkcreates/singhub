import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/scout", "/scout/"],
      },
    ],
    sitemap: "https://singhub.app/sitemap.xml",
  };
}
