import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.couple.displayNames} — ${SITE.couple.hashtag}`,
    short_name: SITE.couple.monogram,
    description: `${SITE.couple.tagline} Celebrate with us on ${SITE.couple.dateDisplay} in ${SITE.couple.locationDisplay}.`,
    start_url: "/",
    display: "standalone",
    background_color: "#FFFCF8",
    theme_color: "#A3195B",
    icons: [
      {
        src: "/icon",
        sizes: "64x64",
        type: "image/png",
      },
    ],
  };
}
