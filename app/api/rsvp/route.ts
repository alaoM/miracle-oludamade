import { NextResponse } from "next/server";
import { rsvpSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { SITE } from "@/content/site";

export const runtime = "nodejs";

function noStoreJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const limit = await checkRateLimit({
    key: `rsvp:${ip}`,
    limit: 10,
    windowSeconds: 600,
  });

  if (!limit.allowed) {
    return noStoreJson(
      {
        error:
          "Too many RSVP attempts in a short time. Please wait a few minutes or message us on WhatsApp.",
      },
      429
    );
  }

  // Check RSVP deadline
  const deadline = new Date(SITE.rsvpDeadlineIsoWat);
  if (!Number.isNaN(deadline.getTime()) && Date.now() > deadline.getTime()) {
    return noStoreJson(
      { error: "RSVPs are now closed. Please message us on WhatsApp." },
      403
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return noStoreJson({ error: "Invalid request payload." }, 400);
  }

  const parsed = rsvpSchema.safeParse(payload);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return noStoreJson(
      {
        error: firstIssue?.message ?? "Please check your details and try again.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      400
    );
  }

  const data = parsed.data;

  // Honeypot trap: silently accept without forwarding
  if (data.website && data.website.trim().length > 0) {
    return noStoreJson({ ok: true });
  }

  const webhookUrl = process.env.RSVP_SHEET_WEBHOOK_URL;
  if (!webhookUrl) {
    return noStoreJson(
      {
        error:
          "Our RSVP sheet is still being connected. Please tap a WhatsApp button below so we don’t miss your response.",
        fallback: true,
      },
      503
    );
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submittedAt: new Date().toISOString(),
        fullName: data.fullName,
        phone: data.phone,
        attending: data.attending === "yes" ? "Yes" : "Regretfully no",
        guestsCount: data.attending === "yes" ? data.guestsCount : 0,
        events: data.attending === "yes" ? data.events.join(", ") : "",
        dietaryNotes: data.dietaryNotes,
        message: data.message,
      }),
      redirect: "follow",
    });

    if (!res.ok) {
      throw new Error(`Webhook status ${res.status}`);
    }

    return noStoreJson({ ok: true });
  } catch {
    return noStoreJson(
      {
        error:
          "We couldn’t save your RSVP just now. Please use one of the WhatsApp buttons below so we receive it right away.",
        fallback: true,
      },
      502
    );
  }
}
