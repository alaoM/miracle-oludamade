import { z } from "zod";

export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export const ALLOWED_VIDEO_MIMES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
] as const;

export const ALLOWED_UPLOAD_MIMES = [
  ...ALLOWED_IMAGE_MIMES,
  ...ALLOWED_VIDEO_MIMES,
] as const;

export const MAX_IMAGE_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200 MB
export const CHUNK_ALIGNMENT = 256 * 1024; // 256 KiB (Google Drive requirement)
export const DEFAULT_CHUNK_SIZE = 2 * 1024 * 1024; // 2 MiB (multiple of 256 KiB)
export const SINGLE_PUT_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export const rsvpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(100, "Name is too long."),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone or WhatsApp number.")
    .max(30, "Phone number is too long."),
  attending: z.enum(["yes", "no"], {
    errorMap: () => ({ message: "Please let us know if you’re attending." }),
  }),
  guestsCount: z.coerce
    .number()
    .int()
    .min(1, "Please select at least 1 guest.")
    .max(10, "Maximum 10 guests per RSVP."),
  events: z
    .array(z.enum(["Engagement", "Church Wedding", "Reception"]))
    .max(3),
  dietaryNotes: z
    .string()
    .trim()
    .max(300, "Dietary notes must be under 300 characters.")
    .optional()
    .default(""),
  message: z
    .string()
    .trim()
    .max(600, "Message must be under 600 characters.")
    .optional()
    .default(""),
  website: z.string().max(100).optional().default(""), // honeypot
});

export type RsvpInput = z.infer<typeof rsvpSchema>;

export const uploadSessionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "File name is required.")
      .max(120, "File name is too long."),
    mimeType: z.enum(ALLOWED_UPLOAD_MIMES, {
      errorMap: () => ({
        message: "Unsupported file type. Please choose a photo or video.",
      }),
    }),
    size: z
      .number()
      .int()
      .positive("File appears to be empty.")
      .max(MAX_VIDEO_BYTES, "File exceeds the 200 MB limit."),
    guestName: z
      .string()
      .trim()
      .max(40, "Name must be 40 characters or fewer.")
      .optional()
      .default(""),
    index: z.number().int().min(1).max(9999).optional().default(1),
  })
  .superRefine((data, ctx) => {
    const isImage = (ALLOWED_IMAGE_MIMES as readonly string[]).includes(
      data.mimeType
    );
    if (isImage && data.size > MAX_IMAGE_BYTES) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["size"],
        message: "Photos must be 25 MB or smaller.",
      });
    }
  });

export type UploadSessionInput = z.infer<typeof uploadSessionSchema>;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

/**
 * Produces a safe server-chosen filename:
 * <GuestName or Guest>_<YYYYMMDD-HHmmss>_<index>.<ext>
 * Sanitised to letters, numbers, dashes and underscores, max 80 characters.
 */
export function buildSafeUploadFilename(params: {
  guestName?: string;
  mimeType: string;
  index?: number;
  now?: Date;
}): string {
  const { guestName, mimeType, index = 1, now = new Date() } = params;

  const ext = MIME_TO_EXT[mimeType] ?? "bin";
  const cleanedGuest = (guestName ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");

  const prefix = cleanedGuest || "Guest";

  // Format timestamp in WAT (UTC+1)
  const watMs = now.getTime() + 60 * 60 * 1000;
  const wat = new Date(watMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  const timestamp =
    `${wat.getUTCFullYear()}${pad(wat.getUTCMonth() + 1)}${pad(wat.getUTCDate())}-` +
    `${pad(wat.getUTCHours())}${pad(wat.getUTCMinutes())}${pad(wat.getUTCSeconds())}`;

  const safeIndex = String(Math.max(1, Math.floor(index))).padStart(2, "0");
  const suffix = `_${timestamp}_${safeIndex}.${ext}`;
  const maxPrefixLen = Math.max(1, 80 - suffix.length);
  const finalPrefix = prefix.slice(0, maxPrefixLen).replace(/[-_]+$/, "") || "Guest";

  return `${finalPrefix}${suffix}`;
}

export interface ChunkRange {
  start: number;
  end: number; // inclusive
  total: number;
  contentRange: string;
  byteLength: number;
}

/**
 * Computes the next Google Drive resumable upload chunk range.
 * Chunk size is guaranteed to be a multiple of 256 KiB (except the final chunk).
 */
export function computeChunkRange(
  offset: number,
  total: number,
  chunkSize: number = DEFAULT_CHUNK_SIZE
): ChunkRange {
  if (!Number.isInteger(total) || total <= 0) {
    throw new Error("Total file size must be a positive integer.");
  }
  if (!Number.isInteger(offset) || offset < 0 || offset >= total) {
    throw new Error("Offset is out of range.");
  }

  const alignedChunkSize = Math.max(
    CHUNK_ALIGNMENT,
    Math.floor(chunkSize / CHUNK_ALIGNMENT) * CHUNK_ALIGNMENT
  );

  const end = Math.min(offset + alignedChunkSize - 1, total - 1);
  return {
    start: offset,
    end,
    total,
    contentRange: `bytes ${offset}-${end}/${total}`,
    byteLength: end - offset + 1,
  };
}

/**
 * Parses Google Drive's HTTP 308 `Range` header (e.g. "bytes=0-2097151")
 * and returns the next byte offset to send.
 */
export function parseNextOffsetFromRange(rangeHeader: string | null): number {
  if (!rangeHeader) return 0;
  const match = /bytes=\d+-(\d+)/i.exec(rangeHeader.trim());
  if (!match) return 0;
  const lastByte = Number(match[1]);
  return Number.isFinite(lastByte) && lastByte >= 0 ? lastByte + 1 : 0;
}
