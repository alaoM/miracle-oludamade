"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, ChevronLeft, ChevronRight, X } from "lucide-react";
import { IMAGE_CATEGORIES, SITE } from "@/content/site";
import type { GalleryCategory, GeneratedImage } from "@/types";
import { BotanicalDivider } from "./Monogram";
import { MagneticButton } from "./MagneticButton";

interface DisplayPhoto {
  id: string;
  src: string;
  alt: string;
  category: GalleryCategory;
  width?: number;
  height?: number;
  blurDataURL?: string;
  isGuest?: boolean;
}

type FilterOption = "All" | GalleryCategory;

export function GallerySection({
  curatedImages,
  publicShareQrDataUrl,
}: {
  curatedImages: GeneratedImage[];
  publicShareQrDataUrl?: string;
}) {
  const [guestPhotos, setGuestPhotos] = useState<DisplayPhoto[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("All");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/gallery/guest")
      .then((res) => (res.ok ? res.json() : { photos: [] }))
      .then((data: { photos?: Array<{ id: string; src: string; alt: string }> }) => {
        if (!mounted || !Array.isArray(data.photos)) return;
        setGuestPhotos(
          data.photos.map((p) => ({
            id: `guest-${p.id}`,
            src: p.src,
            alt: p.alt,
            category: "Guest",
            isGuest: true,
          }))
        );
      })
      .catch(() => {
        // Silently ignore if guest gallery is unavailable
      });
    return () => {
      mounted = false;
    };
  }, []);

  const allPhotos: DisplayPhoto[] = useMemo(
    () => [
      ...curatedImages.map((img) => ({
        id: img.fileName,
        src: img.src,
        alt: img.alt,
        category: (IMAGE_CATEGORIES[img.fileName] ?? "Together") as GalleryCategory,
        width: img.width,
        height: img.height,
        blurDataURL: img.blurDataURL,
      })),
      ...guestPhotos,
    ],
    [curatedImages, guestPhotos]
  );

  const availableFilters: FilterOption[] = useMemo(() => {
    const present = new Set<GalleryCategory>(allPhotos.map((p) => p.category));
    const ordered: GalleryCategory[] = ["Together", "Her", "Him", "Guest"];
    return ["All", ...ordered.filter((cat) => present.has(cat))];
  }, [allPhotos]);

  const visiblePhotos = useMemo(
    () =>
      activeFilter === "All"
        ? allPhotos
        : allPhotos.filter((p) => p.category === activeFilter),
    [allPhotos, activeFilter]
  );

  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + visiblePhotos.length) % visiblePhotos.length
    );
  }, [visiblePhotos.length]);
  const next = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? null : (i + 1) % visiblePhotos.length
    );
  }, [visiblePhotos.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, close, prev, next]);

  const activePhoto =
    activeIndex !== null ? visiblePhotos[activeIndex] : null;

  return (
    <>
      <section id="gallery" className="scroll-mt-20 py-20 sm:py-28 paper-grain">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-script text-3xl text-magenta">Our moments</p>
            <h2 className="mt-1 font-display text-4xl font-medium text-ink sm:text-5xl">
              Gallery
            </h2>
            <p className="mt-3 text-base text-ink-muted">
              A few favourite frames from our journey so far. Share yours with{" "}
              <span className="font-medium text-magenta">
                {SITE.couple.hashtag}
              </span>
              .
            </p>
            <BotanicalDivider />
          </div>

          {/* Category filter pills */}
          {availableFilters.length > 2 && (
            <div
              role="group"
              aria-label="Filter gallery photos"
              className="mt-6 flex flex-wrap items-center justify-center gap-2"
            >
              {availableFilters.map((filter) => {
                const isSelected = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setActiveFilter(filter);
                      setActiveIndex(null);
                    }}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                      isSelected
                        ? "bg-magenta text-white shadow-sm"
                        : "border border-ink/15 bg-surface text-ink-muted hover:border-magenta hover:text-magenta"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          )}

          {/* Masonry grid */}
          <div className="mt-8 columns-2 gap-4 space-y-4 sm:columns-3 lg:columns-4">
            {visiblePhotos.map((photo, idx) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className="group relative block w-full break-inside-avoid overflow-hidden rounded-2xl border border-ink/10 bg-surface text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-magenta"
                aria-label={`View photo: ${photo.alt}`}
              >
                {photo.isGuest ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.width ?? 800}
                    height={photo.height ?? 1000}
                    sizes="(max-width: 640px) 48vw, (max-width: 1024px) 31vw, 24vw"
                    placeholder={photo.blurDataURL ? "blur" : "empty"}
                    blurDataURL={photo.blurDataURL}
                    className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Accessible focus-trapped Lightbox */}
        {activePhoto && activeIndex !== null && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Photo lightbox"
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/92 p-4 backdrop-blur-sm"
            onClick={close}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const delta =
                (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
              touchStartX.current = null;
              if (delta > 50) prev();
              if (delta < -50) next();
            }}
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              aria-label="Close lightbox"
              className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div
              className="relative max-h-[84vh] max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePhoto.src}
                alt={activePhoto.alt}
                className="max-h-[78vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
              />
              <p className="mt-3 text-center text-sm text-white/85">
                {activePhoto.alt} ({activeIndex + 1} / {visiblePhotos.length})
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        )}
      </section>

      {/* 7.7 Share Your Photos Teaser */}
      <section
        id="share-photos"
        className="scroll-mt-20 bg-gradient-to-br from-onion-soft/80 via-ivory to-sage-soft/75 py-16 sm:py-20 border-y border-ink/5"
      >
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-magenta/10 text-magenta">
            <Camera className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-display text-3xl font-medium text-ink sm:text-4xl">
            Share your photos with us
          </h2>
          <p className="mt-3 text-base text-ink/90 sm:text-lg">
            Snapped something beautiful? Add it to our collection, no login
            needed.
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            On the wedding day, simply scan the QR code on the table cards for
            instant one-tap uploads straight into our album.
          </p>
          <div className="mt-7 flex flex-col items-center gap-5">
            {publicShareQrDataUrl && (
              <div className="inline-flex flex-col items-center rounded-2xl border border-gold-hairline/50 bg-ivory p-3 shadow-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={publicShareQrDataUrl}
                  alt="QR code linking to the wedding photo sharing page"
                  width={128}
                  height={128}
                  loading="lazy"
                  className="h-32 w-32 rounded-lg"
                />
                <span className="mt-1.5 text-xs text-ink-muted">
                  Scan on mobile or tap below
                </span>
              </div>
            )}
            <MagneticButton>
              <Link
                href="/share"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-magenta px-8 py-3 text-base font-medium text-white shadow-soft transition hover:bg-magenta-dark"
              >
                <Camera className="h-4 w-4" />
                <span>Share your photos</span>
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>
    </>
  );
}
