"use client";

import React, { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarPlus, CheckCircle2, MessageCircle } from "lucide-react";
import { SITE } from "@/content/site";
import { rsvpSchema } from "@/lib/validation";
import { downloadIcsFile } from "@/lib/calendar";
import { BotanicalDivider, DriftingPetals } from "./Monogram";
import { MagneticButton } from "./MagneticButton";

const EVENT_OPTIONS = [
  "Bible Presentation",
  "Engagement",
  "Church Wedding",
  "Reception",
] as const;

export function RsvpSection() {
  const prefersReducedMotion = useReducedMotion();
  const isPastDeadline = useMemo(() => {
    const deadline = new Date(SITE.rsvpDeadlineIsoWat);
    return !Number.isNaN(deadline.getTime()) && Date.now() > deadline.getTime();
  }, []);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [guestsCount, setGuestsCount] = useState(1);
  const [events, setEvents] = useState<string[]>([...EVENT_OPTIONS]);
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [highlightFallback, setHighlightFallback] = useState(false);

  const toggleEvent = (name: string) => {
    setEvents((prev) =>
      prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name]
    );
  };

  const whatsappMessage = useMemo(() => {
    const nameText = fullName.trim() || "[Your name]";
    const statusText = attending === "yes" ? "attending" : "unable to attend";
    return `Hello! This is ${nameText}. I will be ${statusText} Oludamade & Miracle’s wedding on 5 December 2026 with ${guestsCount} guest(s). ${SITE.couple.hashtag}`;
  }, [fullName, attending, guestsCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setHighlightFallback(false);

    const payload = {
      fullName,
      phone,
      attending,
      guestsCount: attending === "yes" ? guestsCount : 1,
      events: attending === "yes" ? events : [],
      dietaryNotes,
      message,
      website,
    };

    const parsed = rsvpSchema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      setErrorMessage(
        parsed.error.issues[0]?.message ?? "Please check the form fields."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fallback?: boolean;
      };

      if (!res.ok) {
        setErrorMessage(
          data.error ??
            "We couldn’t save your RSVP just now. Please use one of the WhatsApp buttons below."
        );
        if (data.fallback || res.status >= 500) {
          setHighlightFallback(true);
        }
        return;
      }

      setSubmitted(true);
    } catch {
      setErrorMessage(
        "We couldn’t reach our RSVP service. Please tap a WhatsApp button below so we receive your response."
      );
      setHighlightFallback(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="rsvp" className="scroll-mt-20 py-20 sm:py-28 paper-grain">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <div className="text-center">
          <p className="font-script text-3xl text-magenta">RSVP</p>
          <h2 className="mt-1 font-display text-4xl font-medium text-ink sm:text-5xl">
            Celebrate with us
          </h2>
          <p className="mt-3 text-base text-ink-muted">
            Please let us know if you’ll be joining us by{" "}
            <span className="font-medium text-ink">
              {SITE.rsvpDeadlineDisplay}
            </span>
            .
          </p>
          <BotanicalDivider />
        </div>

        <div className="mt-8 rounded-panel border border-ink/10 bg-surface p-6 shadow-card sm:p-8">
          {isPastDeadline ? (
            <div className="py-6 text-center">
              <p className="font-display text-2xl font-medium text-ink">
                RSVPs are now closed.
              </p>
              <p className="mt-2 text-base text-ink-muted">
                Please message us on WhatsApp below if you have any update.
              </p>
            </div>
          ) : submitted ? (
            <motion.div
              initial={
                prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }
              }
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-2xl py-8 text-center"
            >
              <DriftingPetals count={7} />
              <div className="relative z-10">
                <CheckCircle2 className="mx-auto h-12 w-12 text-sage" />
                <h3 className="mt-4 font-display text-3xl font-medium text-ink">
                  Thank you!
                </h3>
                <p className="mt-2 text-base text-ink-muted">
                  {attending === "yes"
                    ? "Thank you! We can’t wait to celebrate with you."
                    : "Thank you for letting us know. We’ll miss you and appreciate your love and prayers."}
                </p>
                {attending === "yes" && (
                  <button
                    type="button"
                    onClick={() =>
                      downloadIcsFile(
                        [SITE.preWeddingEvent, ...SITE.events],
                        "oludamade-and-miracle-wedding.ics"
                      )
                    }
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-magenta px-6 py-3 text-sm font-medium text-white shadow-soft transition hover:bg-magenta-dark"
                  >
                    <CalendarPlus className="h-4 w-4" />
                    <span>Add the events to my calendar</span>
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Honeypot */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="rsvp-website">Website</label>
                <input
                  id="rsvp-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="rsvp-name"
                  className="block text-sm font-medium text-ink"
                >
                  Full name <span className="text-magenta">*</span>
                </label>
                <input
                  id="rsvp-name"
                  type="text"
                  required
                  maxLength={100}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="mt-1.5 w-full rounded-xl border border-ink/15 bg-ivory px-4 py-3 text-base text-ink placeholder:text-ink-muted/60 focus:border-magenta focus:outline-none"
                />
                {fieldErrors.fullName?.[0] && (
                  <p className="mt-1 text-sm text-magenta">
                    {fieldErrors.fullName[0]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="rsvp-phone"
                  className="block text-sm font-medium text-ink"
                >
                  Phone or WhatsApp <span className="text-magenta">*</span>
                </label>
                <input
                  id="rsvp-phone"
                  type="tel"
                  required
                  maxLength={30}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="mt-1.5 w-full rounded-xl border border-ink/15 bg-ivory px-4 py-3 text-base text-ink placeholder:text-ink-muted/60 focus:border-magenta focus:outline-none"
                />
                {fieldErrors.phone?.[0] && (
                  <p className="mt-1 text-sm text-magenta">
                    {fieldErrors.phone[0]}
                  </p>
                )}
              </div>

              <fieldset>
                <legend className="text-sm font-medium text-ink">
                  Will you be attending? <span className="text-magenta">*</span>
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {[
                    { value: "yes" as const, label: "Yes, joyfully!" },
                    { value: "no" as const, label: "Regretfully no" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition ${
                        attending === option.value
                          ? "border-magenta bg-onion-soft text-magenta"
                          : "border-ink/15 bg-ivory text-ink"
                      }`}
                    >
                      <input
                        type="radio"
                        name="attending"
                        value={option.value}
                        checked={attending === option.value}
                        onChange={() => setAttending(option.value)}
                        className="sr-only"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {attending === "yes" && (
                <>
                  <div>
                    <label
                      htmlFor="rsvp-guests"
                      className="block text-sm font-medium text-ink"
                    >
                      Number of guests (including you)
                    </label>
                    <select
                      id="rsvp-guests"
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-xl border border-ink/15 bg-ivory px-4 py-3 text-base text-ink focus:border-magenta focus:outline-none"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "guest" : "guests"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <fieldset>
                    <legend className="text-sm font-medium text-ink">
                      Events you’ll attend
                    </legend>
                    <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                      {EVENT_OPTIONS.map((ev) => {
                        const checked = events.includes(ev);
                        return (
                          <label
                            key={ev}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm transition ${
                              checked
                                ? "border-sage bg-sage-soft text-ink font-medium"
                                : "border-ink/15 bg-ivory text-ink-muted"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleEvent(ev)}
                              className="h-4 w-4 accent-magenta"
                            />
                            <span>{ev}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div>
                    <label
                      htmlFor="rsvp-dietary"
                      className="block text-sm font-medium text-ink"
                    >
                      Dietary notes (optional)
                    </label>
                    <input
                      id="rsvp-dietary"
                      type="text"
                      maxLength={300}
                      value={dietaryNotes}
                      onChange={(e) => setDietaryNotes(e.target.value)}
                      placeholder="Any allergies or preferences"
                      className="mt-1.5 w-full rounded-xl border border-ink/15 bg-ivory px-4 py-3 text-base text-ink placeholder:text-ink-muted/60 focus:border-magenta focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label
                  htmlFor="rsvp-message"
                  className="block text-sm font-medium text-ink"
                >
                  Message to us (optional)
                </label>
                <textarea
                  id="rsvp-message"
                  rows={3}
                  maxLength={600}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share a warm note or prayer for us…"
                  className="mt-1.5 w-full rounded-xl border border-ink/15 bg-ivory px-4 py-3 text-base text-ink placeholder:text-ink-muted/60 focus:border-magenta focus:outline-none"
                />
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-xl border border-magenta/30 bg-magenta/10 px-4 py-3 text-sm text-magenta"
                >
                  {errorMessage}
                </div>
              )}

              <MagneticButton className="w-full">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full min-h-[50px] rounded-full bg-magenta px-6 py-3 text-base font-medium text-white shadow-soft transition hover:bg-magenta-dark disabled:opacity-60"
                >
                  {submitting ? "Sending your RSVP…" : "Send RSVP"}
                </button>
              </MagneticButton>
            </form>
          )}

          {/* Always-visible WhatsApp fallback */}
          <div
            className={`mt-7 rounded-2xl border p-4 sm:p-5 transition ${
              highlightFallback
                ? "border-magenta bg-onion-soft/90"
                : "border-ink/10 bg-ivory"
            }`}
          >
            <p className="text-center text-sm font-medium text-ink">
              Prefer WhatsApp? Send your RSVP directly:
            </p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {SITE.contacts.map((person) => (
                <a
                  key={person.name}
                  href={`https://wa.me/${person.whatsappNumber}?text=${encodeURIComponent(
                    whatsappMessage
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-sage/60 bg-surface px-4 py-2.5 text-sm font-medium text-ink transition hover:border-magenta hover:text-magenta"
                >
                  <MessageCircle className="h-4 w-4 text-sage" />
                  <span>RSVP on WhatsApp to {person.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
