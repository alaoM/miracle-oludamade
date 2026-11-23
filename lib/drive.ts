import fs from "node:fs";
import path from "node:path";
import { OAuth2Client } from "google-auth-library";
import type { DriveStorageQuota, DriveUploadedFile } from "@/types";
import { getRedisClient } from "./ratelimit";

export type { DriveStorageQuota, DriveUploadedFile };

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

export function isDriveConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN &&
      process.env.DRIVE_FOLDER_ID
  );
}

export async function getDriveAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - 60_000 > now) {
    return cachedToken.accessToken;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google Drive OAuth environment variables are not configured.");
  }

  const oauth2Client = new OAuth2Client(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { token, res } = await oauth2Client.getAccessToken();
  if (!token) {
    throw new Error("Unable to refresh Google Drive access token.");
  }

  const expiryMs =
    (res?.data as { expiry_date?: number } | undefined)?.expiry_date ??
    now + 50 * 60 * 1000;

  cachedToken = {
    accessToken: token,
    expiresAt: expiryMs,
  };

  return token;
}

export async function createResumableUploadSession(params: {
  fileName: string;
  mimeType: string;
  size: number;
  origin: string;
}): Promise<string> {
  const folderId = process.env.DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error("DRIVE_FOLDER_ID is not configured.");
  }

  const accessToken = await getDriveAccessToken();

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": params.mimeType,
        "X-Upload-Content-Length": String(params.size),
        Origin: params.origin,
      },
      body: JSON.stringify({
        name: params.fileName,
        parents: [folderId],
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Google Drive session creation failed (${res.status}).`);
  }

  const sessionUri = res.headers.get("location");
  if (!sessionUri) {
    throw new Error("Google Drive did not return a resumable session URI.");
  }

  return sessionUri;
}

export async function listUploadedFiles(): Promise<{
  files: DriveUploadedFile[];
  totalSizeBytes: number;
}> {
  const folderId = process.env.DRIVE_FOLDER_ID;
  if (!folderId || !isDriveConfigured()) {
    return { files: [], totalSizeBytes: 0 };
  }

  const accessToken = await getDriveAccessToken();
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const fields = encodeURIComponent(
    "files(id,name,mimeType,size,createdTime,thumbnailLink,webViewLink)"
  );

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=createdTime+desc&pageSize=100&fields=${fields}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Google Drive files.list failed (${res.status}).`);
  }

  const data = (await res.json()) as {
    files?: Array<{
      id: string;
      name: string;
      mimeType: string;
      size?: string;
      createdTime: string;
      thumbnailLink?: string;
      webViewLink?: string;
    }>;
  };

  const files: DriveUploadedFile[] = (data.files ?? []).map((f) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    size: Number(f.size ?? 0),
    createdTime: f.createdTime,
    thumbnailLink: f.thumbnailLink,
    webViewLink: f.webViewLink,
  }));

  const totalSizeBytes = files.reduce((sum, f) => sum + f.size, 0);
  return { files, totalSizeBytes };
}

export async function getDriveStorageQuota(): Promise<DriveStorageQuota | null> {
  if (!isDriveConfigured()) return null;

  const accessToken = await getDriveAccessToken();
  const res = await fetch(
    "https://www.googleapis.com/drive/v3/about?fields=storageQuota",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as {
    storageQuota?: { limit?: string; usage?: string };
  };

  const limitBytes = Number(data.storageQuota?.limit ?? 0);
  const usageBytes = Number(data.storageQuota?.usage ?? 0);
  const remainingBytes = Math.max(0, limitBytes - usageBytes);
  const fiveGb = 5 * 1024 * 1024 * 1024;

  return {
    limitBytes,
    usageBytes,
    remainingBytes,
    lowSpaceWarning: limitBytes > 0 && remainingBytes < fiveGb,
  };
}

// --- Approved guest gallery persistence (Redis or local JSON fallback) ---

const GALLERY_REDIS_KEY = "wedding:approved-gallery-ids";
const LOCAL_GALLERY_PATH = path.join(
  process.cwd(),
  "data",
  "approved-gallery.json"
);

export async function getApprovedGalleryIds(): Promise<string[]> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const ids = await redis.smembers<string[]>(GALLERY_REDIS_KEY);
      return Array.isArray(ids) ? ids : [];
    } catch {
      return [];
    }
  }

  try {
    if (!fs.existsSync(LOCAL_GALLERY_PATH)) return [];
    const raw = fs.readFileSync(LOCAL_GALLERY_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export async function setApprovedGalleryId(
  fileId: string,
  approved: boolean
): Promise<string[]> {
  const redis = getRedisClient();
  if (redis) {
    if (approved) {
      await redis.sadd(GALLERY_REDIS_KEY, fileId);
    } else {
      await redis.srem(GALLERY_REDIS_KEY, fileId);
    }
    return getApprovedGalleryIds();
  }

  const current = new Set(await getApprovedGalleryIds());
  if (approved) current.add(fileId);
  else current.delete(fileId);

  const next = Array.from(current);
  try {
    fs.mkdirSync(path.dirname(LOCAL_GALLERY_PATH), { recursive: true });
    fs.writeFileSync(LOCAL_GALLERY_PATH, JSON.stringify(next, null, 2), "utf8");
  } catch {
    // Ignore read-only filesystem errors (e.g. Vercel without Redis)
  }
  return next;
}
