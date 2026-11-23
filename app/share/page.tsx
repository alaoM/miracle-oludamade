import type { Metadata } from "next";
import { SITE } from "@/content/site";
import { ShareUploader } from "@/components/ShareUploader";

export const metadata: Metadata = {
  title: `Share your moments — ${SITE.couple.displayNames}`,
  description: `Add your wedding photos and videos to ${SITE.couple.displayNames}’s collection. No login needed.`,
  robots: { index: false, follow: false },
};

export default function SharePage() {
  return <ShareUploader />;
}
