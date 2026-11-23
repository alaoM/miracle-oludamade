import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  getAdminCookieOptions,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rl = await checkRateLimit({
    key: `admin-login:${ip}`,
    limit: 8,
    windowSeconds: 900,
  });

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait 15 minutes." },
      { status: 429, headers: { "Cache-Control": "no-store" } }
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured on the server." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json(
      { error: "Incorrect password." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const token = createAdminSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "Unable to create session." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  const response = NextResponse.json(
    { ok: true },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
  response.cookies.set({ ...getAdminCookieOptions(), value: token });
  return response;
}
