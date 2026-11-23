import { Monogram } from "@/components/Monogram";
import { SITE } from "@/content/site";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading wedding website"
      className="min-h-screen paper-grain flex flex-col items-center justify-center bg-ivory px-6 text-center"
    >
      <div className="motion-safe:animate-pulse">
        <Monogram size="lg" />
      </div>
      <p className="mt-4 font-script text-2xl text-magenta">
        {SITE.couple.hashtag}
      </p>
      <p className="mt-1 text-sm text-ink-muted">Loading…</p>
    </div>
  );
}
