import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import QRCode from "qrcode";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getRequestSiteUrl } from "@/lib/site-url";
import { SITE } from "@/content/site";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { BotanicalDivider, Monogram } from "@/components/Monogram";
import { QrPrintButton } from "@/components/QrPrintButton";

export const metadata: Metadata = {
  title: "Printable QR Table Card — Oludamade & Miracle",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ShareQrPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return <AdminLoginForm title="Printable QR table card" />;
  }

  const headersList = await headers();
  const siteUrl = getRequestSiteUrl(headersList);
  const uploadCode = process.env.UPLOAD_CODE || "";
  const shareUrl = uploadCode
    ? `${siteUrl}/share?c=${encodeURIComponent(uploadCode)}`
    : `${siteUrl}/share`;

  const qrDataUrl = await QRCode.toDataURL(shareUrl, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 640,
    color: {
      dark: "#3A1F2D",
      light: "#FFFCF8",
    },
  });

  return (
    <main className="min-h-screen paper-grain flex flex-col items-center justify-center px-4 py-10">
      {/* Screen-only controls */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-center gap-3">
        <QrPrintButton />
        <Link
          href="/admin/uploads"
          className="inline-flex items-center rounded-full border border-ink/15 bg-surface px-5 py-3 text-sm font-medium text-ink transition hover:border-magenta hover:text-magenta"
        >
          Back to admin
        </Link>
      </div>

      {!uploadCode && (
        <p className="no-print mb-4 max-w-md rounded-xl border border-magenta/30 bg-magenta/10 px-4 py-2.5 text-center text-sm text-magenta">
          Warning: UPLOAD_CODE is not set in your environment variables yet. Set
          it before printing table cards.
        </p>
      )}

      {/* Printable A6 Table Card (105mm x 148mm) */}
      <section
        aria-label="Printable A6 wedding table card"
        className="a6-card relative flex h-[148mm] w-[105mm] flex-col items-center justify-between overflow-hidden rounded-panel border border-gold-hairline/70 bg-[#FFFCF8] p-[9mm] text-center text-[#3A1F2D] shadow-card"
      >
        {/* Inner decorative border */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[4.5mm] rounded-2xl border border-[#C9A66B]/55"
        />

        <div className="relative z-10 flex flex-col items-center">
          <Monogram size="md" />
          <p className="mt-2 font-display text-lg font-medium text-[#3A1F2D]">
            {SITE.couple.displayNames}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-[#A3195B]">
            Scan to share your photos
          </h1>
          <BotanicalDivider className="my-2" />
        </div>

        {/* High-error-correction QR code (at least 48mm x 48mm, well over 4cm min) */}
        <div className="relative z-10 rounded-2xl border-2 border-[#B98AA8]/50 bg-[#FFFCF8] p-2.5 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="QR code to share wedding photos"
            className="h-[52mm] w-[52mm]"
          />
        </div>

        <div className="relative z-10">
          <p className="font-script text-3xl text-[#A3195B]">
            {SITE.couple.hashtag}
          </p>
          <p className="mt-1 text-xs font-medium text-[#3A1F2D]">
            No login needed. Just scan, tap and add.
          </p>
          <p className="mt-1 text-[10px] text-[#664959]">
            {SITE.couple.dateShort} · {SITE.couple.locationShort}
          </p>
        </div>
      </section>
    </main>
  );
}
