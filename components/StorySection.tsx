"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { SITE, type VoiceStatement } from "@/content/site";
import type { GeneratedImage } from "@/lib/images";
import { BotanicalDivider } from "./Monogram";

function VoiceBubble({ statement }: { statement: VoiceStatement }) {
  const isMiracle = statement.speaker === "Miracle";
  const isBoth = statement.speaker === "Both";

  const bubbleClasses = isBoth
    ? "bg-onion-soft/85 border-onion/40"
    : isMiracle
      ? "bg-magenta/[0.06] border-magenta/20"
      : "bg-sage-soft/90 border-sage/40";

  const avatarClasses = isBoth
    ? "bg-onion text-white"
    : isMiracle
      ? "bg-magenta text-white"
      : "bg-sage text-white";

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 shadow-sm ${bubbleClasses}`}
    >
      <div className="mb-2.5 flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-xs font-semibold ${avatarClasses}`}
        >
          {statement.initial}
        </span>
        <span className="text-sm font-semibold text-ink">
          {isBoth ? "Oludamade & Miracle" : statement.speaker}
        </span>
      </div>
      <p className="text-base leading-relaxed text-ink/95">{statement.text}</p>
    </div>
  );
}

export function StorySection({
  imageMap,
}: {
  imageMap: Record<string, GeneratedImage>;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="story"
      className="relative scroll-mt-20 py-20 sm:py-28 paper-grain"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-script text-3xl text-magenta">Our story</p>
          <h2 className="mt-1 font-display text-4xl font-medium text-ink sm:text-5xl">
            From a WhatsApp “Hello” to forever
          </h2>
          <p className="mt-3 text-base text-ink-muted">
            In our own words — how one message on 1 August 2024 led us here.
          </p>
          <BotanicalDivider />
        </div>

        <div className="relative mt-12 space-y-12 sm:space-y-16">
          {/* Vertical timeline spine on desktop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-6 left-1/2 top-6 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-gold-hairline/55 to-transparent lg:block"
          />

          {SITE.storyChapters.map((chapter, index) => {
            const img = imageMap[chapter.imageFile];
            const isEven = index % 2 === 1;

            return (
              <motion.article
                key={chapter.id}
                initial={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: 24 }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative grid items-center gap-6 lg:grid-cols-2 lg:gap-12"
              >
                {/* Chapter dot on desktop spine */}
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 hidden h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ivory bg-magenta shadow-sm lg:block"
                />

                {/* Photo column */}
                <div className={isEven ? "lg:order-2" : "lg:order-1"}>
                  <div className="relative overflow-hidden rounded-panel border border-ink/10 bg-surface shadow-card aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/4.4]">
                    {img ? (
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 48vw"
                        placeholder="blur"
                        blurDataURL={img.blurDataURL}
                        className="object-cover object-[center_20%]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-onion-soft to-sage-soft p-6 text-center text-sm text-ink-muted">
                        Photo coming soon (TODO: add to /public/images)
                      </div>
                    )}
                  </div>
                </div>

                {/* Narrative column */}
                <div
                  className={`relative ${isEven ? "lg:order-1" : "lg:order-2"}`}
                >
                  {chapter.id === "gist-and-laughter" && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-2 -top-5 flex items-center gap-1.5 sm:right-2"
                    >
                      <svg
                        width="44"
                        height="20"
                        viewBox="0 0 44 20"
                        fill="none"
                        className="text-sage/75"
                      >
                        <path
                          d="M2 14C9 4 16 16 23 8C30 1 36 14 42 7"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                      <motion.span
                        animate={
                          prefersReducedMotion
                            ? undefined
                            : { y: [0, -5, 0], rotate: [-4, 4, -4] }
                        }
                        transition={{
                          duration: 3.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl rounded-bl-sm border border-onion/50 bg-onion-soft text-lg shadow-sm"
                      >
                        😂
                      </motion.span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-onion-soft text-xs font-semibold text-magenta">
                      {chapter.number}
                    </span>
                    {chapter.dateLabel && (
                      <span className="text-sm font-medium text-ink-muted">
                        {chapter.dateLabel}
                      </span>
                    )}
                    {chapter.tag && (
                      <span className="rounded-full bg-magenta/10 px-3 py-1 text-xs font-medium text-magenta">
                        {chapter.tag}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 font-display text-3xl font-medium text-ink">
                    {chapter.title}
                  </h3>

                  <div className="mt-4 space-y-3.5">
                    {chapter.statements.map((stmt, sIdx) => (
                      <VoiceBubble key={sIdx} statement={stmt} />
                    ))}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
