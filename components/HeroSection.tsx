"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Check, Copy, CalendarDays } from "lucide-react";
import { SITE } from "@/content/site";
import type { GeneratedImage } from "@/lib/images";
import { DriftingPetals } from "./Monogram";
import { MagneticButton } from "./MagneticButton";

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function computeCountdown(targetIso: string): Countdown {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, isPast: false };
}

export function HeroSection({
  mobileImage,
  desktopImage,
}: {
  mobileImage: GeneratedImage | null;
  desktopImage: GeneratedImage | null;
}) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, prefersReducedMotion ? 0 : 70]);

  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCountdown(computeCountdown(SITE.couple.weddingStartIsoWat));
    const timer = window.setInterval(() => {
      setCountdown(computeCountdown(SITE.couple.weddingStartIsoWat));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const copyHashtag = async () => {
    try {
      await navigator.clipboard.writeText(SITE.couple.hashtag);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard blocked
    }
  };

  return (
    <section
      id="top"
      className="relative min-h-[90svh] w-full overflow-hidden flex items-end sm:items-center justify-center"
    >
      {/* Parallax background image */}
      <motion.div
        style={{ y: parallaxY }}
        className="absolute inset-0 -top-8 -bottom-8"
      >
        {mobileImage && (
          <Image
            src={mobileImage.src}
            alt={mobileImage.alt}
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            blurDataURL={mobileImage.blurDataURL}
            className="object-cover object-[center_20%] md:hidden"
          />
        )}
        {desktopImage && (
          <Image
            src={desktopImage.src}
            alt={desktopImage.alt}
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            blurDataURL={desktopImage.blurDataURL}
            className="hidden object-cover object-[center_18%] md:block"
          />
        )}
      </motion.div>

      {/* Soft ivory-to-onion readability gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ivory via-ivory/75 to-onion/25 sm:bg-gradient-to-r sm:from-ivory/95 sm:via-ivory/78 sm:to-onion/25"
      />

      <DriftingPetals count={5} />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-14 pt-28 sm:px-8 sm:py-24">
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="max-w-xl"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-hairline/50 bg-ivory/85 px-4 py-1.5 text-sm font-medium text-ink shadow-sm backdrop-blur">
            <CalendarDays className="h-4 w-4 text-magenta" />
            <span>
              {SITE.couple.dateShort} · {SITE.couple.locationShort}
            </span>
          </p>

          <h1 className="mt-5 font-display text-5xl font-medium leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            <span className="block font-script text-6xl font-normal text-magenta sm:text-7xl lg:text-8xl">
              {SITE.couple.brideShort}
            </span>
            <span className="mt-1 flex items-baseline gap-3">
              <span className="font-script text-4xl font-normal text-onion sm:text-5xl">
                &amp;
              </span>
              <span>{SITE.couple.groomShort}</span>
            </span>
          </h1>

          <p className="mt-5 font-display text-xl italic text-ink/90 sm:text-2xl">
            “{SITE.couple.tagline}”
          </p>

          {/* Hashtag tap-to-copy chip */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copyHashtag}
              className="inline-flex items-center gap-2 rounded-full border border-magenta/30 bg-ivory/90 px-4 py-1.5 text-sm font-medium text-magenta shadow-sm backdrop-blur transition hover:bg-onion-soft"
            >
              <span>{SITE.couple.hashtag}</span>
              {copied ? (
                <Check className="h-3.5 w-3.5 text-sage" />
              ) : (
                <Copy className="h-3.5 w-3.5 opacity-75" />
              )}
            </button>
            {copied && (
              <span
                role="status"
                aria-live="polite"
                className="text-sm font-medium text-magenta"
              >
                Hashtag copied!
              </span>
            )}
          </div>

          {/* Live countdown (WAT) */}
          <div className="mt-7" aria-live="polite">
            {countdown?.isPast ? (
              <div className="inline-flex items-center rounded-2xl border border-sage/50 bg-sage-soft/90 px-5 py-3 font-display text-2xl font-medium text-ink shadow-sm">
                We’re married! 🎉
              </div>
            ) : (
              <div className="grid max-w-md grid-cols-4 gap-2.5 sm:gap-3">
                {[
                  { label: "Days", value: countdown ? countdown.days : "—" },
                  { label: "Hours", value: countdown ? countdown.hours : "—" },
                  { label: "Mins", value: countdown ? countdown.minutes : "—" },
                  { label: "Secs", value: countdown ? countdown.seconds : "—" },
                ].map((unit) => (
                  <div
                    key={unit.label}
                    className="rounded-2xl border border-gold-hairline/35 bg-ivory/90 px-2 py-3 text-center shadow-sm backdrop-blur"
                  >
                    <p className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                      {typeof unit.value === "number"
                        ? String(unit.value).padStart(2, "0")
                        : unit.value}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">{unit.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Primary CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <MagneticButton>
              <a
                href="#rsvp"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-magenta px-8 py-3 text-base font-medium text-white shadow-soft transition hover:bg-magenta-dark"
              >
                RSVP
              </a>
            </MagneticButton>
            <MagneticButton>
              <a
                href="#the-day"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-ink/20 bg-ivory/90 px-7 py-3 text-base font-medium text-ink shadow-sm backdrop-blur transition hover:border-magenta hover:text-magenta"
              >
                Event details
              </a>
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
