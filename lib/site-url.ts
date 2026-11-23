const DEFAULT_PROD_URL = "https://miracle-oludamade.vercel.app";

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isLocalhostUrl(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url);
}

/**
 * Resolves the canonical site URL at build time or when request headers aren't available.
 * Never falls back to localhost in production / Vercel builds.
 */
export function getBuildSiteUrl(): string {
  const configured = process.env.NEXT_SITE_URL?.trim();
  const isProd = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

  if (configured) {
    const normalized = normalizeUrl(configured);
    if (!isProd || !isLocalhostUrl(normalized)) {
      return normalized;
    }
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  }

  if (process.env.VERCEL_URL) {
    return normalizeUrl(process.env.VERCEL_URL);
  }

  return isProd ? DEFAULT_PROD_URL : "http://localhost:3000";
}

/**
 * Resolves the live site URL from incoming request headers first (ideal for dynamic routes
 * like /share/qr so the QR code always matches the exact production domain being visited),
 * falling back to getBuildSiteUrl().
 */
export function getRequestSiteUrl(headersList: Headers): string {
  const configured = process.env.NEXT_SITE_URL?.trim();
  const isProd = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

  if (configured) {
    const normalized = normalizeUrl(configured);
    if (!isProd || !isLocalhostUrl(normalized)) {
      return normalized;
    }
  }

  const forwardedHost = headersList.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || headersList.get("host")?.trim();

  if (host) {
    const isLocalHost = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host);
    const proto =
      headersList.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      (isLocalHost ? "http" : "https");
    return `${proto}://${host}`.replace(/\/+$/, "");
  }

  return getBuildSiteUrl();
}
