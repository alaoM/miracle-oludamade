import crypto from "node:crypto";
import { NextResponse } from "next/server";
import {
  buildSafeUploadFilename,
  uploadSessionSchema,
} from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { getUploadWindow } from "@/lib/upload-window";
import { createResumableUploadSession, isDriveConfigured } from "@/lib/drive";
import { getBuildSiteUrl } from "@/lib/site-url";

export const runtime = "nodejs";

function noStoreJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function timingSafeMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request) {
  // Strict same-origin check when Origin header is present
  const siteUrl = getBuildSiteUrl();
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin) {
    try {
      const expectedHost = new URL(siteUrl).origin;
      const incomingHost = new URL(requestOrigin).origin;
      const reqUrlOrigin = new URL(request.url).origin;
      if (incomingHost !== expectedHost && incomingHost !== reqUrlOrigin) {
        return noStoreJson({ error: "Origin not allowed." }, 403);
      }
    } catch {
      return noStoreJson({ error: "Invalid origin." }, 403);
    }
  }

  // Check upload window
  const windowInfo = getUploadWindow();
  if (!windowInfo.open) {
    const message =
      windowInfo.state === "before"
        ? "Uploads aren’t open yet. Coming soon — see you on the day!"
        : "Uploads have now closed. Thank you for celebrating with us!";
    return noStoreJson({ error: message, state: windowInfo.state }, 403);
  }

  // Validate shared upload code when provided (or when REQUIRE_UPLOAD_CODE=true)
  const expectedCode = process.env.UPLOAD_CODE?.trim();
  const requireCode = process.env.REQUIRE_UPLOAD_CODE === "true";
  const providedCode = request.headers.get("x-upload-code")?.trim() || "";

  if (requireCode && (!expectedCode || !providedCode || !timingSafeMatch(providedCode, expectedCode))) {
    return noStoreJson(
      {
        error:
          "Please scan the QR code on the table card to upload your photos.",
      },
      403
    );
  }

  if (providedCode && expectedCode && !timingSafeMatch(providedCode, expectedCode)) {
    return noStoreJson(
      {
        error:
          "That upload link looks invalid. Please open the share page from our website or scan a table card QR code.",
      },
      403
    );
  }

  // Rate limit per IP and globally
  const ip = getClientIp(request.headers);
  const ipLimit = await checkRateLimit({
    key: `upload:ip:${ip}`,
    limit: 120,
    windowSeconds: 600,
  });
  if (!ipLimit.allowed) {
    return noStoreJson(
      { error: "You’ve started many uploads recently. Please wait a moment and try again." },
      429
    );
  }

  const bucketKey = providedCode
    ? crypto.createHash("sha256").update(providedCode).digest("hex").slice(0, 12)
    : "public-window";
  const codeLimit = await checkRateLimit({
    key: `upload:code:${bucketKey}`,
    limit: 2000,
    windowSeconds: 600,
  });
  if (!codeLimit.allowed) {
    return noStoreJson(
      { error: "Lots of guests are sharing right now! Please try again in a moment." },
      429
    );
  }

  if (!isDriveConfigured()) {
    return noStoreJson(
      {
        error:
          "We couldn’t reach our upload service. Please try again in a moment, or send your photos to Oludamade or Miracle on WhatsApp.",
      },
      503
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noStoreJson({ error: "Invalid request payload." }, 400);
  }

  const parsed = uploadSessionSchema.safeParse(body);
  if (!parsed.success) {
    return noStoreJson(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid file details.",
      },
      400
    );
  }

  const { mimeType, size, guestName, index } = parsed.data;
  const fileName = buildSafeUploadFilename({
    guestName,
    mimeType,
    index,
  });

  // Use the browser's actual origin if it passed our same-origin check, else NEXT_SITE_URL
  const driveOrigin = requestOrigin || siteUrl;

  try {
    const sessionUri = await createResumableUploadSession({
      fileName,
      mimeType,
      size,
      origin: driveOrigin,
    });

    return noStoreJson({ sessionUri, fileName }, 200);
  } catch (err) {
    console.error(
      "[upload/session]",
      err instanceof Error ? err.message : "Drive session error"
    );
    return noStoreJson(
      {
        error:
          "We couldn’t reach our upload service. Please try again in a moment, or send your photos to Oludamade or Miracle on WhatsApp.",
      },
      502
    );
  }
}
