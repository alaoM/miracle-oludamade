import {
  ALLOWED_IMAGE_MIMES,
  computeChunkRange,
  DEFAULT_CHUNK_SIZE,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  parseNextOffsetFromRange,
  SINGLE_PUT_MAX_BYTES,
} from "./validation";

const MAX_PHOTO_DIMENSION = 2000;
const JPEG_QUALITY = 0.85;
const MAX_RETRIES = 5;

export interface PreparedFile {
  blob: Blob;
  mimeType: string;
  originalName: string;
  isVideo: boolean;
}

/**
 * Decodes photos via createImageBitmap with EXIF orientation applied,
 * resizes longest side to 2000px (never upscaling), and re-encodes to JPEG 0.85
 * (cutting size 5–10x and stripping EXIF/GPS). Falls back to original file if decoding fails.
 */
export async function prepareFileForUpload(file: File): Promise<PreparedFile> {
  const isVideo = file.type.startsWith("video/");
  if (isVideo) {
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error("This video is over our 200 MB limit.");
    }
    return {
      blob: file,
      mimeType: file.type || "video/mp4",
      originalName: file.name,
      isVideo: true,
    };
  }

  const isAllowedImage = (ALLOWED_IMAGE_MIMES as readonly string[]).includes(
    file.type
  );
  if (!isAllowedImage && !file.type.startsWith("image/")) {
    throw new Error("Unsupported file type. Please choose a photo or video.");
  }

  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });

    const { width, height } = bitmap;
    const longest = Math.max(width, height);
    const scale =
      longest > MAX_PHOTO_DIMENSION ? MAX_PHOTO_DIMENSION / longest : 1;
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    let jpegBlob: Blob | null = null;

    if (typeof OffscreenCanvas !== "undefined") {
      const canvas = new OffscreenCanvas(targetWidth, targetHeight);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
        jpegBlob = await canvas.convertToBlob({
          type: "image/jpeg",
          quality: JPEG_QUALITY,
        });
      }
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
        jpegBlob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
        );
      }
    }

    bitmap.close();

    if (jpegBlob && jpegBlob.size <= MAX_IMAGE_BYTES) {
      return {
        blob: jpegBlob,
        mimeType: "image/jpeg",
        originalName: file.name,
        isVideo: false,
      };
    }
  } catch {
    // Fallback to original file (e.g. unusual HEIC unsupported by browser decoder)
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("This photo is over our 25 MB limit.");
  }

  return {
    blob: file,
    mimeType: file.type || "image/jpeg",
    originalName: file.name,
    isVideo: false,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function friendlyDriveError(status: number): string {
  if (status === 403) {
    return "This upload session is no longer valid. Tap Retry to start a fresh one.";
  }
  if (status === 429) {
    return "Lots of guests are uploading right now. Please tap Retry in a moment.";
  }
  if (status >= 500) {
    return "Google Drive had a brief hiccup. Tap Retry to continue.";
  }
  return "Upload interrupted. Tap Retry to try again.";
}

const SESSION_CACHE_PREFIX = "om_session_uri:";

export function getCachedSessionUri(fingerprint: string): string | null {
  try {
    return window.sessionStorage.getItem(`${SESSION_CACHE_PREFIX}${fingerprint}`);
  } catch {
    return null;
  }
}

export function setCachedSessionUri(fingerprint: string, uri: string) {
  try {
    window.sessionStorage.setItem(`${SESSION_CACHE_PREFIX}${fingerprint}`, uri);
  } catch {
    // Ignore storage quota or private-mode errors
  }
}

export function clearCachedSessionUri(fingerprint: string) {
  try {
    window.sessionStorage.removeItem(`${SESSION_CACHE_PREFIX}${fingerprint}`);
  } catch {
    // Ignore
  }
}

/**
 * Requests a resumable upload session URI from /api/upload/session with
 * automatic exponential backoff on 429 / 5xx responses.
 */
export async function requestUploadSessionWithBackoff(params: {
  code: string;
  name: string;
  mimeType: string;
  size: number;
  guestName: string;
  index: number;
}): Promise<{ sessionUri: string; serviceUnavailable?: boolean }> {
  const maxAttempts = 3;
  let lastError = "Could not start upload. Tap Retry.";
  let serviceUnavailable = false;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch("/api/upload/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-upload-code": params.code,
        },
        body: JSON.stringify({
          name: params.name.slice(0, 120),
          mimeType: params.mimeType,
          size: params.size,
          guestName: params.guestName.trim().slice(0, 40),
          index: params.index,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        sessionUri?: string;
        error?: string;
      };

      if (res.ok && data.sessionUri) {
        return { sessionUri: data.sessionUri };
      }

      lastError = data.error || friendlyDriveError(res.status);
      if (res.status === 502 || res.status === 503) {
        serviceUnavailable = true;
      }

      // Only backoff-retry on transient 429 or 5xx errors
      if (
        (res.status === 429 || res.status >= 500) &&
        attempt < maxAttempts - 1
      ) {
        await sleep(700 * Math.pow(2, attempt));
        continue;
      }

      const err = new Error(lastError) as Error & { serviceUnavailable?: boolean };
      err.serviceUnavailable = serviceUnavailable;
      throw err;
    } catch (err) {
      if (attempt < maxAttempts - 1 && !(err instanceof Error && "serviceUnavailable" in err)) {
        await sleep(700 * Math.pow(2, attempt));
        continue;
      }
      throw err;
    }
  }

  throw new Error(lastError);
}

