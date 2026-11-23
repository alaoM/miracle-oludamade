import Link from "next/link";
import { Monogram } from "@/components/Monogram";
import { SITE } from "@/content/site";

export default function NotFound() {
  return (
    <main className="min-h-screen paper-grain flex flex-col items-center justify-center px-6 py-16 text-center">
      <Monogram size="lg" />
      <p className="mt-6 text-sm text-ink-muted">{SITE.couple.hashtag}</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl font-medium text-ink">
        This page wandered off the aisle
      </h1>
      <p className="mt-4 max-w-md text-base text-ink-muted">
        We couldn’t find the page you were looking for, but all our wedding
        details are right back on our home page.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-magenta px-7 py-3 text-base font-medium text-white shadow-soft transition hover:bg-magenta-dark"
      >
        Back to our wedding website
      </Link>
    </main>
  );
}
