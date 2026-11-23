"use client";

import React from "react";
import { CalendarPlus, Clock, Download, MapPin } from "lucide-react";
import { SITE } from "@/content/site";
import { buildGoogleCalendarUrl, downloadIcsFile } from "@/lib/calendar";
import { BotanicalDivider } from "./Monogram";

export function TheDaySection() {
  return (
    <section
      id="the-day"
      className="scroll-mt-20 bg-surface-muted/70 py-20 sm:py-28 border-y border-ink/5"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-script text-3xl text-magenta">The day</p>
          <h2 className="mt-1 font-display text-4xl font-medium text-ink sm:text-5xl">
            {SITE.couple.dateDisplay}
          </h2>
          <p className="mt-3 text-base text-ink-muted">
            Three moments across one unforgettable Saturday in Ilorin. We can’t
            wait to celebrate every part with you.
          </p>
          <BotanicalDivider />
        </div>

        {/* Slim horizontal day timeline */}
        <div className="mx-auto mt-8 max-w-3xl rounded-full border border-gold-hairline/40 bg-surface px-5 py-3 shadow-sm">
          <div className="grid grid-cols-3 items-center gap-2 text-center">
            {SITE.events.map((ev, idx) => (
              <div
                key={ev.id}
                className={`flex flex-col items-center ${
                  idx === 1 ? "border-x border-ink/10 px-2" : ""
                }`}
              >
                <span className="font-display text-lg font-semibold text-magenta sm:text-xl">
                  {ev.shortTime}
                </span>
                <span className="text-xs text-ink-muted sm:text-sm">
                  {ev.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Three event cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {SITE.events.map((event) => (
            <article
              key={event.id}
              className="flex flex-col justify-between rounded-panel border border-ink/10 bg-surface p-6 shadow-card"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-onion-soft px-3.5 py-1 text-sm font-medium text-magenta">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{event.timeDisplay}</span>
                </div>

                <h3 className="mt-4 font-display text-3xl font-medium text-ink">
                  {event.name}
                </h3>

                <p className="mt-2 flex items-start gap-2 text-base font-medium text-ink/90">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-sage" />
                  <span>{event.address}</span>
                </p>

                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {event.description}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 border-t border-ink/10 pt-5">
                <a
                  href={event.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-magenta px-4 py-2.5 text-sm font-medium text-white transition hover:bg-magenta-dark"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Open in Google Maps</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={buildGoogleCalendarUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-ink/15 bg-ivory px-3 py-2 text-xs font-medium text-ink transition hover:border-magenta hover:text-magenta"
                  >
                    <CalendarPlus className="h-3.5 w-3.5" />
                    <span>Google Cal</span>
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      downloadIcsFile(
                        [event],
                        `oludamade-miracle-${event.id}.ics`
                      )
                    }
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-ink/15 bg-ivory px-3 py-2 text-xs font-medium text-ink transition hover:border-magenta hover:text-magenta"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download .ics</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Colours of the Day strip */}
        <div className="mt-12 rounded-panel border border-gold-hairline/40 bg-surface p-6 sm:p-8 text-center shadow-soft">
          <h3 className="font-display text-2xl font-medium text-ink sm:text-3xl">
            Colours of the day
          </h3>
          <p className="mt-2 text-base text-ink-muted">{SITE.dressCodeLine}</p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-5 sm:gap-8">
            {SITE.coloursOfTheDay.map((swatch) => (
              <div key={swatch.name} className="flex flex-col items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-12 w-12 rounded-full border border-ink/15 shadow-sm"
                  style={{ backgroundColor: swatch.hex }}
                />
                <span className="text-sm font-medium text-ink">
                  {swatch.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
