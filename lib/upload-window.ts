const DEFAULT_OPEN_AT = "2026-11-29T14:00:00+01:00";
const DEFAULT_CLOSE_AT = "2026-12-12T23:59:59+01:00";

export type UploadWindowState = "before" | "open" | "closed";

export interface UploadWindowInfo {
  state: UploadWindowState;
  open: boolean;
  opensAt: string;
  closesAt: string;
}

function parseIsoOrFallback(value: string | undefined, fallback: string): Date {
  if (value) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date(fallback);
}

export function getUploadWindow(now: Date = new Date()): UploadWindowInfo {
  const openDate = parseIsoOrFallback(
    process.env.UPLOADS_OPEN_AT,
    DEFAULT_OPEN_AT
  );
  const closeDate = parseIsoOrFallback(
    process.env.UPLOADS_CLOSE_AT,
    DEFAULT_CLOSE_AT
  );

  let state: UploadWindowState = "open";
  if (now.getTime() < openDate.getTime()) {
    state = "before";
  } else if (now.getTime() > closeDate.getTime()) {
    state = "closed";
  }

  return {
    state,
    open: state === "open",
    opensAt: openDate.toISOString(),
    closesAt: closeDate.toISOString(),
  };
}
