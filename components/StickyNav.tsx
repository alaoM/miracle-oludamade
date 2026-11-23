"use client";

import React, { useEffect, useState } from "react";
import { Menu, MessageCircle, Share2, X } from "lucide-react";
import { SITE } from "@/content/site";
import { Monogram } from "./Monogram";

export function StickyNav() {
  const [activeId, setActiveId] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  useEffect(() => {
    const ids = SITE.navLinks.map((l) => l.href.replace("#", ""));
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0.1, 0.35] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleShareSite = async () => {
    const shareData = {
      title: `${SITE.couple.displayNames} — ${SITE.couple.dateShort}`,
      text: `Celebrate with ${SITE.couple.displayNames} on ${SITE.couple.dateShort} in ${SITE.couple.locationShort}! ${SITE.couple.hashtag}`,
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      setShareToast("Link copied!");
    } catch {
      setShareToast("Ready to share");
    }
    window.setTimeout(() => setShareToast(null), 2200);
  };

  const whatsappHelpUrl = `https://wa.me/${SITE.contacts[0].whatsappNumber}?text=${encodeURIComponent(
    `Hello ${SITE.contacts[0].name}! I have a quick question about Oludamade & Miracle’s wedding (${SITE.couple.hashtag}).`
  )}`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-ivory/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a
            href="#top"
            className="flex items-center gap-2.5 focus-visible:outline-magenta"
            aria-label="Back to top"
          >
            <Monogram size="sm" />
            <span className="hidden font-display text-lg font-medium text-ink sm:inline">
              {SITE.couple.displayNames}
            </span>
          </a>

          {/* Desktop nav */}
          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {SITE.navLinks.map((link) => {
              const id = link.href.replace("#", "");
              const isActive = activeId === id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                    isActive
                      ? "bg-onion-soft font-medium text-magenta"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareSite}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-surface px-3 py-1.5 text-sm text-ink transition hover:border-magenta hover:text-magenta"
              aria-label="Share this website"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <a
              href="#rsvp"
              className="hidden rounded-full bg-magenta px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-magenta-dark md:inline-flex"
            >
              RSVP
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-surface text-ink md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <nav
            id="mobile-nav-drawer"
            aria-label="Mobile navigation"
            className="border-t border-ink/10 bg-ivory px-4 pb-5 pt-3 md:hidden"
          >
            <ul className="space-y-1">
              {SITE.navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-3.5 py-2.5 text-base text-ink transition hover:bg-onion-soft hover:text-magenta"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <a
                  href="#rsvp"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-full bg-magenta px-4 py-2.5 text-center text-base font-medium text-white"
                >
                  RSVP now
                </a>
              </li>
            </ul>
          </nav>
        )}
      </header>

      {/* Share toast */}
      {shareToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-soft"
        >
          {shareToast}
        </div>
      )}

      {/* Persistent small RSVP pill on mobile (bottom-left) */}
      <a
        href="#rsvp"
        className="fixed bottom-4 left-4 z-30 inline-flex items-center rounded-full bg-magenta px-4 py-2.5 text-sm font-medium text-white shadow-card transition hover:bg-magenta-dark md:hidden"
      >
        RSVP
      </a>

      {/* Floating WhatsApp help button (bottom-right, never blocks RSVP pill) */}
      <a
        href={whatsappHelpUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message us on WhatsApp for help"
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full border border-sage/60 bg-surface px-4 py-2.5 text-sm font-medium text-ink shadow-card transition hover:border-magenta hover:text-magenta"
      >
        <MessageCircle className="h-4 w-4 text-sage" />
        <span className="hidden sm:inline">Need help?</span>
      </a>
    </>
  );
}
