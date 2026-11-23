import React from "react";

export function Monogram({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-10 w-10 text-sm",
    md: "h-14 w-14 text-lg",
    lg: "h-20 w-20 text-2xl",
  };

  return (
    <div
      aria-label="Oludamade and Miracle monogram"
      className={`inline-flex items-center justify-center rounded-full border border-gold-hairline/70 bg-ivory/90 font-display font-semibold tracking-tight text-magenta shadow-sm ${sizes[size]} ${className}`}
    >
      <span>O</span>
      <span className="mx-0.5 font-script text-[1.15em] font-normal text-onion">
        &amp;
      </span>
      <span>M</span>
    </div>
  );
}

export function BotanicalDivider({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center gap-4 my-6 ${className}`}
    >
      <span className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-gold-hairline/60" />
      <svg
        width="36"
        height="22"
        viewBox="0 0 36 22"
        fill="none"
        className="text-sage shrink-0"
      >
        <path
          d="M2 18C9 15 14 10 18 3C22 10 27 15 34 18"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M18 3C16.5 9.5 14 14 9 16.5"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path
          d="M18 3C19.5 9.5 22 14 27 16.5"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <circle cx="18" cy="15" r="2" fill="var(--onion)" />
      </svg>
      <span className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent to-gold-hairline/60" />
    </div>
  );
}

export function DriftingPetals({
  count = 6,
  palette = "sage-onion",
}: {
  count?: number;
  palette?: "sage-onion" | "sage-magenta";
}) {
  const secondColor =
    palette === "sage-magenta" ? "var(--magenta)" : "var(--onion)";
  const petals = Array.from({ length: count }, (_, i) => ({
    left: `${8 + i * (84 / Math.max(1, count - 1))}%`,
    duration: `${13 + (i % 4) * 3}s`,
    delay: `${(i % 5) * 1.4}s`,
    color: i % 2 === 0 ? "var(--sage)" : secondColor,
    size: 10 + (i % 3) * 4,
  }));

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {petals.map((p, idx) => (
        <span
          key={idx}
          className="petal-drift absolute top-0 block rounded-tl-full rounded-br-full opacity-35"
          style={
            {
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size * 1.4}px`,
              backgroundColor: p.color,
              "--drift-duration": p.duration,
              "--drift-delay": p.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
