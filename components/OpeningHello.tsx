"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCheck } from "lucide-react";
import { SITE } from "@/content/site";
import { DriftingPetals } from "./Monogram";

const STORAGE_KEY = "om_hello_seen_v1";

function safeGetSeen(): boolean {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function safeMarkSeen() {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Ignore storage errors in private browsing
  }
}

export function triggerReplayHello() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("om:replay-hello"));
  }
}

export function OpeningHello() {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [stage, setStage] = useState(0);
  const [replayCount, setReplayCount] = useState(0);

  const finish = useCallback(() => {
    safeMarkSeen();
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!safeGetSeen()) {
      setVisible(true);
      setStage(0);
    }

    const onReplay = () => {
      setStage(0);
      setVisible(true);
      setReplayCount((c) => c + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("om:replay-hello", onReplay);
    return () => window.removeEventListener("om:replay-hello", onReplay);
  }, []);

  useEffect(() => {
    if (!visible) return;

    if (prefersReducedMotion) {
      const t = window.setTimeout(finish, 2000);
      return () => window.clearTimeout(t);
    }

    // 8.5s total choreographed sequence
    const timers = [
      window.setTimeout(() => setStage(1), 450), // Miracle: Hello
      window.setTimeout(() => setStage(2), 1450), // Typing dots
      window.setTimeout(() => setStage(3), 2350), // Oludamade: Hi 🙂
      window.setTimeout(() => setStage(4), 3350), // Thin line + bridge quote
      window.setTimeout(() => setStage(5), 4850), // Miracle: Will you marry me?
      window.setTimeout(() => setStage(6), 5850), // Oludamade: Yes 💍 + magenta ticks
      window.setTimeout(() => setStage(7), 6850), // Bubbles lift away + #aDMeverAfter script
      window.setTimeout(finish, 8600), // Dissolve into hero
    ];

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [visible, prefersReducedMotion, replayCount, finish]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={`hello-${replayCount}`}
          role="dialog"
          aria-modal="true"
          aria-label="Opening story: The Hello"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeOut" } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ivory paper-grain px-5 py-8 text-ink"
        >
          {/* Skip button visible from the start */}
          <button
            type="button"
            onClick={finish}
            className="absolute right-5 top-5 rounded-full border border-ink/15 bg-surface/85 px-4 py-2 text-sm font-medium text-ink shadow-sm backdrop-blur transition hover:border-magenta hover:text-magenta"
          >
            Skip
          </button>

          {prefersReducedMotion ? (
            <div className="max-w-md text-center">
              <p className="font-script text-4xl text-magenta">
                {SITE.couple.hashtag}
              </p>
              <h1 className="mt-3 font-display text-4xl font-medium text-ink">
                {SITE.couple.displayNames}
              </h1>
              <p className="mt-2 text-base text-ink-muted">
                {SITE.couple.tagline}
              </p>
            </div>
          ) : (
            <div className="w-full max-w-md">
              <AnimatePresence mode="wait">
                {stage < 7 ? (
                  <motion.div
                    key="chat-panel"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      y: -36,
                      scale: 0.96,
                      transition: { duration: 0.65, ease: "easeInOut" },
                    }}
                    className="rounded-panel border border-gold-hairline/35 bg-surface/95 p-5 shadow-card backdrop-blur"
                  >
                    {/* Minimal bespoke header — no WhatsApp branding */}
                    <div className="flex items-center justify-between border-b border-ink/10 pb-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-soft font-display text-base font-semibold text-ink">
                          O
                        </span>
                        <div>
                          <p className="text-sm font-medium leading-tight text-ink">
                            Oludamade
                          </p>
                          <p className="text-xs text-ink-muted">
                            {stage === 2 ? "typing…" : "online"}
                          </p>
                        </div>
                      </div>
                      <span className="h-2.5 w-2.5 rounded-full bg-sage" />
                    </div>

                    {/* Messages */}
                    <div className="mt-4 flex min-h-[260px] flex-col justify-center space-y-3">
                      {/* 1. Miracle: Hello */}
                      {stage >= 1 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="ml-auto max-w-[82%] rounded-2xl rounded-br-sm bg-magenta px-4 py-2.5 text-white shadow-sm"
                        >
                          <p className="text-base">Hello</p>
                          <p className="mt-0.5 text-right text-[11px] text-white/80">
                            1 Aug 2024
                          </p>
                        </motion.div>
                      )}

                      {/* 2. Typing dots */}
                      {stage === 2 && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mr-auto inline-flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-sage-soft px-4 py-3"
                        >
                          <span
                            className="typing-dot h-2 w-2 rounded-full bg-ink/50"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="typing-dot h-2 w-2 rounded-full bg-ink/50"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="typing-dot h-2 w-2 rounded-full bg-ink/50"
                            style={{ animationDelay: "300ms" }}
                          />
                        </motion.div>
                      )}

                      {/* 3. Oludamade: Hi 🙂 */}
                      {stage >= 3 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="mr-auto max-w-[80%] rounded-2xl rounded-bl-sm bg-sage-soft px-4 py-2.5 text-ink shadow-sm"
                        >
                          <p className="text-base">Hi 🙂</p>
                        </motion.div>
                      )}

                      {/* 4. Thin line + bridge text */}
                      {stage >= 4 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="py-2 text-center"
                        >
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="mx-auto mb-2 h-px w-full origin-center bg-gradient-to-r from-transparent via-gold-hairline to-transparent"
                          />
                          <p className="font-display text-sm italic text-ink-muted">
                            “calls turned into hours… dates turned into forever”
                          </p>
                        </motion.div>
                      )}

                      {/* 5. Miracle: Will you marry me? */}
                      {stage >= 5 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="ml-auto max-w-[84%] rounded-2xl rounded-br-sm bg-onion-soft border border-onion/40 px-4 py-2.5 text-ink shadow-sm"
                        >
                          <p className="text-base font-medium">
                            “Will you marry me?”
                          </p>
                          <div className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-ink-muted">
                            <span>24 Jul 2026</span>
                            <CheckCheck
                              className={`h-3.5 w-3.5 transition-colors duration-500 ${
                                stage >= 6 ? "text-magenta" : "text-ink-muted/60"
                              }`}
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* 6. Oludamade: Yes 💍 */}
                      {stage >= 6 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="mr-auto max-w-[80%] rounded-2xl rounded-bl-sm bg-sage-soft border border-sage/50 px-4 py-2.5 text-ink shadow-sm"
                        >
                          <p className="text-base font-medium">“Yes 💍”</p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  /* 7. #aDMeverAfter SVG stroke-draw reveal with DM glowing magenta + drifting sage leaves */
                  <motion.div
                    key="hashtag-reveal"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    className="relative py-10 text-center"
                  >
                    <DriftingPetals count={6} />
                    <svg
                      viewBox="0 0 440 104"
                      className="relative z-10 mx-auto w-full max-w-sm overflow-visible"
                      aria-label={SITE.couple.hashtag}
                    >
                      <motion.path
                        d="M 24 82 Q 220 98 416 82"
                        fill="none"
                        stroke="var(--gold-hairline)"
                        strokeWidth="1.5"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.85 }}
                        transition={{ duration: 0.85, ease: "easeInOut" }}
                      />
                      {/* Stroke-draw pass */}
                      <motion.text
                        x="50%"
                        y="60"
                        textAnchor="middle"
                        className="font-script"
                        fill="transparent"
                        stroke="var(--magenta)"
                        strokeWidth="1.35"
                        strokeDasharray="480"
                        initial={{ strokeDashoffset: 480, opacity: 0.95 }}
                        animate={{ strokeDashoffset: 0, opacity: 0.35 }}
                        transition={{ duration: 1.05, ease: "easeInOut" }}
                        style={{ fontSize: "54px" }}
                      >
                        #aDMeverAfter
                      </motion.text>
                      {/* Fill-in pass with DM glowing magenta */}
                      <motion.text
                        x="50%"
                        y="60"
                        textAnchor="middle"
                        className="font-script"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.45, duration: 0.55 }}
                        style={{ fontSize: "54px", fill: "var(--ink)" }}
                      >
                        <tspan>#a</tspan>
                        <tspan
                          style={{
                            fill: "var(--magenta)",
                            filter:
                              "drop-shadow(0 0 12px rgba(163, 25, 91, 0.55))",
                          }}
                        >
                          DM
                        </tspan>
                        <tspan>everAfter</tspan>
                      </motion.text>
                    </svg>
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="relative z-10 mt-2 font-display text-lg text-ink-muted"
                    >
                      {SITE.couple.displayNames} · {SITE.couple.dateShort}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
