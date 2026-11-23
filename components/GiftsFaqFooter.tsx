"use client";

import React, { useState } from "react";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  Heart,
  MessageCircle,
  Phone,
  RotateCcw,
} from "lucide-react";
import { SITE } from "@/content/site";
import { BotanicalDivider, Monogram } from "./Monogram";
import { triggerReplayHello } from "./OpeningHello";

export function GiftsFaqFooter() {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(
    SITE.faqs[0]?.id ?? null
  );

  const copyAccountNumber = async (accountNumber: string, label: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedAccount(label);
      window.setTimeout(() => setCopiedAccount(null), 2200);
    } catch {
      // Clipboard blocked
    }
  };

  return (
    <>
      {/* 7.9 Gifts & Registry */}
      <section
        id="gifts"
        className="scroll-mt-20 bg-surface-muted/70 py-20 sm:py-28 border-y border-ink/5"
      >
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-script text-3xl text-magenta">Gifts</p>
            <h2 className="mt-1 font-display text-4xl font-medium text-ink sm:text-5xl">
              {SITE.gifts.heading}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink/90">
              “{SITE.gifts.message}”
            </p>
            <BotanicalDivider />
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {SITE.gifts.accounts.map((acct) => {
              const isCopied = copiedAccount === acct.label;
              return (
                <div
                  key={acct.label}
                  className="rounded-panel border border-gold-hairline/40 bg-surface p-6 shadow-card"
                >
                  <span className="inline-flex rounded-full bg-onion-soft px-3.5 py-1 text-xs font-semibold text-magenta">
                    {acct.label}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-medium text-ink">
                    {acct.accountName}
                  </h3>
                  <p className="mt-1 text-sm text-ink-muted">{acct.bankName}</p>

                  <div className="mt-5 flex items-center justify-between rounded-xl border border-ink/10 bg-ivory px-4 py-3">
                    <span className="font-mono text-lg font-semibold tracking-wider text-ink">
                      {acct.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyAccountNumber(acct.accountNumber, acct.label)
                      }
                      className="inline-flex items-center gap-1.5 rounded-full bg-magenta px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-magenta-dark"
                      aria-label={`Copy ${acct.label} account number`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-center text-sm text-ink-muted">
            {SITE.gifts.confirmationNote}
          </p>

          {copiedAccount && (
            <div
              role="status"
              aria-live="polite"
              className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-card"
            >
              {copiedAccount} account number copied!
            </div>
          )}
        </div>
      </section>

      {/* 7.10 FAQ Accordion */}
      <section id="faq" className="scroll-mt-20 py-20 sm:py-28 paper-grain">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="text-center">
            <p className="font-script text-3xl text-magenta">Good to know</p>
            <h2 className="mt-1 font-display text-4xl font-medium text-ink sm:text-5xl">
              Frequently asked questions
            </h2>
            <BotanicalDivider />
          </div>

          <div className="mt-8 divide-y divide-ink/10 rounded-panel border border-ink/10 bg-surface shadow-soft">
            {SITE.faqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${faq.id}`}
                      id={`faq-btn-${faq.id}`}
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-medium text-ink transition hover:text-magenta sm:px-6 sm:py-5"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-magenta transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </h3>
                  {isOpen && (
                    <div
                      id={`faq-panel-${faq.id}`}
                      role="region"
                      aria-labelledby={`faq-btn-${faq.id}`}
                      className="px-5 pb-5 text-base leading-relaxed text-ink-muted sm:px-6"
                    >
                      <p>{faq.answer}</p>
                      {faq.showColourSwatches && (
                        <div className="mt-3 flex flex-wrap gap-3">
                          {SITE.coloursOfTheDay.map((c) => (
                            <span
                              key={c.name}
                              className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-ivory px-3 py-1 text-xs font-medium text-ink"
                            >
                              <span
                                className="h-3.5 w-3.5 rounded-full border border-ink/15"
                                style={{ backgroundColor: c.hex }}
                              />
                              {c.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7.11 Contact & Footer */}
      <footer className="border-t border-ink/10 bg-surface-muted/80 pt-16 pb-24 sm:pb-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-medium text-ink sm:text-4xl">
              Questions? We’re a message away
            </h2>
            <p className="mt-2 text-base text-ink-muted">
              Reach out to either of our contacts by call or WhatsApp.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-2xl gap-5 sm:grid-cols-2">
            {SITE.contacts.map((person) => (
              <div
                key={person.name}
                className="rounded-card border border-ink/10 bg-surface p-5 text-center shadow-soft"
              >
                <h3 className="font-display text-2xl font-medium text-ink">
                  {person.name}
                </h3>
                <p className="mt-0.5 text-xs text-ink-muted">{person.role}</p>
                <p className="mt-2 text-base font-medium text-ink">
                  {person.phoneDisplay}
                </p>
                <div className="mt-4 flex justify-center gap-2.5">
                  <a
                    href={person.telHref}
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-ivory px-4 py-2 text-sm font-medium text-ink transition hover:border-magenta hover:text-magenta"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${person.whatsappNumber}?text=${encodeURIComponent(
                      `Hello ${person.name}, I’m reaching out about Oludamade & Miracle’s wedding (${SITE.couple.hashtag}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-magenta px-4 py-2 text-sm font-medium text-white transition hover:bg-magenta-dark"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 border-t border-gold-hairline/30 pt-10 text-center">
            <Monogram size="md" />
            <p className="mt-4 font-script text-3xl text-magenta">
              {SITE.couple.hashtag}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 font-display text-xl text-ink">
              <span>With love, {SITE.couple.displayNames}</span>
              <Heart className="h-4 w-4 fill-magenta text-magenta" />
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {SITE.couple.dateDisplay} · {SITE.couple.locationDisplay}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
              <button
                type="button"
                onClick={triggerReplayHello}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-surface px-4 py-2 font-medium text-ink transition hover:border-magenta hover:text-magenta"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Replay the Hello</span>
              </button>
              <a
                href="#top"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-surface px-4 py-2 font-medium text-ink transition hover:border-magenta hover:text-magenta"
              >
                <ArrowUp className="h-3.5 w-3.5" />
                <span>Back to top</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
