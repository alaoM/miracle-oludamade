import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Jost } from "next/font/google";
import { SITE } from "@/content/site";
import { getBuildSiteUrl } from "@/lib/site-url";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-script",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = getBuildSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${SITE.couple.displayNames} — ${SITE.couple.dateShort} | ${SITE.couple.hashtag}`,
  description: `Join us as we celebrate the wedding of ${SITE.couple.displayNames} on ${SITE.couple.dateDisplay} in ${SITE.couple.locationDisplay}. ${SITE.couple.tagline}`,
  robots: SITE.robotsNoIndex
    ? { index: false, follow: false }
    : { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: `${SITE.couple.displayNames} ${SITE.couple.hashtag}`,
    title: `${SITE.couple.displayNames} — ${SITE.couple.dateShort}`,
    description: `${SITE.couple.tagline} Celebrate with us in ${SITE.couple.locationShort}. ${SITE.couple.hashtag}`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.couple.displayNames} — ${SITE.couple.dateShort}`,
    description: `${SITE.couple.tagline} ${SITE.couple.hashtag}`,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFCF8" },
    { media: "(prefers-color-scheme: dark)", color: "#160E13" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${greatVibes.variable} ${jost.variable}`}
    >
      <body className="min-h-screen bg-ivory text-ink font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
