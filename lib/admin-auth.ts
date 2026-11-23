import crypto from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "om_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function getSecret(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

function signPayload(payload: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
}

export function createAdminSessionToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload = `admin.${expiresAt}`;
  const sig = signPayload(payload, secret);
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  const secret = getSecret();
  if (!secret || !token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [role, expStr, providedSig] = parts;
  if (role !== "admin") return false;

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expectedSig = signPayload(`${role}.${expStr}`, secret);
  const a = Buffer.from(providedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function verifyAdminPassword(password: string): boolean {
  const secret = getSecret();
  if (!secret || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

export function getAdminCookieOptions() {
  return {
    name: ADMIN_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
