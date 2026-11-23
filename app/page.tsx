import dynamic from "next/dynamic";
import QRCode from "qrcode";
import { SITE } from "@/content/site";
import {
  getGalleryImages,
  getHeroImages,
  getImageByName,
  type GeneratedImage,
} from "@/lib/images";
import { OpeningHello } from "@/components/OpeningHello";
import { StickyNav } from "@/components/StickyNav";
import { HeroSection } from "@/components/HeroSection";
import { StorySection } from "@/components/StorySection";
import { TheDaySection } from "@/components/TheDaySection";
import { StayAndPartySection } from "@/components/StayAndPartySection";

// Dynamic-import below-the-fold interactive sections to keep initial JS lean
const GallerySection = dynamic(() =>
  import("@/components/GallerySection").then((m) => m.GallerySection)
);
const RsvpSection = dynamic(() =>
  import("@/components/RsvpSection").then((m) => m.RsvpSection)
);
const GiftsFaqFooter = dynamic(() =>
  import("@/components/GiftsFaqFooter").then((m) => m.GiftsFaqFooter)
);

export default async function HomePage() {
  const heroImages = getHeroImages();
  const curatedGallery = getGalleryImages();

  // Public QR pointing ONLY to plain /share (never includes UPLOAD_CODE)
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/+$/, "");
  const publicShareQrDataUrl = await QRCode.toDataURL(`${siteUrl}/share`, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 240,
    color: {
      dark: "#3A1F2D",
      light: "#FFFCF8",
    },
  });

  // Build serializable image lookup map for story & wedding party
  const imageMap: Record<string, GeneratedImage> = {};
  for (const ch of SITE.storyChapters) {
    const img = getImageByName(ch.imageFile);
    if (img) imageMap[ch.imageFile] = img;
  }
  for (const member of SITE.weddingParty) {
    if (member.imageFile) {
      const img = getImageByName(member.imageFile);
      if (img) imageMap[member.imageFile] = img;
    }
  }

  return (
    <>
      <OpeningHello />

      {SITE.updateBanner.enabled && (
        <div
          role="region"
          aria-label="Wedding notice"
          className="bg-magenta px-4 py-2.5 text-center text-sm font-medium text-white"
        >
          {SITE.updateBanner.message}
        </div>
      )}

      <StickyNav />

      <main>
        <HeroSection
          mobileImage={heroImages.mobile}
          desktopImage={heroImages.desktop}
        />
        <StorySection imageMap={imageMap} />
        <TheDaySection />
        <StayAndPartySection imageMap={imageMap} />
        <GallerySection
          curatedImages={curatedGallery}
          publicShareQrDataUrl={publicShareQrDataUrl}
        />
        <RsvpSection />
        <GiftsFaqFooter />
      </main>
    </>
  );
}
