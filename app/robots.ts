import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/course/", "/room/", "/session/"],
      disallow: ["/student/", "/block/", "/api/"],
    },
  };
}