async function queryConfirmedOffset(
  sessionUri: string,
  total: number
): Promise<{ done: boolean; offset: number }> {
  const res = await fetch(sessionUri, {
    method: "PUT",
    headers: {
      "Content-Range": `bytes */${total}`,
    },
  });

  if (res.status === 200 || res.status === 201) {
    return { done: true, offset: total };
  }
  if (res.status === 308) {
    const nextOffset = parseNextOffsetFromRange(res.headers.get("Range"));
    return { done: false, offset: nextOffset };
  }
  throw new Error(friendlyDriveError(res.status));
}

/**
 * Uploads a prepared Blob directly to Google Drive using the resumable session URI.
 * - Files <= 5 MB: single PUT
 * - Files > 5 MB: 2 MiB chunks with Content-Range, HTTP 308 handling,
 *   resume via `bytes * /total` on network drop or reload, and exponential backoff.
 */
export async function uploadBlobToDriveSession(params: {
  sessionUri: string;
  blob: Blob;
  mimeType: string;
  onProgress: (percent: number) => void;
  checkInitialOffset?: boolean;
}): Promise<void> {
  const { sessionUri, blob, mimeType, onProgress, checkInitialOffset } = params;
  const total = blob.size;

  if (total <= SINGLE_PUT_MAX_BYTES) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await fetch(sessionUri, {
          method: "PUT",
          headers: {
            "Content-Type": mimeType,
          },
          body: blob,
        });
        if (res.status === 200 || res.status === 201) {
          onProgress(100);
          return;
        }
        if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
          throw new Error(friendlyDriveError(res.status));
        }
        throw new Error(friendlyDriveError(res.status));
      } catch (err) {
        if (attempt === MAX_RETRIES - 1) throw err;
        await sleep(Math.min(16_000, 600 * Math.pow(2, attempt)));
      }
    }
    return;
  }

  let offset = 0;
  if (checkInitialOffset) {
    const existing = await queryConfirmedOffset(sessionUri, total);
    if (existing.done) {
      onProgress(100);
      return;
    }
    offset = existing.offset;
    if (offset > 0) {
      onProgress(Math.min(99, Math.round((offset / total) * 100)));
    }
  }

  let retriesForOffset = 0;

  while (offset < total) {
    const range = computeChunkRange(offset, total, DEFAULT_CHUNK_SIZE);
    const chunk = blob.slice(range.start, range.end + 1);

    try {
      const res = await fetch(sessionUri, {
        method: "PUT",
        headers: {
          "Content-Type": mimeType,
          "Content-Range": range.contentRange,
        },
        body: chunk,
      });

      if (res.status === 200 || res.status === 201) {
        onProgress(100);
        return;
      }

      if (res.status === 308) {
        const confirmed = parseNextOffsetFromRange(res.headers.get("Range"));
        offset = confirmed > offset ? confirmed : range.end + 1;
        retriesForOffset = 0;
        onProgress(Math.min(99, Math.round((offset / total) * 100)));
        continue;
      }

      if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
        throw new Error(friendlyDriveError(res.status));
      }
      throw new Error(friendlyDriveError(res.status));
    } catch (err) {
      retriesForOffset += 1;
      if (retriesForOffset >= MAX_RETRIES) {
        throw err instanceof Error
          ? err
          : new Error("Network error during upload. Tap Retry.");
      }

      await sleep(Math.min(16_000, 800 * Math.pow(2, retriesForOffset - 1)));

      // Query Google Drive for last confirmed byte offset before resuming
      try {
        const status = await queryConfirmedOffset(sessionUri, total);
        if (status.done) {
          onProgress(100);
          return;
        }
        offset = status.offset;
        onProgress(Math.min(99, Math.round((offset / total) * 100)));
      } catch {
        // Retry from current offset on next iteration
      }
    }
  }
}
