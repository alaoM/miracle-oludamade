import manifestData from "@/content/images.generated.json";
import { IMAGE_EXCLUDED, IMAGE_SLOTS } from "@/content/site";
import type { GeneratedImage } from "@/types";

export type { GeneratedImage };

const images = (manifestData.images ?? []) as GeneratedImage[];
const byFileName = new Map<string, GeneratedImage>(
  images.map((img) => [img.fileName, img])
);

export function getImageByName(fileName: string | undefined): GeneratedImage | null {
  if (!fileName) return null;
  return byFileName.get(fileName) ?? null;
}

export function getHeroImages(): {
  mobile: GeneratedImage | null;
  desktop: GeneratedImage | null;
} {
  return {
    mobile: getImageByName(IMAGE_SLOTS.heroMobile) ?? images[0] ?? null,
    desktop: getImageByName(IMAGE_SLOTS.heroDesktop) ?? images[0] ?? null,
  };
}

export function getGalleryImages(): GeneratedImage[] {
  const excluded = new Set(IMAGE_EXCLUDED);
  return images.filter(
    (img) => !img.isDuplicate && !excluded.has(img.fileName)
  );
}
