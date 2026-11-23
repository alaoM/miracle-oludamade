import React from "react";
import Image from "next/image";
import { Compass, Hotel, MapPin, Sparkles } from "lucide-react";
import { SITE } from "@/content/site";
import type { GeneratedImage } from "@/lib/images";
import { BotanicalDivider } from "./Monogram";

export function StayAndPartySection({
  imageMap,
}: {
  imageMap: Record<string, GeneratedImage>;
}) {
  return (
    <>
      {/* 7.4 Venue, Travel & Stay */}
      <section id="stay" className="scroll-mt-20 py-20 sm:py-28 paper-grain">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-script text-3xl text-magenta">
              Venue, travel &amp; stay
            </p>
            <h2 className="mt-1 font-display text-4xl font-medium text-ink sm:text-5xl">
              Getting there &amp; where to rest
            </h2>
            <p className="mt-3 text-base text-ink-muted">
              Everything is centred around Pipeline Area and Sabo Oke in Ilorin
              so getting between venues is simple.
            </p>
            <BotanicalDivider />
          </div>

          {/* Directions cards */}
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {SITE.venueDirections.map((v) => (
              <div
                key={v.venue}
                className="rounded-panel border border-ink/10 bg-surface p-6 shadow-soft"
              >
                <div className="flex items-center gap-2.5 text-magenta">
                  <Compass className="h-5 w-5 shrink-0" />
                  <h3 className="font-display text-2xl font-medium text-ink">
                    {v.venue}
                  </h3>
                </div>
                <p className="mt-1 text-sm font-medium text-ink-muted">
                  {v.address}
                </p>
                <p className="mt-3 text-base leading-relaxed text-ink/90">
                  {v.directions}
                </p>
                <a
                  href={v.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-magenta underline-offset-4 hover:underline"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            ))}
          </div>

          {/* Couple travel tip box */}
          <div className="mt-8 rounded-2xl border border-sage/50 bg-sage-soft/80 px-5 py-4 text-center sm:px-8">
            <p className="inline-flex items-center justify-center gap-2 text-base font-medium text-ink">
              <Sparkles className="h-4 w-4 shrink-0 text-magenta" />
              <span>“{SITE.travelTip}”</span>
            </p>
          </div>

          {/* Hotels */}
          <div className="mt-14">
            <div className="flex items-center justify-center gap-2 text-center">
              <Hotel className="h-5 w-5 text-magenta" />
              <h3 className="font-display text-3xl font-medium text-ink">
                Where to stay near Pipeline Road
              </h3>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {SITE.hotels.map((hotel) => (
                <div
                  key={hotel.name}
                  className="flex flex-col justify-between rounded-card border border-ink/10 bg-surface p-5 shadow-soft"
                >
                  <div>
                    <h4 className="font-display text-2xl font-medium text-ink">
                      {hotel.name}
                    </h4>
                    <p className="mt-1 text-sm text-ink-muted">{hotel.area}</p>
                    <p className="mt-3 text-xs text-ink-muted/85">
                      {hotel.contactNote}
                    </p>
                  </div>
                  <a
                    href={hotel.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-full border border-ink/15 bg-ivory px-4 py-2 text-sm font-medium text-ink transition hover:border-magenta hover:text-magenta"
                  >
                    <MapPin className="h-3.5 w-3.5 text-magenta" />
                    <span>View on Maps</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7.5 Wedding Party */}
      <section
        id="wedding-party"
        className="scroll-mt-20 bg-surface-muted/70 py-20 sm:py-24 border-y border-ink/5"
      >
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-script text-3xl text-magenta">Standing with us</p>
            <h2 className="mt-1 font-display text-4xl font-medium text-ink sm:text-5xl">
              Our wedding party
            </h2>
            <p className="mt-3 text-base text-ink-muted">
              The dear friends and family standing right beside us as we say
              “I do”.
            </p>
            <BotanicalDivider />
          </div>

          <div className="mt-10 flex flex-wrap items-stretch justify-center gap-8">
            {SITE.weddingParty.map((member) => {
              const img = member.imageFile
                ? imageMap[member.imageFile]
                : undefined;

              return (
                <div
                  key={member.name}
                  className="flex w-full max-w-[280px] flex-col items-center rounded-panel border border-ink/10 bg-surface p-6 text-center shadow-card"
                >
                  <div className="relative h-52 w-44 overflow-hidden rounded-t-[999px] rounded-b-2xl border-2 border-gold-hairline/50 bg-onion-soft">
                    {img ? (
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        sizes="180px"
                        placeholder="blur"
                        blurDataURL={img.blurDataURL}
                        className="object-cover object-top"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-display text-4xl font-semibold text-magenta">
                        {member.initials}
                      </div>
                    )}
                  </div>
                  <p className="mt-5 rounded-full bg-sage-soft px-3.5 py-1 text-xs font-medium text-ink">
                    {member.role}
                  </p>
                  <h3 className="mt-2.5 font-display text-2xl font-medium text-ink">
                    {member.name}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
